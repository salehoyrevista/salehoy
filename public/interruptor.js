// "El interruptor" — una sola luz para todo el mundo. Lo que pasa en la página.
//
// La verdad está en el servidor (/api/interruptor). Acá:
//   - se mira la luz: en vivo por Firebase si el servidor lo informa (`vivo`), si no preguntando
//     cada `espera` ms, y nunca con la pestaña oculta;
//   - se toca: la luz cambia en el acto (con clic, vibración y transición) y, si el servidor dice
//     que no, vuelve atrás despacio y se explica por qué;
//   - la huella: la imagen para compartir, el enlace propio, y la huella ajena si se llegó con ?h=.
// Los relojes van con la hora del servidor, no la del teléfono. Nada se manda de la persona.
(function () {
  "use strict";

  var raiz = document.getElementById("ix");
  if (!raiz) return;
  var doc = document.documentElement;
  var EN = raiz.getAttribute("data-lang") === "en";
  var RUTA = raiz.getAttribute("data-ruta") || (EN ? "/en/switch/" : "/interruptor/");

  // ───────────────────────── textos ─────────────────────────
  var T = EN ? {
    prendida: "on", apagada: "off",
    estado: function (p, d) { return (p ? "on" : "off") + " for " + d; },
    recordP: "longest on", recordA: "longest off",
    toques: function (n) { return n === 1 ? "1 touch" : fmtN(n) + " touches"; },
    accion: { apago: "turned it off", prendio: "turned it on" },
    alguien: "someone", Alguien: "Someone",
    hace: function (d) { return d + " ago"; }, recien: "just now",
    persona: function (r) { return "You already touched it. You can touch it again in " + r + "."; },
    rafaga: "Someone just touched it. Try again in a moment.",
    minutoAjeno: "For this minute, the light belongs to someone.",
    minutoVuelve: function (r) { return "It belongs to everyone again in " + r + "."; },
    minutoTuyo: "This minute is yours. So is the light.",
    prohibido: "It didn't go through. Reload the page and try again.",
    red: "No connection: the light didn't change.",
    anuncio: function (lugar, apago) { return (lugar ? "Someone in " + lugar : "Someone") + (apago ? " turned off the light." : " turned on the light."); },
    tuyo: function (apago) { return apago ? "You turned off the light of the world." : "You turned on the light of the world."; },
    visita: function (lugar, apago) { return (lugar ? "Someone in " + lugar : "Someone") + (apago ? " turned off the light." : " turned on the light."); },
    duro: function (d) { return "It lasted " + d + "."; },
    lleva: function (d) { return d + " and counting."; },
    frase: function (apago) { return apago ? "I turned off the light of the world." : "I turned on the light of the world."; },
    copiado: "link copied", guardada: "image saved",
    pie: "The Switch — Solzimer", sitio: "salehoy.com.ar/en/switch",
    archivo: "the-switch-"
  } : {
    prendida: "prendida", apagada: "apagada",
    estado: function (p, d) { return (p ? "prendida" : "apagada") + " hace " + d; },
    recordP: "récord prendida", recordA: "récord apagada",
    toques: function (n) { return n === 1 ? "1 toque" : fmtN(n) + " toques"; },
    accion: { apago: "la apagó", prendio: "la prendió" },
    alguien: "alguien", Alguien: "Alguien",
    hace: function (d) { return "hace " + d; }, recien: "recién",
    persona: function (r) { return "Ya tocaste. Podés volver a tocar en " + r + "."; },
    rafaga: "Alguien la tocó recién. Probá de nuevo en un momento.",
    minutoAjeno: "Durante este minuto la luz es de alguien.",
    minutoVuelve: function (r) { return "Vuelve a ser de todos en " + r + "."; },
    minutoTuyo: "Este minuto es tuyo. La luz también.",
    prohibido: "No se pudo tocar. Recargá la página y probá otra vez.",
    red: "Sin conexión: la luz no cambió.",
    anuncio: function (lugar, apago) { return (lugar ? "Alguien de " + lugar : "Alguien") + (apago ? " apagó la luz." : " prendió la luz."); },
    tuyo: function (apago) { return apago ? "Apagaste la luz del mundo." : "Prendiste la luz del mundo."; },
    visita: function (lugar, apago) { return (lugar ? "Alguien de " + lugar : "Alguien") + (apago ? " apagó la luz." : " prendió la luz."); },
    duro: function (d) { return "Duró " + d + "."; },
    lleva: function (d) { return "Lleva " + d + " así."; },
    frase: function (apago) { return apago ? "Apagué la luz del mundo." : "Prendí la luz del mundo."; },
    copiado: "enlace copiado", guardada: "imagen guardada",
    pie: "El interruptor — Solzimer", sitio: "salehoy.com.ar/interruptor",
    archivo: "el-interruptor-"
  };

  function fmtN(n) { try { return Number(n).toLocaleString(EN ? "en" : "es-AR"); } catch (e) { return String(n); } }
  var dos = function (n) { return (n < 10 ? "0" : "") + n; };

  /** Corta: las dos unidades más grandes ("2 h 14 min", "37 s"), como en la imagen de la huella. */
  function corta(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
    if (d) return d + " d" + (h ? " " + h + " h" : "");
    if (h) return h + " h" + (m ? " " + m + " min" : "");
    if (m) return m + " min" + (seg ? " " + seg + " s" : "");
    return seg + " s";
  }
  /** Larga, con segundos, para el reloj en vivo: "3 h 12 min 07 s". */
  function larga(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
    if (d) return d + " d " + h + " h " + dos(m) + " min";
    if (h) return h + " h " + dos(m) + " min " + dos(seg) + " s";
    if (m) return m + " min " + dos(seg) + " s";
    return seg + " s";
  }
  function relojito(ms) {   // 4:12
    var s = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return (h ? h + ":" + dos(m) : m) + ":" + dos(s % 60);
  }
  function haceCuanto(ms) {
    if (ms < 5000) return T.recien;
    var s = Math.floor(ms / 1000);
    if (s < 60) return T.hace(s + " s");
    if (s < 3600) return T.hace(Math.floor(s / 60) + " min");
    if (s < 86400) return T.hace(Math.floor(s / 3600) + " h");
    return T.hace(Math.floor(s / 86400) + " d");
  }
  var nombres = null;
  try { nombres = new Intl.DisplayNames([EN ? "en" : "es"], { type: "region" }); } catch (e) {}
  function lugar(x) {
    if (!x) return "";
    var p = x.pais || "";
    if (nombres && /^[A-Z]{2}$/.test(x.cc || "")) { try { var n = nombres.of(x.cc); if (n && n !== x.cc) p = n; } catch (e) {} }
    return x.ciudad && p ? x.ciudad + ", " + p : x.ciudad || p || "";
  }

  // ───────────────────────── almacenamiento local (todo opcional) ─────────────────────────
  function leerLocal(k, sesion) { try { return (sesion ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } }
  function guardarLocal(k, v, sesion) { try { (sesion ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }

  function medir(nombre) {
    try { if (window.SaleHoyVisita && typeof window.SaleHoyVisita.evento === "function") window.SaleHoyVisita.evento(nombre); } catch (e) {}
  }

  // ───────────────────────── hora del servidor ─────────────────────────
  var desfase = 0, horaFresca = false;
  function ahora() { return Date.now() + desfase; }
  /** `srv`: la hora que dijo el servidor; t0/t1: performance.now() al pedir y al recibir. */
  function ponerHora(srv, t0, t1, fresca) {
    if (typeof srv !== "number" || !isFinite(srv)) return;
    if (!fresca && horaFresca) return;          // una respuesta guardada en caché no corrige a una fresca
    desfase = srv + (t1 - t0) / 2 - (Date.now() - (performance.now() - t1));
    if (fresca) horaFresca = true;
  }

  // ───────────────────────── elementos ─────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var tecla = $("ix-tecla"), elEstado = $("ix-estado"), elAviso = $("ix-aviso"), elAnuncio = $("ix-anuncio");
  var elMinuto = $("ix-minuto"), elMinutoTexto = $("ix-minuto-texto");
  var elRecords = $("ix-records"), elUltimas = $("ix-ultimas"), elVisita = $("ix-visita");
  var elHuella = $("ix-huella"), elHuellaAbrir = $("ix-huella-abrir"), elHuellaOpciones = $("ix-huella-opciones"), elHuellaFrase = $("ix-huella-frase");
  var elIdioma = $("ix-idioma"), rescoldo = document.querySelector(".ix-rescoldo");
  var metaTema = document.querySelector('meta[name="theme-color"]');
  function texto(el, t) { if (el && el.textContent !== t) el.textContent = t; }

  // ───────────────────────── parámetros: huella ajena y llave del minuto ─────────────────────────
  var params = new URLSearchParams(location.search);
  var idVisita = /^[a-z2-7]{8}$/.test(params.get("h") || "") ? params.get("h") : null;
  var llaveUrl = params.get("llave");
  if (llaveUrl) {
    // la llave no se queda en la barra de direcciones (se compartiría sin querer): pasa a la sesión
    guardarLocal("interruptor-llave", llaveUrl, true);
    params.delete("llave");
    try { history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : "") + location.hash); } catch (e) {}
  }
  if (idVisita && elIdioma) elIdioma.href = elIdioma.getAttribute("href") + "?h=" + idVisita;

  function llaveDe(id) {
    var formas = [id, String(id).replace(/:/g, "-")];
    for (var i = 0; i < formas.length; i++) { var l = leerLocal("minuto-llave:" + formas[i]); if (l) return l; }
    return leerLocal("interruptor-llave", true) || llaveUrl || null;
  }

  // ───────────────────────── sonido: Web Audio, creado dentro de un gesto ─────────────────────────
  var audio = null, ruidos = {};
  function prepararAudio() {
    if (!audio) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      try { audio = new C(); } catch (e) { audio = null; return; }
    }
    if (audio.state === "suspended") { try { audio.resume(); } catch (e) {} }
  }
  function ruido(dur) {
    var k = String(dur);
    if (ruidos[k]) return ruidos[k];
    var n = Math.floor(audio.sampleRate * dur), b = audio.createBuffer(1, n, audio.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 5);
    return (ruidos[k] = b);
  }
  /** Clic de tecla: un chasquido corto filtrado y un golpe grave. Prender es más agudo y seco que apagar. */
  function sonar(prende, volumen) {
    if (!audio || audio.state !== "running") return;     // nunca suena sin un gesto previo
    try {
      var t = audio.currentTime + 0.004;
      var src = audio.createBufferSource(); src.buffer = ruido(prende ? 0.022 : 0.034);
      var filtro = audio.createBiquadFilter(); filtro.type = "bandpass";
      filtro.frequency.value = prende ? 3600 : 2000; filtro.Q.value = prende ? 1.4 : 0.9;
      var g1 = audio.createGain(); g1.gain.value = (prende ? 0.7 : 0.6) * volumen;
      src.connect(filtro); filtro.connect(g1); g1.connect(audio.destination);
      src.start(t);

      var osc = audio.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(prende ? 210 : 150, t);
      osc.frequency.exponentialRampToValueAtTime(prende ? 95 : 52, t + 0.08);
      var g2 = audio.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime((prende ? 0.32 : 0.5) * volumen, t + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + (prende ? 0.07 : 0.12));
      osc.connect(g2); g2.connect(audio.destination);
      osc.start(t); osc.stop(t + 0.14);
    } catch (e) {}
  }

  // ───────────────────────── mostrar la luz ─────────────────────────
  var mostrada = null;        // lo que se ve: true prendida, false apagada, null todavía no se sabe
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ubicarRescoldo() {
    if (!rescoldo) return;
    var r = tecla.getBoundingClientRect();
    if (!r.width) return;
    rescoldo.style.left = (r.left + r.width / 2) + "px";
    rescoldo.style.top = (r.top + r.height / 2) + "px";
  }

  /** modo: "quieto" (sin transición), "propio", "remoto" o "revertir" (vuelta atrás despacio). */
  function mostrar(prendida, modo) {
    var cambia = mostrada !== prendida;
    mostrada = prendida;
    doc.classList.remove("ix-apagando", "ix-prendiendo", "ix-suave");
    if (modo === "quieto") {
      doc.classList.add("ix-quieto");
    } else {
      doc.classList.remove("ix-quieto");
      if (modo === "revertir") doc.classList.add("ix-suave");
      else if (cambia) {
        if (!prendida) ubicarRescoldo();
        void doc.offsetWidth;                       // reinicia la animación aunque se repita
        doc.classList.add(prendida ? "ix-prendiendo" : "ix-apagando");
      }
    }
    doc.classList.toggle("ix-luz", prendida);
    tecla.setAttribute("aria-checked", prendida ? "true" : "false");
    if (metaTema) metaTema.setAttribute("content", prendida ? "#f2e9d8" : "#0e0d12");
    if (modo === "quieto") setTimeout(function () { doc.classList.remove("ix-quieto"); }, 60);
    if (cambia && modo === "propio") sonar(prendida, 1);
    if (cambia && modo === "remoto") sonar(prendida, 0.3);
  }

  // ───────────────────────── estado ─────────────────────────
  var actual = null;          // último estado público conocido
  var pendiente = false;      // hay un toque propio en camino
  var enEspera = null;        // estado que llegó mientras tanto
  var huellaVisita = null;    // la huella del enlace ?h=
  var toquesVisita = -1;

  function anunciar(t) { texto(elAnuncio, ""); setTimeout(function () { texto(elAnuncio, t); }, 30); }

  /** Aplica un estado del servidor o del espejo en vivo. Los viejos (menos toques) se ignoran. */
  function aplicar(e, origen) {
    if (!e || typeof e.prendida !== "boolean" || typeof e.desde !== "number") return;
    if (pendiente) { if (!enEspera || (e.toques || 0) >= (enEspera.toques || 0)) enEspera = e; return; }
    if (actual && (e.toques || 0) < (actual.toques || 0)) return;
    var nuevo = actual && (e.toques || 0) > (actual.toques || 0);
    var antes = actual;
    if (origen === "vivo" && actual) {
      // el espejo no trae hora ni minuto frescos: se conservan los de la última consulta
      // (Firebase además borra las claves nulas: lo que falta se toma de lo que ya se sabía)
      e = Object.assign({}, e, { minuto: e.minuto || actual.minuto || null, espera: actual.espera, vivo: actual.vivo });
    }
    actual = e;
    tecla.disabled = false;
    if (mostrada === null) mostrar(e.prendida, "quieto");
    else if (e.prendida !== mostrada) {
      mostrar(e.prendida, "remoto");
      var u = (e.ultimas || [])[0];
      anunciar(T.anuncio(u && u.t === e.desde ? lugar(u) : "", !e.prendida));
    }
    if (!antes || nuevo) pintarUltimas();
    if (huellaVisita && huellaVisita.fin == null && toquesVisita >= 0 && (e.toques || 0) > toquesVisita) cargarVisita();
    reloj(true);
  }

  // ───────────────────────── mirar: en vivo o preguntando ─────────────────────────
  var tSondeo = 0, fuente = null, vivoDato = null;

  function consultar() {
    clearTimeout(tSondeo);
    var t0 = performance.now();
    return fetch("/api/interruptor", { headers: { accept: "application/json" } })
      .then(function (r) {
        var t1 = performance.now();
        return r.json().then(function (d) {
          if (!r.ok || !d || typeof d.prendida !== "boolean") return;
          var edad = Number(r.headers.get("age")) || 0;     // la red de Netlify puede guardarla 3 s
          ponerHora(d.ahora + edad * 1000, t0, t1, false);
          aplicar(d, "consulta");
          if (d.vivo && !fuente) abrirVivo(d.vivo);
        });
      })
      .catch(function () {})
      .then(programar);
  }
  function programar() {
    clearTimeout(tSondeo);
    if (document.hidden) return;
    var ms = fuente ? 60000 : (actual && actual.espera) || 4000;
    tSondeo = setTimeout(consultar, ms);
  }
  function abrirVivo(url) {
    if (!window.EventSource || !/^https:\/\/[\w.-]+\.(firebaseio\.com|firebasedatabase\.app)\//.test(url)) return;
    try { fuente = new EventSource(url); } catch (e) { fuente = null; return; }
    var alVivo = function (tipo) {
      return function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (!m || typeof m.path !== "string") return;
        if (m.path === "/") vivoDato = tipo === "put" ? m.data : Object.assign({}, vivoDato || {}, m.data || {});
        else {
          var partes = m.path.replace(/^\/+/, "").split("/");
          if (partes.length !== 1 || !vivoDato) { consultar(); return; }      // algo raro: mejor preguntar
          var copia = Object.assign({}, vivoDato);
          copia[partes[0]] = tipo === "put" ? m.data : Object.assign({}, copia[partes[0]] || {}, m.data || {});
          vivoDato = copia;
        }
        if (vivoDato) aplicar(vivoDato, "vivo");
      };
    };
    fuente.addEventListener("put", alVivo("put"));
    fuente.addEventListener("patch", alVivo("patch"));
    var cerrar = function () { if (fuente) { try { fuente.close(); } catch (e) {} } fuente = null; programar(); };
    fuente.addEventListener("cancel", cerrar);
    fuente.addEventListener("auth_revoked", cerrar);
    fuente.onerror = function () { if (fuente && fuente.readyState === 2) cerrar(); };
    programar();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearTimeout(tSondeo); return; }
    consultar();
    if (huellaVisita && huellaVisita.fin == null) cargarVisita();
    reloj(true);
  });

  // ───────────────────────── ficha (antibots) ─────────────────────────
  var ficha = null, fichaRecibida = 0, fichaEspera = 1200, pidiendoFicha = null;
  function pedirFicha() {
    if (pidiendoFicha) return pidiendoFicha;
    var t0 = performance.now();
    pidiendoFicha = fetch("/api/interruptor/ficha", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var t1 = performance.now();
        if (d && typeof d.ficha === "string") {
          ficha = d.ficha; fichaRecibida = t1; fichaEspera = Number(d.espera) || 1200;
          ponerHora(d.ahora, t0, t1, true);
        }
      })
      .catch(function () {})
      .then(function () { pidiendoFicha = null; });
    return pidiendoFicha;
  }
  var esperar = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  function fichaLista() {
    var vieja = !ficha || performance.now() - fichaRecibida > 9 * 60 * 1000;
    return (vieja ? (ficha = null, pedirFicha()) : Promise.resolve()).then(function () {
      if (!ficha) return null;
      var falta = fichaEspera + 80 - (performance.now() - fichaRecibida);
      var f = ficha;
      return falta > 0 ? esperar(falta).then(function () { return f; }) : f;
    });
  }

  // ───────────────────────── avisos con cuenta regresiva ─────────────────────────
  var aviso = null;           // { tipo, hasta }
  function avisar(tipo, hasta) { aviso = { tipo: tipo, hasta: hasta || 0 }; pintarAviso(); }
  function pintarAviso() {
    if (!aviso) { texto(elAviso, ""); return; }
    var falta = aviso.hasta - ahora();
    var t = "";
    if (aviso.tipo === "persona") t = falta > 0 ? T.persona(relojito(falta)) : "";
    else if (aviso.tipo === "minuto") t = falta > 0 ? T.minutoVuelve(relojito(falta)) : "";   // la línea del minuto ya dice de quién es
    else if (aviso.tipo === "rafaga") t = falta > -2500 ? T.rafaga : "";
    else t = T[aviso.tipo] || "";
    if (!t) aviso = null;
    texto(elAviso, t);
  }
  function negar() {
    tecla.classList.remove("ix-niega");
    void tecla.offsetWidth;
    tecla.classList.add("ix-niega");
    setTimeout(function () { tecla.classList.remove("ix-niega"); }, 400);
  }

  // ───────────────────────── tocar ─────────────────────────
  function minutoActivo() {
    var m = actual && actual.minuto;
    return m && m.hasta > ahora() ? m : null;
  }
  function hastaPropio() { return Number(leerLocal("interruptor-hasta")) || 0; }

  function tocar() {
    prepararAudio();
    if (!actual || pendiente) return;
    var m = minutoActivo();
    // si hay una llave a mano se manda igual: el servidor sabe mejor que esta página si hay un minuto vigente
    var llave = m ? llaveDe(m.id) : leerLocal("interruptor-llave", true) || llaveUrl || null;
    if (m && !llave) { negar(); avisar("minuto", m.hasta); return; }
    if (!m && hastaPropio() > ahora()) { negar(); avisar("persona", hastaPropio()); return; }

    var antes = mostrada;
    pendiente = true;
    aviso = null; pintarAviso();
    mostrar(!antes, "propio");
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }

    var t0 = 0;
    fichaLista()
      .then(function (f) {
        if (!f) throw new Error("sin-ficha");
        var cuerpo = { ficha: f };
        if (llave) cuerpo.llave = llave;
        t0 = performance.now();
        return fetch("/api/interruptor/tocar", {
          method: "POST", cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(cuerpo)
        });
      })
      .then(function (r) {
        var t1 = performance.now();
        return r.json().catch(function () { return null; }).then(function (d) { terminar(r.status, d, antes, t0, t1); });
      })
      .catch(function () { terminar(0, null, antes, 0, 0); });
  }

  function terminar(status, d, antes, t0, t1) {
    ficha = null; pedirFicha();                 // una ficha nueva después de cada intento
    pendiente = false;
    var guardado = enEspera; enEspera = null;

    if (status === 200 && d && d.estado) {
      ponerHora(d.estado.ahora, t0, t1, true);
      if (typeof d.hasta === "number") guardarLocal("interruptor-hasta", String(d.hasta));
      if (d.huella && d.huella.id) {
        guardarLocal("interruptor-huella", JSON.stringify(d.huella));
        mostrarHuellaPropia(d.huella, true);
      }
      medir("interruptor-toque");
      // la verdad es la del servidor: si la luz ya estaba como la dejamos, el toque la dio vuelta
      if (d.estado.prendida !== mostrada) mostrar(d.estado.prendida, "remoto");
      actual = null;                            // el estado de la respuesta manda sobre cualquier otro
      aplicar(d.estado, "toque");
      if (guardado) aplicar(guardado, "consulta");
      return;
    }

    mostrar(antes, "revertir");
    if (guardado) aplicar(guardado, "consulta");
    if (status === 429 && d) {
      if (d.motivo === "persona") { guardarLocal("interruptor-hasta", String(d.hasta)); avisar("persona", d.hasta); }
      else { avisar("rafaga", d.hasta); consultar(); }
    } else if (status === 423 && d) {
      if (actual) actual = Object.assign({}, actual, { minuto: { id: d.id, hasta: d.hasta } });
      avisar("minuto", d.hasta);
    } else if (status === 403) avisar("prohibido");
    else avisar("red");
  }

  // apretar: la tecla empieza a ceder antes del clic
  tecla.addEventListener("pointerdown", function () { prepararAudio(); if (!tecla.disabled) tecla.classList.add("ix-apretando"); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) {
    tecla.addEventListener(n, function () { tecla.classList.remove("ix-apretando"); });
  });
  tecla.addEventListener("click", function () { tecla.classList.remove("ix-apretando"); tocar(); });

  // ───────────────────────── pintar: reloj, récords, últimas, minuto ─────────────────────────
  var ultimoSegundo = -1;
  function reloj(forzar) {
    var ya = ahora();
    var seg = Math.floor(ya / 1000);
    if (!forzar && seg === ultimoSegundo) { pintarAviso(); return; }
    ultimoSegundo = seg;
    pintarAviso();
    if (!actual) return;
    var tramo = Math.max(0, ya - actual.desde);
    texto(elEstado, T.estado(mostrada === null ? actual.prendida : mostrada, larga(pendiente ? 0 : tramo)));
    var rp = actual.prendida ? Math.max(actual.recordPrendida || 0, tramo) : actual.recordPrendida || 0;
    var ra = actual.prendida ? actual.recordApagada || 0 : Math.max(actual.recordApagada || 0, tramo);
    texto(elRecords, T.recordP + ": " + (rp ? corta(rp) : "—") + " · " + T.recordA + ": " + (ra ? corta(ra) : "—") + " · " + T.toques(actual.toques || 0));
    var lis = elUltimas.children;
    for (var i = 0; i < lis.length; i++) {
      var t = Number(lis[i].getAttribute("data-t"));
      var sp = lis[i].lastChild;
      if (sp) texto(sp, haceCuanto(ya - t));
    }
    // durante un minuto vendido
    var m = minutoActivo();
    if (m) {
      elMinuto.hidden = false;
      texto(elMinutoTexto, llaveDe(m.id) ? T.minutoTuyo : T.minutoAjeno);
    } else elMinuto.hidden = true;
    pintarVisita(ya);
    pintarHuellaPropia(ya);
  }

  function pintarUltimas() {
    var ult = (actual && actual.ultimas) || [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < ult.length; i++) {
      var u = ult[i];
      var li = document.createElement("li");
      li.setAttribute("data-t", String(u.t));
      if (i === 0 && ahora() - u.t < 15000) li.className = "ix-nueva";
      li.appendChild(document.createTextNode((lugar(u) || T.alguien) + " " + (T.accion[u.accion] || "") + " · "));
      li.appendChild(document.createElement("span"));
      frag.appendChild(li);
    }
    elUltimas.textContent = "";
    elUltimas.appendChild(frag);
  }

  // ───────────────────────── la huella ajena (?h=) ─────────────────────────
  function cargarVisita() {
    if (!idVisita) return;
    var t0 = performance.now();
    fetch("/api/interruptor/huella?h=" + idVisita, { cache: "no-store" })
      .then(function (r) {
        var t1 = performance.now();
        if (!r.ok) { elVisita.hidden = true; return; }
        return r.json().then(function (d) {
          if (!d || !d.t) return;
          ponerHora(d.ahora, t0, t1, true);
          huellaVisita = d;
          toquesVisita = actual ? actual.toques || 0 : -1;
          elVisita.hidden = false;
          pintarVisita(ahora());
        });
      })
      .catch(function () {});
  }
  function pintarVisita(ya) {
    var h = huellaVisita;
    if (!h) return;
    if (toquesVisita < 0 && actual) toquesVisita = actual.toques || 0;
    var vigente = h.fin == null;
    var linea = T.visita(lugar(h), h.accion === "apago") + " " +
      (vigente ? T.lleva(larga(ya - h.t)) : T.duro(corta(h.fin - h.t)));
    texto(elVisita, linea);
  }

  // ───────────────────────── tu huella ─────────────────────────
  var huellaPropia = null;
  function enlaceHuella(id) { return location.origin + RUTA + "?h=" + id; }
  function mostrarHuellaPropia(h, recien) {
    huellaPropia = h;
    elHuella.hidden = false;
    if (recien) { elHuellaAbrir.setAttribute("aria-expanded", "false"); elHuellaOpciones.hidden = true; }
    pintarHuellaPropia(ahora());
  }
  function pintarHuellaPropia(ya) {
    if (!huellaPropia || elHuellaOpciones.hidden) return;
    var h = huellaPropia;
    // sigue vigente si es la del último cambio de luz
    var vigente = actual && actual.desde === h.t && (h.fin == null);
    var fin = vigente ? null : (h.fin != null ? h.fin : finDeHuella(h));
    var d = fin == null ? T.lleva(larga(ya - h.t)) : T.duro(corta(fin - h.t));
    var frase = T.tuyo(h.accion === "apago");
    if (elHuellaFrase.getAttribute("data-f") !== frase + d) {
      elHuellaFrase.setAttribute("data-f", frase + d);
      elHuellaFrase.textContent = frase + " ";
      var em = document.createElement("em"); em.textContent = d;
      elHuellaFrase.appendChild(em);
    }
  }
  function finDeHuella(h) {
    // el toque que la cerró es el siguiente en la lista de últimas
    var ult = (actual && actual.ultimas) || [];
    for (var i = ult.length - 1; i >= 0; i--) if (ult[i].t > h.t) return ult[i].t;
    return actual && actual.desde > h.t ? actual.desde : null;
  }
  try {
    var guardada = JSON.parse(leerLocal("interruptor-huella") || "null");
    if (guardada && /^[a-z2-7]{8}$/.test(guardada.id || "") && typeof guardada.t === "number") mostrarHuellaPropia(guardada, false);
  } catch (e) {}

  elHuellaAbrir.addEventListener("click", function () {
    var abrir = elHuellaOpciones.hidden;
    elHuellaOpciones.hidden = !abrir;
    elHuellaAbrir.setAttribute("aria-expanded", abrir ? "true" : "false");
    if (abrir) {
      elHuellaFrase.removeAttribute("data-f");
      pintarHuellaPropia(ahora());
      // el final exacto lo sabe el servidor
      var h = huellaPropia;
      if (h && h.fin == null) datosHuella(h).then(function (d) {
        if (huellaPropia === h && d && !d.local && d.fin != null) { h.fin = d.fin; elHuellaFrase.removeAttribute("data-f"); pintarHuellaPropia(ahora()); }
      });
    }
  });
  var botonCompartir = elHuellaOpciones.querySelector('[data-huella="compartir"]');
  if (navigator.share && botonCompartir) botonCompartir.hidden = false;

  elHuellaOpciones.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("[data-huella]") : null;
    if (!b || !huellaPropia) return;
    var que = b.getAttribute("data-huella");
    var url = enlaceHuella(huellaPropia.id);
    if (que === "copiar") copiar(url).then(function (ok) { if (ok) { medir("huella-compartida"); confirmar(b, T.copiado); } });
    else if (que === "compartir") {
      navigator.share({ title: T.frase(huellaPropia.accion === "apago"), text: T.frase(huellaPropia.accion === "apago"), url: url })
        .then(function () { medir("huella-compartida"); })
        .catch(function () {});
    } else if (que === "guardar") {
      b.disabled = true;
      datosHuella(huellaPropia).then(imagenVertical).then(function (blob) {
        b.disabled = false;
        if (!blob) return;
        descargar(blob, T.archivo + huellaPropia.id + ".png");
        medir("huella-compartida");
        confirmar(b, T.guardada);
      }).catch(function () { b.disabled = false; });
    }
  });
  function confirmar(b, t) {
    var antes = b.getAttribute("data-texto") || b.textContent;
    b.setAttribute("data-texto", antes);
    b.textContent = t;
    setTimeout(function () { b.textContent = antes; }, 1800);
  }
  function copiar(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return copiarViejo(t); });
    }
    return Promise.resolve(copiarViejo(t));
  }
  function copiarViejo(t) {
    try {
      var a = document.createElement("textarea");
      a.value = t; a.setAttribute("readonly", ""); a.style.position = "fixed"; a.style.opacity = "0";
      document.body.appendChild(a); a.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(a);
      return ok;
    } catch (e) { return false; }
  }
  function descargar(blob, nombre) {
    var u = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = u; a.download = nombre; a.rel = "noopener";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(u); }, 10000);
  }
  /** La huella completa (ciudad, país, fin) desde el servidor; si no contesta, lo que se sabe acá. */
  function datosHuella(h) {
    var t0 = performance.now();
    return fetch("/api/interruptor/huella?h=" + h.id, { cache: "no-store" })
      .then(function (r) { var t1 = performance.now(); return r.ok ? r.json().then(function (d) { ponerHora(d.ahora, t0, t1, true); return d; }) : null; })
      .catch(function () { return null; })
      .then(function (d) { return d && d.t ? d : { id: h.id, accion: h.accion, t: h.t, fin: finDeHuella(h), ciudad: "", pais: "", cc: "", local: true }; });
  }

  /** Imagen vertical 1080x1920 para historias, con las tipografías del sitio. */
  function imagenVertical(h) {
    var SERIF = '"Instrument Serif", Georgia, serif', MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
    var fuentes = Promise.resolve();
    if (document.fonts && document.fonts.load) {
      fuentes = Promise.all([
        document.fonts.load('120px "Instrument Serif"'),
        document.fonts.load('italic 64px "Instrument Serif"'),
        document.fonts.load('30px "IBM Plex Mono"')
      ]).then(function () { return document.fonts.ready; }).catch(function () {});
    }
    return fuentes.then(function () {
      var W = 1080, H = 1920, M = 96;
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d");
      if (!x) return null;
      var apago = h.accion === "apago";
      x.fillStyle = "#0e0d12"; x.fillRect(0, 0, W, H);
      if (!apago) {
        var g = x.createRadialGradient(W / 2, 820, 0, W / 2, 820, 820);
        g.addColorStop(0, "rgba(242,233,216,0.2)"); g.addColorStop(0.5, "rgba(242,233,216,0.07)"); g.addColorStop(1, "rgba(242,233,216,0)");
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      } else {
        var r = x.createRadialGradient(W - 150, 200, 0, W - 150, 200, 60);
        r.addColorStop(0, "rgba(226,85,58,0.35)"); r.addColorStop(1, "rgba(226,85,58,0)");
        x.fillStyle = r; x.fillRect(W - 260, 90, 220, 220);
        x.fillStyle = "#e2553a"; x.fillRect(W - 172, 198, 44, 4);
      }
      x.textBaseline = "alphabetic";
      x.fillStyle = "rgba(242,233,216,0.5)";
      x.font = "30px " + MONO;
      x.fillText(T.pie.split(" — ")[0], M, 210);

      var lineas = partir(x, T.frase(apago), W - M * 2, "128px " + SERIF);
      var y = 820 - (lineas.length - 1) * 66;
      x.fillStyle = apago ? "rgba(242,233,216,0.88)" : "#f2e9d8";
      x.font = "128px " + SERIF;
      for (var i = 0; i < lineas.length; i++) { x.fillText(lineas[i], M, y); y += 132; }
      y -= 132;

      var vigente = h.fin == null;
      var d = vigente ? T.lleva(corta(ahora() - h.t)) : T.duro(corta(h.fin - h.t));
      x.font = "italic 64px " + SERIF;
      x.fillStyle = "rgba(242,233,216," + (apago ? 0.6 : 0.74) + ")";
      partir(x, d, W - M * 2, x.font).forEach(function (l, j) { x.fillText(l, M, y + 110 + j * 70); });

      var donde = lugar(h);
      if (donde) {
        x.font = "34px " + MONO;
        x.fillStyle = "rgba(242,233,216,0.56)";
        x.fillText(donde, M, y + 200);
      }
      x.font = "30px " + MONO;
      x.fillStyle = "rgba(242,233,216,0.5)";
      x.fillText(T.sitio, M, H - 200);
      x.fillText("Solzimer", M, H - 150);

      return new Promise(function (ok) {
        if (c.toBlob) c.toBlob(function (b) { ok(b); }, "image/png");
        else ok(null);
      });
    });
  }
  function partir(x, t, ancho, fuente) {
    x.font = fuente;
    var palabras = t.split(" "), lineas = [], linea = "";
    for (var i = 0; i < palabras.length; i++) {
      var prueba = linea ? linea + " " + palabras[i] : palabras[i];
      if (linea && x.measureText(prueba).width > ancho) { lineas.push(linea); linea = palabras[i]; }
      else linea = prueba;
    }
    if (linea) lineas.push(linea);
    return lineas;
  }

  // ───────────────────────── arranque ─────────────────────────
  pedirFicha();
  consultar();
  cargarVisita();
  setInterval(function () { if (!document.hidden) reloj(false); }, 250);
})();
