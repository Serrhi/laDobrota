// La Dobrota — katalog sýrů: filtr podle mléka a země, otáčecí karty.
import { CHEESES, MILK, COUNTRIES, cheesePic, countryNames, allergenText, cheeseCount, esc } from './data.js';

const grid = document.getElementById('cards');
const chipBox = document.getElementById('filters');
const info = document.getElementById('filter-info');
const params = new URLSearchParams(location.search);
const state = {
  milk: 'vse',
  country: COUNTRIES[params.get('zeme')] ? params.get('zeme') : '',
  open: decodeURIComponent(location.hash.slice(1)),
};

const ICON = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>';

function card(c, i) {
  const n = String(CHEESES.indexOf(c) + 1).padStart(2, '0');
  return `<li class="card is-enter${state.open === c.id ? ' is-open' : ''}" id="${c.id}" data-i="${i}">
    <button class="card__btn" type="button" aria-expanded="${state.open === c.id}" aria-label="${esc(c.name)} – zjistit víc">
      <span class="card__inner">
        <span class="card__face card__front">
          <span class="card__top"><span class="card__milk">${MILK[c.milk].label}</span><span class="card__num">${n}</span></span>
          ${cheesePic(c, 'card__img')}
          <span class="card__name">${esc(c.name)}</span>
          <span class="card__origin">${esc(countryNames(c))}</span>
          <span class="card__more">Zjistit víc ${ICON}</span>
        </span>
        <span class="card__face card__back">
          <span class="card__name">${esc(c.name)}</span>
          <span class="card__text">${esc(c.text)}</span>
          ${c.fact ? `<span class="card__fact"><strong>Víš, že…</strong>${esc(c.fact)}</span>` : ''}
          <span class="card__meta">
            <span class="card__row"><b>Původ</b><span>${esc(countryNames(c))}</span></span>
            <span class="card__row"><b>Alergeny</b><span>${esc(allergenText(c))}</span></span>
            <span class="card__row"><b>Cena s DPH</b><span class="price">${c.price} Kč</span></span>
          </span>
        </span>
      </span>
    </button>
  </li>`;
}

function render() {
  const list = CHEESES.filter((c) => (state.milk === 'vse' || c.milk === state.milk) && (!state.country || c.countries.includes(state.country)));
  grid.innerHTML = list.map(card).join('');
  grid.querySelectorAll('.card').forEach((el) => el.style.setProperty('--i', el.dataset.i));
  chipBox.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.milk === state.milk)));
  if (state.country) {
    info.hidden = false;
    info.querySelector('span').textContent = `Jen sýry ${COUNTRIES[state.country].from}: ${cheeseCount(list.length)}.`;
  } else info.hidden = true;
}

// počty u filtrů
chipBox.querySelectorAll('.chip').forEach((b) => {
  const n = b.dataset.milk === 'vse' ? CHEESES.length : CHEESES.filter((c) => c.milk === b.dataset.milk).length;
  b.textContent = `${b.textContent.trim()} · ${n}`;
  b.addEventListener('click', () => { state.milk = b.dataset.milk; state.open = ''; render(); });
});
info.querySelector('button').addEventListener('click', () => {
  state.country = ''; history.replaceState(null, '', location.pathname); render();
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.card__btn');
  if (!btn) return;
  const el = btn.closest('.card');
  const open = !el.classList.contains('is-open');
  grid.querySelectorAll('.card.is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('.card__btn').setAttribute('aria-expanded', 'false'); });
  el.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
  state.open = open ? el.id : '';
  history.replaceState(null, '', open ? `#${el.id}` : location.pathname + location.search);
});

render();
if (state.open) {
  const target = document.getElementById(state.open);
  if (target) setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
}
