// GET /api/interruptor/huella?h=<id> — una huella: desde dónde (ciudad y país) se cambió la luz y cuánto duró.
//   200 { id, accion, t, fin (null = sigue vigente), ciudad, pais, cc, ahora }   |   404
import { almacen } from "../lib/almacen.mjs";
import { leerHuella, ID_HUELLA } from "../lib/interruptor.mjs";

const SIN_CACHE = { "cache-control": "no-store" };

export default async (req) => {
  if (req.method !== "GET") return new Response(null, { status: 405, headers: { allow: "GET" } });
  const id = new URL(req.url).searchParams.get("h") || "";
  if (!ID_HUELLA.test(id)) return Response.json({ error: "no-existe" }, { status: 404, headers: SIN_CACHE });
  try {
    const h = await leerHuella(almacen("interruptor"), id);
    if (!h) return Response.json({ error: "no-existe" }, { status: 404, headers: SIN_CACHE });
    // No se guarda en caché: lleva la hora del servidor, y una huella vigente puede cerrarse en cualquier momento.
    return Response.json({ ...h, ahora: Date.now() }, { headers: SIN_CACHE });
  } catch (error) {
    console.error("interruptor-huella:", error && error.message);
    return Response.json({ error: "interno" }, { status: 500, headers: SIN_CACHE });
  }
};

export const config = { path: "/api/interruptor/huella" };
