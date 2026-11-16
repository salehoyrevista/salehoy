// /minuto/sitemap.xml — las páginas de los minutos vendidos, en español e inglés.
//
// Recorre el archivo (minutos ya pasados) de a 200 y deja afuera los de prueba. El contrato de
// la biblioteca no tiene una forma de listar los minutos futuros, así que por ahora solo entran
// los pasados: cada minuto aparece acá cuando ocurre.
import { almacen } from "../lib/almacen.mjs";
import { listarArchivo } from "../lib/minuto.mjs";
import { sitemapMinutos } from "../lib/minuto-html.mjs";

const POR_VUELTA = 200;
const VUELTAS = 100;       // tope: 20.000 minutos (40.000 direcciones; un sitemap admite 50.000)

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });

  const minutos = [];
  let fallo = false;
  try {
    const alm = almacen("minuto");
    let antes = null;
    for (let i = 0; i < VUELTAS; i++) {
      const opciones = { n: POR_VUELTA };
      if (antes) opciones.antes = antes;
      const lista = (await listarArchivo(alm, opciones)) || {};
      if (Array.isArray(lista.minutos)) minutos.push(...lista.minutos);
      // se corta si no hay más o si "sigue" no avanza (para no girar en falso)
      if (typeof lista.sigue !== "number" || lista.sigue === antes) break;
      antes = lista.sigue;
    }
  } catch (error) {
    console.error("minuto-sitemap:", error);
    fallo = true;
    // con lo que se haya juntado: un sitemap corto es mejor que un error para el buscador
  }

  return new Response(sitemapMinutos(minutos), {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": fallo ? "public, s-maxage=60" : "public, s-maxage=3600"
    }
  });
};

export const config = { path: "/minuto/sitemap.xml" };
