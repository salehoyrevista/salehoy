// Vista previa propia para los enlaces que se comparten.
//
// Cuando la dirección trae una estela (?e=…) o un asterisco (?n=N o ?tx=0x…),
// cambia la imagen de vista previa (Open Graph) de la página por la de esa
// pieza: /og/estela.png o /og/estrella.png. Así, al pegar el enlace en
// WhatsApp, Instagram o X se ve la estela o la estrella, no la imagen general.
//
// No inventa nada: la estela sale de la propia dirección, y la estrella solo
// se dibuja si la transacción es un regalo verificado (lo comprueba
// /og/estrella.png). Si algo falla, la página se sirve tal cual.
import { getStore } from "@netlify/blobs";

const SITIO = "https://salehoy.com.ar";

export default async function (request, context) {
  const url = new URL(request.url);
  const e = url.searchParams.get("e");
  const n = url.searchParams.get("n");
  const tx = url.searchParams.get("tx");
  if (!e && !n && !tx) return;

  let imagen = null;
  if (e && /^[A-Za-z0-9_-]{8,640}$/.test(e)) {
    imagen = "/og/estela.png?e=" + e;
  } else if (tx && /^0x[0-9a-fA-F]{64}$/.test(tx)) {
    imagen = "/og/estrella.png?tx=" + tx;
  } else if (n && /^\d{1,6}$/.test(n)) {
    try {
      const registro = await getStore("cielo").get("regalos", { type: "json" });
      const regalo = registro && registro.regalos && registro.regalos[parseInt(n, 10) - 1];
      if (regalo) imagen = "/og/estrella.png?tx=" + regalo.hash;
    } catch (err) {}
  }
  if (!imagen) return;

  const respuesta = await context.next();
  const tipo = respuesta.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) return respuesta;

  const propia = SITIO + url.pathname + url.search;
  const html = (await respuesta.text())
    .replace(/(<meta property="og:image" content=")[^"]*(")/, "$1" + SITIO + imagen.replace(/&/g, "&amp;") + "$2")
    .replace(/(<meta property="og:url" content=")[^"]*(")/, "$1" + propia.replace(/&/g, "&amp;") + "$2");

  const cabeceras = new Headers(respuesta.headers);
  cabeceras.delete("content-length");
  cabeceras.delete("etag");
  return new Response(html, { status: respuesta.status, headers: cabeceras });
}

export const config = {
  path: ["/", "/en/", "/pt/", "/fr/", "/it/", "/de/", "/zh/", "/ja/"],
  onError: "bypass"
};
