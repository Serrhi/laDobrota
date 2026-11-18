// La Dobrota — stránka O nás: tým, veletrh a kontakty z data.js.
import { TEAM, FAIR, esc } from './data.js';

const team = document.getElementById('team');
if (team) {
  team.innerHTML = TEAM.map((m, i) => {
    const n = String(i + 1).padStart(2, '0');
    const photo = m.photo
      ? `<img class="real" src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">`
      : `<span>${n}</span><img class="ph" src="/assets/img/logo-mark.svg" alt="" width="84" height="76">`;
    return `<li class="member reveal" data-d="${i % 6}">
      <div class="member__photo">${photo}</div>
      <div><div class="member__name">${esc(m.name || 'Představíme se brzy')}</div>
      <div class="member__role">${esc(m.role || 'člen týmu La Dobrota')}</div></div></li>`;
  }).join('');
  team.querySelectorAll('.member').forEach((el) => el.style.setProperty('--d', el.dataset.d));
}

const fair = document.getElementById('fair');
if (fair) {
  if (FAIR.name) {
    fair.querySelector('.fair__title').textContent = FAIR.name;
    const tags = [FAIR.date, FAIR.place, FAIR.stand && `stánek č. ${FAIR.stand}`].filter(Boolean);
    fair.querySelector('.fair__tags').innerHTML = tags.map((t) => `<span>${esc(t)}</span>`).join('');
    fair.querySelector('p').textContent = 'Přijď ochutnat a ukaž nám svůj výsledek ze sýrového kvízu.';
  }
}

import('./site.js').then((m) => m.watchReveal());
