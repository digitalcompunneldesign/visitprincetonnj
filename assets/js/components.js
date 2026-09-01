/* ============================================================
   HIKING TRAILS — master components
   ------------------------------------------------------------
   The header, the footer and the booking modal are defined once,
   here, and injected into every page. A page only needs:

     <div data-component="header"></div>
     <div data-component="footer"></div>
     <script src="assets/js/components.js"></script>

   Set the active nav item with <body data-page="about">, and use
   <body class="page-light"> for pages that sit on a white bar.
   Change anything below and every page follows.
   ============================================================ */
(function () {
  'use strict';

  const BRAND = { first: 'Hiking', second: 'Trails', domain: 'hikingtrails.org' };

  const NAV = [
    { id: 'home',    label: 'Home',           href: 'index.html' },
    { id: 'about',   label: 'About',          href: 'about.html' },
    { id: 'plan',    label: 'Plan your trail', href: 'plan-your-trail.html' },
    { id: 'events',  label: 'Events',         href: 'events.html' },
    { id: 'contact', label: 'Contact',        href: 'contact.html' }
  ];

  const FOOTER_COLS = [
    [{ label: 'Home', href: 'index.html' },
     { label: 'About', href: 'about.html' },
     { label: 'Plan Your Trail', href: 'plan-your-trail.html' },
     { label: 'Events', href: 'events.html' },
     { label: 'Contact', href: 'contact.html' }],
    [{ label: 'Trail Tips', href: 'tips.html' },
     { label: 'Trails & Map', href: 'plan-your-trail.html' },
     { label: 'Visiting', href: 'about.html#visiting' }]
  ];

  const SOCIAL = [
    ['Instagram', '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1"/>'],
    ['YouTube',   '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z"/>'],
    ['Facebook',  '<path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.5-1.5H17V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.6v3h2.7v8h3.2Z"/>'],
    ['X',         '<path d="M4 4l16 16M20 4 4 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>']
  ];

  /* the supplied wordmark; cream on the dark hero bar, ink everywhere else */
  const LOGO_MARK =
    `<img class="logo-mark logo-mark--light" src="assets/img/logo-cream.png" alt="" width="295" height="58">
     <img class="logo-mark logo-mark--dark" src="assets/img/logo-dark.png" alt="" width="295" height="58">`;

  const ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  /* ---------- markup ---------- */
  function headerHTML(page) {
    const links = NAV.map(n =>
      `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ');
    return `
  <header class="header" id="header">
    <div class="container">
      <a class="logo" href="index.html" aria-label="${BRAND.first} ${BRAND.second} — home">${LOGO_MARK}</a>
      <nav class="nav" id="nav" aria-label="Primary">
      ${links}
      </nav>
      <div class="header-right">
        <button class="icon-btn" id="searchOpen" aria-label="Open search">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button class="btn-outline" data-book>Book your trail</button>
        <button class="burger" id="burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav"><span></span></button>
      </div>
    </div>
  </header>

  <div class="search-panel" id="searchPanel" role="dialog" aria-modal="true" aria-label="Search trails">
    <button class="close icon-btn" id="searchClose" aria-label="Close search">
      <span class="close-label">Close</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
    <form onsubmit="return false;">
      <label for="searchInput" style="position:absolute;left:-9999px">Search trails, events and gear</label>
      <input id="searchInput" type="search" placeholder="Search trails, events, gear…" autocomplete="off">
      <button type="submit" class="icon-btn" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </button>
    </form>
    <div class="search-results" id="searchResults" role="listbox" aria-label="Search results"></div>
  </div>`;
  }

  function footerHTML() {
    const cols = FOOTER_COLS.map(col =>
      `<ul>${col.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul>`).join('\n          ');
    const social = SOCIAL.map(([name, path]) =>
      `<a href="#footer" aria-label="${name}"><svg viewBox="0 0 24 24" fill="currentColor">${path}</svg></a>`).join('\n            ');
    return `
  <div class="mountain-band" aria-hidden="true"><div class="mtn-layer mtn-front" id="mtnFront"></div></div>

  <footer class="footer" id="footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <a class="logo" href="index.html" aria-label="${BRAND.first} ${BRAND.second} — home">${LOGO_MARK}</a>
          <nav class="footer-nav" aria-label="Footer">
          ${cols}
          </nav>
        </div>
        <div class="footer-right">
          <a class="to-top" href="#top" id="toTop">Back to top
            <i aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg></i>
          </a>
          <div>
            <p class="footer-follow">Follow us on</p>
            <div class="footer-social">
            ${social}
            </div>
          </div>
        </div>
      </div>
      <div class="footer-powered">
        <span>Website Designed by</span>
        <a href="https://digital.compunnel.com" target="_blank" rel="noopener"
           aria-label="Compunnel Digital — opens in a new tab">
          <img src="assets/img/compunnel-digital.svg" alt="Compunnel Digital" width="132" height="56">
        </a>
      </div>
      <div class="footer-bottom">
        <p>${BRAND.domain} © Copyright ${new Date().getFullYear()}. All rights reserved.</p>
        <nav aria-label="Legal">
          <a href="terms.html">Terms of Service</a>
          <a href="privacy.html">Privacy Policy</a>
        </nav>
      </div>
    </div>
  </footer>`;
  }


  /* ============================================================
     ACCESSIBILITY PANEL
     ------------------------------------------------------------
     User preferences, not a substitute for the page being
     accessible in the first place. Each toggle sets a class on
     <html> and is remembered in localStorage.
     ============================================================ */
  /* ============================================================
     FORM DELIVERY
     ------------------------------------------------------------
     A static site cannot send mail on its own. Submissions POST to
     FormSubmit, which forwards them to the address below. The first
     submission triggers a one-time confirmation email to that
     address; until it is accepted nothing is forwarded.
     Swap ENDPOINT for your own handler and nothing else changes.
     ============================================================ */
  const FORMS = {
    to: 'sanjay.pal@compunnel.com',
    endpoint: 'https://formsubmit.co/ajax/sanjay.pal@compunnel.com',
    subjectPrefix: 'Hiking Trails'
  };
  window.HikingTrails = Object.assign(window.HikingTrails || {}, {
    async sendForm(payload, subject){
      const body = Object.assign({
        _subject: FORMS.subjectPrefix + ' — ' + subject,
        _template: 'table',
        _captcha: 'false'
      }, payload);
      const res = await fetch(FORMS.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });
      if(!res.ok) throw new Error('Delivery failed (' + res.status + ')');
      return res.json().catch(() => ({}));
    },
    mailtoFallback(payload, subject){
      const lines = Object.entries(payload).map(([k, v]) => k + ': ' + v).join('\n');
      return 'mailto:' + FORMS.to +
        '?subject=' + encodeURIComponent(FORMS.subjectPrefix + ' — ' + subject) +
        '&body=' + encodeURIComponent(lines);
    },
    formsTo: FORMS.to
  });

  const A11Y_KEY = 'ht-a11y';
  const A11Y_OPTS = [
    { id: 'bigger',    cls: 'a11y-bigger',    label: 'Larger text',
      hint: 'Scales the whole page to 115%' },
    { id: 'contrast',  cls: 'a11y-contrast',  label: 'Higher contrast',
      hint: 'Darkens body text and strengthens borders' },
    { id: 'links',     cls: 'a11y-links',     label: 'Underline links',
      hint: 'Never relies on colour alone' },
    { id: 'motion',    cls: 'a11y-motion',    label: 'Reduce motion',
      hint: 'Stops animation, autoplay and smooth scrolling' },
    { id: 'spacing',   cls: 'a11y-spacing',   label: 'More text spacing',
      hint: 'Increases line height and letter spacing' }
  ];

  function a11yHTML() {
    const rows = A11Y_OPTS.map(o => `
        <li>
          <label class="a11y-row" for="a11y-${o.id}">
            <span class="a11y-text"><b>${o.label}</b><em>${o.hint}</em></span>
            <input type="checkbox" id="a11y-${o.id}" data-a11y="${o.cls}">
            <span class="a11y-switch" aria-hidden="true"></span>
          </label>
        </li>`).join('');
    return `
  <button class="a11y-fab" id="a11yFab" aria-expanded="false" aria-controls="a11yPanel"
          aria-label="Accessibility options">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="12" cy="6.4" r="1.7" fill="currentColor"/>
      <path d="M4.9 9.1c2.3.8 4.6 1.2 7.1 1.2s4.8-.4 7.1-1.2" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round"/>
      <path d="M12 10.3v4.1m0 0-2.6 5.2m2.6-5.2 2.6 5.2" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="a11y-panel" id="a11yPanel" role="dialog" aria-modal="false"
       aria-labelledby="a11yTitle" hidden>
    <div class="a11y-head">
      <h2 id="a11yTitle">Accessibility</h2>
      <button type="button" class="a11y-close" id="a11yClose" aria-label="Close accessibility options">
        <span class="close-label">Close</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <ul class="a11y-list">${rows}</ul>
    <button type="button" class="a11y-reset" id="a11yReset">Reset all</button>
    <p class="a11y-note">Your browser and operating system settings are respected as well —
      this panel only adds to them.</p>
  </div>`;
  }

  function initA11y() {
    const fab = $('#a11yFab'), panel = $('#a11yPanel'), root = document.documentElement;
    if (!fab || !panel) return;
    let state = {};
    try { state = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}'); } catch (e) { state = {}; }

    function apply() {
      A11Y_OPTS.forEach(o => {
        const on = !!state[o.cls];
        root.classList.toggle(o.cls, on);
        const box = $('#a11y-' + o.id);
        if (box) box.checked = on;
      });
      try { localStorage.setItem(A11Y_KEY, JSON.stringify(state)); } catch (e) {}
    }
    apply();

    $$('input[data-a11y]', panel).forEach(box => {
      box.addEventListener('change', () => {
        state[box.dataset.a11y] = box.checked;
        apply();
        // pause the hero when motion is reduced mid-session
        if (box.dataset.a11y === 'a11y-motion' && box.checked) {
          $$('video').forEach(v => v.pause());
        }
      });
    });

    $('#a11yReset').addEventListener('click', () => {
      state = {}; apply();
      $('#a11yReset').focus();
    });

    function open() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => panel.classList.add('is-open'));
      const first = $('input', panel); if (first) first.focus();
    }
    function close(focusBack) {
      panel.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      setTimeout(() => { panel.hidden = true; }, 200);
      if (focusBack !== false) fab.focus();
    }
    fab.addEventListener('click', () =>
      fab.getAttribute('aria-expanded') === 'true' ? close() : open());
    $('#a11yClose').addEventListener('click', () => close());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
    document.addEventListener('click', e => {
      if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) close(false);
    });
  }

  function modalHTML() {
    const trails = ['Winkler Botanical Preserve — full route', 'the entrance to Alexandria (day ride)',
      'Green Trail (1.25 miles)', 'Red Trail (0.4 miles)', 'Yellow Trail (0.3 miles)',
      'White Trail (0.45 miles)', 'Guided walk with the team', 'Not sure yet'];
    return `
  <div class="modal" id="bookModal" role="dialog" aria-modal="true" aria-labelledby="bookTitle">
    <button class="modal-close icon-btn" id="bookClose" aria-label="Close booking form">
      <span class="close-label">Close</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
    <div class="modal-card" id="bookCard">
      <h2 id="bookTitle">Book your trail</h2>
      <p>Tell us when you are coming and what you want to ride or walk. We reply within two working days.</p>
      <form id="bookForm" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="bkName">Full name</label>
            <input id="bkName" name="name" type="text" autocomplete="name" required>
            <span class="err" data-for="bkName"></span>
          </div>
          <div class="field">
            <label for="bkEmail">Email</label>
            <input id="bkEmail" name="email" type="email" autocomplete="email" required>
            <span class="err" data-for="bkEmail"></span>
          </div>
          <div class="field">
            <label for="bkDate">Preferred date</label>
            <input id="bkDate" name="date" type="date" required>
            <span class="err" data-for="bkDate"></span>
          </div>
          <div class="field">
            <label for="bkPeople">Party size</label>
            <input id="bkPeople" name="people" type="number" min="1" max="40" value="2" required>
            <span class="err" data-for="bkPeople"></span>
          </div>
          <div class="field field--full">
            <label for="bkTrail">Which trail</label>
            <select id="bkTrail" name="trail">${trails.map(t => `<option>${t}</option>`).join('')}</select>
          </div>
          <div class="field field--full">
            <label for="bkNotes">Anything we should know</label>
            <textarea id="bkNotes" name="notes" placeholder="Experience level, bikes needed, accessibility…"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" type="submit">Request booking ${ARROW}</button>
          <span class="modal-note">No payment taken now.</span>
        </div>
      </form>
    </div>
  </div>`;
  }

  /* ---------- footer ridge ----------
     Traced column by column from the reference footer, then mirrored so the
     3022px tile repeats with no seam. */
  const RIDGE_D = 'M0,43.0 L21,48.0 L42,56.9 L63,63.9 L84,66.4 L105,75.1 L126,85.4 L147,89.4 L168,99.1 L189,117.9 L210,122.3 L231,120.3 L252,122.1 L273,127.0 L294,126.6 L315,123.3 L336,118.3 L357,112.4 L378,105.2 L399,98.9 L420,93.6 L441,88.3 L462,81.9 L483,74.4 L504,64.7 L525,53.7 L546,45.4 L567,39.4 L588,44.4 L609,53.0 L630,58.4 L651,63.1 L672,69.6 L693,64.9 L714,41.4 L735,26.6 L756,20.6 L777,19.4 L798,31.1 L819,48.6 L840,56.4 L861,54.1 L882,62.6 L903,64.4 L924,49.4 L945,42.6 L966,47.4 L987,52.6 L1008,51.4 L1029,48.1 L1050,38.9 L1071,32.4 L1092,41.1 L1113,45.6 L1134,42.6 L1155,44.9 L1176,58.6 L1197,72.1 L1218,68.4 L1239,66.1 L1260,68.9 L1281,77.4 L1302,86.1 L1323,86.1 L1344,89.4 L1365,95.9 L1386,101.4 L1407,107.4 L1428,112.4 L1449,114.9 L1470,114.1 L1491,109.4 L1511,105.0 L1511,105.0 L1531,109.4 L1552,114.1 L1573,114.9 L1594,112.4 L1615,107.4 L1636,101.4 L1657,95.9 L1678,89.4 L1699,86.1 L1720,86.1 L1741,77.4 L1762,68.9 L1783,66.1 L1804,68.4 L1825,72.1 L1846,58.6 L1867,44.9 L1888,42.6 L1909,45.6 L1930,41.1 L1951,32.4 L1972,38.9 L1993,48.1 L2014,51.4 L2035,52.6 L2056,47.4 L2077,42.6 L2098,49.4 L2119,64.4 L2140,62.6 L2161,54.1 L2182,56.4 L2203,48.6 L2224,31.1 L2245,19.4 L2266,20.6 L2287,26.6 L2308,41.4 L2329,64.9 L2350,69.6 L2371,63.1 L2392,58.4 L2413,53.0 L2434,44.4 L2455,39.4 L2476,45.4 L2497,53.7 L2518,64.7 L2539,74.4 L2560,81.9 L2581,88.3 L2602,93.6 L2623,98.9 L2644,105.2 L2665,112.4 L2686,118.3 L2707,123.3 L2728,126.6 L2749,127.0 L2770,122.1 L2791,120.3 L2812,122.3 L2833,117.9 L2854,99.1 L2875,89.4 L2896,85.4 L2917,75.1 L2938,66.4 L2959,63.9 L2980,56.9 L3001,48.0 L3022,43.0 L3022,140 L0,140 Z';

  /* ---------- behaviour ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mountRidge() {
    const host = $('#mtnFront');
    if (!host) return;
    const tile = `<svg viewBox="0 0 3022 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path fill="var(--c-beige)" d="${RIDGE_D}"/></svg>`;
    host.innerHTML = tile + tile;
  }

  function wireHeader() {
    const header = $('#header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 90);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = $('#burger');
    if (burger) {
      burger.addEventListener('click', () => {
        const open = document.body.classList.toggle('nav-open');
        burger.setAttribute('aria-expanded', String(open));
      });
      $$('#nav a').forEach(a => a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      }));
    }

    const panel = $('#searchPanel'), input = $('#searchInput'), open = $('#searchOpen');
    const results = $('#searchResults');
    if (!panel || !input) return;

    /* ----------------------------------------------------------
       Search runs against window.SEARCH_INDEX (assets/js/search-index.js),
       generated from the site's own content by build_search_index.py.
       No network, no server: everything is matched in the page.
       ---------------------------------------------------------- */
    const norm = s => (s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const esc = s => s.replace(/[&<>"]/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function score(rec, terms) {
      const title = norm(rec.title), text = norm(rec.text), kind = norm(rec.kind);
      let total = 0;
      for (const t of terms) {
        let s = 0;
        if (title === t) s = 120;
        else if (title.startsWith(t)) s = 80;
        else if (new RegExp('\\b' + t).test(title)) s = 60;
        else if (title.includes(t)) s = 40;
        if (kind.includes(t)) s = Math.max(s, 45);
        if (text.includes(t)) s = Math.max(s, new RegExp('\\b' + t).test(text) ? 22 : 12);
        if (!s) return 0;            // every term must appear somewhere
        total += s;
      }
      if (rec.kind === 'Page') total += 6;
      return total;
    }

    function mark(str, terms, limit) {
      let out = str;
      if (limit && out.length > limit) {
        const first = terms.map(t => norm(out).indexOf(t)).filter(i => i >= 0).sort((a, b) => a - b)[0] || 0;
        const from = Math.max(0, first - 30);
        out = (from ? '…' : '') + out.slice(from, from + limit) + (out.length > from + limit ? '…' : '');
      }
      out = esc(out);
      terms.forEach(t => {
        out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
      });
      return out;
    }

    let hits = [], cursor = -1;

    function render(q) {
      const terms = norm(q).split(/\s+/).filter(t => t.length > 1);
      if (!terms.length) {
        results.innerHTML = '';
        results.classList.remove('is-open');
        hits = []; cursor = -1;
        return;
      }
      const index = window.SEARCH_INDEX || [];
      hits = index
        .map(r => ({ r, s: score(r, terms) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(x => x.r);
      cursor = -1;
      results.classList.add('is-open');

      if (!hits.length) {
        results.innerHTML =
          '<p class="search-empty" role="status">Nothing matches <b>' + esc(q) + '</b>.' +
          '<span>Try a place, an activity or a month — waterfalls, kayaking, tunnel, August.</span></p>';
        return;
      }
      results.innerHTML = hits.map((r, i) => {
        const href = r.page + (r.hash || '');
        return '<a class="search-hit" role="option" id="hit-' + i + '" aria-selected="false" href="' + href + '">' +
          '<span class="hit-kind">' + esc(r.kind) + '</span>' +
          '<span class="hit-main"><b>' + mark(r.title, terms) + '</b>' +
          '<em>' + mark(r.text, terms, 110) + '</em></span>' +
          '<span class="hit-page">' + esc(PAGE_LABEL[r.page] || r.page) + '</span></a>';
      }).join('');
      results.innerHTML += '<p class="search-count" role="status">' + hits.length +
        ' result' + (hits.length === 1 ? '' : 's') + ' · press Enter to open the first</p>';
    }

    const PAGE_LABEL = {
      'index.html': 'Home', 'about.html': 'About', 'events.html': 'Events',
      'contact.html': 'Contact', 'plan-your-trail.html': 'Plan Your Trail'
    };

    function move(step) {
      const items = $$('.search-hit', results);
      if (!items.length) return;
      if (cursor >= 0) items[cursor].setAttribute('aria-selected', 'false');
      cursor = (cursor + step + items.length) % items.length;
      items[cursor].setAttribute('aria-selected', 'true');
      items[cursor].scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', items[cursor].id);
    }

    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => render(input.value.trim()), 120);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        const items = $$('.search-hit', results);
        if (items.length) { e.preventDefault(); items[Math.max(cursor, 0)].click(); }
      }
    });

    function show() {
      panel.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 60);
    }
    function hide() {
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      input.value = '';
      render('');
      if (open) open.focus();
    }
    if (open) open.addEventListener('click', show);
    if ($('#searchClose')) $('#searchClose').addEventListener('click', hide);
    panel.addEventListener('click', e => { if (e.target === panel) hide(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) hide();
      // "/" opens search from anywhere, the way most doc sites do
      if (e.key === '/' && !panel.classList.contains('is-open') &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); show();
      }
    });
  }

  function wireBooking() {
    const modal = $('#bookModal');
    if (!modal) return;
    const card = $('#bookCard'), form = $('#bookForm');
    let lastFocus = null;

    function open(trigger) {
      lastFocus = trigger || document.activeElement;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => $('#bkName') && $('#bkName').focus(), 80);
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    /* Any control anywhere on any page opts in with data-book. */
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-book]');
      if (t) { e.preventDefault(); open(t); }
    });
    $('#bookClose').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
      if (e.key === 'Tab' && modal.classList.contains('is-open')) {
        const f = $$('a[href], button, input, select, textarea', modal)
          .filter(el => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    const rules = {
      bkName:   v => v.trim().length >= 2 || 'Please tell us your name.',
      bkEmail:  v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email does not look right.',
      bkDate:   v => !!v || 'Pick a date.',
      bkPeople: v => (+v >= 1 && +v <= 40) || 'Between 1 and 40 people.'
    };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      Object.entries(rules).forEach(([id, test]) => {
        const el = $('#' + id), msg = test(el.value);
        const slot = $(`.err[data-for="${id}"]`);
        if (msg !== true) { slot.textContent = msg; el.setAttribute('aria-invalid', 'true'); ok = false; }
        else { slot.textContent = ''; el.removeAttribute('aria-invalid'); }
      });
      if (!ok) { form.querySelector('[aria-invalid]').focus(); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector('[type="submit"]');
      const restore = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }

      const done = (title, msg, extra) => {
        card.innerHTML = `
        <div class="booking-done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>
          <h2>${title}</h2>
          <p>${msg}</p>${extra || ''}
        </div>`;
      };

      try {
        await window.HikingTrails.sendForm(data, 'Visit request');
        done('Request received',
          `Thanks ${(data.name || '').split(' ')[0]} — we have your request and will reply to
           ${data.email} within two working days.`);
      } catch (err) {
        /* Offline, blocked, or opened straight off the file system: hand the
           visitor a pre-filled email rather than losing what they typed. */
        const href = window.HikingTrails.mailtoFallback(data, 'Visit request');
        done('Almost there',
          'We could not send that from the browser. Open it as an email instead and it will reach us.',
          `<p style="margin-top:14px"><a class="btn-book" href="${href}">Send as email</a></p>`);
        console.warn('Form delivery failed:', err.message);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = restore; }
      }
    });
  }

  /* ---------- mount ---------- */
  function mount() {
    const page = document.body.dataset.page || '';
    const h = document.querySelector('[data-component="header"]');
    const f = document.querySelector('[data-component="footer"]');
    if (h) h.outerHTML = headerHTML(page);
    if (f) f.outerHTML = footerHTML() + modalHTML() + a11yHTML();
    mountRidge();
    wireHeader();
    wireBooking();
    initA11y();          // must run after the panel is in the DOM
    document.dispatchEvent(new CustomEvent('components:ready'));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mount)
    : mount();

  /* ----------------------------------------------------------
     Scroll reveal — lives here so every page gets it, including
     ones with no inline script of their own. Content injected by
     a page script later is picked up by the second pass.
     ---------------------------------------------------------- */
  let revealIO = null;
  function revealAll(root) {
    const els = [...(root || document).querySelectorAll('.reveal:not(.is-in)')];
    if (!els.length) return;
    if (REDUCED) { els.forEach(el => el.classList.add('is-in')); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            revealIO.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    }
    els.forEach(el => revealIO.observe(el));
  }
  window.HikingTrails = Object.assign(window.HikingTrails || {}, { revealAll });

  revealAll();
  window.addEventListener('load', () => revealAll());
  setTimeout(() => revealAll(), 400);   // page scripts that build cards

})();
