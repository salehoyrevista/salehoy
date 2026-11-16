// Elegir y pedir un minuto de "El minuto" (/minuto/elegir/, /en/minute/choose/). Pedirlo es gratis.
// Marcado y estilos: src/pages/minuto/elegir.astro.
//
// Pasos, sin recargar:
//   1. fecha, hora y zona -> GET /api/minuto/precio (con espera entre teclas): ¿está libre?
//   2. dedicatoria (máx. 80) con vista previa y "Leí los términos"
//   3. POST /api/minuto/pedir -> el minuto es tuyo: página, certificado y llave del interruptor
//
// Aparte y opcional, solo si GET /api/minuto/config trae "aporte": aportar a la obra en USDC en
// Base con MetaMask. El minuto no depende del aporte, y al servidor no se le avisa nada.
//
// Reglas: nunca se piden claves privadas ni frases semilla; nunca se firman mensajes ni se pide
// "approve": lo único que se manda a la billetera es transfer(direccion, monto) del contrato USDC.
// Los eventos de medición no llevan montos ni ningún dato de la persona.
(function () {
  "use strict";
  var raiz = document.getElementById("el");
  if (!raiz) return;

  var lang = document.documentElement.lang === "en" ? "en" : "es";
  var CLAVE = "minuto-elegir";               // sessionStorage: el minuto recién pedido (para una recarga)

  var T = {
    es: {
      consultando: "consultando…",
      especial: "un minuto especial: ",
      enUtc: "En UTC: ",
      ambigua: "Esa hora pasa dos veces en esa zona por el cambio de horario: se toma la primera.",
      disponible: "Está libre.",
      motivo: {
        vendido: "Ese minuto ya es de alguien. Probá con otro.",
        pasado: "Ese minuto ya pasó. Solo se regalan minutos por venir.",
        lejano: "Todavía no se pueden pedir minutos tan lejanos.",
        ocupado: "Ese minuto ya no está libre. Probá con otro."
      },
      error422: {
        "hora-inexistente": "Esa hora no existe en esa zona: el reloj la saltea por el cambio de horario.",
        zona: "No se reconoce esa zona horaria.",
        formato: "Revisá la fecha y la hora."
      },
      demasiadas: "Demasiadas consultas seguidas. Esperá un momento y probá de nuevo.",
      semana: "Se puede pedir un minuto cada 7 días, y ya pediste uno.",
      semanaHasta: function (f) { return " Vas a poder pedir otro desde el " + f + "."; },
      dia: "La obra recibió muchos pedidos hoy. Probá mañana.",
      persona: "No se pudo confirmar que el pedido venga de una persona. Probá de nuevo en un rato, o desde otro navegador.",
      sinRed: "No se pudo consultar. Revisá la conexión y probá de nuevo.",
      falla: "Algo falló del lado del sitio. Probá de nuevo en un momento.",
      dedicatoria: {
        enlace: "Sin enlaces ni direcciones web.",
        larga: "Hasta 80 caracteres.",
        vacia: "Falta la dedicatoria.",
        contacto: "Sin teléfonos, correos ni otros datos de contacto.",
        insulto: "Esa dedicatoria no se puede publicar. Probá con otras palabras."
      },
      faltaAcepto: "Para seguir, marcá que leíste los términos.",
      pidiendo: "pidiendo…",
      vistaVacia: "tu dedicatoria",
      horaDe: "hora de",
      armando: "armando el certificado…",
      certListo: "certificado listo",
      certFallo: "no se pudo armar el certificado",
      copiado: "copiado",
      copiaManual: "seleccioná el enlace y copialo",
      // aporte
      montoMal: "Escribí un monto mayor que 0, con hasta dos decimales.",
      montoConfirmar: function (m) { return "Vas a aportar " + m + " USDC. ¿Es correcto?"; },
      aportarCon: function (m) { return "aportar " + m + " USDC"; },
      elegiMonto: "Elegí un monto para aportar.",
      conectando: "Abriendo MetaMask…",
      red: function (red) { return "Pidiendo a MetaMask que pase a " + red + "…"; },
      conectada: function (cuenta, saldo) { return "billetera " + cuenta + (saldo ? " · saldo " + saldo + " USDC" : ""); },
      sinSaldo: function (red) { return "No te alcanza el saldo de USDC en " + red + " en esta billetera para ese monto."; },
      sinEth: function (red) { return "Esta billetera no tiene ETH en " + red + " para pagar la comisión de red."; },
      sinSaldoLeido: "No se pudo leer el saldo. Si no alcanza, MetaMask avisa.",
      confirmar: "Confirmá la transferencia en MetaMask.",
      cancelado: "Cancelaste en MetaMask. No se movió nada.",
      pendienteMM: "MetaMask ya tiene un pedido abierto: abrilo para seguir.",
      falloMM: "MetaMask no pudo mandar la transferencia. Si en MetaMask no figura como enviada, no se movió nada.",
      redRechazada: "Para aportar hace falta estar en la red Base. No se movió nada.",
      viejo: "Este navegador es demasiado viejo para aportar desde acá. Probá con uno actualizado.",
      verTx: "ver la transacción ↗"
    },
    en: {
      consultando: "checking…",
      especial: "a special minute: ",
      enUtc: "In UTC: ",
      ambigua: "That time happens twice in that zone because of the clock change: the first one is taken.",
      disponible: "It is free.",
      motivo: {
        vendido: "That minute already belongs to someone. Try another.",
        pasado: "That minute has passed. Only minutes still to come can be given.",
        lejano: "Minutes that far ahead cannot be asked for yet.",
        ocupado: "That minute is no longer free. Try another."
      },
      error422: {
        "hora-inexistente": "That time does not exist in that zone: the clock skips it because of the clock change.",
        zona: "That time zone is not recognised.",
        formato: "Check the date and time."
      },
      demasiadas: "Too many requests in a row. Wait a moment and try again.",
      semana: "You can ask for one minute every 7 days, and you already asked for one.",
      semanaHasta: function (f) { return " You can ask for another from " + f + "."; },
      dia: "The work received many requests today. Try tomorrow.",
      persona: "We could not confirm the request comes from a person. Try again in a while, or from another browser.",
      sinRed: "Could not check. Check your connection and try again.",
      falla: "Something failed on the site's side. Try again in a moment.",
      dedicatoria: {
        enlace: "No links or web addresses.",
        larga: "Up to 80 characters.",
        vacia: "The dedication is missing.",
        contacto: "No phone numbers, emails or other contact details.",
        insulto: "That dedication cannot be published. Try other words."
      },
      faltaAcepto: "To continue, tick that you have read the terms.",
      pidiendo: "asking…",
      vistaVacia: "your dedication",
      horaDe: "time in",
      armando: "making the certificate…",
      certListo: "certificate ready",
      certFallo: "the certificate could not be made",
      copiado: "copied",
      copiaManual: "select the link and copy it",
      montoMal: "Write an amount greater than 0, with up to two decimals.",
      montoConfirmar: function (m) { return "You are about to contribute " + m + " USDC. Is that right?"; },
      aportarCon: function (m) { return "contribute " + m + " USDC"; },
      elegiMonto: "Choose an amount to contribute.",
      conectando: "Opening MetaMask…",
      red: function (red) { return "Asking MetaMask to switch to " + red + "…"; },
      conectada: function (cuenta, saldo) { return "wallet " + cuenta + (saldo ? " · balance " + saldo + " USDC" : ""); },
      sinSaldo: function (red) { return "This wallet does not have enough USDC on " + red + " for that amount."; },
      sinEth: function (red) { return "This wallet has no ETH on " + red + " to pay the network fee."; },
      sinSaldoLeido: "The balance could not be read. If it is not enough, MetaMask will tell you.",
      confirmar: "Confirm the transfer in MetaMask.",
      cancelado: "You cancelled in MetaMask. Nothing moved.",
      pendienteMM: "MetaMask already has a request open: open it to continue.",
      falloMM: "MetaMask could not send the transfer. If MetaMask does not show it as sent, nothing moved.",
      redRechazada: "To contribute you need to be on the Base network. Nothing moved.",
      viejo: "This browser is too old to contribute from here. Try an up-to-date one.",
      verTx: "see the transaction ↗"
    }
  }[lang];

  function $(id) { return document.getElementById(id); }
  var el = {
    pasos: [null, $("paso1"), $("paso2"), $("paso3")],
    fecha: $("fecha"), hora: $("hora"), zona: $("zona"), zonaTexto: $("zonaTexto"),
    disponible: $("disponible"), seguir1: $("seguir1"),
    elegido2: $("elegido2"), dedicatoria: $("dedicatoria"), contador: $("contador"),
    vistaReloj: $("vistaReloj"), vistaDed: $("vistaDed"), acepto: $("acepto"), error2: $("error2"),
    pedir: $("pedir"), volver2: $("volver2"),
    elegido3: $("elegido3"), enlacePagina: $("enlacePagina"), certificado: $("certificado"), avisoCert: $("avisoCert"),
    bloqueLlave: $("bloqueLlave"), llaveEnlace: $("llaveEnlace"), copiarLlave: $("copiarLlave"), avisoLlave: $("avisoLlave"),
    aporte: $("aportar"), montos: $("montos"), montoLibre: $("montoLibre"), aRed: $("aRed"), aDestino: $("aDestino"),
    sinBilletera: $("sinBilletera"), conBilletera: $("conBilletera"), conectar: $("conectar"), cuenta: $("cuenta"),
    aportarBoton: $("aportarBoton"), estadoAporte: $("estadoAporte"), gracias: $("gracias"), transaccion: $("transaccion")
  };
  var RUTA_INTERRUPTOR = raiz.getAttribute("data-interruptor") || "/interruptor/";

  // ---------- utilidades ----------

  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function evento(nombre) {
    try { if (window.SaleHoyVisita && typeof window.SaleHoyVisita.evento === "function") window.SaleHoyVisita.evento(nombre); } catch (e) {}
  }
  function leerSesion() {
    try { var v = sessionStorage.getItem(CLAVE); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function guardarSesion(v) {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) {}
  }
  function decir(nodo, texto, mal) {
    nodo.textContent = texto || "";
    if (nodo.classList) nodo.classList.toggle("mal", !!mal);
  }
  function largoTexto(s) { return Array.from ? Array.from(s).length : s.length; }
  function idUrl(id) { return String(id || "").replace(":", "-"); }
  function rutaPagina(id) { return (lang === "en" ? "/en/minute/m/" : "/minuto/m/") + idUrl(id) + "/"; }
  function cuentaCorta(c) { return c ? c.slice(0, 6) + "…" + c.slice(-4) : ""; }
  function reducido() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // Pide JSON y devuelve { status, datos } (datos null si no vino JSON). Nunca rechaza salvo sin red.
  function pedirJSON(url, opciones) {
    opciones = opciones || {};
    opciones.cache = "no-store";
    opciones.headers = opciones.headers || {};
    opciones.headers.accept = "application/json";
    return fetch(url, opciones).then(function (r) {
      return r.text().then(function (txt) {
        var d = null;
        try { d = txt ? JSON.parse(txt) : null; } catch (e) {}
        return { status: r.status, datos: d };
      });
    });
  }
  function postJSON(url, cuerpo) {
    return pedirJSON(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
  }

  // "jueves, 24 de diciembre de 2026, 00:33 · hora de …" en la zona elegida
  function minutoLegible(instante, zona) {
    try {
      var d = new Date(instante);
      var f = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-AR", { timeZone: zona, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
      var h = new Intl.DateTimeFormat("en-GB", { timeZone: zona, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
      return f + ", " + h + " · " + T.horaDe + " " + String(zona).replace(/_/g, " ");
    } catch (e) { return ""; }
  }
  // "hasta" del 429 puede venir en ms o como fecha ISO; si no se entiende, no se muestra.
  function fechaCorta(v) {
    var d = typeof v === "number" ? new Date(v) : typeof v === "string" ? new Date(v) : null;
    if (!d || isNaN(d.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-AR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
    } catch (e) { return ""; }
  }

  // ---------- estado ----------

  var config = null;     // GET /api/minuto/config
  var libre = null;      // última respuesta de /precio válida (y libre) para lo que está en los campos
  var pedido = null;     // el minuto recién pedido: { id, llave, instante, zona }

  function mostrarPaso(n) {
    for (var i = 1; i <= 3; i++) el.pasos[i].hidden = i !== n;
    var destino = el.pasos[n].querySelector("h2");
    if (destino && mostrarPaso.yaUsado) {
      destino.setAttribute("tabindex", "-1");
      destino.focus({ preventScroll: true });
      el.pasos[n].scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" });
    }
    mostrarPaso.yaUsado = true;
    pintarAporte();
  }

  // ---------- paso 1: el minuto ----------

  function llenarZonas() {
    var propia = "UTC";
    try { propia = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) {}
    var lista = null;
    try { if (Intl.supportedValuesOf) lista = Intl.supportedValuesOf("timeZone"); } catch (e) {}
    if (!lista || !lista.length) {
      el.zona.hidden = true;
      el.zonaTexto.hidden = false;
      el.zonaTexto.value = propia;
      return;
    }
    lista = lista.slice();
    if (lista.indexOf("UTC") < 0) lista.push("UTC");
    if (lista.indexOf(propia) < 0) lista.push(propia);
    lista.sort();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < lista.length; i++) {
      var o = document.createElement("option");
      o.value = lista[i];
      o.textContent = lista[i].replace(/_/g, " ");
      if (lista[i] === propia) o.selected = true;
      frag.appendChild(o);
    }
    el.zona.appendChild(frag);
  }
  function zonaElegida() { return (el.zona.hidden ? el.zonaTexto.value : el.zona.value).trim(); }
  function entradaActual() { return { fecha: el.fecha.value, hora: (el.hora.value || "").slice(0, 5), zona: zonaElegida() }; }

  var esperaConsulta = null, numConsulta = 0;
  function alCambiarMinuto() {
    libre = null;
    el.seguir1.disabled = true;
    clearTimeout(esperaConsulta);
    var e = entradaActual();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.fecha) || !/^\d{2}:\d{2}$/.test(e.hora) || !e.zona) { el.disponible.textContent = ""; return; }
    esperaConsulta = setTimeout(consultar, 400);
  }

  function renglon(texto, mal, clase) {
    var p = document.createElement("p");
    p.className = clase || (mal ? "el-error" : "");
    p.textContent = texto;
    el.disponible.appendChild(p);
    return p;
  }

  function consultar() {
    var e = entradaActual();
    var n = ++numConsulta;
    el.disponible.textContent = "";
    renglon(T.consultando, false, "mono");
    var url = "/api/minuto/precio?fecha=" + encodeURIComponent(e.fecha) + "&hora=" + encodeURIComponent(e.hora) + "&zona=" + encodeURIComponent(e.zona);
    pedirJSON(url).then(function (r) {
      if (n !== numConsulta) return;          // llegó tarde: ya cambió la consulta
      var d = r.datos;
      el.disponible.textContent = "";
      if (r.status === 200 && d && typeof d.disponible === "boolean") {
        pintarDisponible(d);
        if (d.disponible) { libre = { entrada: e, datos: d }; el.seguir1.disabled = false; }
        return;
      }
      if (r.status === 422) return renglon(T.error422[d && d.error] || T.error422.formato, true);
      if (r.status === 429) return renglon(T.demasiadas, true);
      renglon(T.falla, true);
    }, function () {
      if (n !== numConsulta) return;
      el.disponible.textContent = "";
      renglon(T.sinRed, true);
    });
  }
  function pintarDisponible(d) {
    if (d.disponible) renglon(T.disponible, false, "el-libre");
    else renglon(T.motivo[d.motivo] || T.motivo.ocupado, true);
    if (d.especial) renglon(T.especial + d.especial, false, "mono");
    if (d.utc) renglon(T.enUtc + d.utc, false, "mono");
    if (d.ambigua) renglon(T.ambigua, false, "mono");
  }

  el.fecha.addEventListener("input", alCambiarMinuto);
  el.hora.addEventListener("input", alCambiarMinuto);
  el.zona.addEventListener("change", alCambiarMinuto);
  el.zonaTexto.addEventListener("input", alCambiarMinuto);
  el.fecha.addEventListener("change", alCambiarMinuto);
  el.hora.addEventListener("change", alCambiarMinuto);

  el.seguir1.addEventListener("click", function () {
    if (!libre) return;
    el.elegido2.textContent = minutoLegible(libre.datos.instante, libre.entrada.zona);
    pintarVista();
    mostrarPaso(2);
    el.dedicatoria.focus({ preventScroll: true });
  });

  // ---------- paso 2: la dedicatoria ----------

  var MAX = 80;
  function pintarVista() {
    var texto = el.dedicatoria.value.trim();
    var n = largoTexto(el.dedicatoria.value);
    el.contador.textContent = n + " / " + MAX;
    el.contador.classList.toggle("cerca", n > MAX - 10);
    if (libre) {
      try {
        el.vistaReloj.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: libre.entrada.zona, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(libre.datos.instante)) + ":00";
      } catch (e) { el.vistaReloj.textContent = libre.entrada.hora + ":00"; }
    }
    el.vistaDed.textContent = texto || T.vistaVacia;      // textContent: nunca HTML
    el.vistaDed.classList.toggle("vacia", !texto);
  }
  el.dedicatoria.addEventListener("input", function () { pintarVista(); el.error2.textContent = ""; });
  el.acepto.addEventListener("change", function () { el.error2.textContent = ""; });
  el.volver2.addEventListener("click", function () { mostrarPaso(1); });

  var pidiendo = false;
  el.pedir.addEventListener("click", function () {
    if (pidiendo || !libre) return;
    var dedicatoria = el.dedicatoria.value.trim();
    if (!dedicatoria) { el.error2.textContent = T.dedicatoria.vacia; el.dedicatoria.focus(); return; }
    if (largoTexto(dedicatoria) > MAX) { el.error2.textContent = T.dedicatoria.larga; el.dedicatoria.focus(); return; }
    if (/(https?:\/\/|www\.)/i.test(dedicatoria)) { el.error2.textContent = T.dedicatoria.enlace; el.dedicatoria.focus(); return; }
    if (!el.acepto.checked) { el.error2.textContent = T.faltaAcepto; el.acepto.focus(); return; }

    pidiendo = true;
    el.pedir.disabled = true;
    el.error2.textContent = "";
    var textoBoton = el.pedir.textContent;
    el.pedir.textContent = T.pidiendo;
    var e = libre.entrada, instante = libre.datos.instante;
    postJSON("/api/minuto/pedir", { fecha: e.fecha, hora: e.hora, zona: e.zona, dedicatoria: dedicatoria, lang: lang })
      .then(function (r) {
        var d = r.datos || {};
        if (r.status === 200 && d.id) {
          entregar(d, instante, e.zona);
          return;
        }
        if (r.status === 409) {
          mostrarPaso(1);
          el.disponible.textContent = "";
          renglon(T.motivo[d.motivo] || T.motivo.ocupado, true);
          libre = null; el.seguir1.disabled = true;
          return;
        }
        if (r.status === 422 && d.error === "dedicatoria") { el.error2.textContent = T.dedicatoria[d.detalle] || T.dedicatoria.insulto; el.dedicatoria.focus(); return; }
        if (r.status === 422) { el.error2.textContent = T.error422[d.error] || T.error422.formato; return; }
        if (r.status === 429 && d.motivo === "semana") {
          var f = fechaCorta(d.hasta);
          el.error2.textContent = T.semana + (f ? T.semanaHasta(f) : "");
          return;
        }
        if (r.status === 429 && d.motivo === "dia") { el.error2.textContent = T.dia; return; }
        if (r.status === 429) { el.error2.textContent = T.demasiadas; return; }
        if (r.status === 403) { el.error2.textContent = T.persona; return; }
        el.error2.textContent = T.falla;
      }, function () { el.error2.textContent = T.sinRed; })
      .then(function () {
        pidiendo = false;
        el.pedir.disabled = false;
        el.pedir.textContent = textoBoton;
      });
  });

  // ---------- paso 3: el minuto es tuyo ----------

  function entregar(d, instante, zona) {
    var id = String(d.id);
    var llave = d.llave ? String(d.llave) : null;
    if (llave) {
      try { localStorage.setItem("minuto-llave:" + id, llave); } catch (e) {}
    }
    var utcMs = typeof d.utc === "string" && !isNaN(Date.parse(d.utc)) ? Date.parse(d.utc) : null;
    pedido = { id: id, llave: llave, instante: typeof instante === "number" ? instante : utcMs, zona: d.zona || zona, pagina: typeof d.pagina === "string" ? d.pagina : null };
    guardarSesion({ pedido: pedido });     // para que una recarga en esta pestaña no pierda la llave
    evento("minuto-compra-inicio");        // ahora significa "pidió un minuto"
    pintarPedido();
  }

  function pintarPedido() {
    var v = pedido;
    mostrarPaso(3);
    el.elegido3.textContent = v.instante != null ? minutoLegible(v.instante, v.zona) : "";
    // La página del minuto: la que manda el servidor si es una ruta propia; si no, se arma.
    el.enlacePagina.href = v.pagina && /^\/[a-z0-9\/_-]+\/$/i.test(v.pagina) && v.pagina.indexOf("//") < 0 ? v.pagina : rutaPagina(v.id);
    if (v.llave) {
      el.llaveEnlace.value = location.origin + RUTA_INTERRUPTOR + "?llave=" + encodeURIComponent(v.llave);
      el.bloqueLlave.hidden = false;
    } else el.bloqueLlave.hidden = true;
  }

  el.certificado.addEventListener("click", function () {
    var v = pedido;
    if (!v) return;
    if (!window.MinutoCertificado) { el.avisoCert.textContent = T.certFallo; return; }
    el.avisoCert.textContent = T.armando;
    window.MinutoCertificado.entregar({
      id: v.id, instante: v.instante, zona: v.zona, estado: "pendiente", dedicatoria: null, prueba: false, lang: lang
    }).then(function () { el.avisoCert.textContent = T.certListo; }, function () { el.avisoCert.textContent = T.certFallo; });
  });

  el.copiarLlave.addEventListener("click", function () {
    var texto = el.llaveEnlace.value;
    function manual() { el.llaveEnlace.focus(); el.llaveEnlace.select(); el.avisoLlave.textContent = T.copiaManual; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { el.avisoLlave.textContent = T.copiado; }, manual);
    } else manual();
  });
  el.llaveEnlace.addEventListener("focus", function () { el.llaveEnlace.select(); });

  // ---------- aporte (opcional) ----------
  //
  // Se muestra solo si config.aporte existe, y solo después de pedir un minuto (o si se llega con
  // #aportar, por ejemplo desde la app de MetaMask). No toca nada del minuto.

  var aporte = null;            // config.aporte validado
  var proveedor = null, cuenta = null, ocupado = false, aportado = false;
  var montoElegido = null;      // { texto: "5", unidades: BigInt } o null
  var saldoUsdc = null;         // BigInt o null si no se pudo leer
  var directo = location.hash === "#aportar";

  function aporteValido(a) {
    if (!a || typeof a !== "object" || !a.red || typeof a.red !== "object") return null;
    if (!/^0x[0-9a-fA-F]{40}$/.test(String(a.direccion || ""))) return null;
    if (!/^0x[0-9a-fA-F]{40}$/.test(String(a.red.usdc || ""))) return null;
    if (!/^0x[0-9a-fA-F]+$/.test(String(a.red.chainIdHex || ""))) return null;
    return a;
  }

  function pintarAporte() {
    var ver = !!aporte && (!!pedido || directo);
    el.aporte.hidden = !ver;
    if (!ver) return;
    el.aRed.textContent = (aporte.red.nombre || "Base") + (aporte.red.chainId ? " (chain " + aporte.red.chainId + ")" : "");
    el.aDestino.textContent = aporte.direccion;
    if (!el.montos.childNodes.length) armarMontos();
    pintarBilletera();
  }

  function armarMontos() {
    var sugeridos = Array.isArray(aporte.sugeridos) ? aporte.sugeridos : [1, 5, 15];
    for (var i = 0; i < sugeridos.length; i++) {
      var n = sugeridos[i];
      if (typeof n !== "number" || !(n > 0)) continue;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "enlace";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("data-monto", String(n));
      b.textContent = n + " USD";
      b.addEventListener("click", elegirSugerido);
      el.montos.appendChild(b);
    }
  }
  function marcarSugerido(valor) {
    var bs = el.montos.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-monto") === valor ? "true" : "false");
  }
  function elegirSugerido(ev) {
    var v = ev.currentTarget.getAttribute("data-monto");
    el.montoLibre.value = "";
    marcarSugerido(v);
    ponerMonto(v);
  }
  el.montoLibre.addEventListener("input", function () {
    marcarSugerido(null);
    ponerMonto(el.montoLibre.value);
  });

  // "5", "5.5", "5,50" -> { texto, unidades } (USDC tiene 6 decimales). null si no es un monto válido.
  function leerMonto(s) {
    s = String(s || "").trim().replace(",", ".");
    if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) return null;
    if (typeof BigInt !== "function") return null;
    var partes = s.split(".");
    var dec = ((partes[1] || "") + "000000").slice(0, 6);
    var unidades = BigInt(partes[0]) * BigInt(1000000) + BigInt(dec);
    if (unidades <= BigInt(0)) return null;
    var texto = String(BigInt(partes[0])) + (partes[1] && /[1-9]/.test(partes[1]) ? "." + partes[1].replace(/0+$/, "") : "");
    return { texto: texto, unidades: unidades };
  }
  function ponerMonto(s) {
    montoElegido = leerMonto(s);
    if (!aportado) decir(el.estadoAporte, String(s || "").trim() && !montoElegido ? T.montoMal : "", !!(String(s || "").trim() && !montoElegido));
    pintarBotonAporte();
  }

  // Billeteras: EIP-6963 (se prefiere MetaMask) y, si no, window.ethereum.
  window.addEventListener("eip6963:announceProvider", function (ev) {
    var det = ev && ev.detail;
    if (!det || !det.provider) return;
    var esMetaMask = det.info && det.info.rdns === "io.metamask";
    if (!proveedor || esMetaMask) { proveedor = det.provider; escucharProveedor(); }
    if (!el.aporte.hidden) pintarBilletera();
  });
  try { window.dispatchEvent(new Event("eip6963:requestProvider")); } catch (e) {}

  var escuchando = null;
  function escucharProveedor() {
    if (!proveedor || escuchando === proveedor || !proveedor.on) return;
    escuchando = proveedor;
    try {
      proveedor.on("accountsChanged", function (c) { cuenta = c && c[0] ? String(c[0]) : null; if (cuenta) revisarBilletera(); else pintarBilletera(); });
      proveedor.on("chainChanged", function () { if (cuenta) revisarBilletera(); });
    } catch (e) {}
  }
  function buscarProveedor() {
    if (!proveedor && window.ethereum) { proveedor = window.ethereum; escucharProveedor(); }
    return proveedor;
  }

  function pintarBilletera() {
    if (!aporte) return;
    var hay = !!buscarProveedor();
    el.sinBilletera.hidden = hay;
    el.conBilletera.hidden = !hay;
    if (!cuenta) el.cuenta.textContent = "";
    pintarBotonAporte();
  }
  function pintarBotonAporte() {
    var b = el.aportarBoton;
    if (!cuenta || aportado) { b.hidden = true; return; }
    b.hidden = false;
    b.textContent = montoElegido ? T.aportarCon(montoElegido.texto) : T.elegiMonto;
    var alcanza = !montoElegido || saldoUsdc === null || saldoUsdc >= montoElegido.unidades;
    b.disabled = ocupado || !montoElegido || !alcanza;
    if (montoElegido && !alcanza) decir(el.estadoAporte, T.sinSaldo(aporte.red.nombre || "Base"), true);
  }

  function codigoError(e) {
    return e && (e.code || (e.data && e.data.originalError && e.data.originalError.code) || (e.error && e.error.code));
  }
  function relleno64(hex) { var s = "0000000000000000000000000000000000000000000000000000000000000000" + hex; return s.slice(-64); }

  // Unidades de USDC (6 decimales) -> "12.34"
  function aUsdc(unidades) {
    var s = unidades.toString();
    while (s.length < 7) s = "0" + s;
    var entero = s.slice(0, -6), dec = s.slice(-6).replace(/0+$/, "");
    return entero + (dec ? "." + dec.slice(0, 4) : "");
  }

  function pasarARed(red) {
    return proveedor.request({ method: "eth_chainId" }).then(function (id) {
      if (String(id).toLowerCase() === String(red.chainIdHex).toLowerCase()) return;
      decir(el.estadoAporte, T.red(red.nombre || "Base"));
      return proveedor.request({ method: "wallet_switchEthereumChain", params: [{ chainId: red.chainIdHex }] }).catch(function (e) {
        if (codigoError(e) !== 4902) throw e;
        var rpcs = Array.isArray(red.rpcs) && red.rpcs.length ? red.rpcs : ["https://mainnet.base.org"];
        return proveedor.request({ method: "wallet_addEthereumChain", params: [{
          chainId: red.chainIdHex,
          chainName: red.nombre || "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: rpcs,
          blockExplorerUrls: red.explorador ? [red.explorador] : []
        }] });
      });
    });
  }

  // Saldo de USDC (balanceOf) y de ETH (para la comisión). Solo lectura.
  function revisarBilletera() {
    if (!aporte || !cuenta || !proveedor) return Promise.resolve();
    var red = aporte.red;
    return pasarARed(red).then(function () {
      var datos = "0x70a08231" + relleno64(cuenta.slice(2).toLowerCase());
      return Promise.all([
        proveedor.request({ method: "eth_call", params: [{ to: red.usdc, data: datos }, "latest"] }),
        proveedor.request({ method: "eth_getBalance", params: [cuenta, "latest"] }).catch(function () { return null; })
      ]);
    }).then(function (r) {
      if (!r) return;
      saldoUsdc = BigInt(r[0] && r[0] !== "0x" ? r[0] : "0x0");
      el.cuenta.textContent = T.conectada(cuentaCorta(cuenta), aUsdc(saldoUsdc));
      if (r[1] !== null && BigInt(r[1] || "0x0") === BigInt(0)) decir(el.estadoAporte, T.sinEth(red.nombre || "Base"), true);
      else decir(el.estadoAporte, "");
      pintarBotonAporte();
    }).catch(function (e) {
      var c = codigoError(e);
      if (c === 4001) { decir(el.estadoAporte, T.redRechazada, true); return; }
      if (c === -32002) { decir(el.estadoAporte, T.pendienteMM, true); return; }
      // No se pudo leer el saldo: no se bloquea, MetaMask avisa si no alcanza.
      saldoUsdc = null;
      el.cuenta.textContent = T.conectada(cuentaCorta(cuenta), "");
      decir(el.estadoAporte, T.sinSaldoLeido);
      pintarBotonAporte();
    });
  }

  el.conectar.addEventListener("click", function () {
    if (ocupado || !aporte || !buscarProveedor()) return;
    if (typeof BigInt !== "function") { decir(el.estadoAporte, T.viejo, true); return; }
    ocupado = true;
    el.conectar.disabled = true;
    evento("minuto-metamask");
    decir(el.estadoAporte, T.conectando);
    proveedor.request({ method: "eth_requestAccounts" }).then(function (cuentas) {
      cuenta = cuentas && cuentas[0] ? String(cuentas[0]) : null;
      if (!cuenta) throw { code: 4001 };
      return revisarBilletera();
    }).catch(function (e) {
      var c = codigoError(e);
      decir(el.estadoAporte, c === 4001 ? T.cancelado : c === -32002 ? T.pendienteMM : T.falloMM, true);
    }).then(function () {
      ocupado = false;
      el.conectar.disabled = false;
      pintarBilletera();
    });
  });

  el.aportarBoton.addEventListener("click", function () {
    if (ocupado || aportado || !aporte || !proveedor || !cuenta || !montoElegido) return;
    if (typeof BigInt !== "function") { decir(el.estadoAporte, T.viejo, true); return; }
    var red = aporte.red, destino = aporte.direccion, monto = montoElegido;
    // Montos grandes: una pregunta más, por si hay un cero de más.
    if (monto.unidades >= BigInt(100) * BigInt(1000000) && !window.confirm(T.montoConfirmar(monto.texto))) return;
    ocupado = true;
    el.aportarBoton.disabled = true;
    pasarARed(red).then(function () {
      decir(el.estadoAporte, T.confirmar);
      // transfer(address,uint256) del contrato USDC: lo único que se le pide a la billetera.
      var tx = {
        from: cuenta,
        to: red.usdc,
        value: "0x0",
        data: "0xa9059cbb" + relleno64(destino.slice(2).toLowerCase()) + relleno64(monto.unidades.toString(16))
      };
      return proveedor.request({ method: "eth_sendTransaction", params: [tx] });
    }).then(function (hash) {
      hash = String(hash || "");
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new Error("hash");
      aportado = true;
      evento("minuto-pagado");             // ahora significa "aportó"; sin monto ni hash
      decir(el.estadoAporte, "");
      el.transaccion.textContent = "";
      if (red.explorador) {
        var a = document.createElement("a");
        a.href = String(red.explorador).replace(/\/+$/, "") + "/tx/" + hash;
        a.rel = "noopener"; a.target = "_blank"; a.textContent = T.verTx;
        el.transaccion.appendChild(a);
      }
      el.gracias.hidden = false;
    }).catch(function (e) {
      var c = codigoError(e);
      decir(el.estadoAporte, c === 4001 || c === "ACTION_REJECTED" ? T.cancelado : c === -32002 ? T.pendienteMM : T.falloMM, true);
    }).then(function () {
      ocupado = false;
      pintarBotonAporte();
    });
  });

  // ---------- arranque ----------

  llenarZonas();
  var hoy = new Date();
  el.fecha.min = hoy.getFullYear() + "-" + dos(hoy.getMonth() + 1) + "-" + dos(hoy.getDate());
  pintarVista();

  pedirJSON("/api/minuto/config").then(function (r) {
    if (r.status !== 200 || !r.datos || typeof r.datos !== "object") return;
    config = r.datos;
    if (typeof config.dedicatoriaMax === "number" && config.dedicatoriaMax > 0) {
      MAX = config.dedicatoriaMax;
      el.dedicatoria.maxLength = MAX;
      pintarVista();
    }
    aporte = aporteValido(config.aporte);
    pintarAporte();
  }, function () {});

  // ¿Se pidió un minuto en esta pestaña? (una recarga no pierde la llave)
  var guardada = leerSesion();
  if (guardada && guardada.pedido && guardada.pedido.id) {
    pedido = guardada.pedido;
    pintarPedido();
  } else {
    mostrarPaso(1);
  }
  setTimeout(function () { if (!el.aporte.hidden) pintarBilletera(); }, 400);   // da tiempo a que aparezca la billetera
})();
