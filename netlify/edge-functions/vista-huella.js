// Vista previa propia para el enlace de una huella de "El interruptor".
//
// /interruptor/?h=<id> (y /en/switch/?h=<id>): cambia la imagen, el título y la descripción de la
// vista previa (Open Graph) por los de esa huella: "Apagué la luz del mundo." y cuánto duró.
// Mientras la huella sigue vigente la cifra crece: la dirección de la imagen lleva el minuto actual
// (`v`) para que las redes no se queden con una vieja. Cuando termina, la imagen es fija.
//
// Solo muestra lo que existe: si la huella no está o algo falla, la página se sirve tal cual.
import { getStore } from "@netlify/blobs";

const SITIO = "https://salehoy.com.ar";
const ID = /^[a-z2-7]{8}$/;

// Las mismas reglas que netlify/lib/interruptor.mjs (duracion, lineaDuracion, lugar), repetidas acá
// porque las funciones de borde no comparten los módulos de Node de las otras.
function duracion(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
  if (d) return d + " d" + (h ? " " + h + " h" : "");
  if (h) return h + " h" + (m ? " " + m + " min" : "");
  if (m) return m + " min" + (seg ? " " + seg + " s" : "");
  return seg + " s";
}
function lugar(h, lang) {
  let pais = h.pais || "";
  try {
    if (/^[A-Z]{2}$/.test(h.cc || "")) {
      const n = new Intl.DisplayNames([lang], { type: "region" }).of(h.cc);
      if (n && n !== h.cc) pais = n;
    }
  } catch (e) {}
  return h.ciudad && pais ? h.ciudad + ", " + pais : h.ciudad || pais || "";
}
const atributo = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function (request, context) {
  const url = new URL(request.url);
  const id = url.searchParams.get("h");
  if (!id || !ID.test(id)) return;

  let h = null, fin = null;
  try {
    const store = getStore({ name: "interruptor", consistency: "strong" });
    h = await store.get("huella/" + id, { type: "json" });
    if (!h || !h.t) return;
    fin = h.fin != null ? h.fin : null;
    if (fin == null) {
      // ¿sigue vigente de verdad? Lo dice el estado.
      const est = await store.get("estado", { type: "json" });
      if (est && est.huellaVigente !== id) {
        const ult = est.ultimas || [];
        const i = ult.findIndex((u) => u.h === id);
        fin = i > 0 ? ult[i - 1].t : h.t;
      }
    }
  } catch (err) {
    return;
  }

  const respuesta = await context.next();
  const tipo = respuesta.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) return respuesta;

  const lang = url.pathname.startsWith("/en/") ? "en" : "es";
  const ahora = Date.now();
  const apago = h.accion === "apago";
  const d = duracion((fin == null ? ahora : fin) - h.t);
  const donde = lugar(h, lang);

  let titulo, descripcion;
  if (lang === "en") {
    titulo = apago ? "I turned off the light of the world." : "I turned on the light of the world.";
    descripcion = (fin == null ? d + " and counting." : "It lasted " + d + ".") + (donde ? " " + donde + "." : "") +
      " The Switch: one light for the whole world.";
  } else {
    titulo = apago ? "Apagué la luz del mundo." : "Prendí la luz del mundo.";
    descripcion = (fin == null ? "Lleva " + d + " así." : "Duró " + d + ".") + (donde ? " " + donde + "." : "") +
      " El interruptor: una sola luz para todo el mundo.";
  }

  const imagen = SITIO + "/og/huella.png?h=" + id + (lang === "en" ? "&lang=en" : "") +
    (fin == null ? "&v=" + Math.floor(ahora / 60000) : "");
  const propia = SITIO + url.pathname + "?h=" + id;

  const poner = (html, propiedad, valor) =>
    html.replace(new RegExp('(<meta property="' + propiedad + '" content=")[^"]*(")'), (m, a, b) => a + atributo(valor) + b);

  let html = await respuesta.text();
  html = poner(html, "og:image", imagen);
  html = poner(html, "og:title", titulo);
  html = poner(html, "og:description", descripcion);
  html = poner(html, "og:url", propia);

  const cabeceras = new Headers(respuesta.headers);
  cabeceras.delete("content-length");
  cabeceras.delete("etag");
  cabeceras.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(html, { status: respuesta.status, headers: cabeceras });
}

export const config = {
  path: ["/interruptor/", "/en/switch/"],
  onError: "bypass"
};
