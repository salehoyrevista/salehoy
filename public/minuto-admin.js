// Administración de "El minuto" (/admin/). Marcado: src/pages/admin.astro.
//
// Esta página no contiene secretos y no decide nada: todo se valida en el servidor con
// ADMIN_PASSWORD. La contraseña queda en sessionStorage (se borra al cerrar la pestaña) y viaja
// en la cabecera x-admin. Las dedicatorias se ponen siempre con textContent, nunca con innerHTML.
//
//   GET  /api/admin/minutos?estado=pendiente|todas
//   POST /api/admin/moderar        { id, decision: "aprobar" | "rechazar", nota? }
//
// Pedir un minuto es gratis: acá no hay precios, pagos ni reembolsos.
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
      if (decision === "rechazar" && !window.confirm("¿Rechazar esta dedicatoria? No se va a mostrar.")) return;
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
    li.appendChild(aviso);
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
      decir(estado, minutos.length ? minutos.length + (filtro === "pendiente" ? " pendientes" : " minutos") : (filtro === "pendiente" ? "No hay dedicatorias pendientes." : "No hay minutos pedidos."));
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

  if (clave) cargar();
})();