// Pruebas del HTML de "El minuto" (netlify/lib/minuto-html.mjs). Correr con: node --test tests/minuto-html.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  esc, jsonParaScript, paginaMinuto, paginaArchivo, paginaAviso, sitemapMinutos,
  armarIcs, textoFalta, fechaLarga, horaLocal, textoUtc, idUrl, idCanonico, instanteDeId
} from "../netlify/lib/minuto-html.mjs";

const ID = "2026-12-24T03:33Z";
const INSTANTE = Date.UTC(2026, 11, 24, 3, 33);
const MALA = `</script><script>alert("x")</script><img src=x onerror='y'> & “fin”`;

function minuto(cambios = {}) {
  return {
    id: ID, instante: INSTANTE, zona: "America/Argentina/Buenos_Aires",
    local: { fecha: "2026-12-24", hora: "00:33" },
    estado: "aprobada", dedicatoria: "Para vos, que naciste a esta hora", prueba: false,
    vendido: INSTANTE - 86400000, pasado: false, ...cambios
  };
}
// Lo que hay entre <script type="application/ld+json"> y </script>
function jsonLd(html) {
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, "falta el JSON-LD");
  return m[1];
}
function datosCliente(html) {
  const m = /<script type="application\/json" id="minuto-datos">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, "faltan los datos del cliente");
  return m[1];
}

test("esc escapa lo que puede romper HTML o atributos", () => {
  assert.equal(esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  assert.equal(esc(null), "");
});

test("jsonParaScript no deja cerrar la etiqueta ni abrir comentarios", () => {
  const s = jsonParaScript({ t: "</script><!--  " });
  assert.ok(!s.includes("<"));
  assert.ok(!s.includes(">"));
  assert.ok(!s.includes(" "));
  assert.deepEqual(JSON.parse(s), { t: "</script><!--  " });
});

test("dedicatoria maliciosa aprobada: escapada en el cuerpo, en las meta y en el JSON-LD", () => {
  const html = paginaMinuto({ minuto: minuto({ dedicatoria: MALA }), lang: "es", ahora: INSTANTE - 1000 });
  // ninguna etiqueta del comprador entra viva al documento
  assert.ok(!html.includes("<script>alert"), "script crudo");
  assert.ok(!html.includes("<img src=x"), "img cruda");
  assert.ok(!html.includes(`alert("x")`), "comillas sin escapar");
  // solo hay los </script> propios: interno.js, JSON-LD, datos, certificado, cliente, visita.js
  const cierres = html.match(/<\/script>/g).length;
  const aperturas = html.match(/<script[\s>]/g).length;
  assert.equal(cierres, aperturas);
  // en el cuerpo aparece escapada
  assert.ok(html.includes("&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"));
  // el JSON-LD sigue siendo JSON válido y conserva el texto original
  const ld = JSON.parse(jsonLd(html));
  assert.equal(ld["@type"], "CreativeWork");
  assert.equal(ld.text, MALA);
  assert.ok(!jsonLd(html).includes("</script"));
  // los datos del cliente también
  const datos = JSON.parse(datosCliente(html));
  assert.equal(datos.dedicatoria, MALA);
  // y la descripción de la cabecera va escapada dentro del atributo
  const desc = /<meta name="description" content="([^"]*)">/.exec(html);
  assert.ok(desc && desc[1].includes("&lt;/script&gt;"));
});

test("dedicatoria pendiente o rechazada: no aparece en ningún lado", () => {
  for (const estado of ["pendiente", "rechazada"]) {
    const secreto = "TEXTO-NO-APROBADO-" + estado;
    const html = paginaMinuto({ minuto: minuto({ estado, dedicatoria: secreto }), lang: "es", ahora: INSTANTE - 1000 });
    assert.ok(!html.includes(secreto), estado + ": se filtró la dedicatoria");
    assert.equal(JSON.parse(datosCliente(html)).dedicatoria, null);
    assert.equal(JSON.parse(jsonLd(html)).text, undefined);
    if (estado === "pendiente") assert.ok(html.includes("La dedicatoria está esperando aprobación."));
    else assert.ok(html.includes("Este minuto es de alguien."));
  }
  const en = paginaMinuto({ minuto: minuto({ estado: "pendiente", dedicatoria: "nope" }), lang: "en", ahora: INSTANTE });
  assert.ok(en.includes("The dedication is waiting for approval."));
  assert.ok(!en.includes("nope"));
});

