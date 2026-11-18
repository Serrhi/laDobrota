// La Dobrota — domovská stránka: 3D bochník s fakty a výběr sýra podle mléka.
import { createCheese } from './cheese3d.js';
import { CHEESES, MILK, COUNTRIES, cheeseImg, countryNames } from './data.js';
import { replay } from './site.js';

// ----- 3D bochník a zlaté body -----
const FACTS = [
  { where: 'top', a: 3.55, b: 0.52, q: 'Proč má sýr díry?', text: 'Při zrání vzniká v těstě oxid uhličitý. Bublinky nemají kudy ven, a tak v sýru zůstanou jako oka.' },
  { where: 'side', a: 2.95, b: -0.05, q: 'Kolik mléka je v sýru?', text: 'Na jeden kilogram tvrdého sýra je potřeba zhruba deset litrů mléka.' },
  { where: 'wedge', a: 0, b: 0.5, q: 'Proč sýr zraje?', text: 'Zráním se mění chuť i vůně. Čím déle sýr zraje, tím je výraznější.' },
];

const stage = document.getElementById('stage');
const canvas = document.getElementById('cheese');
const fact = document.getElementById('fact');
const cut = document.getElementById('cut');
const spots = [...stage.querySelectorAll('.spot')];

if (canvas && canvas.getContext) {
  const cheese = createCheese(canvas, {
    host: stage,
    onFrame(api) {
      spots.forEach((btn, i) => {
        const f = FACTS[i];
        const p = api.spot(f.where, f.a, f.b);
        btn.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
        btn.classList.toggle('is-hidden', !p.visible);
      });
    },
    onWedge(open) { cut.textContent = open ? 'Vrátit dílek' : 'Ukrojit dílek'; cut.setAttribute('aria-pressed', String(open)); },
  });
  stage.classList.add('is-live');

  const show = (i, turn) => {
    spots.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    fact.querySelector('.fact__q').textContent = FACTS[i].q;
    fact.querySelector('.fact__a').textContent = FACTS[i].text;
    replay(fact, 'is-swap');
    if (turn && FACTS[i].where === 'side') cheese.face(FACTS[i].a);
    if (turn && FACTS[i].where === 'wedge') cheese.face(cheese.WEDGE_AT);
  };
  spots.forEach((btn, i) => {
    btn.addEventListener('click', () => show(i, true));
    btn.addEventListener('focus', () => { if (btn.classList.contains('is-hidden')) show(i, true); });
  });
  cut.addEventListener('click', () => cheese.toggleWedge());
}

// ----- výběr sýra podle mléka -----
const taste = document.getElementById('taste');
if (taste) {
  const chips = [...document.querySelectorAll('[data-milk]')];
  const featured = { kravske: 'karamelovy-syr-brunost', ovci: 'pecorino-s-pistaciemi', kozi: 'kozi-syr-s-medem' };
  const state = { milk: 'kravske', i: 0 };
  const list = () => CHEESES.filter((c) => c.milk === state.milk);
  const el = (sel) => taste.querySelector(sel);

  const render = (animate) => {
    const all = list();
    const c = all[state.i];
    el('.taste__img').src = cheeseImg(c);
    el('.taste__img').alt = c.name;
    el('.eyebrow').textContent = `${MILK[c.milk].from} · ${countryNames(c)}`;
    el('.taste__name').textContent = c.name;
    el('.taste__text').textContent = c.text;
    el('.taste__tags').replaceChildren(...[`${state.i + 1} / ${all.length}`, ...c.countries.map((k) => COUNTRIES[k].name), `${c.price} Kč`].map((t) => {
      const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; return s;
    }));
    el('.taste__link').href = `/syry/#${c.id}`;
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.milk === state.milk)));
    if (animate) replay(taste, 'is-swap');
  };
  chips.forEach((b) => b.addEventListener('click', () => {
    state.milk = b.dataset.milk;
    state.i = Math.max(0, list().findIndex((c) => c.id === featured[state.milk]));
    render(true);
  }));
  el('.taste__next').addEventListener('click', () => { state.i = (state.i + 1) % list().length; render(true); });
  el('.taste__prev').addEventListener('click', () => { state.i = (state.i - 1 + list().length) % list().length; render(true); });
  state.i = Math.max(0, list().findIndex((c) => c.id === featured[state.milk]));
  render(false);
}
