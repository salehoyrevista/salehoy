// Administración de "El minuto" (/admin/). Marcado: src/pages/admin.astro.
//
// Esta página no contiene secretos y no decide nada: todo se valida en el servidor con
// ADMIN_PASSWORD. La contraseña queda en sessionStorage (se borra al cerrar la pestaña) y viaja
// en la cabecera x-admin. Las dedicatorias se ponen siempre con textContent, nunca con innerHTML.
//
//   GET  /api/admin/minutos?estado=pendiente|todas
//   POST /api/admin/moderar        { id, decision: "aprobar" | "rechazar", nota? }
//   POST /api/admin/reembolso      { id, hash }
//   POST /api/admin/borrar-pruebas {}
(function () {
  "use strict";
  var CLAVE = "minuto-admin";
  function $(id) { return document.getElementById(id); }
  var entrar = $("entrar"), claveEl = $("clave"), estado = $("estado"), panel = $("panel"), lista = $("lista");
  var verPendientes = $("verPendientes"), verTodas = $("verTodas");
  if (!entrar || !lista) return;

  var clave = "";
  try { clave = sessionStorage.getItem(CLAVE) || ""; } catch (e) {}
  var filtro = "pendiente";
  var explorador = "";

  function decir(nodo, texto, mal) { nodo.textContent = texto || ""; nodo.classList.toggle("mal", !!mal); }

  var MENSAJES = {
    401: "Contraseña incorrecta.",
    429: "Demasiados intentos seguidos. Esperá un rato y probá de nuevo.",
    "sin-clave": "Falta cargar ADMIN_PASSWORD en Netlify.",
    red: "No se pudo hablar con el servidor. Revisá la conexión.",
    otro: "El servidor respondió con un error. Probá de nuevo."
  };
  function mensajeDe(r) {
    if (r.status === 401 || r.status === 403) return MENSAJES[401];
    if (r.status === 429) return MENSAJES[429];
    if (r.status === 503 && r.datos && r.datos.error === "sin-clave") return MENSAJES["sin-clave"];
    return MENSAJES.otro + " (" + r.status + ")";
  }

  function api(metodo, ruta, cuerpo) {
    var opciones = { method: metodo, cache: "no-store", headers: { accept: "application/json", "x-admin": clave } };
    if (cuerpo) { opciones.headers["content-type"] = "application/json"; opciones.body = JSON.stringify(cuerpo); }
    return fetch(ruta, opciones).then(function (r) {
      return r.text().then(function (t) {
        var d = null;
        try { d = t ? JSON.parse(t) : null; } catch (e) {}
        return { status: r.status, datos: d };
      });
    });
  }
  // Ante 401 o falta de clave, se vuelve al formulario.
  function sinPermiso(r) {
    if (r.status === 401 || r.status === 403 || (r.status === 503 && r.datos && r.datos.error === "sin-clave")) {
      clave = "";
      try { sessionStorage.removeItem(CLAVE); } catch (e) {}
      panel.hidden = true;
      entrar.hidden = false;
      decir(estado, mensajeDe(r), true);
      return true;
    }
    return false;
  }

  // ---------- fechas ----------

  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function zonaSegura(z) { try { new Intl.DateTimeFormat("en", { timeZone: z }); return z; } catch (e) { return "UTC"; } }
  function horaYFecha(instante, zona) {
    var z = zonaSegura(zona || "UTC"), d = new Date(instante);
    var h = new Intl.DateTimeFormat("en-GB", { timeZone: z, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
    var f = new Intl.DateTimeFormat("es-AR", { timeZone: z, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
    return h + " · " + f;
  }
  function utc(instante) { return new Date(instante).toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
  function cuanto(instante) {
    var ms = instante - Date.now(), pasado = ms < 0;
    var s = Math.abs(Math.round(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    var t = (d ? d + " d " : "") + dos(h) + " h " + dos(m) + " min";
    if (pasado) return ms > -60000 ? "está pasando ahora" : "pasó hace " + t;
    return "faltan " + t;
  }
  function instanteDe(m) {
    if (typeof m.instante === "number") return m.instante;
    var x = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})[-:](\d{2})Z$/.exec(String(m.id || ""));
    return x ? Date.UTC(+x[1], +x[2] - 1, +x[3], +x[4], +x[5]) : NaN;
  }

  // ---------- lista ----------

  function nodo(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }
  function enlaceTx(hash, rotulo) {
    if (!hash) return null;
    var a = nodo("a", null, rotulo || hash.slice(0, 10) + "…");
    a.href = (explorador || "https://basescan.org").replace(/\/+$/, "") + "/tx/" + encodeURIComponent(hash);
    a.rel = "noopener"; a.target = "_blank";
    return a;
  }

  function hashDeReembolso(m) {
    if (m.reembolso && typeof m.reembolso === "object") return m.reembolso.hash || null;
    if (typeof m.reembolso === "string") return m.reembolso;
    return m.reembolsoHash || null;
  }

  function fila(m) {
    var li = nodo("li");
    var instante = instanteDe(m);
    var est = String(m.estado || "pendiente");

    var etiquetas = nodo("p", "ad-dato");
    etiquetas.appendChild(nodo("span", "ad-etiqueta " + est, est));
    if (m.prueba) etiquetas.appendChild(nodo("span", "ad-etiqueta prueba", "prueba"));
    if (!isNaN(instante)) etiquetas.appendChild(document.createTextNode(cuanto(instante)));
    li.appendChild(etiquetas);

    li.appendChild(nodo("p", "ad-hora", isNaN(instante) ? String(m.id) : horaYFecha(instante, m.zona)));
    li.appendChild(nodo("p", "ad-dato", "hora de " + String(m.zona || "UTC").replace(/_/g, " ") + (isNaN(instante) ? "" : " · " + utc(instante)) + " · id " + String(m.id)));

    var ded = typeof m.dedicatoria === "string" && m.dedicatoria.trim() ? m.dedicatoria : "";
    li.appendChild(nodo("p", "ad-ded" + (ded ? "" : " vacia"), ded || "(sin dedicatoria)"));   // textContent

    var plata = [];
    if (typeof m.precioUsd === "number") plata.push("precio " + m.precioUsd + " USD");
    if (m.montoUsdc) plata.push("monto " + m.montoUsdc + " USDC");
    var datoPlata = nodo("p", "ad-dato", plata.join(" · "));
    var tx = enlaceTx(m.hash || (m.pago && m.pago.hash), "ver pago ↗");
    if (tx) { if (plata.length) datoPlata.appendChild(document.createTextNode(" · ")); datoPlata.appendChild(tx); }
    if (plata.length || tx) li.appendChild(datoPlata);
    if (m.nota) li.appendChild(nodo("p", "ad-dato", "nota: " + m.nota));

    // moderar
    var aviso = nodo("p", "ad-estado");
    aviso.setAttribute("aria-live", "polite");
    var acciones = nodo("p", "ad-acciones");
    var notaCampo = null;
    {
      notaCampo = nodo("input");
      notaCampo.type = "text";
      notaCampo.placeholder = "nota (opcional, solo para administración)";
      notaCampo.setAttribute("aria-label", "Nota para la decisión");
      notaCampo.maxLength = 300;
      var etiquetaNota = nodo("label", "ad-campo");
      etiquetaNota.appendChild(notaCampo);
      li.appendChild(etiquetaNota);
    }
    function moderar(decision) {
      if (decision === "rechazar" && !window.confirm("¿Rechazar esta dedicatoria? En la página del minuto se va a ver el texto neutro.")) return;
      var botones = acciones.querySelectorAll("button");
      for (var i = 0; i < botones.length; i++) botones[i].disabled = true;
      decir(aviso, decision === "aprobar" ? "aprobando…" : "rechazando…");
      var cuerpo = { id: m.id, decision: decision };
      var nota = notaCampo && notaCampo.value.trim();
      if (nota) cuerpo.nota = nota;
      api("POST", "/api/admin/moderar", cuerpo).then(function (r) {
        if (sinPermiso(r)) return;
        if (r.status >= 200 && r.status < 300) { decir(aviso, decision === "aprobar" ? "aprobada" : "rechazada"); setTimeout(cargar, 700); return; }
        decir(aviso, mensajeDe(r) + (r.datos && r.datos.error ? " " + r.datos.error : ""), true);
        for (var j = 0; j < botones.length; j++) botones[j].disabled = false;
      }, function () {
        decir(aviso, MENSAJES.red, true);
        for (var j = 0; j < botones.length; j++) botones[j].disabled = false;
      });
    }
    if (est !== "aprobada") {
      var aprobar = nodo("button", "enlace", "Aprobar");
      aprobar.type = "button";
      aprobar.addEventListener("click", function () { moderar("aprobar"); });
      acciones.appendChild(aprobar);
    }
    if (est !== "rechazada") {
      var rechazar = nodo("button", "enlace tenue", "Rechazar");
      rechazar.type = "button";
      rechazar.addEventListener("click", function () { moderar("rechazar"); });
      acciones.appendChild(rechazar);
    }
    li.appendChild(acciones);

    // reembolso de los rechazados
    if (est === "rechazada") {
      var hecho = hashDeReembolso(m);
      var r = nodo("p", "ad-dato");
      if (hecho) {
        r.textContent = "reembolso anotado: ";
        r.appendChild(enlaceTx(hecho));
      } else {
        r.textContent = "reembolso: " + (m.prueba ? "no corresponde (prueba)" : "pendiente si lo pidieron · " + (m.montoUsdc ? m.montoUsdc + " USDC" : "monto pagado") + " menos la comisión de red, a la dirección que pagó, dentro de los 14 días");
      }
      li.appendChild(r);
      if (!hecho && !m.prueba) {
        var campo = nodo("input");
        campo.type = "text"; campo.placeholder = "hash del reembolso (0x…)"; campo.spellcheck = false;
        campo.setAttribute("aria-label", "Hash de la transacción de reembolso");
        var lab = nodo("label", "ad-campo"); lab.appendChild(campo);
        li.appendChild(lab);
        var anotar = nodo("button", "enlace", "anotar reembolso");
        anotar.type = "button";
        var filaR = nodo("p", "ad-acciones"); filaR.appendChild(anotar);
        li.appendChild(filaR);
        anotar.addEventListener("click", function () {
          var hash = campo.value.trim();
          if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) { decir(aviso, "Ese no es un hash de transacción (0x y 64 caracteres).", true); return; }
          anotar.disabled = true;
          api("POST", "/api/admin/reembolso", { id: m.id, hash: hash }).then(function (res) {
            if (sinPermiso(res)) return;
            if (res.status >= 200 && res.status < 300) { decir(aviso, "reembolso anotado"); setTimeout(cargar, 700); return; }
            decir(aviso, mensajeDe(res) + (res.datos && res.datos.error ? " " + res.datos.error : ""), true);
            anotar.disabled = false;
          }, function () { decir(aviso, MENSAJES.red, true); anotar.disabled = false; });
        });
      }
    }
    li.appendChild(aviso);
    return li;
  }

  function filaHuerfano(h) {
    var li = nodo("li", "ad-minuto");
    li.appendChild(nodo("p", "ad-etiquetas", "pago sin minuto · reembolsar"));
    li.appendChild(nodo("p", "ad-dato", "Llegó cuando la reserva de " + String(h.id || "?") + " ya era de otra persona. Devolvé el monto a la dirección que pagó (se ve en el explorador)."));
    var dato = nodo("p", "ad-dato", "");
    var tx = enlaceTx(h.hash, "ver pago ↗");
    if (tx) dato.appendChild(tx);
    li.appendChild(dato);
    var hecho = h.reembolso && h.reembolso.estado === "hecho";
    if (hecho) { li.appendChild(nodo("p", "ad-dato", "reembolso hecho: " + String(h.reembolso.hash || ""))); return li; }
    var campo = nodo("input");
    campo.type = "text"; campo.placeholder = "hash del reembolso (0x…)"; campo.setAttribute("aria-label", "Hash del reembolso");
    var boton = nodo("button", null, "anotar reembolso");
    boton.type = "button";
    var aviso = nodo("p", "ad-estado");
    aviso.setAttribute("aria-live", "polite");
    boton.addEventListener("click", function () {
      var hash = campo.value.trim();
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) { decir(aviso, "Ese hash no tiene la forma 0x + 64 caracteres.", true); return; }
      api("POST", "/api/admin/reembolso", { id: h.hash, hash: hash }).then(function (r) {
        if (sinPermiso(r)) return;
        if (r.status === 200) cargar(); else decir(aviso, mensajeDe(r), true);
      }, function () { decir(aviso, MENSAJES.red, true); });
    });
    var acciones = nodo("p", "ad-acciones");
    acciones.appendChild(campo); acciones.appendChild(boton);
    li.appendChild(acciones); li.appendChild(aviso);
    return li;
  }

  function cargar() {
    if (!clave) return;
    decir(estado, "cargando…");
    api("GET", "/api/admin/minutos?estado=" + filtro).then(function (r) {
      if (sinPermiso(r)) return;
      if (r.status !== 200) { decir(estado, mensajeDe(r), true); return; }
      entrar.hidden = true;
      panel.hidden = false;
      var minutos = Array.isArray(r.datos) ? r.datos : (r.datos && Array.isArray(r.datos.minutos) ? r.datos.minutos : []);
      if (filtro === "pendiente") minutos = minutos.filter(function (m) { return !m.estado || m.estado === "pendiente"; });
      // pendientes primero; dentro de cada grupo, el que ocurre antes primero
      minutos.sort(function (a, b) {
        var pa = (a.estado || "pendiente") === "pendiente" ? 0 : 1, pb = (b.estado || "pendiente") === "pendiente" ? 0 : 1;
        return pa - pb || instanteDe(a) - instanteDe(b);
      });
      lista.textContent = "";
      for (var i = 0; i < minutos.length; i++) lista.appendChild(fila(minutos[i]));
      // Pagos que llegaron cuando su reserva ya era de otro: no compraron nada y hay que devolverlos.
      var huerfanos = r.datos && Array.isArray(r.datos.huerfanos) ? r.datos.huerfanos : [];
      for (var j = 0; j < huerfanos.length; j++) lista.appendChild(filaHuerfano(huerfanos[j]));
      decir(estado, minutos.length ? minutos.length + (filtro === "pendiente" ? " pendientes" : " minutos") : (filtro === "pendiente" ? "No hay dedicatorias pendientes." : "No hay minutos vendidos."));
    }, function () { decir(estado, MENSAJES.red, true); });
  }

  function elegir(f) {
    filtro = f;
    verPendientes.setAttribute("aria-pressed", f === "pendiente" ? "true" : "false");
    verTodas.setAttribute("aria-pressed", f === "todas" ? "true" : "false");
    cargar();
  }
  verPendientes.addEventListener("click", function () { elegir("pendiente"); });
  verTodas.addEventListener("click", function () { elegir("todas"); });
  $("recargar").addEventListener("click", cargar);
  $("salir").addEventListener("click", function () {
    clave = "";
    try { sessionStorage.removeItem(CLAVE); } catch (e) {}
    lista.textContent = "";
    panel.hidden = true;
    entrar.hidden = false;
    claveEl.value = "";
    decir(estado, "");
  });

  entrar.addEventListener("submit", function (ev) {
    ev.preventDefault();
    clave = claveEl.value;
    if (!clave) return;
    try { sessionStorage.setItem(CLAVE, clave); } catch (e) {}
    claveEl.value = "";
    cargar();
  });

  var borrar = $("borrarPruebas"), estadoPruebas = $("estadoPruebas");
  borrar.addEventListener("click", function () {
    if (!window.confirm("¿Borrar todos los minutos marcados como prueba? No se puede deshacer. Los minutos reales no se tocan.")) return;
    borrar.disabled = true;
    decir(estadoPruebas, "borrando…");
    api("POST", "/api/admin/borrar-pruebas", {}).then(function (r) {
      if (sinPermiso(r)) return;
      if (r.status >= 200 && r.status < 300) {
        var n = r.datos && typeof r.datos.borrados === "number" ? r.datos.borrados : null;
        decir(estadoPruebas, n === null ? "Listo: minutos de prueba borrados." : "Listo: " + n + " minutos de prueba borrados.");
        cargar();
      } else decir(estadoPruebas, mensajeDe(r), true);
    }, function () { decir(estadoPruebas, MENSAJES.red, true); }).then(function () { borrar.disabled = false; });
  });

  // El explorador de la red activa, para los enlaces a las transacciones (no requiere contraseña).
  fetch("/api/minuto/config", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.red && d.red.explorador) explorador = d.red.explorador; }).catch(function () {});

  if (clave) cargar();
})();
