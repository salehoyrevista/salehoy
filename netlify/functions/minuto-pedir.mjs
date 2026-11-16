// POST /api/minuto/pedir { fecha, hora, zona, dedicatoria, lang } — pide un minuto, gratis.
//
// Límites: un minuto por persona cada 7 días y un tope de pedidos por día en todo el mundo.
// "Persona" es una firma de la IP y la semana con un secreto: la IP no se guarda ni se registra.
// Contra bots: origen del propio sitio, JSON y un navegador que no se anuncie como automático.
import { almacen } from "../lib/almacen.mjs";
import { secreto, firmar } from "../lib/ajustes.mjs";
import { pedir, json, leerCuerpo, DIA } from "../lib/minuto.mjs";
import { avisar } from "../lib/avisos.mjs";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|scrapy|httpclient/i;   // la misma de visita.mjs
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** Semana fija de 7 días contada desde el 1/1/1970 (alcanza para separar personas por semana). */
const semana = (ms) => Math.floor(ms / (7 * DIA));

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  const ua = req.headers.get("user-agent") || "";
  const origen = req.headers.get("origin") || "";
  let propio = "";
  try { propio = new URL(req.url).origin; } catch (e) {}
  const origenOk = origen === "https://salehoy.com.ar" || origen === propio || LOCAL.test(origen);
  const tipoOk = (req.headers.get("content-type") || "").toLowerCase().startsWith("application/json");
  if (!ua || BOT.test(ua) || !origenOk || !tipoOk) return json({ error: "prohibido" }, 403);

  const d = await leerCuerpo(req);
  if (!d) return json({ error: "formato" }, 422);
  try {
    const alm = almacen("minuto");
    const ahora = Date.now();
    const ip = (context && context.ip) || "sin-ip";
    const persona = firmar(await secreto(alm), "pedir|" + ip + "|" + semana(ahora)).slice(0, 32);
    const r = await pedir(alm, {
      fecha: d.fecha, hora: d.hora, zona: d.zona, dedicatoria: d.dedicatoria, lang: d.lang,
      ahora, persona
    });
    if (r.status === 200) {
      const aviso = avisar(alm, "vendido", r.cuerpo.id).catch(() => false);
      if (context && typeof context.waitUntil === "function") context.waitUntil(aviso); else await aviso;
    }
    return json(r.cuerpo, r.status);
  } catch (error) {
    console.error("minuto-pedir:", error && error.message);
    return json({ error: "interno" }, 500);
  }
};

export const config = { path: "/api/minuto/pedir" };
