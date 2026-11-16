// GET /api/minuto/ahora — qué minuto se está mostrando y cuáles vienen en las próximas 24 h.
//
// La portada pregunta seguido: el CDN guarda la respuesta 5 segundos. Si el minuto en curso no tiene
// la dedicatoria aprobada se muestra un mensaje neutro y se avisa al dueño (una sola vez).
import { almacen } from "../lib/almacen.mjs";
import { ventas } from "../lib/ajustes.mjs";
import { ahoraPublico, json } from "../lib/minuto.mjs";
import { avisar } from "../lib/avisos.mjs";

const CACHE = { "cache-control": "public, max-age=0", "netlify-cdn-cache-control": "public, s-maxage=5" };

export default async (req, context) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  try {
    const alm = almacen("minuto");
    const r = await ahoraPublico(alm, { ahora: Date.now(), modo: ventas().modo });
    if (r.minuto && r.minuto.estado === "neutra" && context && typeof context.waitUntil === "function") {
      context.waitUntil(avisar(alm, "neutro", r.minuto.id).catch(() => false));
    }
    return json(r, 200, CACHE);
  } catch (error) {
    console.error("minuto-ahora:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/ahora" };
