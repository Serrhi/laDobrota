// La Dobrota — všechna data webu na jednom místě.
// Sýry, země, tým a veletrh se upravují jen tady; stránky si je načtou samy.

export const MILK = {
  kravske: { label: 'Kravské', adj: 'kravský', from: 'z kravského mléka' },
  ovci: { label: 'Ovčí', adj: 'ovčí', from: 'z ovčího mléka' },
  kozi: { label: 'Kozí', adj: 'kozí', from: 'z kozího mléka' },
};

export const ALLERGENS = { 7: 'mléko', 8: 'ořechy' };

// x, y = poloha značky na mapě v procentech (vypočteno ze zeměpisných souřadnic)
export const COUNTRIES = {
  nl: { name: 'Holandsko', from: 'z Holandska', code: 'NL', x: 46.62, y: 53.91 },
  fr: { name: 'Francie', from: 'z Francie', code: 'FR', x: 40.27, y: 67.99 },
  ch: { name: 'Švýcarsko', from: 'ze Švýcarska', code: 'CH', x: 50.2, y: 68.77 },
  gb: { name: 'Velká Británie', from: 'z Velké Británie', code: 'GB', x: 35.53, y: 51.13 },
  no: { name: 'Norsko', from: 'z Norska', code: 'NO', x: 52.42, y: 30.53 },
  cz: { name: 'Česká republika', from: 'z České republiky', code: 'CZ', x: 62.54, y: 60.66 },
  it: { name: 'Itálie', from: 'z Itálie', code: 'IT', x: 57.84, y: 78.92 },
  es: { name: 'Španělsko', from: 'ze Španělska', code: 'ES', x: 26.27, y: 83.46 },
};
export const COUNTRY_ORDER = ['nl', 'fr', 'ch', 'gb', 'no', 'cz', 'it', 'es'];

