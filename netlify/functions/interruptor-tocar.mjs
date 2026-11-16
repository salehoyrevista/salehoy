// POST /api/interruptor/tocar { ficha, llave? } — tocar el interruptor.
//
//   200 { estado, huella: { id, accion, t }, hasta }     el toque entró; `hasta`: cuándo puede volver a tocar
//   429 { error: "espera", hasta, motivo }                ya tocó (5 min) o alguien acaba de tocar (1,5 s)
//   423 { error: "minuto", id, hasta }                    este minuto es de alguien y no trajo su llave
//   403                                                   no parece una persona en la página (ficha, origen, bot)
//
// La IP se usa una sola vez, en memoria, para calcular un HMAC que rota cada día (personaDe).
// No se guarda ni se escribe en los registros. Del toque queda solo ciudad y país.
import { almacen } from "../lib/almacen.mjs";
import { secreto } from "../lib/ajustes.mjs";
import { minutoVigente, esLlaveDelMinuto } from "../lib/minuto-vigente.mjs";
import { difundir, urlVivo } from "../lib/difusion.mjs";
import { tocar, verificarFicha, personaDe, estadoPublico, limpiarLimites, ESPERA_SONDEO } from "../lib/interruptor.mjs";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|scrapy|httpclient/i;   // la misma de visita.mjs
const SITIOS = ["https://salehoy.com.ar", "https://www.salehoy.com.ar"];
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
const SIN_CACHE = { "cache-control": "no-store" };

const json = (cuerpo, status) => Response.json(cuerpo, { status, headers: SIN_CACHE });
const prohibido = () => json({ error: "prohibido" }, 403);

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });

  // ¿Viene de la página, de un navegador de verdad?
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return prohibido();
  if (!/^application\/json\b/i.test(req.headers.get("content-type") || "")) return prohibido();
  const origen = req.headers.get("origin") || "";
  let propio = "";
  try { propio = new URL(req.url).origin; } catch (e) {}
  if (!origen || !(SITIOS.includes(origen) || LOCAL.test(origen) || origen === propio)) return prohibido();

  let cuerpo;
  try { cuerpo = await req.json(); } catch (e) { return prohibido(); }
  if (!cuerpo || typeof cuerpo !== "object") return prohibido();

  try {
    const ahora = Date.now();
    const alm = almacen("interruptor");
    const sec = await secreto(alm);
    if (!verificarFicha(sec, cuerpo.ficha, ahora)) return prohibido();

    // ¿Este minuto es de alguien? Si la otra obra no contesta, el interruptor sigue siendo de todos.
    let minuto = null, llaveValida = false;
    try {
      minuto = await minutoVigente(ahora);
      if (minuto && typeof cuerpo.llave === "string" && cuerpo.llave.length <= 200) {
        llaveValida = (await esLlaveDelMinuto(minuto.id, cuerpo.llave)) === true;
      }
    } catch (error) {
      console.error("interruptor-tocar: minuto:", error && error.message);
      minuto = null;
    }

    const geo = (context && context.geo) || {};
    const pais = geo.country || {};
    const r = await tocar(alm, {
      ahora,
      persona: personaDe(sec, context && context.ip, ahora),
      ciudad: geo.city || "",
      pais: pais.name || "",
      cc: pais.code || "",
      llaveValida,
      minuto
    });

    if (!r.ok) {
      if (r.estado === 423) return json({ error: "minuto", id: r.id, hasta: r.hasta }, 423);
      return json({ error: "espera", hasta: r.hasta, motivo: r.motivo }, 429);
    }

    const publico = estadoPublico(r.estado, { ahora, minuto, vivo: urlVivo(), espera: ESPERA_SONDEO });
    // Avisar a quienes miran y barrer límites vencidos: después de responder si la plataforma lo permite.
    const despues = Promise.all([
      difundir(publico),
      limpiarLimites(alm, ahora).catch(() => 0)
    ]);
    if (context && typeof context.waitUntil === "function") context.waitUntil(despues);
    else await despues;

    return json({ estado: publico, huella: r.huella, hasta: r.hasta }, 200);
  } catch (error) {
    console.error("interruptor-tocar:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/interruptor/tocar" };
