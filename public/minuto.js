// Portada de "El minuto" (/minuto/, /en/minute/). Marcado y estilos: src/components/MinutoPortada.astro.
//
// Un reloj con la hora local del visitante, corregida con la hora del servidor. Cuando el minuto
// actual es de alguien (alguien lo pidió), su dedicatoria ocupa la pantalla sus 60 segundos; si la
// dedicatoria no está aprobada, un mensaje neutro. Después vuelve el reloj.
//
// Pregunta a GET /api/minuto/ahora al cargar, cada 20 s y justo al cambiar de minuto; con la
// lista de "proximos" programa el cambio exacto. La dedicatoria se pone siempre con textContent.
(function () {
  "use strict";
  var mn = document.getElementById("mn");
  if (!mn) return;

  var T = {
    es: {
      neutra: "Este minuto es de alguien.",
      proximo: "el próximo minuto de alguien empieza en "
    },
    en: {
      neutra: "This minute belongs to someone.",
      proximo: "the next minute that belongs to someone starts in "
    }
  };
  var lang = document.documentElement.lang === "en" ? "en" : "es";
  var t = T[lang];

  var cifras = mn.querySelectorAll(".mn-reloj .mn-c:not(.mn-p)");   // H H M M S S
  var libre = document.getElementById("mnLibre");
  var suyo = document.getElementById("mnSuyo");
  var dedicatoriaEl = document.getElementById("mnDedicatoria");
  var hilo = document.getElementById("mnHilo");
  var pruebaEl = document.getElementById("mnPrueba");
  var proximoEl = document.getElementById("mnProximo");

  var desfase = 0;            // reloj del servidor menos reloj del dispositivo, en ms
  var minuto = null;          // { id, desde, hasta, estado, dedicatoria, prueba } que devolvió el servidor
  var proximos = [];          // [{ id, desde }]
  var mostrado = null;        // id del minuto que está en pantalla
  var vistos = {};            // ids ya contados como "minuto-en-vivo" en esta visita
  var pidiendo = false;
  var ultimoMinuto = -1;
  var programado = null;      // temporizador del cambio exacto
  var reintentos = 0;

  function ahora() { return Date.now() + desfase; }
  function dos(n) { return (n < 10 ? "0" : "") + n; }

  function evento(nombre) {
    try { if (window.SaleHoyVisita && typeof window.SaleHoyVisita.evento === "function") window.SaleHoyVisita.evento(nombre); } catch (e) {}
  }

  // ---------- servidor ----------

  function pedir() {
    if (pidiendo) return;
    pidiendo = true;
    var salida = Date.now();
    fetch("/api/minuto/ahora", { cache: "no-store", headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || typeof d.ahora !== "number") return;
        var llegada = Date.now();
        desfase = d.ahora + (llegada - salida) / 2 - llegada;
        minuto = d.minuto && typeof d.minuto.desde === "number" && typeof d.minuto.hasta === "number" ? d.minuto : null;
        proximos = Array.isArray(d.proximos) ? d.proximos.filter(function (p) { return p && typeof p.desde === "number"; }) : [];
        proximos.sort(function (a, b) { return a.desde - b.desde; });
        // Si se esperaba un minuto de alguien y el servidor todavía no lo informa, se vuelve a preguntar enseguida.
        var esperado = proximos.some(function (p) { var x = ahora(); return p.desde <= x && x < p.desde + 60000; });
        if (esperado && !minuto && reintentos < 3) { reintentos++; setTimeout(pedir, 1500); } else reintentos = 0;
        programar();
        pintar();
      })
      .catch(function () {})
      .then(function () { pidiendo = false; });
  }

  // Programa una pregunta justo cuando empieza el próximo minuto de alguien.
  function programar() {
    if (programado) { clearTimeout(programado); programado = null; }
    var x = ahora();
    for (var i = 0; i < proximos.length; i++) {
      var falta = proximos[i].desde - x;
      if (falta > 0) {
        if (falta < 2147483000) programado = setTimeout(pedir, falta + 60);
        return;
      }
    }
  }

  // ---------- pantalla ----------

  function largo(texto) {
    var n = texto.length;
    return n <= 28 ? "corto" : n <= 54 ? "medio" : "largo";
  }

  function pintarReloj(x) {
    var d = new Date(x);
    var v = dos(d.getHours()) + dos(d.getMinutes()) + dos(d.getSeconds());
    for (var i = 0; i < cifras.length && i < 6; i++) {
      if (cifras[i].textContent !== v[i]) cifras[i].textContent = v[i];
    }
  }

  function entrar(m) {
    mostrado = m.id;
    var aprobada = m.estado === "aprobada" && typeof m.dedicatoria === "string" && m.dedicatoria.trim() !== "";
    var texto = aprobada ? m.dedicatoria.trim() : t.neutra;
    dedicatoriaEl.textContent = texto;                    // nunca innerHTML
    dedicatoriaEl.setAttribute("data-largo", largo(texto));
    dedicatoriaEl.classList.toggle("neutra", !aprobada);
    pruebaEl.hidden = !m.prueba;
    mn.setAttribute("data-estado", "suyo");
    libre.hidden = true;
    suyo.classList.remove("visible");
    suyo.hidden = false;
    // la entrada: un cuadro después, para que corra la transición
    requestAnimationFrame(function () { requestAnimationFrame(function () { suyo.classList.add("visible"); }); });
    if (!vistos[m.id]) { vistos[m.id] = true; evento("minuto-en-vivo"); }
  }

  function salir() {
    mostrado = null;
    mn.setAttribute("data-estado", "reloj");
    suyo.classList.remove("visible");
    suyo.hidden = true;
    dedicatoriaEl.textContent = "";
    pruebaEl.hidden = true;
    libre.hidden = false;
  }

  function pintarProximo(x) {
    var siguiente = null;
    for (var i = 0; i < proximos.length; i++) if (proximos[i].desde > x) { siguiente = proximos[i]; break; }
    var falta = siguiente ? siguiente.desde - x : Infinity;
    if (falta > 3600000) { if (!proximoEl.hidden) { proximoEl.hidden = true; proximoEl.textContent = ""; } return; }
    var s = Math.ceil(falta / 1000);
    proximoEl.textContent = t.proximo + dos(Math.floor(s / 60)) + ":" + dos(s % 60);
    proximoEl.hidden = false;
  }

  function pintar() {
    var x = ahora();
    pintarReloj(x);
    var vigente = minuto && minuto.desde <= x && x < minuto.hasta ? minuto : null;
    if (vigente) {
      if (mostrado !== vigente.id) entrar(vigente);
      var resto = Math.max(0, Math.min(1, (vigente.hasta - x) / (vigente.hasta - vigente.desde || 60000)));
      hilo.style.transform = "scaleX(" + resto.toFixed(4) + ")";
    } else {
      if (mostrado) salir();
      pintarProximo(x);
    }
  }

  function tic() {
    var x = ahora();
    pintar();
    var m = Math.floor(x / 60000);
    if (ultimoMinuto !== -1 && m !== ultimoMinuto) setTimeout(pedir, 120);   // cambió el minuto
    ultimoMinuto = m;
    setTimeout(tic, 1000 - (ahora() % 1000) + 15);
  }

  pintar();
  pedir();
  tic();
  setInterval(function () { if (!document.hidden) pedir(); }, 20000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) pedir(); });
})();
