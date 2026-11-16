// Texto en las imágenes que arma el servidor (vistas previas de "El interruptor" y "El minuto").
// Usa el atlas de glifos de letras-datos.mjs: las tipografías reales del sitio, sin dependencias.
//
//   lienzoLiso(ancho, alto)                 lienzo en color tinta, sin la marca de "Sin motivo"
//   dibujarTexto(lienzo, texto, x, y, op)   y = línea de base; devuelve el ancho dibujado
//   medirTexto(texto, op)                   ancho en píxeles
//   partirEnLineas(texto, anchoMax, op)     corta por palabras
//
// op: { fuente: "serif" | "italica" | "mono", tam: px, color: [r,g,b], alfa: 0..1, alinear: "izq" | "centro" | "der" }
// Los caracteres que el atlas no tiene se saltean (un emoji o un ideograma no rompen la imagen).
import { fuente as abrir } from "./letras-datos.mjs";
import { TINTA, CREMA } from "./dibujo.mjs";

export function lienzoLiso(ancho = 1200, alto = 630, color = TINTA) {
  const px = new Uint8Array(ancho * alto * 3);
  for (let i = 0; i < px.length; i += 3) { px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2]; }
  return { ancho, alto, px, capa: null };
}

const normal = (texto) => String(texto == null ? "" : texto).normalize("NFC");

export function medirTexto(texto, { fuente = "serif", tam = 40 } = {}) {
  const f = abrir(fuente);
  const k = tam / f.tam;
  let ancho = 0;
  for (const ch of normal(texto)) { const g = f.glifos[ch]; if (g) ancho += g.a * k; }
  return ancho;
}

export function dibujarTexto(lienzo, texto, x, y, { fuente = "serif", tam = 40, color = CREMA, alfa = 1, alinear = "izq" } = {}) {
  const f = abrir(fuente);
  const k = tam / f.tam;
  const total = medirTexto(texto, { fuente, tam });
  let cursor = alinear === "centro" ? x - total / 2 : alinear === "der" ? x - total : x;
  for (const ch of normal(texto)) {
    const g = f.glifos[ch];
    if (!g) continue;
    if (g.w) estampar(lienzo, f.alfa, g, cursor + g.x * k, y + g.y * k, k, color, alfa);
    cursor += g.a * k;
  }
  return total;
}

// Copia un glifo escalado promediando los píxeles de origen que caen en cada píxel de destino
// (filtro de caja): achica sin dientes y agranda con interpolación suave.
function estampar(lienzo, atlas, g, dx, dy, k, color, alfa) {
  const { ancho, alto, px } = lienzo;
  const x0 = Math.max(0, Math.floor(dx)), y0 = Math.max(0, Math.floor(dy));
  const x1 = Math.min(ancho - 1, Math.ceil(dx + g.w * k)), y1 = Math.min(alto - 1, Math.ceil(dy + g.h * k));
  const inv = 1 / k;
  const [cr, cg, cb] = color;
  for (let py = y0; py <= y1; py++) {
    const sy0 = (py - dy) * inv, sy1 = (py + 1 - dy) * inv;
    for (let pxx = x0; pxx <= x1; pxx++) {
      const sx0 = (pxx - dx) * inv, sx1 = (pxx + 1 - dx) * inv;
      const c = k >= 1 ? bilineal(atlas, g, (sx0 + sx1) / 2 - 0.5, (sy0 + sy1) / 2 - 0.5) : caja(atlas, g, sx0, sy0, sx1, sy1);
      if (c <= 0.004) continue;
      const a = c * alfa;
      const j = (py * ancho + pxx) * 3;
      px[j] += (cr - px[j]) * a;
      px[j + 1] += (cg - px[j + 1]) * a;
      px[j + 2] += (cb - px[j + 2]) * a;
    }
  }
}

function punto(atlas, g, x, y) {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return 0;
  return atlas[g.o + y * g.w + x];
}

function bilineal(atlas, g, x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const a = punto(atlas, g, xi, yi), b = punto(atlas, g, xi + 1, yi), c = punto(atlas, g, xi, yi + 1), d = punto(atlas, g, xi + 1, yi + 1);
  return (a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy) / 255;
}

function caja(atlas, g, sx0, sy0, sx1, sy1) {
  const xa = Math.max(0, Math.floor(sx0)), xb = Math.min(g.w - 1, Math.ceil(sx1) - 1);
  const ya = Math.max(0, Math.floor(sy0)), yb = Math.min(g.h - 1, Math.ceil(sy1) - 1);
  let suma = 0;
  for (let y = ya; y <= yb; y++) {
    const py = Math.min(y + 1, sy1) - Math.max(y, sy0);
    if (py <= 0) continue;
    for (let x = xa; x <= xb; x++) {
      const pxx = Math.min(x + 1, sx1) - Math.max(x, sx0);
      if (pxx > 0) suma += atlas[g.o + y * g.w + x] * pxx * py;
    }
  }
  return suma / (255 * (sx1 - sx0) * (sy1 - sy0));
}

/** Corta un texto en líneas que entran en anchoMax. Una palabra más larga que la línea se parte. */
export function partirEnLineas(texto, anchoMax, op = {}) {
  const palabras = normal(texto).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = "";
  const entra = (t) => medirTexto(t, op) <= anchoMax;
  for (let palabra of palabras) {
    const prueba = actual ? actual + " " + palabra : palabra;
    if (entra(prueba)) { actual = prueba; continue; }
    if (actual) { lineas.push(actual); actual = ""; }
    while (!entra(palabra) && palabra.length > 1) {
      let n = palabra.length - 1;
      while (n > 1 && !entra(palabra.slice(0, n))) n--;
      lineas.push(palabra.slice(0, n));
      palabra = palabra.slice(n);
    }
    actual = palabra;
  }
  if (actual) lineas.push(actual);
  return lineas;
}
