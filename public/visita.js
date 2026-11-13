// Medición de visitas y de lo que la gente hace en el sitio.
//
// Dos destinos, con los mismos hitos:
//   1. el contador propio (/api/visita): sin cookies, solo números por día;
//   2. Google Analytics, si su etiqueta está cargada (la agrega Netlify).
// No se manda nada que identifique a una persona: ni nombres, ni direcciones
// de billetera, ni hashes de transacción. Respeta "No rastrear" y Global
// Privacy Control. Los dispositivos marcados como propios (/interno.js) no
// suman al contador propio.
(function () {
  // nombre del hito en el contador propio -> evento y parámetros en Google Analytics
  var EVENTOS_GA = {
    "regalar-toque":      ["regalar_toque", null],
    "regalo-llegada":     ["regalo_llegada", null],
    "copiar-direccion":   ["direccion_copiada", null],
    "estela-abrir":       ["estela_generada", null],
    "estela-imagen":      ["estela_guardada", { formato: "imagen" }],
    "estela-video":       ["estela_guardada", { formato: "video" }],
    "estela-enlace":      ["estela_compartida", { via: "enlace" }],
    "estela-compartida":  ["estela_compartida", { via: "archivo" }],
    "sonido":             ["sonido_activado", null],
    "estrella-vista":     ["estrella_vista", null],
    "estela-vista":       ["estela_vista", null],
    "clic-regalar":       ["regalo_billetera_abierta", null],
    "regalo-enviado":     ["regalo_enviado", null],
    "ya-regale":          ["ya_regale", null],
    "copiar-enlace":      ["estrella_enlace_copiado", null]
  };

  function sinRastreo() {
    return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  }

  function mandar(datos) {
    try {
      if (sinRastreo() || window.SaleHoyInterno) return;
      if (location.hostname !== "salehoy.com.ar") return;   // no cuenta en pruebas locales
      var cuerpo = JSON.stringify(datos);
      if (navigator.sendBeacon) navigator.sendBeacon("/api/visita", new Blob([cuerpo], { type: "application/json" }));
      else fetch("/api/visita", { method: "POST", body: cuerpo, keepalive: true, headers: { "content-type": "application/json" } });
    } catch (e) {}
  }

  function aGoogle(nombre) {
    try {
      var ga = EVENTOS_GA[nombre];
      if (!ga || sinRastreo() || typeof window.gtag !== "function") return;
      var parametros = { pagina: location.pathname };
      if (ga[1]) for (var k in ga[1]) parametros[k] = ga[1][k];
      if (/[?&]depurar=1/.test(location.search)) parametros.debug_mode = true;   // para la vista de depuración de GA4
      window.gtag("event", ga[0], parametros);
    } catch (e) {}
  }

  function evento(nombre) {
    nombre = String(nombre);
    mandar({ e: nombre });
    aGoogle(nombre);
  }

  var origen = "";
  try { if (document.referrer) origen = new URL(document.referrer).hostname; } catch (e) {}
  var conEstrella = /[?&](n=\d+|tx=0x[0-9a-fA-F]{64})/.test(location.search);
  var conEstela = /[?&]e=[\w-]+/.test(location.search);

  mandar({
    p: location.pathname,
    l: document.documentElement.lang || "",
    r: origen,
    n: conEstrella ? 1 : 0,
    s: conEstela ? 1 : 0     // llegó por el enlace de una estela
  });

  window.SaleHoyVisita = { evento: evento };

  // Hitos que se pueden registrar desde acá, sin tocar cada página:
  function alCargar() {
    if (conEstrella) evento("estrella-vista");                      // visita a la página de una estrella
    if (conEstela) evento("estela-vista");
    if (/^\/regalo(\.html)?$/.test(location.pathname)) evento("regalo-llegada");
  }
  if (document.readyState === "complete") alCargar();
  else window.addEventListener("load", alCargar);

  // Toque en cualquier enlace "regalar" del sitio (los que llevan a la página de regalo).
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var destino = a.getAttribute("href") || "";
    if (/^\/regalo(\.html)?(\?|$)/.test(destino) && !/^\/regalo(\.html)?$/.test(location.pathname)) evento("regalar-toque");
  }, true);
})();
