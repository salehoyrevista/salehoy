// GET /api/minuto/archivo?antes=<ms>&n=50 — minutos que ya pasaron, del más reciente al más viejo.
import { almacen } from "../lib/almacen.mjs";
import { listarArchivo, json } from "../lib/minuto.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const q = new URL(req.url).searchParams;
  const antes = /^\d{1,15}$/.test(q.get("antes") || "") ? Number(q.get("antes")) : null;
  const n = /^\d{1,3}$/.test(q.get("n") || "") ? Number(q.get("n")) : 50;
  try {
    return json(await listarArchivo(almacen("minuto"), { antes, n: Math.min(n, 200), ahora: Date.now() }));
  } catch (error) {
    console.error("minuto-archivo:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/archivo" };