// price = katalogová cena s DPH v Kč; photo = cesta k fotce (když je prázdná, použije se ilustrace img)
// Fotografie pocházejí z www.syrydomu.cz.
export const CHEESES = [
  {
    id: 'syr-s-vlasskymi-orechy', name: 'Sýr s vlašskými ořechy', milk: 'kravske', countries: ['nl'], price: 69, allergens: [7, 8],
    img: '01-syr-s-vlasskymi-orechy.svg', photo: '/assets/img/syry/foto/syr-s-vlasskymi-orechy.jpg',
    text: 'Základ tvoří jemný sýr, ve kterém jsou rozprostřené kousky ořechů.',
    fact: '',
  },
  {
    id: 'gouda', name: 'Gouda', milk: 'kravske', countries: ['nl'], price: 49, allergens: [7],
    img: '02-gouda.svg', photo: '/assets/img/syry/foto/gouda.jpg',
    text: 'Sýr, který má chuť a pořád si zachovává svou krémovost a přístupnost.',
    fact: 'Jmenuje se podle nizozemského města Gouda, kde se s ní odedávna obchodovalo.',
  },
  {
    id: 'fancy-gouda', name: 'Fancy Gouda', milk: 'kravske', countries: ['nl'], price: 76, allergens: [7],
    img: '03-fancy-gouda.svg', photo: '',
    text: 'Gouda pro ty, kdo chtějí něco navíc. Plnější a výraznější chuť než u klasické goudy.',
    fact: '',
  },
  {
    id: 'irsky-cheddar', name: 'Irský cheddar', milk: 'kravske', countries: ['gb'], price: 69, allergens: [7],
    img: '04-irsky-cheddar.svg', photo: '/assets/img/syry/foto/irsky-cheddar.jpg',
    text: 'Přesně ten typ sýra, který je ideální na vaření.',
    fact: 'Cheddar dostal jméno podle vesnice Cheddar v anglickém hrabství Somerset.',
  },
  {
    id: 'raclette', name: 'Raclette', milk: 'kravske', countries: ['ch', 'fr'], price: 69, allergens: [7],
    img: '05-raclette.svg', photo: '/assets/img/syry/foto/raclette.jpg',
    text: 'Švýcarská specialita na rozpékání. Jemně oříšková, smetanová a lehce ovocná chuť.',
    fact: 'Název pochází z francouzského „racler“ – škrábat. Roztavený sýr se seškrabává přímo na talíř.',
  },
  {
    id: 'uzeny-kremovy-syr', name: 'Uzený krémový sýr', milk: 'kravske', countries: ['nl'], price: 49, allergens: [7],
    img: '06-uzeny-kremovy-syr.svg', photo: '/assets/img/syry/foto/uzeny-kremovy-syr.jpg',
    text: 'Spojuje hladkou krémovou strukturu a díky zauzování na dřevě má jemné kouřové aroma.',
    fact: '',
  },
  {
    id: 'camembert', name: 'Camembert', milk: 'kravske', countries: ['fr'], price: 45, allergens: [7],
    img: '07-camembert.svg', photo: '/assets/img/syry/foto/camembert.jpg',
    text: 'Francouzský sýr s bílou plísňovou kůrkou a jemným, krémovým středem.',
    fact: 'Pochází z Normandie a jmenuje se podle vesnice Camembert.',
  },
  {
    id: 'kaskaval', name: 'Kaškaval', milk: 'kravske', countries: ['nl'], price: 189, allergens: [7],
    img: '08-kaskaval.svg', photo: '/assets/img/syry/foto/kaskaval.jpg',
    text: 'Tradiční balkánský polotvrdý sýr. Je ideální jak pro studenou kuchyni, tak i pro tepelnou úpravu.',
    fact: 'Na Balkáně se kaškaval často obaluje a smaží.',
  },
  {
    id: 'emental', name: 'Ementál', milk: 'kravske', countries: ['fr'], price: 55, allergens: [7],
    img: '09-emental.svg', photo: '',
    text: 'Francouzský sýr s typickými oky, pružnou strukturou a příjemně jemnou chutí s lehce nasládlým a oříškovým nádechem.',
    fact: 'Oka vznikají při zrání: bakterie uvolňují oxid uhličitý a bublinky v těstě zůstanou.',
  },
  {
    id: 'karamelovy-syr-brunost', name: 'Karamelový sýr Brunost', milk: 'kravske', countries: ['no'], price: 98, allergens: [7],
    img: '10-karamelovy-syr-brunost.svg', photo: '/assets/img/syry/foto/karamelovy-syr-brunost.jpg',
    text: 'Sýr, který chutná jako karamel (a přesto je to sýr). Chuť je sladká, lehce slaná.',
    fact: 'Vyrábí se dlouhým vařením syrovátky se smetanou, při kterém mléčný cukr zkaramelizuje.',
  },
  {
    id: 'ovci-farmarsky-syr', name: 'Ovčí farmářský sýr', milk: 'ovci', countries: ['cz'], price: 79, allergens: [7],
    img: '11-ovci-farmarsky-syr.svg', photo: '/assets/img/syry/foto/ovci-farmarsky-syr.jpg',
    text: 'Má jemnou slanost a máslový základ. Při zrání ho chrání voskový obal.',
    fact: '',
  },
  {
    id: 'pecorino-s-pistaciemi', name: 'Pecorino s pistáciemi Lo Sfizio', short: 'Pecorino s pistáciemi', milk: 'ovci', countries: ['it'], price: 129, allergens: [7, 8],
    img: '12-pecorino-s-pistaciemi.svg', photo: '/assets/img/syry/foto/pecorino-s-pistaciemi.jpg',
    text: 'Jedinečná kombinace plné chuti ovčího mléka a jemně nasládlých pistácií.',
    fact: 'Pecorino má jméno od italského slova „pecora“ – ovce.',
  },
  {
    id: 'manchego-dop', name: 'Manchego DOP', milk: 'ovci', countries: ['es'], price: 95, allergens: [7, 8],
    img: '13-manchego-dop.svg', photo: '/assets/img/syry/foto/manchego-dop.jpg',
    text: 'Elegantní sýr z ovčího mléka s jemně oříškovou chutí. Je pýchou španělské gastronomie.',
    fact: 'Pravé Manchego se vyrábí jen v kraji La Mancha z mléka ovcí plemene manchega. DOP znamená chráněné označení původu.',
  },
  {
    id: 'kozi-gouda', name: 'Kozí gouda', milk: 'kozi', countries: ['nl'], price: 79, allergens: [7],
    img: '14-kozi-gouda.svg', photo: '/assets/img/syry/foto/kozi-gouda.jpg',
    text: 'Jemná, klidná, přirozená, s lehce máslovou a jemně nasládlou chutí.',
    fact: 'Kozí sýry jsou bělejší než kravské: kozí mléko neobsahuje žluté barvivo beta-karoten.',
  },
  {
    id: 'kozi-syr-s-medem', name: 'Kozí sýr s medem', milk: 'kozi', countries: ['nl'], price: 89, allergens: [7],
    img: '15-kozi-syr-s-medem.svg', photo: '/assets/img/syry/foto/kozi-syr-s-medem.jpg',
    text: 'Kozí základ není výrazný ani ostrý, naopak velmi přístupný a hladký.',
    fact: '',
  },
  {
    id: 'kozi-syr-s-lanyzem', name: 'Kozí sýr s lanýžem', milk: 'kozi', countries: ['nl'], price: 99, allergens: [7, 8],
    img: '16-kozi-syr-s-lanyzem.svg', photo: '/assets/img/syry/foto/kozi-syr-s-lanyzem.jpg',
    text: 'Jemná gurmánská delikatesa. Má krásně vyváženou chuť.',
    fact: 'Lanýž je vzácná houba, která roste pod zemí.',
  },
];

