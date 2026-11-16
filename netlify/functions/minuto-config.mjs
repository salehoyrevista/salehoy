// GET /api/minuto/config — modo de venta, red, dirección de ventas y tabla de precios.
// La dirección es la de ventas de "El minuto" (SALES_ADDRESS), nunca la de "Sin motivo".
import { ventas } from "../lib/ajustes.mjs";
import { preciosPublicos } from "../lib/precios.mjs";
import { DEDICATORIA_MAX } from "../lib/filtro.mjs";
import { json, redPublica, RESERVA_MS } from "../lib/minuto.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const v = ventas();
  return json({
    modo: v.modo,
    prueba: v.prueba,
    red: redPublica(v.red),
    direccion: v.direccion || "",
    precios: preciosPublicos(),
    reservaMinutos: RESERVA_MS / 60000,
    dedicatoriaMax: DEDICATORIA_MAX,
    confirmaciones: v.red.confirmaciones
  });
};

export const config = { path: "/api/minuto/config" };
