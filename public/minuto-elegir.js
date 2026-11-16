// Elegir y comprar un minuto de "El minuto" (/minuto/elegir/, /en/minute/choose/).
// Marcado y estilos: src/pages/minuto/elegir.astro.
//
// Pasos, sin recargar:
//   1. fecha, hora y zona -> GET /api/minuto/precio (con espera entre teclas)
//   2. dedicatoria (máx. 80) con vista previa y "Leí los términos"
//   3. POST /api/minuto/reservar -> resumen antes de pagar y cuenta regresiva de la reserva
//   4. MetaMask: conectar, pasar a la red, ver saldo y pagar con una transferencia de USDC
//      (o, en modo simulado, "simular el pago" sin billetera)
//   5. POST /api/minuto/pagar hasta que el servidor confirme -> página, certificado y llave
//
// Reglas: nunca se piden claves privadas ni frases semilla; nunca se firman mensajes ni se pide
// "approve": lo único que se manda a la billetera es transfer(direccion, monto) del contrato USDC.
// La reserva vive en sessionStorage para sobrevivir una recarga. Los eventos de medición no
// llevan ningún dato de la persona (ni dirección, ni hash, ni el minuto).
(function () {
  "use strict";
  var raiz = document.getElementById("el");
  if (!raiz) return;

  var lang = document.documentElement.lang === "en" ? "en" : "es";
  var CONTACTO = "https://github.com/salehoyrevista/salehoy/issues";
  var CLAVE = "minuto-elegir";               // sessionStorage: la compra en curso
  var RPC = { 8453: "https://mainnet.base.org", 84532: "https://sepolia.base.org" };

  var T = {
    es: {
      modo: {
        simulado: "Modo prueba: todavía no se cobra. Podés recorrer todo el flujo; el minuto queda marcado como prueba y se borra al abrir las ventas.",
        testnet: "Modo prueba en Base Sepolia: se paga con USDC de prueba, sin valor."
      },
      consultando: "consultando…",
      precio: "Precio",
      especial: "minuto especial: ",
      enUtc: "En UTC: ",
      ambigua: "Esa hora pasa dos veces en esa zona por el cambio de horario: se toma la primera.",
      disponible: "Está libre.",
      motivo: {
        vendido: "Ese minuto ya es de alguien. Probá con otro.",
        reservado: "Alguien está reservando ese minuto ahora. Probá con otro, o en unos minutos.",
        pasado: "Ese minuto ya pasó. Solo se regalan minutos por venir.",
        lejano: "Todavía no se venden minutos tan lejanos.",
        ocupado: "Ese minuto ya no está disponible. Probá con otro."
      },
      error422: {
        "hora-inexistente": "Esa hora no existe en esa zona: el reloj la saltea por el cambio de horario.",
        zona: "No se reconoce esa zona horaria.",
        formato: "Revisá la fecha y la hora."
      },
      demasiadas: "Demasiadas consultas seguidas. Esperá un momento y probá de nuevo.",
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
      reservando: "reservando…",
      vista: "Este minuto es de alguien.",
      vistaVacia: "tu dedicatoria",
      horaDe: "hora de",
      comision: function (red) { return "en " + red + " normalmente menos de 0,01 USD, que se paga en ETH: hace falta un poco de ETH en " + red + " en la misma billetera."; },
      comisionSimulada: "no hay: en modo prueba el pago se simula.",
      destinoSimulado: "todavía no hay: en modo prueba el pago se simula.",
      vencida: "La reserva venció y el minuto quedó libre otra vez. Podés volver a elegirlo.",
      conectando: "Abriendo MetaMask…",
      red: function (red) { return "Pidiendo a MetaMask que pase a " + red + "…"; },
      conectada: function (cuenta, saldo) { return "billetera " + cuenta + (saldo ? " · saldo " + saldo + " USDC" : ""); },
      sinSaldo: function (red) { return "No te alcanza el saldo de USDC en " + red + " en esta billetera para este pago."; },
      sinEth: function (red) { return "Esta billetera no tiene ETH en " + red + " para pagar la comisión de red."; },
      pagarCon: function (monto) { return "pagar " + monto + " USDC"; },
      confirmar: "Confirmá la transferencia en MetaMask.",
      cancelado: "Cancelaste en MetaMask. No se pagó nada.",
      pendienteMM: "MetaMask ya tiene un pedido abierto: abrilo para seguir.",
      falloMM: "MetaMask no pudo mandar el pago. Si en MetaMask no figura como enviado, no se cobró nada.",
      redRechazada: "Para pagar hace falta estar en la red correcta. No se pagó nada.",
      viejo: "Este navegador es demasiado viejo para pagar desde acá. Probá con uno actualizado.",
      pocoTiempo: "Quedan muy pocos segundos de reserva para pagar a tiempo. Elegí el minuto otra vez.",
      verificando: "Verificando el pago en la red…",
      simulando: "Simulando el pago…",
      confirmaciones: function (c, n) { return "Esperando confirmaciones de la red: " + c + " de " + n + "."; },
      reintentando: "Sin respuesta del sitio. Reintentando…",
      verTx: "ver la transacción ↗",
      llevarTx: " Llevá el enlace de la transacción.",
      contacto: "escribir en el repositorio ↗",
      e409: {
        "hash-usado": "Esa transacción ya se usó para otro minuto.",
        "reserva-vencida": "El pago llegó pero la reserva ya había vencido. Se reembolsa a mano: escribí con el enlace de la transacción.",
        "reserva-vencida-sim": "La reserva venció antes de simular el pago. Elegí el minuto otra vez.",
        "ya-vendido": "Ese minuto se vendió mientras tanto. Si pagaste, se reembolsa a mano: escribí con el enlace de la transacción."
      },
      e422: {
        destino: "La transacción no fue a la dirección de la obra.",
        token: "La transacción no es de USDC en la red de la obra.",
        monto: "El monto no es el exacto de la reserva.",
        fallida: "La transacción falló en la red: no se movió el dinero.",
        "no-encontrada": "La transacción no aparece en la red.",
        anterior: "Esa transacción es anterior a la reserva."
      },
      siPagaste: " Si se movió dinero, escribí con el enlace de la transacción.",
      armando: "armando el certificado…",
      certListo: "certificado listo",
      certFallo: "no se pudo armar el certificado",
      copiado: "copiado",
      copiaManual: "seleccioná el enlace y copialo",
      sinSaldoLeido: "No se pudo leer el saldo. Podés pagar igual: si no alcanza, MetaMask avisa."
    },
    en: {
      modo: {
        simulado: "Test mode: nothing is charged yet. You can go through the whole flow; the minute is marked as a test and deleted when sales open.",
        testnet: "Test mode on Base Sepolia: you pay with test USDC, worth nothing."
      },
      consultando: "checking…",
      precio: "Price",
      especial: "special minute: ",
      enUtc: "In UTC: ",
      ambigua: "That time happens twice in that zone because of the clock change: the first one is taken.",
      disponible: "It is free.",
      motivo: {
        vendido: "That minute already belongs to someone. Try another.",
        reservado: "Someone is reserving that minute right now. Try another, or in a few minutes.",
        pasado: "That minute has passed. Only minutes still to come can be given.",
        lejano: "Minutes that far ahead are not on sale yet.",
        ocupado: "That minute is no longer available. Try another."
      },
      error422: {
        "hora-inexistente": "That time does not exist in that zone: the clock skips it because of the clock change.",
        zona: "That time zone is not recognised.",
        formato: "Check the date and time."
      },
      demasiadas: "Too many requests in a row. Wait a moment and try again.",
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
      reservando: "reserving…",
      vista: "This minute belongs to someone.",
      vistaVacia: "your dedication",
      horaDe: "time in",
      comision: function (red) { return "on " + red + " usually under 0.01 USD, paid in ETH: you need a little ETH on " + red + " in the same wallet."; },
      comisionSimulada: "none: in test mode the payment is simulated.",
      destinoSimulado: "none yet: in test mode the payment is simulated.",
      vencida: "The reservation expired and the minute is free again. You can choose it again.",
      conectando: "Opening MetaMask…",
      red: function (red) { return "Asking MetaMask to switch to " + red + "…"; },
      conectada: function (cuenta, saldo) { return "wallet " + cuenta + (saldo ? " · balance " + saldo + " USDC" : ""); },
      sinSaldo: function (red) { return "This wallet does not have enough USDC on " + red + " for this payment."; },
      sinEth: function (red) { return "This wallet has no ETH on " + red + " to pay the network fee."; },
      pagarCon: function (monto) { return "pay " + monto + " USDC"; },
      confirmar: "Confirm the transfer in MetaMask.",
      cancelado: "You cancelled in MetaMask. Nothing was paid.",
      pendienteMM: "MetaMask already has a request open: open it to continue.",
      falloMM: "MetaMask could not send the payment. If MetaMask does not show it as sent, nothing was charged.",
      redRechazada: "To pay you need to be on the right network. Nothing was paid.",
      viejo: "This browser is too old to pay from here. Try an up-to-date one.",
      pocoTiempo: "Too few seconds are left on the reservation to pay in time. Choose the minute again.",
      verificando: "Checking the payment on the network…",
      simulando: "Simulating the payment…",
      confirmaciones: function (c, n) { return "Waiting for network confirmations: " + c + " of " + n + "."; },
      reintentando: "No answer from the site. Retrying…",
      verTx: "see the transaction ↗",
      llevarTx: " Bring the transaction link.",
      contacto: "write in the repository ↗",
      e409: {
        "hash-usado": "That transaction was already used for another minute.",
        "reserva-vencida": "The payment arrived but the reservation had already expired. It is refunded by hand: write with the transaction link.",
        "reserva-vencida-sim": "The reservation expired before the payment was simulated. Choose the minute again.",
        "ya-vendido": "That minute was sold in the meantime. If you paid, it is refunded by hand: write with the transaction link."
      },
      e422: {
        destino: "The transaction did not go to the work's address.",
        token: "The transaction is not USDC on the work's network.",
        monto: "The amount is not the reservation's exact amount.",
        fallida: "The transaction failed on the network: no money moved.",
        "no-encontrada": "The transaction does not appear on the network.",
        anterior: "That transaction is older than the reservation."
      },
      siPagaste: " If money moved, write with the transaction link.",
      armando: "making the certificate…",
      certListo: "certificate ready",
      certFallo: "the certificate could not be made",
      copiado: "copied",
      copiaManual: "select the link and copy it",
      sinSaldoLeido: "The balance could not be read. You can still pay: if it is not enough, MetaMask will tell you."
    }
  }[lang];

  function $(id) { return document.getElementById(id); }
  var el = {
    modo: $("elModo"),
    pasos: [null, $("paso1"), $("paso2"), $("paso3"), $("paso4"), $("paso5")],
    fecha: $("fecha"), hora: $("hora"), zona: $("zona"), zonaTexto: $("zonaTexto"),
    precio: $("precio"), seguir1: $("seguir1"),
    elegido2: $("elegido2"), dedicatoria: $("dedicatoria"), contador: $("contador"),
    vistaReloj: $("vistaReloj"), vistaDed: $("vistaDed"), acepto: $("acepto"), error2: $("error2"),
    seguir2: $("seguir2"), volver2: $("volver2"),
    vence: $("vence"), rMinuto: $("rMinuto"), rDedicatoria: $("rDedicatoria"), rRed: $("rRed"),
    rMonto: $("rMonto"), rComision: $("rComision"), rDestino: $("rDestino"), notaCentesimos: $("notaCentesimos"),
    sinBilletera: $("sinBilletera"), conBilletera: $("conBilletera"), simulado: $("simulado"),
    conectar: $("conectar"), cuenta: $("cuenta"), pagar: $("pagar"), simular: $("simular"),
    estado4: $("estado4"), otroMinuto: $("otroMinuto"),
    estado5: $("estado5"), transaccion: $("transaccion"), vendido: $("vendido"), elegido5: $("elegido5"),
    enlacePagina: $("enlacePagina"), certificado: $("certificado"), avisoCert: $("avisoCert"),
    bloqueLlave: $("bloqueLlave"), llaveEnlace: $("llaveEnlace"), copiarLlave: $("copiarLlave"), avisoLlave: $("avisoLlave"),
    otroRegalo: $("otroRegalo")
  };
  var RUTA_TERMINOS = raiz.getAttribute("data-terminos") || "/minuto/terminos/";
  var RUTA_INTERRUPTOR = raiz.getAttribute("data-interruptor") || "/interruptor/";

  // ---------- utilidades ----------

  var desfase = 0;      // reloj del servidor menos el del dispositivo
  function ahora() { return Date.now() + desfase; }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function evento(nombre) {
    try { if (window.SaleHoyVisita && typeof window.SaleHoyVisita.evento === "function") window.SaleHoyVisita.evento(nombre); } catch (e) {}
  }
  function leerSesion() {
    try { var v = sessionStorage.getItem(CLAVE); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function guardarSesion() {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(compra)); } catch (e) {}
  }
  function borrarSesion() {
    try { sessionStorage.removeItem(CLAVE); } catch (e) {}
  }
  function decir(nodo, texto, mal) {
    nodo.textContent = texto || "";
    if (nodo.classList) nodo.classList.toggle("mal", !!mal);
  }
  function largoTexto(s) { return Array.from ? Array.from(s).length : s.length; }
  function idUrl(id) { return String(id || "").replace(":", "-"); }
  function rutaPagina(id) { return (lang === "en" ? "/en/minute/m/" : "/minuto/m/") + idUrl(id) + "/"; }
  function cuentaCorta(c) { return c ? c.slice(0, 6) + "…" + c.slice(-4) : ""; }

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

  // Un enlace en un párrafo, armado con nodos (nunca innerHTML).
  function conEnlace(nodo, texto, href, rotulo) {
    nodo.textContent = texto + " ";
    var a = document.createElement("a");
    a.href = href; a.rel = "noopener"; a.target = "_blank"; a.textContent = rotulo;
    nodo.appendChild(a);
  }

  function formatoUsd(n) {
    try {
      return new Intl.NumberFormat(lang === "en" ? "en-US" : "es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n) + " USD";
    } catch (e) { return n + " USD"; }
  }

  // "jueves, 24 de diciembre de 2026, 00:33" en la zona elegida
  function minutoLegible(instante, zona) {
    try {
      var d = new Date(instante);
      var f = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-AR", { timeZone: zona, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
      var h = new Intl.DateTimeFormat("en-GB", { timeZone: zona, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
      return f + ", " + h + " · " + T.horaDe + " " + String(zona).replace(/_/g, " ");
    } catch (e) { return ""; }
  }

  // ---------- estado ----------

  var config = null;     // GET /api/minuto/config
  var precio = null;     // última respuesta de /precio válida para lo que está en los campos
  // compra: { paso, entrada: { fecha, hora, zona, dedicatoria }, reserva: {…respuesta de /reservar}, hash?, simulado?, vendido? }
  var compra = null;

  function mostrarPaso(n) {
    // del 3 en adelante, el resumen (3) queda a la vista arriba del pago (4)
    for (var i = 1; i <= 5; i++) {
      var ver = i === n || (n === 4 && i === 3);
      el.pasos[i].hidden = !ver;
    }
    var destino = el.pasos[n].querySelector("h2");
    if (destino && mostrarPaso.yaUsado) { destino.setAttribute("tabindex", "-1"); destino.focus({ preventScroll: true }); el.pasos[n === 4 ? 3 : n].scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" }); }
    mostrarPaso.yaUsado = true;
  }
  function reducido() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function modoActual() {
    if (compra && compra.reserva && compra.reserva.pago && compra.reserva.pago.modo) return compra.reserva.pago.modo;
    return config && config.modo ? config.modo : null;
  }
  function redActual() {
    var p = compra && compra.reserva && compra.reserva.pago;
    if (p && p.red && typeof p.red === "object" && p.red.chainIdHex) return p.red;
    return config && config.red ? config.red : null;
  }
  function direccionActual() {
    var p = compra && compra.reserva && compra.reserva.pago;
    if (p && typeof p.direccion === "string" && p.direccion) return p.direccion;
    return config && config.direccion ? config.direccion : "";
  }
  function pintarModo() {
    var m = modoActual();
    var texto = m && T.modo[m];
    el.modo.textContent = texto || "";
    el.modo.hidden = !texto;
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

  var esperaPrecio = null, pedidoPrecio = 0;
  var notaPrecio = null;      // un aviso que tiene que quedar arriba del precio (p. ej. "la reserva venció")
  function ponerEntrada(e) {
    el.fecha.value = e.fecha || "";
    el.hora.value = e.hora || "";
    if (e.zona) {
      if (el.zona.hidden) el.zonaTexto.value = e.zona;
      else {
        for (var i = 0; i < el.zona.options.length; i++) if (el.zona.options[i].value === e.zona) { el.zona.selectedIndex = i; break; }
      }
    }
  }
  function alCambiarMinuto(ev) {
    if (ev) notaPrecio = null;      // la persona cambió algo: el aviso viejo ya no corre
    precio = null;
    el.seguir1.disabled = true;
    clearTimeout(esperaPrecio);
    var e = entradaActual();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.fecha) || !/^\d{2}:\d{2}$/.test(e.hora) || !e.zona) { el.precio.textContent = ""; return; }
    esperaPrecio = setTimeout(consultarPrecio, 400);
  }

  function consultarPrecio() {
    var e = entradaActual();
    var n = ++pedidoPrecio;
    el.precio.textContent = "";
    var p = document.createElement("p"); p.className = "mono"; p.textContent = T.consultando; el.precio.appendChild(p);
    var url = "/api/minuto/precio?fecha=" + encodeURIComponent(e.fecha) + "&hora=" + encodeURIComponent(e.hora) + "&zona=" + encodeURIComponent(e.zona);
    pedirJSON(url).then(function (r) {
      if (n !== pedidoPrecio) return;          // llegó tarde: ya cambió el pedido
      var d = r.datos;
      el.precio.textContent = "";
      if (notaPrecio) { renglon(notaPrecio, true); notaPrecio = null; }
      if (r.status === 200 && d && typeof d.precioUsd === "number") {
        pintarPrecio(d);
        if (d.disponible) { precio = { entrada: e, datos: d }; el.seguir1.disabled = false; }
        return;
      }
      if (r.status === 422) return renglon(T.error422[d && d.error] || T.error422.formato, true);
      if (r.status === 429) return renglon(T.demasiadas, true);
      renglon(T.falla, true);
    }, function () {
      if (n !== pedidoPrecio) return;
      el.precio.textContent = "";
      renglon(T.sinRed, true);
    });
  }
  function renglon(texto, mal, clase) {
    var p = document.createElement("p");
    p.className = clase || (mal ? "el-error" : "");
    p.textContent = texto;
    el.precio.appendChild(p);
    return p;
  }
  function pintarPrecio(d) {
    var p = renglon("", false, "el-cifra");
    p.textContent = formatoUsd(d.precioUsd);
    if (d.especial) renglon(T.especial + d.especial, false, "mono");
    if (d.utc) renglon(T.enUtc + d.utc, false, "mono");
    if (d.ambigua) renglon(T.ambigua, false, "mono");
    if (d.disponible) renglon(T.disponible, false, "mono");
    else renglon(T.motivo[d.motivo] || T.motivo.ocupado, true);
  }

  el.fecha.addEventListener("input", alCambiarMinuto);
  el.hora.addEventListener("input", alCambiarMinuto);
  el.zona.addEventListener("change", alCambiarMinuto);
  el.zonaTexto.addEventListener("input", alCambiarMinuto);
  el.fecha.addEventListener("change", alCambiarMinuto);
  el.hora.addEventListener("change", alCambiarMinuto);

  el.seguir1.addEventListener("click", function () {
    if (!precio) return;
    el.elegido2.textContent = minutoLegible(precio.datos.instante, precio.entrada.zona) + " · " + formatoUsd(precio.datos.precioUsd);
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
    if (precio) {
      try {
        el.vistaReloj.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: precio.entrada.zona, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(precio.datos.instante)) + ":00";
      } catch (e) { el.vistaReloj.textContent = precio.entrada.hora + ":00"; }
    }
    el.vistaDed.textContent = texto || T.vistaVacia;      // textContent: nunca HTML
    el.vistaDed.classList.toggle("vacia", !texto);
  }
  el.dedicatoria.addEventListener("input", function () { pintarVista(); el.error2.textContent = ""; });
  el.acepto.addEventListener("change", function () { el.error2.textContent = ""; });
  el.volver2.addEventListener("click", function () { mostrarPaso(1); });

  var reservando = false;
  el.seguir2.addEventListener("click", function () {
    if (reservando || !precio) return;
    var dedicatoria = el.dedicatoria.value.trim();
    if (!dedicatoria) { el.error2.textContent = T.dedicatoria.vacia; el.dedicatoria.focus(); return; }
    if (largoTexto(dedicatoria) > MAX) { el.error2.textContent = T.dedicatoria.larga; el.dedicatoria.focus(); return; }
    if (/(https?:\/\/|www\.)/i.test(dedicatoria)) { el.error2.textContent = T.dedicatoria.enlace; el.dedicatoria.focus(); return; }
    if (!el.acepto.checked) { el.error2.textContent = T.faltaAcepto; el.acepto.focus(); return; }

    reservando = true;
    el.seguir2.disabled = true;
    el.error2.textContent = "";
    var textoBoton = el.seguir2.textContent;
    el.seguir2.textContent = T.reservando;
    var e = precio.entrada;
    postJSON("/api/minuto/reservar", { fecha: e.fecha, hora: e.hora, zona: e.zona, dedicatoria: dedicatoria, lang: lang })
      .then(function (r) {
        var d = r.datos || {};
        if (r.status === 200 && d.reserva && d.montoUnidades) {
          compra = { paso: 4, entrada: { fecha: e.fecha, hora: e.hora, zona: e.zona, dedicatoria: dedicatoria }, reserva: d };
          guardarSesion();
          evento("minuto-compra-inicio");
          entrarPago();
          return;
        }
        if (r.status === 409) {
          mostrarPaso(1);
          el.precio.textContent = "";
          renglon(T.motivo[d.motivo] || T.motivo.ocupado, true);
          precio = null; el.seguir1.disabled = true;
          return;
        }
        if (r.status === 422 && d.error === "dedicatoria") { el.error2.textContent = T.dedicatoria[d.detalle] || T.dedicatoria.insulto; el.dedicatoria.focus(); return; }
        if (r.status === 422) { el.error2.textContent = T.error422[d.error] || T.error422.formato; return; }
        if (r.status === 429) { el.error2.textContent = T.demasiadas; return; }
        el.error2.textContent = T.falla;
      }, function () { el.error2.textContent = T.sinRed; })
      .then(function () {
        reservando = false;
        el.seguir2.disabled = false;
        el.seguir2.textContent = textoBoton;
      });
  });

  // ---------- paso 3: resumen antes de pagar ----------

  var relojReserva = null;
  function pintarResumen() {
    var res = compra.reserva, red = redActual(), m = modoActual();
    var zona = res.zona || compra.entrada.zona;
    el.rMinuto.textContent = minutoLegible(res.instante, zona) || compra.entrada.fecha + " " + compra.entrada.hora;
    el.rDedicatoria.textContent = compra.entrada.dedicatoria;
    var nombreRed = red && red.nombre ? red.nombre : "Base";
    el.rRed.textContent = nombreRed + (red && red.chainId ? " (chain " + red.chainId + ")" : "");
    el.rMonto.textContent = res.montoUsdc + " USDC";
    if (m === "simulado") {
      el.rComision.textContent = T.comisionSimulada;
      el.rDestino.textContent = T.destinoSimulado;
    } else {
      el.rComision.textContent = T.comision(nombreRed);
      el.rDestino.textContent = direccionActual();
    }
    pintarModo();
  }

  function tictacReserva() {
    clearTimeout(relojReserva);
    if (!compra || !compra.reserva || compra.hash || compra.vendido) return;
    var falta = compra.reserva.vence - ahora();
    if (falta <= 0) { vencer(); return; }
    var s = Math.ceil(falta / 1000);
    el.vence.textContent = dos(Math.floor(s / 60)) + ":" + dos(s % 60);
    el.vence.parentNode.classList.toggle("poco", s <= 120);
    relojReserva = setTimeout(tictacReserva, 1000 - (ahora() % 1000) + 15);
  }

  function vencer() {
    if (compra && (compra.hash || compra.vendido)) return;
    var entrada = compra && compra.entrada;
    compra = null;
    borrarSesion();
    ocupado = false;
    mostrarPaso(1);
    if (entrada) { ponerEntrada(entrada); el.dedicatoria.value = entrada.dedicatoria; }
    el.precio.textContent = "";
    renglon(T.vencida, true);
    notaPrecio = T.vencida;
    alCambiarMinuto();
  }

  el.otroMinuto.addEventListener("click", function () {
    if (ocupado || (compra && compra.hash)) return;
    // La reserva en el servidor se libera sola cuando vence.
    var entrada = compra && compra.entrada;
    compra = null;
    borrarSesion();
    clearTimeout(relojReserva);
    if (entrada) el.dedicatoria.value = entrada.dedicatoria;
    el.precio.textContent = "";
    precio = null; el.seguir1.disabled = true;
    mostrarPaso(1);
    alCambiarMinuto();
  });

  // ---------- paso 4: pagar ----------

  var proveedor = null, cuenta = null, ocupado = false;

  // Billeteras: EIP-6963 (se prefiere MetaMask) y, si no, window.ethereum.
  window.addEventListener("eip6963:announceProvider", function (ev) {
    var det = ev && ev.detail;
    if (!det || !det.provider) return;
    var esMetaMask = det.info && det.info.rdns === "io.metamask";
    if (!proveedor || esMetaMask) { proveedor = det.provider; escucharProveedor(); }
    if (compra && !compra.hash && !compra.vendido) pintarBilletera();
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

  function entrarPago() {
    pintarResumen();
    mostrarPaso(4);
    tictacReserva();
    pintarBilletera();
  }

  function pintarBilletera() {
    var m = modoActual();
    el.simulado.hidden = m !== "simulado";
    if (m === "simulado") { el.sinBilletera.hidden = true; el.conBilletera.hidden = true; return; }
    var hay = !!buscarProveedor();
    el.sinBilletera.hidden = hay;
    el.conBilletera.hidden = !hay;
    el.pagar.hidden = !cuenta;
    el.pagar.textContent = T.pagarCon(compra.reserva.montoUsdc);
    if (!cuenta) el.cuenta.textContent = "";
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
      decir(el.estado4, T.red(red.nombre));
      return proveedor.request({ method: "wallet_switchEthereumChain", params: [{ chainId: red.chainIdHex }] }).catch(function (e) {
        if (codigoError(e) !== 4902) throw e;
        return proveedor.request({ method: "wallet_addEthereumChain", params: [{
          chainId: red.chainIdHex,
          chainName: red.chainId === 84532 ? "Base Sepolia" : "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [RPC[red.chainId] || RPC[8453]],
          blockExplorerUrls: red.explorador ? [red.explorador] : []
        }] });
      });
    });
  }

  // Saldo de USDC (balanceOf) y de ETH (para la comisión). Solo lectura.
  var saldoOk = false;
  function revisarBilletera() {
    var red = redActual();
    if (!red || !cuenta || !proveedor) return Promise.resolve();
    return pasarARed(red).then(function () {
      var datos = "0x70a08231" + relleno64(cuenta.slice(2).toLowerCase());
      return Promise.all([
        proveedor.request({ method: "eth_call", params: [{ to: red.usdc, data: datos }, "latest"] }),
        proveedor.request({ method: "eth_getBalance", params: [cuenta, "latest"] }).catch(function () { return null; })
      ]);
    }).then(function (r) {
      if (!r) return;
      var usdc = BigInt(r[0] && r[0] !== "0x" ? r[0] : "0x0");
      var necesario = BigInt(compra.reserva.montoUnidades);
      saldoOk = usdc >= necesario;
      el.cuenta.textContent = T.conectada(cuentaCorta(cuenta), aUsdc(usdc));
      el.pagar.hidden = false;
      el.pagar.disabled = !saldoOk;
      if (!saldoOk) decir(el.estado4, T.sinSaldo(red.nombre), true);
      else if (r[1] !== null && BigInt(r[1] || "0x0") === BigInt(0)) decir(el.estado4, T.sinEth(red.nombre), true);
      else decir(el.estado4, "");
    }).catch(function (e) {
      var c = codigoError(e);
      if (c === 4001) { decir(el.estado4, T.redRechazada, true); return; }
      if (c === -32002) { decir(el.estado4, T.pendienteMM, true); return; }
      // No se pudo leer el saldo: no se bloquea el pago, MetaMask avisa si no alcanza.
      saldoOk = true;
      el.cuenta.textContent = T.conectada(cuentaCorta(cuenta), "");
      el.pagar.hidden = false;
      el.pagar.disabled = false;
      decir(el.estado4, T.sinSaldoLeido);
    });
  }

  el.conectar.addEventListener("click", function () {
    if (ocupado || !buscarProveedor()) return;
    if (typeof BigInt !== "function") { decir(el.estado4, T.viejo, true); return; }
    ocupado = true;
    el.conectar.disabled = true;
    evento("minuto-metamask");
    decir(el.estado4, T.conectando);
    proveedor.request({ method: "eth_requestAccounts" }).then(function (cuentas) {
      cuenta = cuentas && cuentas[0] ? String(cuentas[0]) : null;
      if (!cuenta) throw { code: 4001 };
      return revisarBilletera();
    }).catch(function (e) {
      var c = codigoError(e);
      decir(el.estado4, c === 4001 ? T.cancelado : c === -32002 ? T.pendienteMM : T.falloMM, true);
    }).then(function () {
      ocupado = false;
      el.conectar.disabled = false;
      pintarBilletera();
      if (cuenta) el.pagar.hidden = false;
    });
  });

  el.pagar.addEventListener("click", function () {
    if (ocupado || !proveedor || !cuenta || !compra || compra.hash) return;
    if (typeof BigInt !== "function") { decir(el.estado4, T.viejo, true); return; }
    var red = redActual(), destino = direccionActual(), res = compra.reserva;
    if (!red || !/^0x[0-9a-fA-F]{40}$/.test(destino) || !/^\d+$/.test(String(res.montoUnidades))) { decir(el.estado4, T.falla, true); return; }
    if (res.vence - ahora() < 30000) { decir(el.estado4, T.pocoTiempo, true); return; }
    ocupado = true;
    el.pagar.disabled = true;
    pasarARed(red).then(function () {
      decir(el.estado4, T.confirmar);
      // transfer(address,uint256) del contrato USDC: lo único que se le pide a la billetera.
      var tx = {
        from: cuenta,
        to: red.usdc,
        value: "0x0",
        data: "0xa9059cbb" + relleno64(destino.slice(2).toLowerCase()) + relleno64(BigInt(res.montoUnidades).toString(16))
      };
      return proveedor.request({ method: "eth_sendTransaction", params: [tx] });
    }).then(function (hash) {
      hash = String(hash || "");
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new Error("hash");
      compra.hash = hash;
      compra.paso = 5;
      guardarSesion();
      decir(el.estado4, "");
      verificar();
    }).catch(function (e) {
      var c = codigoError(e);
      decir(el.estado4, c === 4001 || c === "ACTION_REJECTED" ? T.cancelado : c === -32002 ? T.pendienteMM : T.falloMM, true);
    }).then(function () {
      ocupado = false;
      el.pagar.disabled = !saldoOk;
    });
  });

  el.simular.addEventListener("click", function () {
    if (ocupado || !compra || compra.hash) return;
    compra.simulado = true;
    compra.paso = 5;
    guardarSesion();
    verificar();
  });

  // ---------- paso 5: verificar y entregar ----------

  var intentosNoEncontrada = 0, intentosRed = 0, esperaVerificar = null;

  function pintarTransaccion() {
    el.transaccion.textContent = "";
    var red = redActual();
    if (compra && compra.hash && red && red.explorador) {
      var a = document.createElement("a");
      a.href = red.explorador.replace(/\/+$/, "") + "/tx/" + compra.hash;
      a.rel = "noopener"; a.target = "_blank"; a.textContent = T.verTx;
      el.transaccion.appendChild(a);
    }
  }

  function fallar(texto, contactar) {
    clearTimeout(esperaVerificar);
    decir(el.estado5, texto, true);
    if (contactar) {
      var p = document.createElement("span");
      el.estado5.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = CONTACTO; a.rel = "noopener"; a.target = "_blank"; a.textContent = T.contacto;
      p.appendChild(a);
      el.estado5.appendChild(p);
    }
    // La compra fallida ya no sirve: se olvida (el hash queda en el enlace de la transacción, a la vista).
    borrarSesion();
  }

  function verificar() {
    clearTimeout(esperaVerificar);
    clearTimeout(relojReserva);
    mostrarPaso(5);
    el.vendido.hidden = true;
    pintarTransaccion();
    var simulado = !!compra.simulado;
    if (!el.estado5.textContent) decir(el.estado5, simulado ? T.simulando : T.verificando);
    var cuerpo = simulado ? { reserva: compra.reserva.reserva, simulado: true } : { reserva: compra.reserva.reserva, hash: compra.hash };
    postJSON("/api/minuto/pagar", cuerpo).then(function (r) {
      intentosRed = 0;
      var d = r.datos || {};
      if (r.status === 200 && d.estado === "vendido") return entregar(d);
      if (r.status === 202) {
        if (typeof d.confirmaciones === "number" && typeof d.necesarias === "number") decir(el.estado5, T.confirmaciones(d.confirmaciones, d.necesarias));
        else decir(el.estado5, T.verificando);
        esperaVerificar = setTimeout(verificar, 4000);
        return;
      }
      if (r.status === 409) {
        if (d.error === "reserva-vencida") return fallar(simulado ? T.e409["reserva-vencida-sim"] : T.e409["reserva-vencida"], !simulado);
        if (d.error === "ya-vendido") return fallar(simulado ? T.motivo.vendido : T.e409["ya-vendido"], !simulado);
        if (d.error === "hash-usado") return fallar(T.e409["hash-usado"], true);
        return fallar(T.falla, !simulado);
      }
      if (r.status === 422 && d.error === "pago-invalido") {
        // Recién mandada, la transacción puede tardar en aparecer: se espera un poco antes de rendirse.
        if (d.detalle === "no-encontrada" && intentosNoEncontrada < 20) {
          intentosNoEncontrada++;
          decir(el.estado5, T.verificando);
          esperaVerificar = setTimeout(verificar, 4000);
          return;
        }
        var conDinero = d.detalle === "destino" || d.detalle === "token" || d.detalle === "monto";
        return fallar((T.e422[d.detalle] || T.falla) + (conDinero ? T.siPagaste : ""), conDinero);
      }
      if (r.status === 429) { esperaVerificar = setTimeout(verificar, 8000); return; }
      // 5xx u otra cosa: se reintenta sin perder el hash.
      decir(el.estado5, T.reintentando);
      esperaVerificar = setTimeout(verificar, 6000);
    }, function () {
      intentosRed++;
      decir(el.estado5, T.reintentando);
      esperaVerificar = setTimeout(verificar, Math.min(30000, 4000 * intentosRed));
    });
  }

  function entregar(d) {
    var id = d.id || compra.reserva.id;
    if (d.llave) {
      try { localStorage.setItem("minuto-llave:" + id, String(d.llave)); } catch (e) {}
    }
    compra.vendido = { id: id, llave: d.llave ? String(d.llave) : null, instante: compra.reserva.instante, zona: compra.reserva.zona || compra.entrada.zona, prueba: modoActual() !== "real" };
    compra.paso = 5;
    guardarSesion();       // para que una recarga en esta pestaña no pierda la llave
    evento("minuto-pagado");
    pintarVendido();
  }

  function pintarVendido() {
    var v = compra.vendido;
    mostrarPaso(5);
    decir(el.estado5, "");
    pintarTransaccion();
    el.vendido.hidden = false;
    el.elegido5.textContent = minutoLegible(v.instante, v.zona);
    el.enlacePagina.href = rutaPagina(v.id);
    if (v.llave) {
      el.llaveEnlace.value = location.origin + RUTA_INTERRUPTOR + "?llave=" + encodeURIComponent(v.llave);
      el.bloqueLlave.hidden = false;
    } else el.bloqueLlave.hidden = true;
  }

  el.certificado.addEventListener("click", function () {
    var v = compra && compra.vendido;
    if (!v) return;
    if (!window.MinutoCertificado) { el.avisoCert.textContent = T.certFallo; return; }
    el.avisoCert.textContent = T.armando;
    window.MinutoCertificado.entregar({
      id: v.id, instante: v.instante, zona: v.zona, estado: "pendiente", dedicatoria: null, prueba: v.prueba, lang: lang
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

  el.otroRegalo.addEventListener("click", function () {
    compra = null;
    borrarSesion();
    el.dedicatoria.value = "";
    el.acepto.checked = false;
    el.precio.textContent = "";
    precio = null; el.seguir1.disabled = true;
    mostrarPaso(1);
    alCambiarMinuto();
  });

  // ---------- arranque ----------

  llenarZonas();
  var hoy = new Date();
  el.fecha.min = hoy.getFullYear() + "-" + dos(hoy.getMonth() + 1) + "-" + dos(hoy.getDate());
  pintarVista();

  // Hora del servidor, para la cuenta regresiva de la reserva.
  var salida = Date.now();
  pedirJSON("/api/minuto/ahora").then(function (r) {
    if (r.status === 200 && r.datos && typeof r.datos.ahora === "number") {
      var llegada = Date.now();
      desfase = r.datos.ahora + (llegada - salida) / 2 - llegada;
      if (compra && compra.reserva && !compra.hash && !compra.vendido) tictacReserva();
    }
  }, function () {});

  pedirJSON("/api/minuto/config").then(function (r) {
    if (r.status === 200 && r.datos && r.datos.modo) {
      config = r.datos;
      if (typeof config.dedicatoriaMax === "number" && config.dedicatoriaMax > 0) {
        MAX = config.dedicatoriaMax;
        el.dedicatoria.maxLength = MAX;
        pintarVista();
      }
      pintarModo();
      if (compra && compra.reserva && !compra.hash && !compra.vendido) { pintarResumen(); pintarBilletera(); }
    }
  }, function () {});

  // ¿Había una compra en curso en esta pestaña?
  var guardada = leerSesion();
  if (guardada && guardada.reserva && guardada.entrada) {
    compra = guardada;
    ponerEntrada(compra.entrada);
    el.dedicatoria.value = compra.entrada.dedicatoria || "";
    if (compra.vendido) pintarVendido();
    else if (compra.hash || compra.simulado) verificar();
    else if (compra.reserva.vence > ahora()) {
      setTimeout(function () { if (compra && !compra.hash) pintarBilletera(); }, 400);   // da tiempo a que aparezca la billetera
      entrarPago();
    } else { compra = null; borrarSesion(); mostrarPaso(1); }
  } else {
    mostrarPaso(1);
  }
  pintarModo();
  setTimeout(function () { if (compra && compra.reserva && !compra.hash && !compra.vendido) pintarBilletera(); }, 400);
})();
