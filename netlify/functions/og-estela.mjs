// /og/estela.png?e=… — vista previa (Open Graph, PNG 1200x630) de la estela de una visita.
//
// La estela viaja entera en la URL (ver decodificarEstela en ../lib/dibujo.mjs), así que la imagen
// es una función pura de la URL: se dibuja una vez y queda en caché para siempre.
// Si `e` falta o no es válida, se redirige a la imagen genérica /og.png.
import { decodificarEstela, imagenEstela } from "../lib/dibujo.mjs";

const CABECERAS_PNG = {
  "content-type": "image/png",
  "cache-control": "public, max-age=31536000, immutable",
  "netlify-cdn-cache-control": "public, durable, s-maxage=31536000",
};

function aGenerica() {
  return new Response(null, { status: 302, headers: { location: "/og.png", "cache-control": "public, max-age=300" } });
}

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });

  const estela = decodificarEstela(new URL(req.url).searchParams.get("e"));
  if (!estela) return aGenerica();

  try {
    return new Response(imagenEstela(estela), { status: 200, headers: CABECERAS_PNG });
  } catch (error) {
    console.error("og-estela:", error);
    return aGenerica();
  }
};

export const config = { path: "/og/estela.png" };
