// /og/estrella.png?tx=0x… — vista previa (Open Graph, PNG 1200x630) de la estrella de un regalo.
//
// Solo se dibuja si la transacción es de verdad un regalo de la obra (verificarRegalo): nunca una
// estrella que no existe. El asterisco tiene la misma forma que en el cielo del sitio, porque sale
// de la misma clave con el mismo algoritmo (formaDeClave en ../lib/dibujo.mjs).
// Una transacción confirmada no cambia: la imagen queda en caché para siempre. Las redirecciones a
// la imagen genérica /og.png no se guardan, porque un regalo recién enviado puede tardar en verse.
import { verificarRegalo } from "../lib/cadena.mjs";
import { imagenEstrella } from "../lib/dibujo.mjs";

const HASH = /^0x[0-9a-fA-F]{64}$/;

const CABECERAS_PNG = {
  "content-type": "image/png",
  "cache-control": "public, max-age=31536000, immutable",
  "netlify-cdn-cache-control": "public, durable, s-maxage=31536000",
};

function aGenerica() {
  return new Response(null, { status: 302, headers: { location: "/og.png", "cache-control": "no-store" } });
}

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });

  const tx = new URL(req.url).searchParams.get("tx");
  if (!tx || !HASH.test(tx)) return aGenerica();

  try {
    const regalo = await verificarRegalo(tx);
    if (!regalo || typeof regalo.clave !== "string" || !regalo.clave) return aGenerica();
    return new Response(imagenEstrella(regalo.clave), { status: 200, headers: CABECERAS_PNG });
  } catch (error) {
    console.error("og-estrella:", error);
    return aGenerica();
  }
};

export const config = { path: "/og/estrella.png" };
