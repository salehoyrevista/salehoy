// POST /api/admin/borrar-pruebas (cabecera x-admin) — borra los minutos de prueba.
//
// Se corre una vez al pasar a modo real (SALES_ADDRESS + MINUTO_MODO=real), por ejemplo:
//   curl -X POST https://salehoy.com.ar/api/admin/borrar-pruebas -H "x-admin: <contraseña>"
// Solo borra minutos con `prueba: true`; los vendidos en modo real no se tocan.
import { almacen } from "../lib/almacen.mjs";
import { esAdmin, hayAdmin, secreto, firmar } from "../lib/ajustes.mjs";
import { controlAdmin, borrarPruebas, json } from "../lib/minuto.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  try {
    const alm = almacen("minuto");
    const ahora = Date.now();
    const persona = firmar(await secreto(alm), "admin|" + ((context && context.ip) || ""));
    const no = await controlAdmin(alm, { clave: req.headers.get("x-admin"), persona, ahora, esAdmin, hayAdmin });
    if (no) return json(no.cuerpo, no.status);
    return json(await borrarPruebas(alm));
  } catch (error) {
    console.error("admin-borrar-pruebas:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/admin/borrar-pruebas" };
