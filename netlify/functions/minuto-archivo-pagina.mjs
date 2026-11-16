// /minuto/archivo/ y /en/minute/archive/ — archivo público de los minutos que ya pasaron.
//
// HTML armado en el servidor, indexable, de a 50 minutos por página (?antes=<ms> para seguir).
// Las dedicatorias solo aparecen si están aprobadas (ver ../lib/minuto-html.mjs).
import { almacen } from "../lib/almacen.mjs";
import { listarArchivo } from "../lib/minuto.mjs";
import { paginaArchivo, paginaAviso, RUTAS } from "../lib/minuto-html.mjs";

const HTML = { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff" };
const POR_PAGINA = 50;

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });

  const url = new URL(req.url);
  const lang = url.pathname.startsWith("/en/") ? "en" : "es";
  const canonica = RUTAS[lang].archivo;
  if (url.pathname !== canonica) {
    return new Response(null, { status: 301, headers: { location: canonica + url.search, "cache-control": "public, max-age=3600" } });
  }

  const pedido = url.searchParams.get("antes");
  const antes = pedido && /^\d{1,15}$/.test(pedido) ? Number(pedido) : null;

  try {
    const opciones = { n: POR_PAGINA };
    if (antes) opciones.antes = antes;
    const lista = (await listarArchivo(almacen("minuto"), opciones)) || {};
    const html = paginaArchivo({
      minutos: Array.isArray(lista.minutos) ? lista.minutos : [],
      sigue: typeof lista.sigue === "number" ? lista.sigue : null,
      antes, lang
    });
    return new Response(html, {
      status: 200,
      headers: { ...HTML, "cache-control": "public, max-age=0, must-revalidate", "netlify-cdn-cache-control": "public, s-maxage=60" }
    });
  } catch (error) {
    console.error("minuto-archivo-pagina:", error);
    return new Response(paginaAviso({ lang, tipo: "error" }), { status: 500, headers: { ...HTML, "cache-control": "no-store" } });
  }
};

export const config = { path: ["/minuto/archivo", "/minuto/archivo/", "/en/minute/archive", "/en/minute/archive/"] };
