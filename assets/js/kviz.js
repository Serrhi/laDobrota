// La Dobrota — sýrový kvíz. Dva režimy:
//  1) „Jaký sýr jsi?“ – osobnostní test, výsledkem je jeden z osmi sýrů z katalogu,
//  2) „Sýrový znalec“ – vědomostní kvíz s ověřenými fakty a vysvětlením ke každé otázce.
import { cheeseById, cheeseImg, COUNTRIES, esc } from './data.js';
import { toast } from './site.js';

const box = document.getElementById('quiz');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE = 'ladobrota-kviz';

// ---------- 1) osobnostní test ----------
// Zkratky sýrů. Každá odpověď dává 2 body prvnímu a 1 bod druhému sýru.
// Každý sýr má v testu stejnou šanci: třikrát může dostat 2 body a třikrát 1 bod.
const TYPES = {
  G: { id: 'gouda', title: 'Jsi Gouda', sub: 'Pohodář, se kterým si rozumí každý', tags: ['pohoda', 'přátelství', 'spolehlivost'],
    text: 'Jsi kliďas a parťák do nepohody. Stejně jako gouda zapadneš všude – na snídani i na oslavu.' },
  C: { id: 'camembert', title: 'Jsi Camembert', sub: 'Jemná duše s měkkým srdcem', tags: ['cit', 'romantika', 'klid'],
    text: 'Navenek klid, uvnitř samý cit. Umíš si vychutnat hezké chvíle a nikam nespěcháš.' },
  E: { id: 'emental', title: 'Jsi Ementál', sub: 'Vtipálek, který má rád lidi', tags: ['humor', 'optimismus', 'otevřenost'],
    text: 'Kde jsi ty, tam je veselo. A že máš sem tam díru? Právě díky nim si tě všichni pamatují.' },
  R: { id: 'raclette', title: 'Jsi Raclette', sub: 'Duše každé party', tags: ['zábava', 'pohostinnost', 'energie'],
    text: 'Nejlíp ti je, když se kolem stolu sejde celá parta. Umíš lidi rozehřát – přesně jako raclette, které se podává rozpečené.' },
  M: { id: 'manchego-dop', title: 'Jsi Manchego', sub: 'Elegance s charakterem', tags: ['elegance', 'hrdost', 'styl'],
    text: 'Víš, co chceš, a máš styl. Jsi pýchou své party, stejně jako je Manchego pýchou Španělska.' },
  B: { id: 'karamelovy-syr-brunost', title: 'Jsi karamelový Brunost', sub: 'Originál, kterého nikdo nečeká', tags: ['originalita', 'odvaha', 'překvapení'],
    text: 'Nikdo tě nezařadí do škatulky. Vypadáš jinak, chutnáš jinak – a právě proto si tě lidé zamilují.' },
  U: { id: 'uzeny-kremovy-syr', title: 'Jsi Uzený krémový sýr', sub: 'Dobrodruh od táboráku', tags: ['dobrodružství', 'příroda', 'oheň'],
    text: 'Voníš dálkami a ohněm. Navenek drsňák, uvnitř ale úplně hladký a krémový.' },
  K: { id: 'kozi-syr-s-medem', title: 'Jsi Kozí sýr s medem', sub: 'Sladká duše', tags: ['laskavost', 'něha', 'péče'],
    text: 'Umíš osladit den každému kolem. Ostrá slova u tebe nikdo nehledá.' },
};

