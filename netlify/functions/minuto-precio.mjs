// GET /api/minuto/precio?fecha=YYYY-MM-DD&hora=HH:MM&zona=<IANA> — precio y disponibilidad de un minuto.
import { almacen } from "../lib/almacen.mjs";
import { consultar, json } from "../lib/minuto.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const q = new URL(req.url).searchParams;
  try {
    const r = await consultar(almacen("minuto"), {
      fecha: q.get("fecha") || "", hora: q.get("hora") || "", zona: q.get("zona") || "", ahora: Date.now()
    });
    return json(r.cuerpo, r.status);
  } catch (error) {
    console.error("minuto-precio:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/precio" };
