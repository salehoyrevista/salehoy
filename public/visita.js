// Medición de visitas, sin cookies ni datos personales.
// Manda: la página, el idioma, el sitio de origen (solo el dominio) y si se
// llegó por el enlace de un asterisco. No manda ni guarda quién sos.
// Respeta "No rastrear" y Global Privacy Control. Ver /api/estadisticas.
(function () {
  function mandar(datos) {
    try {
      if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
      if (location.hostname !== "salehoy.com.ar") return;   // no cuenta en pruebas locales
      var cuerpo = JSON.stringify(datos);
      if (navigator.sendBeacon) navigator.sendBeacon("/api/visita", new Blob([cuerpo], { type: "application/json" }));
      else fetch("/api/visita", { method: "POST", body: cuerpo, keepalive: true, headers: { "content-type": "application/json" } });
    } catch (e) {}
  }

  var origen = "";
  try { if (document.referrer) origen = new URL(document.referrer).hostname; } catch (e) {}

  mandar({
    p: location.pathname,
    l: document.documentElement.lang || "",
    r: origen,
    n: /[?&]n=\d+/.test(location.search) ? 1 : 0,
    s: /[?&]e=[\w-]+/.test(location.search) ? 1 : 0     // llegó por el enlace de una estela
  });

  // Hitos del camino al regalo (sin montos ni direcciones).
  window.SaleHoyVisita = { evento: function (nombre) { mandar({ e: String(nombre) }); } };
})();
