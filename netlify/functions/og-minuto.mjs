// /og/minuto.png?id=<id>[&lang=en] — vista previa (Open Graph, PNG 1200x630) de un minuto vendido.
//
// Arriba "El minuto — Solzimer"; grande, la hora local que eligió quien lo compró, la fecha larga y
// la zona; la dedicatoria entre comillas SOLO si el dueño la aprobó (si no, una frase neutra). Si el
// minuto no existe o no está vendido: redirección a la imagen genérica /og.png.
import { almacen } from "../lib/almacen.mjs";
import { leerMinutoPublico, instanteDeId } from "../lib/minuto.mjs";
import { lienzoLiso, dibujarTexto, partirEnLineas, medirTexto } from "../lib/letras.mjs";
import { grano, codificarPNG, semillaDeTexto, BERMELLON } from "../lib/dibujo.mjs";

const MESES = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
const NEUTRA = { es: "Este minuto es un regalo.", en: "This minute is a gift." };

const CABECERAS_PNG = {
  "content-type": "image/png",
  "cache-control": "public, max-age=300",
  "netlify-cdn-cache-control": "public, s-maxage=300"
};

const aGenerica = () => new Response(null, { status: 302, headers: { location: "/og.png", "cache-control": "no-store" } });

export function fechaLarga(fecha, lang) {
  const [a, m, d] = fecha.split("-").map(Number);
  return lang === "en" ? `${MESES.en[m - 1]} ${d}, ${a}` : `${d} de ${MESES.es[m - 1]} de ${a}`;
}

const nombreZona = (zona) => (zona === "UTC" ? "UTC" : String(zona).replace(/_/g, " "));

/** Recorta a `max` líneas; si sobra texto, la última termina en "…". */
function lineasDedicatoria(texto, ancho, op, max = 3) {
  const lineas = partirEnLineas(texto, ancho, op);
  if (lineas.length <= max) return lineas;
  const corte = lineas.slice(0, max);
  let ultima = corte[max - 1];
  while (ultima.length > 1 && medirTexto(ultima + "…”", op) > ancho) ultima = ultima.slice(0, -1).trimEnd();
  corte[max - 1] = ultima + "…";
  return corte;
}

export function imagenMinuto(m, lang = "es") {
  const L = lienzoLiso(1200, 630);
  const X = 80;
  dibujarTexto(L, "El minuto — Solzimer", X, 84, { fuente: "mono", tam: 22, alfa: 0.62 });

  dibujarTexto(L, m.local.hora, X, 244, { fuente: "serif", tam: 150 });
  dibujarTexto(L, fechaLarga(m.local.fecha, lang), X, 312, { fuente: "serif", tam: 46 });
  dibujarTexto(L, nombreZona(m.zona), X, 356, { fuente: "mono", tam: 22, alfa: 0.62 });

  const op = { fuente: "italica", tam: 38 };
  if (m.estado === "aprobada" && m.dedicatoria) {
    const lineas = lineasDedicatoria(m.dedicatoria, 1040, op);
    lineas.forEach((l, i) => {
      const texto = (i === 0 ? "“" : "") + l + (i === lineas.length - 1 ? "”" : "");
      dibujarTexto(L, texto, i === 0 ? X - medirTexto("“", op) : X, 436 + i * 48, op);
    });
  } else {
    dibujarTexto(L, NEUTRA[lang] || NEUTRA.es, X, 436, { ...op, alfa: 0.72 });
  }

  dibujarTexto(L, "salehoy.com.ar/minuto", X, 586, { fuente: "mono", tam: 20, alfa: 0.62 });
  if (m.prueba) dibujarTexto(L, lang === "en" ? "test" : "prueba", 1120, 586, { fuente: "mono", tam: 20, color: BERMELLON, alinear: "der" });

  grano(L, Math.floor(semillaDeTexto("minuto:" + m.id)() * 4294967296));   // semillaDeTexto devuelve un generador
  return codificarPNG(L);
}

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const q = new URL(req.url).searchParams;
  const id = q.get("id") || "";
  const lang = q.get("lang") === "en" ? "en" : "es";
  if (instanteDeId(id) === null) return aGenerica();
  try {
    const m = await leerMinutoPublico(almacen("minuto"), id, Date.now());
    if (!m) return aGenerica();
    return new Response(imagenMinuto(m, lang), { status: 200, headers: CABECERAS_PNG });
  } catch (error) {
    console.error("og-minuto:", error && error.message);
    return aGenerica();
  }
};

export const config = { path: "/og/minuto.png" };