const PERSON = [
  { q: 'Jak vypadá tvoje ideální sobota?', a: [
    ['Gauč, deka a dobrý seriál', 'G', 'C'], ['Výlet do přírody a večer oheň', 'U', 'K'],
    ['Velká oslava se všemi kamarády', 'R', 'E'], ['Poznat město, které ještě neznám', 'M', 'B']] },
  { q: 'Co nesmí chybět na stole?', a: [
    ['Čerstvý chleba a máslo', 'E', 'G'], ['Něco sladkého na závěr', 'K', 'B'],
    ['Hrozny a olivy', 'C', 'M'], ['Jídlo, u kterého sedí celá parta', 'R', 'U']] },
  { q: 'Jak by tě popsali kamarádi?', a: [
    ['Vtipálek, se kterým je legrace', 'E', 'R'], ['Kliďas, na kterého je spoleh', 'G', 'K'],
    ['Originál, který vždycky překvapí', 'B', 'U'], ['Člověk se stylem', 'M', 'C']] },
  { q: 'Co ti hraje ve sluchátkách?', a: [
    ['Hity, které rozjedou každou party', 'R', 'E'], ['Klidná hudba na dlouhé večery', 'C', 'G'],
    ['Kytara a písničky k ohni', 'U', 'M'], ['Něco, co skoro nikdo nezná', 'B', 'K']] },
  { q: 'Kam vyrazíš na dovolenou snů?', a: [
    ['Slunce, moře a staré uličky', 'M', 'C'], ['Chalupa a klid na venkově', 'K', 'G'],
    ['Sever, fjordy a polární záře', 'B', 'U'], ['Hory a chata s celou partou', 'E', 'R']] },
  { q: 'Jaká je tvoje superschopnost?', a: [
    ['Vyjdu úplně s každým', 'G', 'E'], ['Vidím krásu v maličkostech', 'C', 'M'],
    ['Nebojím se zkusit cokoli', 'U', 'B'], ['Umím udělat radost', 'K', 'R']] },
];

// ---------- 2) vědomostní kvíz ----------
// První odpověď je vždy správná; pořadí se při každé hře zamíchá.
const KNOW = [
  { q: 'Kolik litrů mléka je zhruba potřeba na 1 kg tvrdého sýra?', a: ['10 litrů', '2 litry', '5 litrů', '25 litrů'],
    why: 'Na kilogram tvrdého sýra padne zhruba deset litrů mléka. Většina vody z něj odteče jako syrovátka.' },
  { q: 'Proč má ementál díry?', a: ['Při zrání v něm vznikají bublinky plynu', 'Vykusují je myši', 'Vrtají se do něj kvůli vzhledu', 'Vzniknou až při krájení'],
    why: 'Bakterie v sýru při zrání uvolňují oxid uhličitý. Bublinky nemají kudy ven a zůstanou v těstě jako oka.' },
  { q: 'Z jakého mléka se vyrábí Manchego?', a: ['Z ovčího', 'Z kravského', 'Z kozího', 'Z buvolího'],
    why: 'Manchego se vyrábí z mléka ovcí plemene manchega ve španělském kraji La Mancha.' },
  { q: 'Co znamená francouzské slovo, podle kterého se jmenuje raclette?', a: ['Škrábat', 'Rozpustit', 'Horský sýr', 'Malý bochník'],
    why: 'Název pochází ze slova „racler“ – škrábat. Roztavený sýr se seškrabává přímo na talíř.' },
  { q: 'Proč chutná norský brunost jako karamel?', a: ['Při vaření syrovátky zkaramelizuje mléčný cukr', 'Přidává se do něj karamel', 'Sladí se medem', 'Zraje v sudech od sirupu'],
    why: 'Brunost vzniká dlouhým vařením syrovátky se smetanou. Mléčný cukr při tom zkaramelizuje a sýr zhnědne.' },
  { q: 'Proč je kozí sýr bělejší než kravský?', a: ['Kozí mléko neobsahuje žluté barvivo beta-karoten', 'Kozí sýr se bělí', 'Přidává se do něj smetana', 'Zraje kratší dobu'],
    why: 'Kozy přeměňují beta-karoten na bezbarvý vitamin A. Jejich mléko i sýr proto zůstávají bílé.' },
  { q: 'Podle čeho se jmenuje gouda?', a: ['Podle nizozemského města', 'Podle jména sýraře', 'Podle plemene krav', 'Podle tvaru bochníku'],
    why: 'Gouda je město v Nizozemsku, kde se s tímto sýrem odedávna obchodovalo.' },
  { q: 'Co je lanýž, který najdeš v jednom z našich kozích sýrů?', a: ['Houba, která roste pod zemí', 'Druh ořechu', 'Koření z Asie', 'Sušené ovoce'],
    why: 'Lanýž je vzácná houba. Její plodnice rostou pod zemí u kořenů stromů.' },
];
const RANKS = [[8, 'Sýrový mistr', 'Bez jediné chyby. U našeho stánku ti rádi zatleskáme.'], [6, 'Sýrový znalec', 'Skoro všechno správně. O sýrech toho víš opravdu hodně.'],
  [4, 'Sýrový učeň', 'Dobrý základ. Pár sýrových tajemství už znáš.'], [0, 'Sýrový nováček', 'Každý mistr jednou začínal. Zkus to znovu, odpovědi si teď už pamatuješ.']];

