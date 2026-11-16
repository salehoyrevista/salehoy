// GET /api/minuto/m?id=<id> — un minuto vendido. La dedicatoria solo si está aprobada.
import { almacen } from "../lib/almacen.mjs";
import { leerMinutoPublico, json } from "../lib/minuto.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const id = new URL(req.url).searchParams.get("id") || "";
  try {
    const m = await leerMinutoPublico(almacen("minuto"), id, Date.now());
    return m ? json(m) : json({ error: "no-existe" }, 404);
  } catch (error) {
    console.error("minuto-m:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/m" };
