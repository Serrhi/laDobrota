// La Dobrota — společné chování všech stránek: menu, animace při posunu, počítadla.
window.ldReady = true;

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// hlavička
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('is-stuck', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// aktivní položka menu
const here = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
document.querySelectorAll('.nav a').forEach((a) => {
  const path = new URL(a.href).pathname.replace(/\/?$/, '/');
  if (path === here) a.setAttribute('aria-current', 'page');
});

// mobilní menu
const menuBtn = document.querySelector('.menu-btn');
const setMenu = (open) => {
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
};
if (menuBtn) {
  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));
}

// objevování při posunu
export function watchReveal(scope = document) {
  const els = scope.querySelectorAll('.reveal:not(.is-in)');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}
watchReveal();

// počítadla (data-count="16")
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const run = (el) => {
    const to = Number(el.dataset.count);
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

// krátká zpráva dole na obrazovce
export function toast(text) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

// přehrání animace znovu (přidá a odebere třídu)
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}
