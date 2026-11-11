// /sitemap.xml — se arma al construir, con las alternativas por idioma.
import { SITIO, RUTAS, S } from "../lib/obra.js";

const ruta = (l) => (l === "es" ? "/" : `/${l}/`);

// Cada grupo es una misma página en varios idiomas.
const grupos = [
  { defecto: "es", paginas: Object.fromEntries(S.IDIOMAS.map((l) => [l, ruta(l)])) },
  { defecto: "en", paginas: { es: RUTAS.es.estrella, en: RUTAS.en.estrella, pt: RUTAS.pt.estrella } },
  { defecto: "en", paginas: { es: RUTAS.es.frases, en: RUTAS.en.frases, pt: RUTAS.pt.frases } },
  { defecto: "en", paginas: { es: RUTAS.es.sobre, en: RUTAS.en.sobre } },
  { defecto: "en", paginas: { en: "/agentes/" } },
  { defecto: "es", paginas: { es: "/regalo.html" } }
];

export function GET() {
  const hoy = new Date().toISOString().slice(0, 10);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const g of grupos) {
    const idiomas = Object.keys(g.paginas);
    for (const l of idiomas) {
      xml += "  <url>\n    <loc>" + SITIO + g.paginas[l] + "</loc>\n    <lastmod>" + hoy + "</lastmod>\n";
      if (idiomas.length > 1) {
        for (const o of idiomas) xml += '    <xhtml:link rel="alternate" hreflang="' + o + '" href="' + SITIO + g.paginas[o] + '"/>\n';
        xml += '    <xhtml:link rel="alternate" hreflang="x-default" href="' + SITIO + g.paginas[g.defecto] + '"/>\n';
      }
      xml += "  </url>\n";
    }
  }
  xml += "</urlset>\n";
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