const ARROW = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const BACK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const KEYS = ['A', 'B', 'C', 'D'];

const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
const save = (patch) => { try { localStorage.setItem(STORE, JSON.stringify({ ...load(), ...patch })); } catch (e) { /* soukromé okno */ } };
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const top = () => box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });

let state = {};

// ---------- úvodní výběr ----------
function start() {
  state = { view: 'start' };
  const last = load();
  const lastType = last.person && TYPES[last.person];
  const bits = [];
  if (lastType) bits.push(`Minule ti vyšlo: <strong>${esc(lastType.title.replace('Jsi ', ''))}</strong>`);
  if (typeof last.know === 'number') bits.push(`Nejlepší skóre znalce: <strong>${last.know} / ${KNOW.length}</strong>`);
  box.innerHTML = `
    <div class="modes">
      <button class="mode reveal" type="button" data-mode="person">
        <img src="/assets/img/syry/02-gouda.svg" alt="" width="147" height="110">
        <span class="eyebrow">6 otázek · 1 minuta</span>
        <span class="mode__title">Jaký sýr jsi ty?</span>
        <span class="mode__text">Osobnostní test. Podle odpovědí ti vybereme jeden z osmi sýrů z našeho katalogu.</span>
        <span class="mode__go">Spustit test ${ARROW}</span>
      </button>
      <button class="mode reveal" type="button" data-mode="know">
        <img src="/assets/img/syry/09-emental.svg" alt="" width="147" height="110">
        <span class="eyebrow">${KNOW.length} otázek · 2 minuty</span>
        <span class="mode__title">Sýrový znalec</span>
        <span class="mode__text">Vědomostní kvíz. Ke každé otázce se dozvíš, jak to se sýrem doopravdy je.</span>
        <span class="mode__go">Spustit kvíz ${ARROW}</span>
      </button>
    </div>
    ${bits.length ? `<p class="last">${bits.join('<span aria-hidden="true">·</span>')}</p>` : ''}`;
  box.querySelectorAll('.mode').forEach((el, i) => { el.style.setProperty('--d', i); requestAnimationFrame(() => el.classList.add('is-in')); });
}

// ---------- společná karta s otázkou ----------
function frame(count, total, body, canBack) {
  box.innerHTML = `
    <div class="panel qcard">
      <div class="qbar">
        <button class="qback" type="button" ${canBack ? '' : 'disabled'}>${BACK} Zpět</button>
        <div class="qbar__track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}" aria-label="Postup kvízu"><div class="qbar__fill"></div></div>
        <div class="qbar__count">${count + 1} / ${total}</div>
      </div>
      ${body}
    </div>`;
  const fill = box.querySelector('.qbar__fill');
  fill.style.transform = `scaleX(${state.prevFill ?? 0})`;
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transform = `scaleX(${count / total})`; }));
  state.prevFill = count / total;
  box.querySelector('.qback').addEventListener('click', () => state.back && state.back());
}
const answersHtml = (list) => `<div class="answers">${list.map((t, i) => `<button class="answer" type="button" data-i="${i}"><span class="answer__key">${KEYS[i]}</span><span>${esc(t)}</span></button>`).join('')}</div>`;

// ---------- osobnostní test ----------
function person(i, dir = 'q-in') {
  state.view = 'person'; state.i = i;
  const q = PERSON[i];
  frame(i, PERSON.length, `<div class="${dir} qwrap"><h2 class="qtext">${esc(q.q)}</h2>${answersHtml(q.a.map((x) => x[0]))}</div>`, true);
  state.back = () => { if (i === 0) start(); else { state.picks.pop(); person(i - 1, 'q-back'); } };
  state.pick = (k, btn) => {
    if (state.lock) return;
    state.lock = true; btn.classList.add('is-picked');
    state.picks[i] = k;
    setTimeout(() => { state.lock = false; if (i + 1 < PERSON.length) person(i + 1); else personResult(); }, reduce ? 0 : 380);
  };
}

function personScores() {
  const s = Object.fromEntries(Object.keys(TYPES).map((k) => [k, 0]));
  state.picks.forEach((k, qi) => {
    const [, first, second] = PERSON[qi].a[k];
    s[first] += 2 + qi * 0.001;   // při shodě rozhodne pozdější otázka
    s[second] += 1;
  });
  return Object.entries(s).sort((a, b) => b[1] - a[1]);
}

