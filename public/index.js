(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  // Text size and high contrast (remembered for return visits)
  const scales = [1, 1.15, 1.3];
  const setSize = i => { root.style.setProperty('--scale', scales[i]); $$('[data-size]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.size === i))); store.set('rc-size', i); };
  $$('[data-size]').forEach(b => b.addEventListener('click', () => setSize(+b.dataset.size)));
  setSize(scales[+store.get('rc-size')] ? +store.get('rc-size') : 0);
  const hc = $('#hc');
  const setHC = on => { root.classList.toggle('hc', on); hc.setAttribute('aria-pressed', String(on)); store.set('rc-hc', on ? '1' : '0'); };
  hc.addEventListener('click', () => setHC(!root.classList.contains('hc')));
  setHC(store.get('rc-hc') === '1');

  // Mobile menu
  const btn = $('.menu-btn'), nav = $('#nav');
  const closeMenu = () => { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); btn.focus(); } });

  // Highlight the nav link for the section in view
  const links = $$('.nav a[href^="#"]:not(.btn-nav)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  // Photo placeholders: if an image file is missing, show a labeled slot
  $$('img[data-ph]').forEach(img => {
    const swap = () => { const s = document.createElement('span'); s.className = 'ph ' + img.dataset.ph; s.textContent = img.dataset.label || 'Photo'; s.setAttribute('role', 'img'); s.setAttribute('aria-label', img.alt); img.replaceWith(s); };
    if (img.complete && !img.naturalWidth) swap(); else img.addEventListener('error', swap, { once: true });
  });

  // Tape measure numerals
  const tape = $('#tape');
  if (tape) for (let i = 1; i <= Math.ceil(screen.width / 48) + 2; i++) { const s = document.createElement('span'); s.style.left = i * 48 + 'px'; s.textContent = i; tape.appendChild(s); }

  // Privacy and terms dialogs
  $$('[data-open]').forEach(b => b.addEventListener('click', () => $('#' + b.dataset.open).showModal()));
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    $('[data-close]', d).addEventListener('click', () => d.close());
  });

  // Estimate form: check required fields, then send
  const form = $('#form'), status = $('#status');
  const rules = { name: 'Enter your name.', phone: 'Enter a phone number we can reach you at.', details: 'Describe what needs to be done.' };
  form.addEventListener('submit', async e => {
    e.preventDefault(); status.className = ''; status.textContent = '';
    let first = null;
    Object.keys(rules).forEach(id => {
      const f = $('#' + id), m = $('#' + id + '-e'), bad = !f.value.trim();
      f.setAttribute('aria-invalid', String(bad)); m.hidden = !bad; m.textContent = bad ? rules[id] : '';
      if (bad) { f.setAttribute('aria-describedby', id + '-e'); first = first || f; }
    });
    if (first) { status.className = 'bad'; status.textContent = 'Please fix the highlighted fields.'; first.focus(); return; }
    status.textContent = 'Sending…';
    try {
      const r = await fetch('/', { method: 'POST', body: new FormData(form) });
      if (!r.ok) throw new Error();
      form.reset(); status.className = 'good'; status.textContent = 'Thank you. Your request was sent and we’ll be in touch.';
    } catch (err) { status.className = 'bad'; status.textContent = 'Your request didn’t send. Please call (931) 477-5805.'; }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
