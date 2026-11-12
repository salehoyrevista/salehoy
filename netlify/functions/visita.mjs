// /api/visita — suma una visita al contador del día.
//
// No usa cookies, no guarda IP ni identificadores: solo incrementa números
// (por página, idioma y dominio de origen) en Netlify Blobs. Con poco tráfico,
// dos visitas simultáneas pueden pisarse y contarse como una: alcanza para
// ver tendencias.
import { getStore } from "@netlify/blobs";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|scrapy|httpclient/i;
const EVENTOS = ["clic-regalar", "regalo-enviado", "ya-regale", "copiar-direccion", "copiar-enlace", "estela-imagen", "estela-video", "estela-enlace", "sonido"];
const TOPE = 150;   // claves distintas por día en cada tabla

function sumar(tabla, clave) {
  if (!(clave in tabla) && Object.keys(tabla).length >= TOPE) clave = "(otros)";
  tabla[clave] = (tabla[clave] || 0) + 1;
}

export default async function (req) {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });   // los bots se cuentan aparte

  let d;
  try { d = await req.json(); } catch { return new Response(null, { status: 400 }); }

  const dia = new Date().toISOString().slice(0, 10);
  const store = getStore("visitas");
  const datos = (await store.get(dia, { type: "json" })) ||
    { visitas: 0, porEnlaceDeAsterisco: 0, paginas: {}, idiomas: {}, origenes: {}, eventos: {} };

  if (typeof d.e === "string") {
    if (!EVENTOS.includes(d.e)) return new Response(null, { status: 204 });
    datos.eventos = datos.eventos || {};
    sumar(datos.eventos, d.e);
  } else {
    const pagina = typeof d.p === "string" && /^\/[\w\-./]{0,80}$/.test(d.p) ? d.p : "(otra)";
    const idioma = typeof d.l === "string" && /^[a-z]{2}$/.test(d.l) ? d.l : "?";
    let origen = typeof d.r === "string" ? d.r.toLowerCase().replace(/^www\./, "").slice(0, 60) : "";
    if (!origen) origen = "(directo)";
    else if (origen === "salehoy.com.ar") origen = "(interno)";
    else if (!/^[a-z0-9.\-]+$/.test(origen)) origen = "(otro)";
    datos.visitas++;
    if (d.n) datos.porEnlaceDeAsterisco++;
    if (d.s) datos.porEnlaceDeEstela = (datos.porEnlaceDeEstela || 0) + 1;
    sumar(datos.paginas, pagina);
    sumar(datos.idiomas, idioma);
    sumar(datos.origenes, origen);
  }

  await store.setJSON(dia, datos);
  return new Response(null, { status: 204 });
}

export const config = { path: "/api/visita" };
