// script.js — enhanced: preserves previous demo logic + microinteractions
// Replace your existing script.js with this file.

document.addEventListener('DOMContentLoaded', () => {
  // --- Basic values (demo / placeholders)
  safeSetText('year', new Date().getFullYear());
  safeSetText('stat-districts', '734');
  safeSetText('stat-vendors', '4,321');
  safeSetText('stat-users', '98,765');

  // run old-population behaviours (kept for compatibility)
  try { populateSampleRankings(); } catch (e) {}
  try { populateSampleVendors(); } catch (e) {}
  try { reportsPageInit && reportsPageInit(); } catch (e) {}

  // --- Header shrink on scroll
  const header = document.querySelector('.site-header');
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const sc = window.scrollY;
    if (!header) return;
    if (sc > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    lastScroll = sc;
  }, { passive: true });

  // --- Mobile nav toggle with animated class
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('mobile-open');
      // small aria update
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // --- Smooth reveal-on-scroll for .reveal or .card elements
  const revealSelector = '.reveal, .card';
  const revealEls = document.querySelectorAll(revealSelector);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('visible');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => {
      // do not reveal immediately if within viewport already
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
      else io.observe(el);
    });
  } else {
    // fallback: simple timeout reveal
    revealEls.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 120 * i));
  }

  // --- Button ripple effect (delegated)
  document.body.addEventListener('pointerdown', (ev) => {
    let btn = ev.target.closest && ev.target.closest('.btn.ripple');
    if (!btn) return;
    createRipple(btn, ev);
  });

  // --- Quick form behaviour (keeps demo alerts, adds small loader)
  const quickForm = document.getElementById('quickForm');
  if (quickForm) quickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const need = (document.getElementById('q_need') || {}).value || '';
    const budget = (document.getElementById('q_budget') || {}).value || '';
    const city = (document.getElementById('q_city') || {}).value || '';
    if (!need.trim()) { alert('Please describe your need briefly.'); return; }

    // show loader on submit button
    const btn = quickForm.querySelector('.btn-primary') || quickForm.querySelector('button[type=submit]');
    showButtonLoader(btn, 'Searching...');
    setTimeout(() => {
      hideButtonLoader(btn);
      alert('Thanks! We will search matches for: ' + need + (budget ? ' within ₹' + budget : '') + (city ? ' — ' + city : ''));
    }, 900);
  });

  // vendor form & contact demos: keep but with loader
  const vendorForm = document.getElementById('vendorForm');
  if (vendorForm) vendorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('v_name') || {}).value || '';
    if (!name.trim()) { alert('Please enter your business name.'); return; }
    const btn = vendorForm.querySelector('button[type=submit]');
    showButtonLoader(btn, 'Sending...');
    setTimeout(() => {
      hideButtonLoader(btn);
      alert('Thanks — your vendor application has been received. Our team will contact you within 3 business days (demo).');
      vendorForm.reset();
    }, 900);
  });

  // contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('c_name') || {}).value || '';
    const email = (document.getElementById('c_email') || {}).value || '';
    const msg = (document.getElementById('c_message') || {}).value || '';
    if (!name.trim() || !email.trim() || !msg.trim()) { alert('Please fill name, email and message.'); return; }
    const btn = contactForm.querySelector('button[type=submit]');
    showButtonLoader(btn, 'Sending...');
    setTimeout(() => {
      hideButtonLoader(btn);
      alert('Thanks, ' + name + '! Your message has been received. We will reply soon (demo).');
      contactForm.reset();
    }, 900);
  });

  // small interactions for download buttons (demo)
  document.querySelectorAll('[id^="download"]').forEach(el => el && el.addEventListener('click', (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    showButtonLoader(btn, 'Downloading...');
    setTimeout(() => { hideButtonLoader(btn); alert('Download started (demo).'); }, 800);
  }));

  // make .btn-primary have optional shimmer class on hover for a tiny fraction
  document.querySelectorAll('.btn-primary').forEach(b => {
    b.addEventListener('mouseenter', () => b.classList.add('hover-shimmer'));
    b.addEventListener('mouseleave', () => b.classList.remove('hover-shimmer'));
  });
});

