// Vigía de "El minuto": corre cada 15 minutos (función programada de Netlify).
//
//   - Si a un minuto vendido le faltan menos de 24 h y su dedicatoria sigue pendiente: avisa (una vez).
//   - Si el minuto llegó sin dedicatoria aprobada (se mostró el mensaje neutro): avisa (una vez).
//   - Borra claves auxiliares viejas (montos y límites vencidos).
// Los avisos no llevan la dedicatoria ni datos de nadie (ver ../lib/avisos.mjs).
import { almacen } from "../lib/almacen.mjs";
import { avisosPendientes, limpiar } from "../lib/minuto.mjs";
import { avisar } from "../lib/avisos.mjs";

export default async () => {
  const alm = almacen("minuto");
  const ahora = Date.now();
  try {
    for (const { id, tipo } of await avisosPendientes(alm, ahora)) await avisar(alm, tipo, id);
  } catch (error) {
    console.error("minuto-vigia: avisos:", error && error.message);
  }
  try {
    await limpiar(alm, ahora);
  } catch (error) {
    console.error("minuto-vigia: limpieza:", error && error.message);
  }
  return new Response(null, { status: 204 });
};

export const config = { schedule: "*/15 * * * *" };