// Tým: doplňte jméno, funkci a případně cestu k fotce (např. '/assets/img/tym/jana.jpg').
// Prázdná položka se na webu ukáže jako „Představíme se brzy“.
export const TEAM = [
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
  { name: '', role: '', photo: '' },
];

// Veletrh: dokud je name prázdné, web ukáže „Termín a místo brzy doplníme“.
export const FAIR = { name: '', date: '', place: '', stand: '' };

export const CONTACT = {
  phone: '+420 707 632 989',
  phoneHref: 'tel:+420707632989',
  email: 'laDobrotafif@gmail.com',
  address: 'Zdeňka Fibicha 2778/20, 434 01 Most',
  mapHref: 'https://mapy.cz/zakladni?q=Zde%C5%88ka%20Fibicha%202778%2F20%2C%20Most',
  instagram: '@fif_ladobrota',
  instagramHref: 'https://www.instagram.com/fif_ladobrota',
};

export const cheeseImg = (c) => c.photo || `/assets/img/syry/${c.img}`;
// Obrázek sýra jako HTML: fotka dostane světlou podložku, ilustrace zůstane průhledná.
export const cheesePic = (c, cls = '') => `<span class="pic ${cls}${c.photo ? ' pic--photo' : ''}"><img src="${esc(cheeseImg(c))}" alt="" width="640" height="480" loading="lazy"></span>`;
export const cheeseById = (id) => CHEESES.find((c) => c.id === id);
export const cheesesFrom = (country) => CHEESES.filter((c) => c.countries.includes(country));
export const allergenText = (c) => c.allergens.map((a) => `${ALLERGENS[a]} (${a})`).join(', ');
export const countryNames = (c) => c.countries.map((k) => COUNTRIES[k].name).join(', ');

// Skloňování: 1 sýr, 2–4 sýry, 5+ sýrů
export const cheeseCount = (n) => `${n} ${n === 1 ? 'sýr' : n >= 2 && n <= 4 ? 'sýry' : 'sýrů'}`;

// Bezpečné vložení textu do HTML
export const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
