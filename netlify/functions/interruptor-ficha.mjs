// GET /api/interruptor/ficha — la ficha que hay que traer para poder tocar.
//
// Antibots sin captcha: la página la pide al cargar y recién puede usarla 1,2 s después (y hasta
// 10 minutos). No guarda nada: es la hora del servidor firmada. De paso, como esta respuesta nunca
// se guarda en caché, la página la usa para poner en hora sus relojes.
import { almacen } from "../lib/almacen.mjs";
import { secreto } from "../lib/ajustes.mjs";
import { emitirFicha, FICHA_MINIMA } from "../lib/interruptor.mjs";

export default async (req) => {
  if (req.method !== "GET") return new Response(null, { status: 405, headers: { allow: "GET" } });
  try {
    const ahora = Date.now();
    const sec = await secreto(almacen("interruptor"));
    return Response.json({ ficha: emitirFicha(sec, ahora), espera: FICHA_MINIMA, ahora }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("interruptor-ficha:", error && error.message);
    return Response.json({ error: "interno" }, { status: 500, headers: { "cache-control": "no-store" } });
  }
};

export const config = { path: "/api/interruptor/ficha" };