test("archivo: escapa y solo muestra aprobadas", () => {
  const html = paginaArchivo({
    lang: "es",
    minutos: [
      { id: ID, instante: INSTANTE, dedicatoria: MALA, estado: "aprobada", prueba: false },
      { id: "2026-12-23T10:00Z", instante: Date.UTC(2026, 11, 23, 10, 0), dedicatoria: "OCULTA", estado: "rechazada", prueba: true }
    ],
    sigue: 123
  });
  assert.ok(!html.includes("<script>alert"));
  assert.ok(!html.includes("OCULTA"));
  assert.ok(html.includes("Este minuto fue de alguien."));
  assert.ok(html.includes("/minuto/m/2026-12-24T03-33Z/"));
  assert.ok(html.includes("?antes=123"));
  const vacio = paginaArchivo({ lang: "es", minutos: [] });
  assert.ok(vacio.includes("Todavía no pasó ningún minuto regalado."));
  assert.ok(paginaArchivo({ lang: "en", minutos: [] }).includes("No gifted minute has passed yet."));
});

test("cabecera de la página de un minuto: canónica, hreflang, og:image, noindex en prueba", () => {
  const html = paginaMinuto({ minuto: minuto(), lang: "en", ahora: INSTANTE + 120000 });
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('<link rel="canonical" href="https://salehoy.com.ar/en/minute/m/2026-12-24T03-33Z/">'));
  assert.ok(html.includes('hreflang="es" href="https://salehoy.com.ar/minuto/m/2026-12-24T03-33Z/"'));
  assert.ok(html.includes('content="https://salehoy.com.ar/og/minuto.png?id=2026-12-24T03-33Z&amp;lang=en"'));
  assert.ok(html.includes('<script src="/interno.js"></script>'));
  assert.ok(html.includes('<script src="/visita.js" defer></script>'));
  assert.ok(!html.includes("noindex"));
  // después del minuto se ve el bloque "después"
  assert.match(html, /<section class="pm-momento" id="despues">/);
  assert.match(html, /<section class="pm-momento" id="antes" hidden>/);
  const prueba = paginaMinuto({ minuto: minuto({ prueba: true }), lang: "es", ahora: INSTANTE });
  assert.ok(prueba.includes('<meta name="robots" content="noindex">'));
  assert.ok(prueba.includes('class="prueba">prueba<'));
  assert.match(prueba, /<section class="pm-momento" id="durante">/);
});

test("fechas largas y horas en la zona del comprador, en es y en", () => {
  const zona = "America/Argentina/Buenos_Aires";
  assert.equal(horaLocal(INSTANTE, zona), "00:33");
  assert.equal(fechaLarga(INSTANTE, zona, "es"), "jueves, 24 de diciembre de 2026");
  assert.match(fechaLarga(INSTANTE, zona, "en"), /^Thursday,? 24 December 2026$/);
  assert.equal(textoUtc(INSTANTE), "2026-12-24 03:33 UTC");
  // zona inválida: UTC, sin romperse
  assert.equal(horaLocal(INSTANTE, "Marte/Olimpo"), "03:33");
  const html = paginaMinuto({ minuto: minuto(), lang: "es", ahora: INSTANTE - 1000 });
  assert.ok(html.includes("jueves, 24 de diciembre de 2026"));
  assert.ok(html.includes("hora de America/Argentina/Buenos Aires · 2026-12-24 03:33 UTC"));
});

