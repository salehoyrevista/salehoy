// POST /api/minuto/pagar { reserva, hash } | { reserva, simulado: true } — confirma un pago.
//
// El servidor verifica en la red: destino (dirección de ventas), token (USDC de la red del modo),
// monto exacto, transacción exitosa, confirmaciones suficientes y que el hash no se haya usado.
// Recién ahí el minuto pasa a vendido y se entrega la llave del dueño, una sola vez.
import { almacen } from "../lib/almacen.mjs";
import { ventas } from "../lib/ajustes.mjs";
import { confirmarPago, json, leerCuerpo } from "../lib/minuto.mjs";
import { avisar } from "../lib/avisos.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  const d = await leerCuerpo(req);
  if (!d) return json({ error: "formato" }, 422);
  try {
    const alm = almacen("minuto");
    const r = await confirmarPago(alm, {
      reserva: d.reserva, hash: d.hash, simulado: d.simulado === true, ahora: Date.now(), ventas: ventas()
    });
    if (r.status === 200) {
      const aviso = avisar(alm, "vendido", r.cuerpo.id).catch(() => false);
      if (context && typeof context.waitUntil === "function") context.waitUntil(aviso); else await aviso;
    }
    return json(r.cuerpo, r.status);
  } catch (error) {
    // La red no contestó: se puede volver a intentar con el mismo hash.
    console.error("minuto-pagar:", error && error.message);
    return json({ error: "red" }, 503);
  }
};

export const config = { path: "/api/minuto/pagar" };
