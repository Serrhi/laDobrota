// La Dobrota — interaktivní mapa Evropy: klik na zemi ukáže sýry, které z ní jsou.
import { COUNTRIES, COUNTRY_ORDER, MILK, cheesesFrom, cheeseImg, cheeseCount, esc } from './data.js';
import { replay } from './site.js';

const map = document.getElementById('map');
const chips = document.getElementById('countries');
const info = document.getElementById('mapinfo');
let current = COUNTRIES[location.hash.slice(1)] ? location.hash.slice(1) : 'nl';

chips.innerHTML = COUNTRY_ORDER.map((k) => `<button class="chip" type="button" data-key="${k}" aria-pressed="false">${esc(COUNTRIES[k].name)} · ${cheesesFrom(k).length}</button>`).join('');
map.insertAdjacentHTML('beforeend', COUNTRY_ORDER.map((k) => `<button class="pin" type="button" data-key="${k}" data-x="${COUNTRIES[k].x}" data-y="${COUNTRIES[k].y}" aria-pressed="false" aria-label="${esc(COUNTRIES[k].name)}">${COUNTRIES[k].code}</button>`).join(''));
map.querySelectorAll('.pin').forEach((p) => { p.style.left = `${p.dataset.x}%`; p.style.top = `${p.dataset.y}%`; });

function select(key, animate = true) {
  current = key;
  const list = cheesesFrom(key);
  document.querySelectorAll('[data-key]').forEach((el) => {
    const on = el.dataset.key === key;
    if (el.matches('.country')) el.classList.toggle('is-on', on); else el.setAttribute('aria-pressed', String(on));
  });
  info.querySelector('.eyebrow').textContent = cheeseCount(list.length);
  info.querySelector('.mapinfo__name').textContent = COUNTRIES[key].name;
  info.querySelector('.mapinfo__list').innerHTML = list.map((c, i) => `<li data-i="${i}"><a class="row" href="/syry/#${c.id}">
    <img src="${esc(cheeseImg(c))}" alt="" width="84" height="63">
    <span><span class="row__name">${esc(c.short || c.name)}</span><span class="row__milk">${MILK[c.milk].adj} sýr · ${c.price} Kč</span></span></a></li>`).join('');
  info.querySelectorAll('li').forEach((li) => li.style.setProperty('--i', li.dataset.i));
  info.querySelector('.link-arrow').href = `/syry/?zeme=${key}`;
  info.querySelector('.link-arrow span').textContent = `Všechny sýry ${COUNTRIES[key].from}`;
  if (animate) { replay(info, 'is-swap'); history.replaceState(null, '', `#${key}`); }
  const chip = chips.querySelector('[aria-pressed="true"]');
  if (chip && animate && chips.scrollWidth > chips.clientWidth) chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-key]');
  if (el && (el.closest('#map') || el.closest('#countries'))) select(el.dataset.key);
});

// mapa se vloží přímo do stránky, aby šlo klikat na jednotlivé země
fetch('/assets/img/mapa/europa.svg')
  .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
  .then((svg) => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    if (doc.nodeName !== 'svg') return;
    const old = map.querySelector('img');
    map.insertBefore(document.importNode(doc, true), map.firstChild);
    if (old) old.remove();
    select(current, false);
  })
  .catch(() => { /* zůstane obrázek mapy, značky a tlačítka fungují dál */ });

select(current, false);
