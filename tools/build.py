#!/usr/bin/env python3
"""Sestaví HTML stránky webu La Dobrota ze společné hlavičky, patičky a obsahu v tools/pages/.

Spuštění z kořene repozitáře:  python3 tools/build.py
Výsledné soubory (index.html, syry/index.html, …) se ukládají do repozitáře a nasazují se tak, jak jsou.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "tools" / "pages"
SITE = "https://ladobrota.pages.dev"

# soubor s obsahem, výstup, adresa, titulek, popis, skript stránky
PAGE_LIST = [
    ("index.html", "index.html", "/", "La Dobrota – sýrárna | Dobrota, která zraje",
     "La Dobrota je studentská fiktivní firma z Mostu. Šestnáct sýrů z osmi zemí Evropy, otočný 3D bochník, mapa sýrů a sýrový kvíz.", "home.js"),
    ("syry.html", "syry/index.html", "/syry/", "Naše sýry – La Dobrota",
     "Katalog sýrárny La Dobrota: šestnáct kravských, ovčích a kozích sýrů. U každého chuť, původ, alergeny a katalogová cena.", "syry.js"),
    ("mapa.html", "mapa/index.html", "/mapa/", "Mapa sýrů – La Dobrota",
     "Interaktivní mapa Evropy: klikni na zemi a zjisti, které sýry z ní sýrárna La Dobrota nabízí.", "mapa.js"),
    ("kviz.html", "kviz/index.html", "/kviz/", "Sýrový kvíz – La Dobrota",
     "Jaký sýr jsi ty? Osobnostní test a vědomostní kvíz Sýrový znalec od sýrárny La Dobrota.", "kviz.js"),
    ("o-nas.html", "o-nas/index.html", "/o-nas/", "O nás a kontakt – La Dobrota",
     "Kdo stojí za sýrárnou La Dobrota: dvanáct studentů z Mostu. Kontakty a informace k veletrhu fiktivních firem.", "onas.js"),
    ("404.html", "404.html", "/404", "Stránka nenalezena – La Dobrota",
     "Tahle stránka se nám někam zakutálela.", ""),
]

HEAD = """<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#060504">
<link rel="canonical" href="{site}{path}">
<meta property="og:type" content="website">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="La Dobrota – sýrárna">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{site}{path}">
<meta property="og:image" content="{site}/assets/img/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/boot.js"></script>
<script type="module" src="/assets/js/site.js"></script>{script}
</head>
<body>
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="brand" href="/" aria-label="La Dobrota – domů"><img src="/assets/img/logo-mark.svg" alt="" width="47" height="42"><span>LA DOBROTA</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Otevřít menu"><span></span><span></span></button>
    <nav class="nav" id="menu" aria-label="Hlavní menu">
      <a href="/">Domů</a>
      <a href="/syry/">Naše sýry</a>
      <a href="/mapa/">Mapa sýrů</a>
      <a href="/o-nas/">O nás</a>
      <a class="btn btn--gold btn--sm" href="/kviz/">Sýrový kvíz</a>
    </nav>
  </div>
</header>
<main id="obsah">
"""

FOOT = """</main>
<footer class="site-footer">
  <div class="wrap site-footer__in">
    <img class="site-footer__logo" src="/assets/img/logo-full.svg" alt="La Dobrota – sýrárna" width="168" height="148" loading="lazy">
    <div>
      <h2>Kontakt</h2>
      <ul>
        <li><a href="tel:+420707632989">+420 707 632 989</a></li>
        <li><a href="mailto:laDobrotafif@gmail.com">laDobrotafif@gmail.com</a></li>
        <li><span>Zdeňka Fibicha 2778/20, 434 01 Most</span></li>
      </ul>
    </div>
    <div>
      <h2>Web</h2>
      <ul>
        <li><a href="/syry/">Naše sýry</a></li>
        <li><a href="/mapa/">Mapa sýrů</a></li>
        <li><a href="/kviz/">Sýrový kvíz</a></li>
        <li><a href="/o-nas/">O nás a kontakt</a></li>
        <li><a href="https://www.instagram.com/fif_ladobrota" rel="noopener">Instagram @fif_ladobrota</a></li>
      </ul>
    </div>
    <p class="site-footer__note">La Dobrota je studentská fiktivní firma. Web je prezentační – nic se zde neprodává ani neplatí. Web neukládá cookies a nikoho nesleduje.</p>
  </div>
</footer>
</body>
</html>
"""


def main():
    for src, out, path, title, desc, script in PAGE_LIST:
        body = (PAGES / src).read_text(encoding="utf-8")
        tag = f'\n<script type="module" src="/assets/js/{script}"></script>' if script else ""
        html = HEAD.format(title=title, desc=desc, site=SITE, path=path, script=tag) + body.rstrip() + "\n" + FOOT
        target = ROOT / out
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")
        print("ok", out)


if __name__ == "__main__":
    main()
