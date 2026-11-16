// /minuto/m/<idurl>/ y /en/minute/m/<idurl>/ — la página permanente de un minuto vendido.
//
// Se arma en el servidor (HTML completo, indexable) con lo que guarda el almacén de "El minuto".
// La dedicatoria solo aparece si está aprobada; el armado y los escapes están en
// ../lib/minuto-html.mjs. Si el minuto no existe o no está vendido: 404 con una página mínima.
import { almacen } from "../lib/almacen.mjs";
import { leerMinutoPublico } from "../lib/minuto.mjs";
import { paginaMinuto, paginaAviso, idCanonico, idUrl, RUTAS } from "../lib/minuto-html.mjs";

const HTML = { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff" };

const respuesta = (html, status, cache) => new Response(html, { status, headers: { ...HTML, ...cache } });
const SIN_CACHE = { "cache-control": "no-store" };
const UN_MINUTO = { "cache-control": "public, max-age=0, must-revalidate", "netlify-cdn-cache-control": "public, s-maxage=60" };

export default async (req, context) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });

  const url = new URL(req.url);
  const lang = url.pathname.startsWith("/en/") ? "en" : "es";
  let crudo = (context && context.params && context.params.id) || "";
  if (!crudo) { const m = /\/m\/([^/]+)\/?$/.exec(url.pathname); crudo = m ? m[1] : ""; }
  try { crudo = decodeURIComponent(crudo); } catch (e) { crudo = ""; }

  const id = idCanonico(crudo);        // "2026-12-24T03:33Z"
  const idurl = idUrl(crudo);          // "2026-12-24T03-33Z"
  if (!id) return respuesta(paginaAviso({ lang }), 404, SIN_CACHE);

  // Una sola dirección por minuto: con guion y con barra final.
  const canonica = RUTAS[lang].pagina(idurl);
  if (url.pathname !== canonica) return new Response(null, { status: 301, headers: { location: canonica, "cache-control": "public, max-age=3600" } });

  try {
    const minuto = await leerMinutoPublico(almacen("minuto"), id);
    if (!minuto) return respuesta(paginaAviso({ lang }), 404, SIN_CACHE);
    return respuesta(paginaMinuto({ minuto: { ...minuto, id }, lang, ahora: Date.now() }), 200, UN_MINUTO);
  } catch (error) {
    console.error("minuto-pagina:", error);
    return respuesta(paginaAviso({ lang, tipo: "error" }), 500, SIN_CACHE);
  }
};

export const config = { path: ["/minuto/m/:id", "/minuto/m/:id/", "/en/minute/m/:id", "/en/minute/m/:id/"] };
