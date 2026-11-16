// HTML de las páginas de "El minuto" que sirve una función (no Astro):
//   - la página permanente de cada minuto  (/minuto/m/<idurl>/, /en/minute/m/<idurl>/)
//   - el archivo de minutos pasados        (/minuto/archivo/, /en/minute/archive/)
//   - el sitemap de esas páginas           (/minuto/sitemap.xml)
//
// Todo son funciones puras: reciben datos y devuelven texto. No leen el almacén ni la red, así
// se prueban con node:test (tests/minuto-html.test.mjs).
//
// Regla que no se rompe: el único texto que escribe una persona de afuera es la dedicatoria.
// Siempre pasa por esc() antes de entrar al HTML y por jsonParaScript() antes de entrar a un
// <script>. Y solo se muestra si está aprobada.

export const SITIO = "https://salehoy.com.ar";

// Mismas rutas que src/lib/obras.js (se repiten acá para que la función no dependa de src/).
export const RUTAS = {
  es: {
    sinMotivo: "/", interruptor: "/interruptor/", minuto: "/minuto/", elegir: "/minuto/elegir/",
    archivo: "/minuto/archivo/", terminos: "/minuto/terminos/", pagina: (idurl) => "/minuto/m/" + idurl + "/"
  },
  en: {
    sinMotivo: "/en/", interruptor: "/en/switch/", minuto: "/en/minute/", elegir: "/en/minute/choose/",
    archivo: "/en/minute/archive/", terminos: "/en/minute/terms/", pagina: (idurl) => "/en/minute/m/" + idurl + "/"
  }
};
const NOMBRES = {
  es: { sinMotivo: "Sin motivo", interruptor: "El interruptor", minuto: "El minuto", obras: "Obras de Solzimer" },
  en: { sinMotivo: "Sin motivo", interruptor: "The Switch", minuto: "The Minute", obras: "Works by Solzimer" }
};

const idioma = (lang) => (lang === "en" ? "en" : "es");
const otro = (lang) => (idioma(lang) === "en" ? "es" : "en");

// ---------- escapes ----------

/** Texto -> seguro dentro de HTML (contenido y atributos entre comillas). */
export function esc(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Objeto -> JSON seguro dentro de un <script>: nada puede cerrar la etiqueta ni abrir un comentario. */
export function jsonParaScript(objeto) {
  return JSON.stringify(objeto)
    .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// ---------- identificadores ----------

const FORMA_ID = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})[-:](\d{2})Z$/;