function personResult() {
  state.view = 'personResult';
  const ranked = personScores();
  const [key] = ranked[0];
  const t = TYPES[key];
  const c = cheeseById(t.id);
  const next = ranked.slice(1, 3).map(([k]) => TYPES[k].title.replace('Jsi ', '').replace('karamelový ', '')).join(' a ');
  save({ person: key });
  box.innerHTML = `
    <div class="result" role="status">
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="result__body">
        <p class="eyebrow">Tvůj výsledek · ${esc(t.sub)}</p>
        <h2 class="result__title">${esc(t.title)}</h2>
        <p class="result__text">${esc(t.text)}</p>
        <div class="taste__tags">${t.tags.map((x) => `<span class="tag tag--ink">${esc(x)}</span>`).join('')}</div>
        <div class="result__box"><strong>${esc(c.name)} · ${esc(c.countries.map((k) => COUNTRIES[k].name).join(', '))}</strong>${esc(c.fact || c.text)}</div>
        <p class="result__next">Hned za ním: <strong>${esc(next)}</strong></p>
        <div class="btn-row">
          <button class="btn btn--dark" type="button" data-act="share">Sdílet výsledek</button>
          <a class="btn btn--ink" href="/syry/#${c.id}">Prohlédnout sýr</a>
          <button class="btn btn--ink" type="button" data-act="again">Zkusit znovu</button>
        </div>
      </div>
      <div class="result__side">
        <div class="result__disc${c.photo ? ' result__disc--photo' : ''}"><img src="${esc(cheeseImg(c))}" alt="${esc(c.name)}" width="240" height="180"></div>
        <span>Ukaž výsledek u našeho stánku</span>
      </div>
    </div>
    <p class="note"><button class="link-arrow link-btn" type="button" data-act="home">${BACK} Zpět na výběr kvízu</button></p>`;
  state.share = { title: `${t.title} – sýrový kvíz La Dobrota`, text: `${t.title}! ${t.sub}. Jaký sýr jsi ty?` };
  state.again = () => { state.picks = []; state.prevFill = 0; person(0); };
  confetti(box.querySelector('.confetti'));
  top();
}

// ---------- vědomostní kvíz ----------
function know(i, dir = 'q-in') {
  state.view = 'know'; state.i = i;
  const q = state.deck[i];
  frame(i, state.deck.length, `<div class="${dir} qwrap"><h2 class="qtext">${esc(q.q)}</h2>${answersHtml(q.order.map((k) => q.a[k]))}<div class="explain-slot" aria-live="polite"></div></div>`, i === 0);
  state.back = () => start();
  state.pick = (k, btn) => {
    if (state.lock) return;
    state.lock = true;
    const right = q.order[k] === 0;
    if (right) state.score += 1;
    box.querySelectorAll('.answer').forEach((b, bi) => {
      b.disabled = true;
      if (q.order[bi] === 0) b.classList.add('is-right');
    });
    if (!right) btn.classList.add('is-wrong');
    const last = i + 1 >= state.deck.length;
    box.querySelector('.explain-slot').innerHTML = `<div class="explain"><p><strong>${right ? 'Správně!' : 'Tentokrát ne.'}</strong> ${esc(q.why)}</p>
      <button class="btn btn--gold btn--sm" type="button" data-act="next">${last ? 'Zobrazit výsledek' : 'Další otázka'} ${ARROW}</button></div>`;
    const nextBtn = box.querySelector('[data-act="next"]');
    nextBtn.focus({ preventScroll: true });
    nextBtn.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    state.next = () => { state.lock = false; if (last) knowResult(); else know(i + 1); };
  };
}

