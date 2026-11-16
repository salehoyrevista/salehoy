// GET /api/interruptor — el estado de la luz, igual para todo el mundo.
//
// Es lo que consultan las páginas abiertas cada pocos segundos cuando no hay tiempo real. Para que
// ese sondeo no gaste una invocación por persona, la red de Netlify guarda la respuesta 3 segundos:
// mil personas mirando cuestan lo mismo que una. El navegador no la guarda nunca.
import { almacen } from "../lib/almacen.mjs";
import { minutoVigente } from "../lib/minuto-vigente.mjs";
import { urlVivo } from "../lib/difusion.mjs";
import { leerEstado, estadoPublico, ESPERA_SONDEO } from "../lib/interruptor.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  try {
    const ahora = Date.now();
    const alm = almacen("interruptor");
    const [est, minuto] = await Promise.all([
      leerEstado(alm, ahora),
      minutoVigente(ahora).catch(() => null)
    ]);
    return Response.json(estadoPublico(est, { ahora, minuto, vivo: urlVivo(), espera: ESPERA_SONDEO }), {
      headers: {
        "cache-control": "public, max-age=0",
        "netlify-cdn-cache-control": "public, s-maxage=3"
      }
    });
  } catch (error) {
    console.error("interruptor:", error && error.message);
    return Response.json({ error: "interno" }, { status: 500, headers: { "cache-control": "no-store" } });
  }
};

export const config = { path: "/api/interruptor" };