/** Instante (ms UTC) de un id en cualquiera de sus dos formas; null si no es un minuto válido. */
export function instanteDeId(id) {
  const m = FORMA_ID.exec(String(id || ""));
  if (!m) return null;
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const d = new Date(ms);
  // Date.UTC acepta "32 de enero": se comprueba que la fecha sea la que se escribió.
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3] ||
      d.getUTCHours() !== +m[4] || d.getUTCMinutes() !== +m[5]) return null;
  return ms;
}
/** "2026-12-24T03:33Z" (forma canónica) o null. */
export function idCanonico(id) {
  const m = FORMA_ID.exec(String(id || ""));
  return m && instanteDeId(id) !== null ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}Z` : null;
}
/** "2026-12-24T03-33Z" (forma para URLs) o null. */
export function idUrl(id) {
  const c = idCanonico(id);
  return c ? c.replace(":", "-") : null;
}

// ---------- fechas ----------

/** Devuelve la zona si el entorno la conoce; si no, "UTC". */
export function zonaSegura(zona) {
  try { new Intl.DateTimeFormat("en", { timeZone: zona }); return zona; } catch (e) { return "UTC"; }
}

/** "jueves, 24 de diciembre de 2026" / "Thursday 24 December 2026", en la zona dada. */
export function fechaLarga(instante, zona, lang) {
  return new Intl.DateTimeFormat(idioma(lang) === "en" ? "en-GB" : "es-AR", {
    timeZone: zonaSegura(zona), weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date(instante));
}

/** "00:33" en la zona dada (reloj de 24 horas). */
export function horaLocal(instante, zona) {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: zonaSegura(zona), hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(instante));
  const v = (tipo) => (partes.find((p) => p.type === tipo) || { value: "00" }).value;
  return v("hour") + ":" + v("minute");
}

/** "2026-12-24 03:33 UTC" */
export function textoUtc(instante) {
  return new Date(instante).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

/** Nombre de zona legible: "America/Argentina/Buenos_Aires" -> "America/Argentina/Buenos Aires". */
export const zonaLegible = (zona) => String(zona || "UTC").replace(/_/g, " ");

// Las dos funciones que siguen corren también en el navegador: se pegan tal cual (toString) en
// el script de la página de un minuto. Por eso no usan nada de afuera ni sintaxis moderna.

/** Cuánto falta, para la cuenta regresiva: "faltan 3 días 04:12:09" / "3 days 04:12:09 to go". */
export function textoFalta(ms, lang) {
  var s = Math.max(0, Math.ceil(ms / 1000));
  var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  function p(n) { return (n < 10 ? "0" : "") + n; }
  var reloj = p(h) + ":" + p(m) + ":" + p(x);
  if (lang === "en") return (d ? d + (d === 1 ? " day " : " days ") : "") + reloj + " to go";
  return (d === 1 ? "falta " : "faltan ") + (d ? d + (d === 1 ? " día " : " días ") : "") + reloj;
}

/**
 * Archivo .ics de un minuto (un evento de 60 segundos con un aviso 5 minutos antes).
 * No lleva nombres ni la dedicatoria: solo la hora y la dirección de la obra.
 * d: { uid, sello (ms), instante (ms), titulo, descripcion, url }
 */
export function armarIcs(d) {
  function p(n) { return (n < 10 ? "0" : "") + n; }
  function f(ms) {
    var x = new Date(ms);
    return x.getUTCFullYear() + p(x.getUTCMonth() + 1) + p(x.getUTCDate()) + "T" +
      p(x.getUTCHours()) + p(x.getUTCMinutes()) + p(x.getUTCSeconds()) + "Z";
  }
  function t(s) { return String(s).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1"); }
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Solzimer//El minuto//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + t(d.uid),
    "DTSTAMP:" + f(d.sello),
    "DTSTART:" + f(d.instante),
    "DTEND:" + f(d.instante + 60000),
    "SUMMARY:" + t(d.titulo),
    "DESCRIPTION:" + t(d.descripcion),
    "URL:" + d.url,
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + t(d.titulo), "TRIGGER:-PT5M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", ""
  ].join("\r\n");
}

// ---------- textos ----------

export const T = {
  es: {
    obra: "El minuto",
    prueba: "prueba",
    horaDe: "hora de",
    pendiente: "La dedicatoria está esperando aprobación.",
    neutro: "Este minuto es de alguien.",
    rechazadaNota: "La dedicatoria no fue aprobada. Si este minuto es tuyo, en los términos dice qué podés pedir.",
    juntos: ["Para verlo juntos: abran ", " a esa hora."],
    calendario: "agregar al calendario →",
    ahora: "Está pasando ahora →",
    paso: "Este minuto ya pasó. Fue de alguien.",
    certificado: "descargar certificado",
    compartir: "compartir",
    copiado: "enlace copiado",
    copiar: "copiá el enlace de la barra de direcciones",
    armando: "armando el certificado…",
    listo: "certificado listo",
    falloCert: "no se pudo armar el certificado",
    archivo: "archivo", terminos: "términos", regalar: "regalar un minuto →", idioma: "English",
    icsTitulo: "El minuto",
    icsDescripcion: "Un minuto regalado. Para verlo juntos: abran salehoy.com.ar/minuto a esta hora. Dura 60 segundos.",
    titulo: (hora, fecha) => `${hora} · ${fecha} · El minuto`,
    descAprobada: (ded, hora, fecha, utc) => `«${ded}» Un minuto regalado: el ${fecha} a las ${hora} (${utc}), esta dedicatoria ocupa la portada de El minuto durante 60 segundos.`,
    descNeutra: (hora, fecha, utc) => `Este minuto es de alguien. El ${fecha} a las ${hora} (${utc}) es un minuto regalado de El minuto, una obra de Solzimer.`,
    noEstaTitulo: "Ese minuto no es de nadie",
    noEsta: ["Ese minuto", "no es de nadie."],
    errorTitulo: "No se pudo leer",
    error: ["No se pudo leer.", "Probá de nuevo en un momento."],
    volver: "ir a El minuto →",
    archivoTitulo: "Archivo de El minuto",
    archivoH1: ["Archivo", "de El minuto"],
    archivoDesc: "Todos los minutos regalados que ya pasaron en El minuto, la obra de Solzimer. Cada uno tiene su página permanente.",
    archivoEntrada: "Los minutos regalados que ya pasaron. Cada uno ocupó la portada durante 60 segundos y tiene su página para siempre.",
    archivoVacio: "Todavía no pasó ningún minuto regalado.",
    fueDeAlguien: "Este minuto fue de alguien.",
    masViejos: "más antiguos →",
    alPrincipio: "← los más recientes"
  },
  en: {
    obra: "The Minute",
    prueba: "test",
    horaDe: "time in",
    pendiente: "The dedication is waiting for approval.",
    neutro: "This minute belongs to someone.",
    rechazadaNota: "The dedication was not approved. If this minute is yours, the terms say what you can ask for.",
    juntos: ["To watch it together: open ", " at that time."],
    calendario: "add to calendar →",
    ahora: "It is happening now →",
    paso: "This minute has passed. It belonged to someone.",
    certificado: "download certificate",
    compartir: "share",
    copiado: "link copied",
    copiar: "copy the link from the address bar",
    armando: "making the certificate…",
    listo: "certificate ready",
    falloCert: "the certificate could not be made",
    archivo: "archive", terminos: "terms", regalar: "give a minute →", idioma: "Español",
    icsTitulo: "The Minute",
    icsDescripcion: "A minute given as a gift. To watch it together: open salehoy.com.ar/en/minute at this time. It lasts 60 seconds.",
    titulo: (hora, fecha) => `${hora} · ${fecha} · The Minute`,
    descAprobada: (ded, hora, fecha, utc) => `“${ded}” A minute given as a gift: on ${fecha} at ${hora} (${utc}), this dedication takes over the front page of The Minute for 60 seconds.`,
    descNeutra: (hora, fecha, utc) => `This minute belongs to someone. ${fecha} at ${hora} (${utc}) is a gifted minute of The Minute, a work by Solzimer.`,
    noEstaTitulo: "That minute belongs to no one",
    noEsta: ["That minute", "belongs to no one."],
    errorTitulo: "Could not be read",
    error: ["It could not be read.", "Try again in a moment."],
    volver: "go to The Minute →",
    archivoTitulo: "The Minute — archive",
    archivoH1: ["Archive", "of The Minute"],
    archivoDesc: "Every gifted minute that has already passed in The Minute, a work by Solzimer. Each one has its permanent page.",
    archivoEntrada: "The gifted minutes that have already passed. Each one took over the front page for 60 seconds and keeps its page forever.",
    archivoVacio: "No gifted minute has passed yet.",
    fueDeAlguien: "This minute belonged to someone.",
    masViejos: "older →",
    alPrincipio: "← most recent"
  }
};

// ---------- documento ----------

// Tipografías, colores y prosa: copiados de src/layouts/Obra.astro y src/components/NavObras.astro.
const ESTILO_BASE = `
@font-face{font-family:"Instrument Serif";font-style:normal;font-weight:400;font-display:swap;src:url("/fonts/instrument-serif.woff2") format("woff2")}
@font-face{font-family:"Instrument Serif";font-style:italic;font-weight:400;font-display:swap;src:url("/fonts/instrument-serif-italic.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:400;font-display:swap;src:url("/fonts/ibm-plex-mono.woff2") format("woff2")}
:root{--tinta:#0e0d12;--crema:#f2e9d8;--tenue:rgba(242,233,216,.6);--linea:rgba(242,233,216,.16);--bermellon:#e2553a;--serif:"Instrument Serif",Georgia,"Times New Roman",serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}
*{box-sizing:border-box}
html,body{margin:0;background:var(--tinta);color:var(--crema)}
body{min-height:100vh;min-height:100svh;font-family:var(--serif);overflow-x:hidden}
[hidden]{display:none!important}
a,.enlace{color:var(--bermellon);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
a:hover,.enlace:hover{text-decoration-thickness:2px}
.enlace{background:none;border:0;padding:0;cursor:pointer;font:inherit;min-height:44px}
:focus-visible{outline:1px solid var(--bermellon);outline-offset:4px}
.obra-arriba{position:relative;z-index:5;padding:max(16px,env(safe-area-inset-top)) 16px 0}
.nav-obras{display:flex;flex-wrap:wrap;gap:2px 16px;font-family:var(--mono);font-size:.68rem;letter-spacing:.04em;line-height:2}
.nav-obras a{color:var(--tenue);text-decoration:none}
.nav-obras a:hover{color:var(--crema)}
.nav-obras a[aria-current="page"]{color:var(--crema);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
main{width:100%;max-width:46rem;padding:9vh 16px 64px clamp(16px,9vw,7rem)}
h1{margin:0 0 1.5rem;font-weight:400;font-size:clamp(2.5rem,7.5vw,4.8rem);line-height:.98;letter-spacing:-.012em;overflow-wrap:break-word}
h1 em{color:var(--tenue)}
p{margin:0 0 1rem;font-size:1.25rem;line-height:1.5;overflow-wrap:break-word}
.entrada{font-size:clamp(1.4rem,3vw,1.7rem);line-height:1.35}
.mono{font-family:var(--mono);font-size:.76rem;line-height:1.7;color:var(--tenue)}
.prueba{font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;color:var(--bermellon);border:1px solid var(--bermellon);padding:1px 6px;margin-left:.6em;white-space:nowrap;font-style:normal}
.mas{margin-top:3rem;font-family:var(--mono);font-size:.72rem;line-height:2.4;color:var(--tenue)}
.mas a{margin-right:1.2rem;white-space:nowrap}
`;

const ESTILO_MINUTO = `
.pm-sobre{margin:0 0 1.2rem}
.pm-hora{margin:0;font-size:clamp(5.5rem,27vw,13rem);line-height:.86;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.pm-fecha{margin:1.2rem 0 .2rem;font-size:clamp(1.5rem,4.4vw,2.2rem);line-height:1.2}
.pm-dedicatoria{margin:2.4rem 0 0;padding:0;font-style:italic;font-size:clamp(1.9rem,6.4vw,3.2rem);line-height:1.12;overflow-wrap:anywhere}
.pm-neutro{margin:2.4rem 0 0;font-style:italic;font-size:clamp(1.5rem,4.6vw,2.1rem);line-height:1.2;color:var(--tenue)}
.pm-nota{margin:.8rem 0 0}
.pm-momento{margin-top:2.6rem;padding-top:1.4rem;border-top:1px solid var(--linea)}
.pm-cuenta{margin:0 0 1rem;font-family:var(--mono);font-size:clamp(1.25rem,5.6vw,2.2rem);line-height:1.2;font-variant-numeric:tabular-nums;color:var(--crema)}
.pm-momento p{max-width:30rem}
.pm-ahora{font-size:clamp(1.8rem,6vw,2.8rem);line-height:1.15}
.pm-acciones{display:flex;flex-wrap:wrap;align-items:center;gap:0 1.6rem;margin:2.2rem 0 0;font-family:var(--mono);font-size:.84rem}
.pm-aviso{min-height:1.7em;margin:.2rem 0 0}
`;

const ESTILO_ARCHIVO = `
.arch{list-style:none;margin:2.4rem 0 0;padding:0;border-top:1px solid var(--linea)}
.arch li{padding:1rem 0 1.1rem;border-bottom:1px solid var(--linea)}
.arch-hora{display:inline-block;padding:6px 0;font-family:var(--mono);font-size:.8rem}
.arch-ded{margin:.15rem 0 0;font-style:italic;font-size:clamp(1.35rem,4.4vw,1.8rem);line-height:1.2;overflow-wrap:anywhere}
.arch-neutro{margin:.15rem 0 0;font-style:italic;font-size:1.15rem;color:var(--tenue)}
.arch-pie{margin-top:1.6rem;font-family:var(--mono);font-size:.8rem;display:flex;flex-wrap:wrap;gap:.4rem 1.6rem}
.arch-pie a{display:inline-block;padding:10px 0}
`;

const ESTILO_AVISO = `
.aviso-pagina{position:absolute;left:clamp(16px,9vw,10rem);right:16px;top:26vh;max-width:58rem;padding:0}
.aviso-pagina h1{font-size:clamp(2.8rem,8vw,6.5rem);line-height:.96}
.aviso-pagina .linea{display:block}
.aviso-pagina .tenue{font-style:italic;color:var(--tenue)}
.aviso-pagina a{font-family:var(--mono);font-size:.8rem;display:inline-block;padding:10px 0}
`;

function navObras(lang) {
  const l = idioma(lang), r = RUTAS[l], n = NOMBRES[l];
  const enlaces = ["sinMotivo", "interruptor", "minuto"]
    .map((o) => `<a href="${r[o]}"${o === "minuto" ? ' aria-current="page"' : ""}>${esc(n[o])}</a>`).join("");
  return `<header class="obra-arriba"><nav class="nav-obras" aria-label="${esc(n.obras)}">${enlaces}</nav></header>`;
}

/**
 * Documento HTML completo, con la misma cabecera que src/layouts/Obra.astro.
 * `cuerpo`, `estilo` y `scripts` ya vienen armados (y escapados) por quien llama.
 */
export function documento({ lang, titulo, descripcion, ruta, alterna = null, imagen = "/og.png", ld = null, indexar = true, estilo = "", cuerpo, scripts = "" }) {
  const l = idioma(lang);
  const url = SITIO + ruta;
  const alternas = alterna
    ? `<link rel="alternate" hreflang="${l}" href="${esc(url)}">\n` +
      `<link rel="alternate" hreflang="${otro(l)}" href="${esc(SITIO + alterna)}">\n` +
      `<link rel="alternate" hreflang="x-default" href="${esc(SITIO + (l === "en" ? ruta : alterna))}">\n`
    : "";
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0e0d12">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script src="/interno.js"></script>
<title>${esc(titulo)} — Solzimer</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="author" content="Solzimer">
${indexar ? "" : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${esc(url)}">
${alternas}<link rel="preload" href="/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website">
<meta property="og:site_name" content="Solzimer">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:image" content="${esc(imagen.startsWith("http") ? imagen : SITIO + imagen)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
${ld ? `<script type="application/ld+json">${jsonParaScript(ld)}</script>\n` : ""}<style>${ESTILO_BASE}${estilo}</style>
</head>
<body data-obra="minuto">
${navObras(l)}
${cuerpo}
${scripts}<script src="/visita.js" defer></script>
</body>
</html>
`;
}

// ---------- página de un minuto ----------

/**
 * Lo que corre en el navegador en la página de un minuto. Se pega con toString(): no puede usar
 * nada de este módulo salvo lo que recibe por parámetro.
 */
export function clientePagina(armarIcs, textoFalta) {
  var datos;
  try { datos = JSON.parse(document.getElementById("minuto-datos").textContent); } catch (e) { return; }
  function el(id) { return document.getElementById(id); }
  var bloques = { antes: el("antes"), durante: el("durante"), despues: el("despues") };
  var cuenta = el("cuenta"), aviso = el("aviso");
  var desfase = 0;   // reloj del servidor menos reloj del dispositivo
  function ahora() { return Date.now() + desfase; }

  function pintar() {
    var t = ahora(), falta = datos.instante - t;
    var momento = falta > 0 ? "antes" : (t < datos.instante + 60000 ? "durante" : "despues");
    for (var k in bloques) if (bloques[k]) bloques[k].hidden = k !== momento;
    if (momento === "antes" && cuenta) cuenta.textContent = textoFalta(falta, datos.lang);
    return momento;
  }
  function tic() {
    if (pintar() !== "despues") setTimeout(tic, 1000 - (ahora() % 1000) + 20);
  }
  tic();

  // La cuenta regresiva usa la hora del servidor, por si el reloj del dispositivo está corrido.
  var salida = Date.now();
  fetch("/api/minuto/ahora", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || typeof d.ahora !== "number") return;
      var llegada = Date.now();
      desfase = d.ahora + (llegada - salida) / 2 - llegada;
      pintar();
    })
    .catch(function () {});

  function decir(texto) { if (aviso) aviso.textContent = texto; }

  var calendario = el("calendario");
  if (calendario) calendario.addEventListener("click", function () {
    var ics = armarIcs({
      uid: datos.idurl + "@salehoy.com.ar", sello: Date.now(), instante: datos.instante,
      titulo: datos.t.icsTitulo, descripcion: datos.t.icsDescripcion, url: datos.portada
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "el-minuto-" + datos.idurl + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  });

  var certificado = el("certificado");
  if (certificado) certificado.addEventListener("click", function () {
    if (!window.MinutoCertificado) { decir(datos.t.falloCert); return; }
    decir(datos.t.armando);
    window.MinutoCertificado.entregar(datos).then(
      function () { decir(datos.t.listo); },
      function () { decir(datos.t.falloCert); }
    );
  });

  var compartir = el("compartir");
  if (compartir) compartir.addEventListener("click", function () {
    function copiar() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(datos.url).then(function () { decir(datos.t.copiado); }, function () { decir(datos.t.copiar); });
      } else decir(datos.t.copiar);
    }
    if (navigator.share) {
      navigator.share({ title: document.title, url: datos.url }).catch(function (e) {
        if (!e || e.name !== "AbortError") copiar();
      });
    } else copiar();
  });
}

/**
 * Página permanente de un minuto.
 * minuto: lo que devuelve leerMinutoPublico (id, instante, zona, local, estado, dedicatoria, prueba…).
 * ahora: ms del servidor, para decidir qué bloque se ve antes de que corra el script.
 */
export function paginaMinuto({ minuto, lang, ahora = Date.now() }) {
  const l = idioma(lang), t = T[l], r = RUTAS[l];
  const idurl = idUrl(minuto.id);
  const instante = typeof minuto.instante === "number" ? minuto.instante : instanteDeId(minuto.id);
  const zona = zonaSegura(minuto.zona || "UTC");
  const hora = minuto.local && /^\d{2}:\d{2}$/.test(minuto.local.hora || "") ? minuto.local.hora : horaLocal(instante, zona);
  const fecha = fechaLarga(instante, zona, l);
  const utc = textoUtc(instante);
  // La dedicatoria solo existe para la página si está aprobada. Nada más la deja pasar.
  const aprobada = minuto.estado === "aprobada" && typeof minuto.dedicatoria === "string" && minuto.dedicatoria.trim() !== "";
  const dedicatoria = aprobada ? minuto.dedicatoria.trim() : null;
  const prueba = !!minuto.prueba;
  const ruta = r.pagina(idurl);
  const url = SITIO + ruta;
  const momento = ahora < instante ? "antes" : ahora < instante + 60000 ? "durante" : "despues";

  const titulo = t.titulo(hora, fecha);
  const descripcion = dedicatoria ? t.descAprobada(dedicatoria, hora, fecha, utc) : t.descNeutra(hora, fecha, utc);

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: titulo,
    url,
    inLanguage: l,
    author: { "@type": "Person", name: "Solzimer" },
    temporalCoverage: new Date(instante).toISOString().slice(0, 19) + "Z/" + new Date(instante + 60000).toISOString().slice(0, 19) + "Z",
    isPartOf: {
      "@type": "VisualArtwork", name: t.obra, artform: "Net art",
      creator: { "@type": "Person", name: "Solzimer" }, url: SITIO + r.minuto
    }
  };
  if (dedicatoria) ld.text = dedicatoria;

  let texto;
  if (dedicatoria) texto = `<blockquote class="pm-dedicatoria">${esc(dedicatoria)}</blockquote>`;
  else if (minuto.estado === "pendiente") texto = `<p class="pm-neutro">${esc(t.pendiente)}</p>`;
  else if (minuto.estado === "rechazada") {
    texto = `<p class="pm-neutro">${esc(t.neutro)}</p>\n  <p class="mono pm-nota">${esc(t.rechazadaNota)} <a href="${r.terminos}">${esc(t.terminos)}</a></p>`;
  } else texto = `<p class="pm-neutro">${esc(t.neutro)}</p>`;

  const oculto = (m) => (m === momento ? "" : " hidden");
  const portadaVisible = SITIO.replace("https://", "") + r.minuto.replace(/\/$/, "");

  const cuerpo = `<main class="pm">
  <p class="mono pm-sobre">${esc(t.obra)} · Solzimer${prueba ? `<span class="prueba">${esc(t.prueba)}</span>` : ""}</p>
  <h1 class="pm-hora"><time datetime="${esc(new Date(instante).toISOString().slice(0, 16) + "Z")}">${esc(hora)}</time></h1>
  <p class="pm-fecha">${esc(fecha)}</p>
  <p class="mono">${esc(t.horaDe)} ${esc(zonaLegible(zona))} · ${esc(utc)}</p>
  ${texto}
  <section class="pm-momento" id="antes"${oculto("antes")}>
    <p class="pm-cuenta" id="cuenta" role="timer">${esc(textoFalta(instante - ahora, l))}</p>
    <p>${esc(t.juntos[0])}<a href="${r.minuto}">${esc(portadaVisible)}</a>${esc(t.juntos[1])}</p>
    <button class="enlace mono-boton" id="calendario" type="button">${esc(t.calendario)}</button>
  </section>
  <section class="pm-momento" id="durante"${oculto("durante")}>
    <a class="pm-ahora" href="${r.minuto}">${esc(t.ahora)}</a>
  </section>
  <section class="pm-momento" id="despues"${oculto("despues")}>
    <p>${esc(t.paso)}</p>
  </section>
  <div class="pm-acciones">
    <button class="enlace" id="certificado" type="button">${esc(t.certificado)}</button>
    <button class="enlace" id="compartir" type="button">${esc(t.compartir)}</button>
  </div>
  <p class="mono pm-aviso" id="aviso" aria-live="polite"></p>
  <p class="mas"><a href="${r.elegir}">${esc(t.regalar)}</a><a href="${r.archivo}">${esc(t.archivo)}</a><a href="${r.terminos}">${esc(t.terminos)}</a><a href="${RUTAS[otro(l)].pagina(idurl)}" hreflang="${otro(l)}">${esc(t.idioma)}</a></p>
</main>`;

  const datos = {
    id: idCanonico(minuto.id), idurl, instante, zona, estado: aprobada ? "aprobada" : String(minuto.estado || "pendiente"),
    dedicatoria, prueba, lang: l, url, portada: SITIO + r.minuto,
    t: {
      icsTitulo: t.icsTitulo, icsDescripcion: t.icsDescripcion, copiado: t.copiado, copiar: t.copiar,
      armando: t.armando, listo: t.listo, falloCert: t.falloCert
    }
  };
  const scripts =
    `<script type="application/json" id="minuto-datos">${jsonParaScript(datos)}</script>\n` +
    `<script src="/minuto-certificado.js" defer></script>\n` +
    `<script>(${clientePagina.toString()})(${armarIcs.toString()}, ${textoFalta.toString()});</script>\n`;

  return documento({
    lang: l, titulo, descripcion, ruta, alterna: RUTAS[otro(l)].pagina(idurl),
    imagen: `${SITIO}/og/minuto.png?id=${idurl}&lang=${l}`,
    ld, indexar: !prueba, estilo: ESTILO_MINUTO + ".mono-boton{font-family:var(--mono);font-size:.84rem}", cuerpo, scripts
  });
}

/** Página mínima: el minuto no existe o no está vendido (404), o no se pudo leer (error). */
export function paginaAviso({ lang, tipo = "no-esta" }) {
  const l = idioma(lang), t = T[l], r = RUTAS[l];
  const lineas = tipo === "error" ? t.error : t.noEsta;
  const cuerpo = `<main class="aviso-pagina">
  <h1><span class="linea">${esc(lineas[0])}</span><span class="linea tenue">${esc(lineas[1])}</span></h1>
  <a href="${r.minuto}">${esc(t.volver)}</a>
</main>`;
  return documento({
    lang: l, titulo: tipo === "error" ? t.errorTitulo : t.noEstaTitulo, descripcion: lineas.join(" "),
    ruta: r.minuto, indexar: false, estilo: ESTILO_AVISO, cuerpo
  });
}

// ---------- archivo ----------

/**
 * Archivo de minutos pasados.
 * minutos: [{ id, instante, dedicatoria|null, estado, prueba }], más reciente primero.
 * sigue: ms para pedir la página siguiente (o null). antes: el ?antes= de esta página (o null).
 */
export function paginaArchivo({ minutos = [], sigue = null, antes = null, lang }) {
  const l = idioma(lang), t = T[l], r = RUTAS[l];
  const filas = minutos.map((m) => {
    const idurl = idUrl(m.id);
    if (!idurl) return "";
    const instante = typeof m.instante === "number" ? m.instante : instanteDeId(m.id);
    const aprobada = m.estado === "aprobada" && typeof m.dedicatoria === "string" && m.dedicatoria.trim() !== "";
    return `<li>
    <a class="arch-hora" href="${r.pagina(idurl)}"><time datetime="${esc(new Date(instante).toISOString().slice(0, 16) + "Z")}">${esc(textoUtc(instante))}</time></a>${m.prueba ? `<span class="prueba">${esc(t.prueba)}</span>` : ""}
    ${aprobada ? `<p class="arch-ded">${esc(m.dedicatoria.trim())}</p>` : `<p class="arch-neutro">${esc(t.fueDeAlguien)}</p>`}
  </li>`;
  }).filter(Boolean);

  const paginada = typeof antes === "number" && antes > 0;
  const pie = [
    paginada ? `<a href="${r.archivo}">${esc(t.alPrincipio)}</a>` : "",
    typeof sigue === "number" && sigue > 0 ? `<a href="${r.archivo}?antes=${sigue}" rel="next">${esc(t.masViejos)}</a>` : ""
  ].filter(Boolean).join("");

  const cuerpo = `<main>
  <h1>${esc(t.archivoH1[0])} <em>${esc(t.archivoH1[1])}</em></h1>
  <p class="entrada">${esc(t.archivoEntrada)}</p>
  ${filas.length ? `<ol class="arch">\n  ${filas.join("\n  ")}\n  </ol>` : `<p class="pm-vacio"><em>${esc(t.archivoVacio)}</em></p>`}
  ${pie ? `<p class="arch-pie">${pie}</p>` : ""}
  <p class="mas"><a href="${r.minuto}">${esc(t.obra)}</a><a href="${r.elegir}">${esc(t.regalar)}</a><a href="${r.terminos}">${esc(t.terminos)}</a><a href="${RUTAS[otro(l)].archivo}" hreflang="${otro(l)}">${esc(t.idioma)}</a></p>
</main>`;

  const ld = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: t.archivoTitulo, inLanguage: l,
    url: SITIO + r.archivo,
    isPartOf: { "@type": "VisualArtwork", name: t.obra, artform: "Net art", creator: { "@type": "Person", name: "Solzimer" }, url: SITIO + r.minuto }
  };
  return documento({
    lang: l, titulo: t.archivoTitulo, descripcion: t.archivoDesc,
    ruta: r.archivo + (paginada ? "?antes=" + antes : ""),
    alterna: RUTAS[otro(l)].archivo + (paginada ? "?antes=" + antes : ""),
    ld, estilo: ESTILO_ARCHIVO, cuerpo
  });
}

// ---------- sitemap ----------

/** Sitemap de las páginas de minutos: una entrada por idioma, con sus alternativas. Sin los de prueba. */
export function sitemapMinutos(minutos = []) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  const vistos = new Set();
  const grupo = (es, en) => {
    for (const loc of [es, en]) {
      xml += "  <url>\n    <loc>" + esc(SITIO + loc) + "</loc>\n" +
        '    <xhtml:link rel="alternate" hreflang="es" href="' + esc(SITIO + es) + '"/>\n' +
        '    <xhtml:link rel="alternate" hreflang="en" href="' + esc(SITIO + en) + '"/>\n' +
        // x-default en inglés, como en src/layouts/Obra.astro y el resto del sitio
        '    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(SITIO + en) + '"/>\n' +
        "  </url>\n";
    }
  };
  grupo(RUTAS.es.archivo, RUTAS.en.archivo);
  for (const m of minutos) {
    const idurl = m && !m.prueba ? idUrl(m.id) : null;
    if (!idurl || vistos.has(idurl)) continue;
    vistos.add(idurl);
    grupo(RUTAS.es.pagina(idurl), RUTAS.en.pagina(idurl));
  }
  return xml + "</urlset>\n";
}
