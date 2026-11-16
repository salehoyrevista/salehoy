// POST /api/admin/reembolso { id, hash } (cabecera x-admin) — anota el hash de un reembolso hecho a mano.
// `id` es el de un minuto ("2026-12-24T03:33Z") o el hash de un pago huérfano.
import { almacen } from "../lib/almacen.mjs";
import { esAdmin, hayAdmin, secreto, firmar } from "../lib/ajustes.mjs";
import { controlAdmin, anotarReembolso, json, leerCuerpo } from "../lib/minuto.mjs";

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
    const r = await anotarReembolso(alm, { id: d.id, hash: d.hash, ahora });
    return json(r.cuerpo, r.status);
  } catch (error) {
    console.error("admin-reembolso:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/admin/reembolso" };
