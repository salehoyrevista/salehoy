// POST /api/minuto/reservar { fecha, hora, zona, dedicatoria, lang } — reserva un minuto 15 minutos.
//
// Límite: 3 reservas vigentes y 10 por hora por persona. "Persona" es una firma de la IP y el día
// con un secreto: la IP no se guarda ni se registra en ningún lado.
import { almacen } from "../lib/almacen.mjs";
import { ventas, secreto, firmar } from "../lib/ajustes.mjs";
import { reservar, json, leerCuerpo } from "../lib/minuto.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  const d = await leerCuerpo(req);
  if (!d) return json({ error: "formato" }, 422);
  try {
    const alm = almacen("minuto");
    const ahora = Date.now();
    const ip = (context && context.ip) || "";
    const persona = firmar(await secreto(alm), ip + "|" + new Date(ahora).toISOString().slice(0, 10));
    const r = await reservar(alm, {
      fecha: d.fecha, hora: d.hora, zona: d.zona, dedicatoria: d.dedicatoria, lang: d.lang,
      ahora, persona, ventas: ventas()
    });
    return json(r.cuerpo, r.status);
  } catch (error) {
    console.error("minuto-reservar:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/reservar" };