/* -------------------------
   Helper functions (UI)
   ------------------------- */

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function createRipple(btn, ev) {
  // remove old ripple
  const old = btn.querySelector('.ripple-effect');
  if (old) old.remove();

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.2;
  const span = document.createElement('span');
  span.className = 'ripple-effect';
  span.style.width = span.style.height = size + 'px';
  const x = ev.clientX - rect.left - size / 2;
  const y = ev.clientY - rect.top - size / 2;
  span.style.left = x + 'px';
  span.style.top = y + 'px';
  btn.appendChild(span);
  // cleanup after animation
  span.addEventListener('animationend', () => span.remove());
}

function showButtonLoader(btn, label) {
  if (!btn) return;
  btn.dataset.oldHtml = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('ripple'); // keep ripple area
  btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.12"></circle><path d="M22 12a10 10 0 0 0-18.32-5.32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="rotate" dur="0.9s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/></path></svg>${label || 'Working...'}</span>`;
}

function hideButtonLoader(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.oldHtml !== undefined) {
    btn.innerHTML = btn.dataset.oldHtml;
    delete btn.dataset.oldHtml;
  }
}

/* -------------------------
   Existing demo population functions (kept)
   ------------------------- */

/* If these functions already exist in your project we won't override them.
   But if they are missing (because we replaced script.js fully), we reimplement
   the small demo helpers used across pages. */

function populateSampleRankings() {
  const list = document.getElementById('rankingCards');
  const sample = [
    { title: 'Hyderabad — Living Score', score: 62, id: 'HYD' },
    { title: 'Patna — Infrastructure', score: 41, id: 'PTA' },
    { title: 'Kolkata — Employment Index', score: 55, id: 'KLK' }
  ];
  if (!list) return;
  list.innerHTML = sample.map(r => `
    <div class="card small reveal">
      <div style="font-weight:700">${r.title}</div>
      <div style="color:var(--accent);font-size:22px;margin-top:8px">${r.score} / 100</div>
      <div style="margin-top:10px;color:#6b7280;font-size:13px">District ID: ${r.id}</div>
      <div style="margin-top:12px"><button class="btn btn-ghost ripple">View report</button></div>
    </div>
  `).join('');
}

function populateSampleVendors() {
  const list = document.getElementById('vendorList');
  const sample = [
    { name: 'LocalStore', cat: 'Electronics', price: 'Low', note: 'Nearby seller offering EMI' },
    { name: 'QuickRepair', cat: 'Appliance', price: 'Medium', note: 'Verified technicians' },
    { name: 'SkillUp', cat: 'Training', price: 'Low', note: 'Short courses, certificates' }
  ];
  if (!list) return;
  list.innerHTML = sample.map(v => `
    <div class="vendor-card card reveal">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${v.name}</div>
          <div style="font-size:13px;color:${'#6b7280'}">${v.cat} • ${v.price}</div>
        </div>
        <div><button class="btn btn-primary ripple" onclick="contactVendor('${v.name}')">Contact</button></div>
      </div>
      <div style="margin-top:10px;color:var(--muted);font-size:13px">${v.note}</div>
    </div>
  `).join('');
}

// kept for reports page, isolated init
function reportsPageInit() {
  // placeholder to avoid errors when script runs before reports page bindings
  try {
    const topList = document.getElementById('topList');
    if (topList && topList.innerHTML.trim() === '') {
      topList.innerHTML = `<div class="small-muted">No districts loaded (demo)</div>`;
    }
  } catch (e) {}
}

/* legacy demo functions from earlier script kept below for compatibility */

function contactVendor(name) {
  alert('Opening contact for ' + name + ' (demo).');
}
function goHome() {
  window.location.href = 'index.html';
}

