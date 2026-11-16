// GET /api/admin/minutos?estado=pendiente|todas — minutos vendidos para moderar (cabecera x-admin).
// Incluye los pagos huérfanos (llegaron tarde, se devuelven a mano).
import { almacen } from "../lib/almacen.mjs";
import { esAdmin, hayAdmin, secreto, firmar } from "../lib/ajustes.mjs";
import { controlAdmin, listarParaAdmin, json } from "../lib/minuto.mjs";

export default async (req, context) => {
  if (req.method !== "GET") return new Response(null, { status: 405, headers: { allow: "GET" } });
  try {
    const alm = almacen("minuto");
    const ahora = Date.now();
    const persona = firmar(await secreto(alm), "admin|" + ((context && context.ip) || ""));
    const no = await controlAdmin(alm, { clave: req.headers.get("x-admin"), persona, ahora, esAdmin, hayAdmin });
    if (no) return json(no.cuerpo, no.status);
    const estado = new URL(req.url).searchParams.get("estado") === "todas" ? "todas" : "pendiente";
    const r = await listarParaAdmin(alm, { estado, ahora });
    return json({ ...r, ahora });
  } catch (error) {
    console.error("admin-minutos:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/admin/minutos" };