function knowResult() {
  state.view = 'knowResult';
  const n = state.score, total = state.deck.length;
  const [, rank, text] = RANKS.find((r) => n >= r[0]);
  const best = Math.max(n, load().know ?? 0);
  save({ know: best });
  box.innerHTML = `
    <div class="result" role="status">
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="result__body">
        <p class="eyebrow">Tvůj výsledek · sýrový znalec</p>
        <h2 class="result__title">${esc(rank)}</h2>
        <p class="result__text">${esc(text)}</p>
        <div class="result__box"><strong>Tvoje nejlepší skóre</strong>${best} z ${total} správných odpovědí</div>
        <div class="btn-row">
          <button class="btn btn--dark" type="button" data-act="share">Sdílet výsledek</button>
          <button class="btn btn--ink" type="button" data-act="again">Zkusit znovu</button>
          <button class="btn btn--ink" type="button" data-act="person">Jaký sýr jsi ty?</button>
        </div>
      </div>
      <div class="result__side">
        <div class="result__disc"><span class="result__score">${n}<small> / ${total}</small></span></div>
        <span>Ukaž výsledek u našeho stánku</span>
      </div>
    </div>
    <p class="note"><button class="link-arrow link-btn" type="button" data-act="home">${BACK} Zpět na výběr kvízu</button></p>`;
  state.share = { title: 'Sýrový znalec – kvíz La Dobrota', text: `${rank}: ${n} z ${total} v sýrovém kvízu La Dobrota. Zvládneš víc?` };
  state.again = () => startKnow();
  if (n >= 6) confetti(box.querySelector('.confetti'));
  top();
}

function startKnow() {
  state = { deck: shuffle(KNOW).map((q) => ({ ...q, order: shuffle([0, 1, 2, 3]) })), score: 0, prevFill: 0 };
  know(0);
}
function startPerson() { state = { picks: [], prevFill: 0 }; person(0); }

// ---------- konfety ze sýrových ok ----------
function confetti(canvas) {
  if (reduce || !canvas) return;
  const ctx = canvas.getContext('2d');
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = r.width * dpr; canvas.height = r.height * dpr; ctx.scale(dpr, dpr);
  const colors = ['#060504', '#F5EFE0', '#8A6A1E', '#FFFFFF'];
  const bits = Array.from({ length: 70 }, () => ({
    x: r.width * (0.2 + Math.random() * 0.6), y: -20 - Math.random() * r.height * 0.5,
    vx: (Math.random() - 0.5) * 120, vy: 120 + Math.random() * 260, s: 4 + Math.random() * 9,
    c: colors[Math.floor(Math.random() * colors.length)], ring: Math.random() < 0.45, wob: Math.random() * 6,
  }));
  let t0 = performance.now(), last = t0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, r.width, r.height);
    const fade = Math.max(0, 1 - (now - t0) / 3200);
    bits.forEach((b) => {
      b.y += b.vy * dt; b.x += (b.vx + Math.sin((now / 300) + b.wob) * 40) * dt;
      ctx.globalAlpha = 0.75 * fade; ctx.beginPath(); ctx.arc(b.x, b.y, b.s, 0, Math.PI * 2);
      if (b.ring) { ctx.strokeStyle = b.c; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = b.c; ctx.fill(); }
    });
    if (fade > 0 && canvas.isConnected) requestAnimationFrame(tick); else ctx.clearRect(0, 0, r.width, r.height);
  };
  requestAnimationFrame(tick);
}

async function share() {
  const url = location.origin + '/kviz/';
  const data = { ...state.share, url };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(`${data.text} ${url}`);
    toast('Zkopírováno. Vlož to kamarádům do zprávy.');
  } catch (e) {
    if (e && e.name !== 'AbortError') toast('Sdílení se nepovedlo. Ukaž výsledek rovnou na telefonu.');
  }
}

// ---------- ovládání ----------
box.addEventListener('click', (e) => {
  const mode = e.target.closest('[data-mode]');
  if (mode) { (mode.dataset.mode === 'person' ? startPerson : startKnow)(); top(); return; }
  const ans = e.target.closest('.answer');
  if (ans && state.pick) { state.pick(Number(ans.dataset.i), ans); return; }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  const a = act.dataset.act;
  if (a === 'next' && state.next) state.next();
  if (a === 'again' && state.again) { state.again(); top(); }
  if (a === 'home') { start(); top(); }
  if (a === 'person') { startPerson(); top(); }
  if (a === 'share') share();
});
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (state.view !== 'person' && state.view !== 'know') return;
  const k = KEYS.indexOf(e.key.toUpperCase());
  const n = k >= 0 ? k : ['1', '2', '3', '4'].indexOf(e.key);
  const btn = n >= 0 && box.querySelectorAll('.answer')[n];
  if (btn && !btn.disabled) btn.click();
});

start();
// odkaz /kviz/#znalec nebo /kviz/#test spustí režim rovnou
if (location.hash === '#znalec') startKnow();
if (location.hash === '#test') startPerson();
