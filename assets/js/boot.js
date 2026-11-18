// Zapne animace jen tehdy, když běží JavaScript.
// Pojistka: kdyby se hlavní skript nenačetl, po 4 s se obsah ukáže i bez animací.
document.documentElement.classList.add('js');
setTimeout(function () {
  if (!window.ldReady) document.documentElement.classList.add('show-all');
}, 4000);
