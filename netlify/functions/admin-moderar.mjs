// POST /api/admin/moderar { id, decision: "aprobar" | "rechazar", nota? } (cabecera x-admin).
// Rechazar deja el reembolso pendiente: se devuelve a mano y se anota con /api/admin/reembolso.
import { almacen } from "../lib/almacen.mjs";
import { esAdmin, hayAdmin, secreto, firmar } from "../lib/ajustes.mjs";
import { controlAdmin, moderar, json, leerCuerpo } from "../lib/minuto.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  try {
    const alm = almacen("minuto");
    const ahora = Date.now();
    const persona = firmar(await secreto(alm), "admin|" + ((context && context.ip) || ""));
    const no = await controlAdmin(alm, { clave: req.headers.get("x-admin"), persona, ahora, esAdmin, hayAdmin });
    if (no) return json(no.cuerpo, no.status);
    const d = await leerCuerpo(req);
    if (!d) return json({ error: "formato" }, 422);
    const r = await moderar(alm, { id: d.id, decision: d.decision, nota: d.nota, ahora });
    return json(r.cuerpo, r.status);
  } catch (error) {
    console.error("admin-moderar:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/admin/moderar" };