test("cuenta regresiva", () => {
  assert.equal(textoFalta(3 * 86400000 + 4 * 3600000 + 12 * 60000 + 9000, "es"), "faltan 3 días 04:12:09");
  assert.equal(textoFalta(86400000 + 1000, "es"), "falta 1 día 00:00:01");
  assert.equal(textoFalta(5000, "en"), "00:00:05 to go");
  assert.equal(textoFalta(-10, "es"), "faltan 00:00:00");
});

test(".ics bien formado, sin nombres ni dedicatoria", () => {
  for (const lang of ["es", "en"]) {
    const html = paginaMinuto({ minuto: minuto({ dedicatoria: "SECRETO" }), lang, ahora: INSTANTE - 1000 });
    const t = JSON.parse(datosCliente(html)).t;
    const ics = armarIcs({ uid: "2026-12-24T03-33Z@salehoy.com.ar", sello: Date.UTC(2026, 10, 16, 12, 0, 5), instante: INSTANTE, titulo: t.icsTitulo, descripcion: t.icsDescripcion, url: "https://salehoy.com.ar/minuto/" });
    const lineas = ics.split("\r\n");
    assert.equal(lineas[0], "BEGIN:VCALENDAR");
    assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
    assert.ok(!/[^\r]\n/.test(ics), "saltos de línea sin CR");
    assert.ok(lineas.includes("DTSTART:20261224T033300Z"));
    assert.ok(lineas.includes("DTEND:20261224T033400Z"));
    assert.ok(lineas.includes("DTSTAMP:20261116T120005Z"));
    assert.ok(lineas.includes("TRIGGER:-PT5M"));
    assert.equal(lineas.filter((l) => l === "BEGIN:VEVENT").length, 1);
    assert.equal(lineas.filter((l) => l === "END:VEVENT").length, 1);
    assert.ok(!ics.includes("SECRETO"));
    // comas y punto y coma escapados en el texto
    const desc = lineas.find((l) => l.startsWith("DESCRIPTION:"));
    assert.ok(!/[^\\][,;]/.test(desc.slice("DESCRIPTION:".length)));
  }
  assert.ok(armarIcs({ uid: "a", sello: 0, instante: 0, titulo: "a, b; c\nd", descripcion: "", url: "u" }).includes("SUMMARY:a\\, b\\; c\\nd"));
});

test("identificadores", () => {
  assert.equal(idUrl(ID), "2026-12-24T03-33Z");
  assert.equal(idCanonico("2026-12-24T03-33Z"), ID);
  assert.equal(instanteDeId("2026-12-24T03-33Z"), INSTANTE);
  assert.equal(idCanonico("2026-02-30T00:00Z"), null);
  assert.equal(idCanonico("<script>"), null);
});

test("sitemap sin minutos de prueba, con hreflang", () => {
  const xml = sitemapMinutos([
    { id: ID, prueba: false }, { id: ID, prueba: false }, { id: "2026-12-25T00:00Z", prueba: true }
  ]);
  assert.ok(xml.includes("<loc>https://salehoy.com.ar/minuto/m/2026-12-24T03-33Z/</loc>"));
  assert.ok(xml.includes("<loc>https://salehoy.com.ar/en/minute/m/2026-12-24T03-33Z/</loc>"));
  assert.ok(!xml.includes("2026-12-25T00-00Z"));
  assert.equal(xml.match(/2026-12-24T03-33Z\/<\/loc>/g).length, 2);
  assert.ok(xml.includes('hreflang="es"') && xml.includes('hreflang="en"'));
});

test("aviso 404 mínimo, sin indexar", () => {
  const html = paginaAviso({ lang: "es" });
  assert.ok(html.includes("noindex"));
  assert.ok(html.includes("no es de nadie."));
  assert.ok(paginaAviso({ lang: "en", tipo: "error" }).includes("It could not be read."));
});
