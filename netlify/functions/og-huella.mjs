// /og/huella.png?h=<id>[&lang=en][&v=…] — vista previa (PNG 1200x630) de una huella de "El interruptor".
//
// "Apagué la luz del mundo." y cuánto duró. Si la huella sigue vigente la cifra crece: la imagen
// se guarda un minuto y la página cambia el parámetro `v` cada minuto. Cuando la huella termina,
// la imagen no cambia más y queda guardada un año. La de una luz apagada es oscura; la de una luz
// prendida tiene un halo crema. Solo se dibuja lo que existe: con una huella que no está, va la
// imagen general del sitio; sin `h`, la de la obra.
import { almacen } from "../lib/almacen.mjs";
import { trazo, grano, codificarPNG, semillaDeTexto, CREMA, BERMELLON } from "../lib/dibujo.mjs";
import { lienzoLiso, dibujarTexto, partirEnLineas } from "../lib/letras.mjs";
import { leerHuella, fraseHuella, lineaDuracion, lugar, ID_HUELLA } from "../lib/interruptor.mjs";

const MARGEN = 84;
// semillaDeTexto devuelve un generador: la semilla del grano es su primer número, como en imagenEstrella
const semilla = (texto) => Math.floor(semillaDeTexto(texto)() * 4294967296);

function aGenerica() {
  return new Response(null, { status: 302, headers: { location: "/og.png", "cache-control": "no-store" } });
}

export function imagenHuella(h, ahora, lang = "es") {
  const lienzo = lienzoLiso(1200, 630);
  const prendio = h.accion === "prendio";

  if (prendio) {
    // la luz: un halo crema, ancho y tenue, detrás de la frase
    trazo(lienzo, [{ x: 330, y: 250 }, { x: 760, y: 250 }], { color: CREMA, alfa: 0.2, radio: 60, difuso: 210 });
  } else {
    // lo que queda de una lámpara recién apagada: un rescoldo
    trazo(lienzo, [{ x: 1092, y: 96 }], { color: BERMELLON, alfa: 0.28, radio: 3, difuso: 22 });
    trazo(lienzo, [{ x: 1080, y: 96 }, { x: 1104, y: 96 }], { color: BERMELLON, alfa: 0.9, radio: 1.6 });
  }

  const tinte = prendio ? 1 : 0.86;
  const lineas = partirEnLineas(fraseHuella(h.accion, lang), 1200 - MARGEN * 2, { fuente: "serif", tam: 98 }).slice(0, 3);
  let y = lineas.length > 1 ? 196 : 262;
  for (const linea of lineas) {
    dibujarTexto(lienzo, linea, MARGEN, y, { fuente: "serif", tam: 98, color: CREMA, alfa: tinte });
    y += 100;
  }
  y -= 100;

  dibujarTexto(lienzo, lineaDuracion(h, ahora, lang), MARGEN, y + 78, { fuente: "italica", tam: 50, color: CREMA, alfa: prendio ? 0.72 : 0.56 });
  const donde = lugar(h, lang);
  if (donde) dibujarTexto(lienzo, donde, MARGEN, y + 136, { fuente: "mono", tam: 22, color: CREMA, alfa: 0.56 });

  const pie = lang === "en"
    ? "The Switch — Solzimer · salehoy.com.ar/en/switch"
    : "El interruptor — Solzimer · salehoy.com.ar/interruptor";
  dibujarTexto(lienzo, pie, MARGEN, 572, { fuente: "mono", tam: 20, color: CREMA, alfa: 0.5 });

  grano(lienzo, semilla("huella:" + h.id));
  return codificarPNG(lienzo);
}

/** La vista previa de la obra, sin huella: la frase de la obra, nada más. */
export function imagenObra(lang = "es") {
  const lienzo = lienzoLiso(1200, 630);
  trazo(lienzo, [{ x: 330, y: 250 }, { x: 760, y: 250 }], { color: CREMA, alfa: 0.14, radio: 60, difuso: 210 });
  const frase = lang === "en" ? "One light for the whole world." : "Una sola luz para todo el mundo.";
  const sigue = lang === "en" ? "If you turn it off, it goes off for everyone." : "Si la apagás, se apaga para todos.";
  const lineas = partirEnLineas(frase, 1200 - MARGEN * 2, { fuente: "serif", tam: 92 }).slice(0, 2);
  let y = lineas.length > 1 ? 210 : 270;
  for (const linea of lineas) { dibujarTexto(lienzo, linea, MARGEN, y, { fuente: "serif", tam: 92, color: CREMA }); y += 94; }
  dibujarTexto(lienzo, sigue, MARGEN, y - 94 + 76, { fuente: "italica", tam: 50, color: CREMA, alfa: 0.62 });
  const pie = lang === "en"
    ? "The Switch — Solzimer · salehoy.com.ar/en/switch"
    : "El interruptor — Solzimer · salehoy.com.ar/interruptor";
  dibujarTexto(lienzo, pie, MARGEN, 572, { fuente: "mono", tam: 20, color: CREMA, alfa: 0.5 });
  grano(lienzo, semilla("interruptor:" + lang));
  return codificarPNG(lienzo);
}

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const q = new URL(req.url).searchParams;
  const id = q.get("h") || "";
  if (!id) {
    // sin huella: la imagen general de la obra (la que usan /interruptor/ y /en/switch/)
    try {
      const png = imagenObra(q.get("lang") === "en" ? "en" : "es");
      return new Response(png, { status: 200, headers: {
        "content-type": "image/png", "cache-control": "public, max-age=86400", "netlify-cdn-cache-control": "public, s-maxage=604800"
      } });
    } catch (error) {
      console.error("og-huella:", error && error.message);
      return aGenerica();
    }
  }
  if (!ID_HUELLA.test(id)) return aGenerica();
  try {
    const h = await leerHuella(almacen("interruptor"), id);
    if (!h) return aGenerica();
    const png = imagenHuella(h, Date.now(), q.get("lang") === "en" ? "en" : "es");
    const cabeceras = h.fin != null
      ? { "cache-control": "public, max-age=31536000, immutable", "netlify-cdn-cache-control": "public, durable, s-maxage=31536000" }
      : { "cache-control": "public, max-age=60", "netlify-cdn-cache-control": "public, s-maxage=60" };
    return new Response(png, { status: 200, headers: { "content-type": "image/png", ...cabeceras } });
  } catch (error) {
    console.error("og-huella:", error && error.message);
    return aGenerica();
  }
};

export const config = { path: "/og/huella.png" };
