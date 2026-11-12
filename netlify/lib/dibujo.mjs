// Rasterizador mínimo para las vistas previas (Open Graph) de "Sin motivo".
// JavaScript puro + node:zlib: sin dependencias nativas ni paquetes.
//
// Cómo dibuja: cada trazo se calcula como un campo de distancias a "cápsulas" (segmentos con
// puntas redondas) sobre una capa de cobertura en coma flotante. La capa acumula con "max",
// así los cruces de un mismo trazo no se queman. Después la capa se vuelca sobre el lienzo RGB
// mezclando el color con su alfa. El resplandor es la misma cápsula con caída gaussiana.
import { deflateSync } from 'node:zlib';
import { pixelesBase, ANCHO_BASE, ALTO_BASE } from './og-base.mjs';

export const ANCHO = 1200;
export const ALTO = 630;
export const TINTA = [0x0e, 0x0d, 0x12];
export const CREMA = [0xf2, 0xe9, 0xd8];
export const BERMELLON = [0xe2, 0x55, 0x3a];

/** Zona libre para dibujar la estela (debajo queda el texto de la imagen base). */
export const CAJA_ESTELA = { x0: 72, y0: 60, x1: 1128, y1: 470 };

const MAX_PARES = 160;

// ───────────────────────────── Azar determinístico ─────────────────────────────

/** PRNG mulberry32: devuelve una función que da números en [0, 1). Nunca Math.random. */
export function mulberry32(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generador sembrado con un texto. Es EXACTAMENTE el del sitio (no cambiar: define la forma de cada estrella). */
export function semillaDeTexto(texto) {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return mulberry32(h >>> 0);
}

/**
 * Forma del asterisco de un regalo a partir de su clave, con el mismo orden de consumo de azar que el sitio.
 * Devuelve { puntas, brazos, grosor, giro }.
 */
export function formaDeClave(clave) {
  const r = semillaDeTexto(String(clave));
  const puntas = 5 + Math.floor(r() * 4);
  const brazos = [];
  for (let i = 0; i < puntas; i++) brazos.push(0.82 + r() * 0.3);
  r(); r();                  // ángulo y rho en el cielo: se consumen, acá no se usan
  r();                       // tamaño en el cielo: ídem
  const grosor = 0.8 + r() * 1.3;
  const giro = r() * Math.PI * 2;
  return { puntas, brazos, grosor, giro };
}

// ───────────────────────────── Lienzo y capas ─────────────────────────────

/**
 * Crea un lienzo RGB. Si mide 1200x630 parte de la imagen base (fondo, marca y textos);
 * con otras medidas queda liso en color tinta.
 */
export function crearLienzo(ancho = ANCHO, alto = ALTO) {
  const px = new Uint8Array(ancho * alto * 3);
  if (ancho === ANCHO_BASE && alto === ALTO_BASE) {
    px.set(pixelesBase());
  } else {
    for (let i = 0; i < px.length; i += 3) { px[i] = TINTA[0]; px[i + 1] = TINTA[1]; px[i + 2] = TINTA[2]; }
  }
  return { ancho, alto, px, capa: null };
}

/** Capa de cobertura (0..1) del tamaño del lienzo; se crea una sola vez y se reutiliza. */
function capaDe(lienzo) {
  if (!lienzo.capa) {
    lienzo.capa = { v: new Float32Array(lienzo.ancho * lienzo.alto), x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  }
  return lienzo.capa;
}

/**
 * Estampa en la capa una cápsula (segmento de puntas redondas) con radio r0 en un extremo y r1 en el otro.
 * difuso = 0 → borde nítido con antialias de 1 px; difuso > 0 → caída suave tipo gaussiana de ese sigma (resplandor).
 */
function capsula(lienzo, ax, ay, r0, bx, by, r1, difuso) {
  const capa = capaDe(lienzo);
  const { ancho, alto } = lienzo;
  const rMax = Math.max(r0, r1);
  const alcance = rMax + (difuso > 0 ? difuso * 2.7 : 1);
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - alcance));
  const x1 = Math.min(ancho - 1, Math.ceil(Math.max(ax, bx) + alcance));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - alcance));
  const y1 = Math.min(alto - 1, Math.ceil(Math.max(ay, by) + alcance));
  if (x0 > x1 || y0 > y1) return;
  if (x0 < capa.x0) capa.x0 = x0;
  if (y0 < capa.y0) capa.y0 = y0;
  if (x1 > capa.x1) capa.x1 = x1;
  if (y1 > capa.y1) capa.y1 = y1;

  const dx = bx - ax, dy = by - ay;
  const largo2 = dx * dx + dy * dy;
  const inv = largo2 > 1e-9 ? 1 / largo2 : 0;
  const alcance2 = alcance * alcance;
  const invCaida2 = difuso > 0 ? 1 / (difuso * difuso * 7.29) : 0;   // 1 / (2,7·sigma)²
  const v = capa.v;

  for (let y = y0; y <= y1; y++) {
    const py = y + 0.5 - ay;
    let i = y * ancho + x0;
    for (let x = x0; x <= x1; x++, i++) {
      const pxx = x + 0.5 - ax;
      let t = (pxx * dx + py * dy) * inv;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      const qx = pxx - dx * t, qy = py - dy * t;
      const d2 = qx * qx + qy * qy;
      if (d2 > alcance2) continue;
      const s = Math.sqrt(d2) - (r0 + (r1 - r0) * t);   // distancia al borde del trazo
      let c;
      if (difuso > 0) {
        if (s <= 0) c = 1;
        else {
          // (1 - x²)^8 con x = s / (2,7·sigma): casi idéntica a la gaussiana exp(-s²/sigma²), sin Math.exp
          let u = 1 - s * s * invCaida2;
          if (u <= 0) continue;
          u *= u; u *= u; c = u * u;
        }
      } else c = s <= -0.5 ? 1 : s >= 0.5 ? 0 : 0.5 - s;
      if (c > v[i]) v[i] = c;                            // acumulación "max": los cruces no se queman
    }
  }
}

/** Vuelca la capa sobre el lienzo con un color y un alfa, y la deja en blanco para el próximo uso. */
function volcar(lienzo, color, alfa) {
  const capa = lienzo.capa;
  if (!capa || capa.x1 < capa.x0) return;
  const { ancho, px } = lienzo;
  const [cr, cg, cb] = color;
  const v = capa.v;
  for (let y = capa.y0; y <= capa.y1; y++) {
    let i = y * ancho + capa.x0;
    for (let x = capa.x0; x <= capa.x1; x++, i++) {
      const c = v[i];
      if (c === 0) continue;
      v[i] = 0;
      const a = c * alfa;
      if (a < 0.002) continue;
      const j = i * 3;
      px[j] += (cr - px[j]) * a;
      px[j + 1] += (cg - px[j + 1]) * a;
      px[j + 2] += (cb - px[j + 2]) * a;
    }
  }
  capa.x0 = capa.y0 = Infinity;
  capa.x1 = capa.y1 = -Infinity;
}

// ───────────────────────────── Trazos ─────────────────────────────

/** Suaviza una polilínea cortando esquinas (Chaikin) y conservando los extremos. */
export function suavizar(puntos, pasadas = 2) {
  let p = puntos;
  for (let n = 0; n < pasadas && p.length > 2; n++) {
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
}

/**
 * Traza una polilínea gruesa con antialias y puntas redondas.
 * puntos: [{x, y}] en píxeles. radio: número, o función (i, n) → radio en el punto i.
 * difuso: 0 para trazo nítido; > 0 para resplandor (sigma en px).
 */
export function trazo(lienzo, puntos, { color = CREMA, alfa = 1, radio = 2, difuso = 0 } = {}) {
  if (!puntos.length) return;
  const n = puntos.length;
  const r = typeof radio === 'function' ? radio : () => radio;
  if (n === 1) {
    capsula(lienzo, puntos[0].x, puntos[0].y, r(0, 1), puntos[0].x, puntos[0].y, r(0, 1), difuso);
  } else {
    for (let i = 0; i < n - 1; i++) {
      capsula(lienzo, puntos[i].x, puntos[i].y, r(i, n), puntos[i + 1].x, puntos[i + 1].y, r(i + 1, n), difuso);
    }
  }
  volcar(lienzo, color, alfa);
}

// ───────────────────────────── Asterisco ─────────────────────────────

/**
 * Dibuja un asterisco: una punta por brazo, desde el centro, con trazo redondeado y halo.
 * forma: { puntas, brazos[], giro, grosor } (ver formaDeClave) más, opcionales,
 *        radio (px, 150 por defecto) y halo (0..1, intensidad del resplandor; 1 por defecto).
 */
export function dibujarAsterisco(lienzo, cx, cy, forma, color = BERMELLON, alfa = 1) {
  const radio = forma.radio ?? 150;
  const halo = forma.halo ?? 1;
  const ancho = (forma.grosor / 1.4) * 9 * (radio / 150);   // grosor del trazo en px, proporcional
  const r = Math.max(0.6, ancho / 2);
  const puntas = [];
  for (let i = 0; i < forma.puntas; i++) {
    const a = forma.giro + (i / forma.puntas) * Math.PI * 2;
    const largo = radio * forma.brazos[i];
    puntas.push({ x: cx + Math.cos(a) * largo, y: cy + Math.sin(a) * largo });
  }
  const pasada = (rr, difuso, a) => {
    if (a <= 0) return;
    for (const p of puntas) capsula(lienzo, cx, cy, rr, p.x, p.y, rr, difuso);
    volcar(lienzo, color, a);
  };
  pasada(r, radio * 0.42, 0.10 * halo * alfa);   // halo amplio
  pasada(r, radio * 0.11, 0.22 * halo * alfa);   // halo cercano
  pasada(r, 0, alfa);                            // el asterisco
}

// ───────────────────────────── Estela ─────────────────────────────

/**
 * Decodifica y valida estrictamente una estela de la URL.
 * e: base64url sin relleno de bytes [versión = 1][semilla uint32 big-endian][pares x, y (0..254)…];
 *    el par 255, 255 corta el trazo. Máximo 160 pares; al menos 2 puntos.
 * Devuelve { semilla, trazos: [[{x, y}, …], …] } con x e y en 0..1, o null si algo no cierra.
 */
export function decodificarEstela(e) {
  if (typeof e !== 'string') return null;
  if (e.length < 12 || e.length > Math.ceil(((5 + MAX_PARES * 2) * 4) / 3)) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(e)) return null;
  const bytes = Buffer.from(e, 'base64url');
  if (bytes.toString('base64url') !== e) return null;         // solo la forma canónica
  if (bytes.length < 9 || (bytes.length - 5) % 2 !== 0) return null;
  const pares = (bytes.length - 5) / 2;
  if (pares > MAX_PARES) return null;
  if (bytes[0] !== 1) return null;
  const semilla = bytes.readUInt32BE(1);

  const trazos = [];
  let actual = [];
  let total = 0;
  for (let i = 5; i < bytes.length; i += 2) {
    const x = bytes[i], y = bytes[i + 1];
    if (x === 255 && y === 255) {
      if (actual.length) trazos.push(actual);
      actual = [];
      continue;
    }
    if (x === 255 || y === 255) return null;                   // 255 solo vale como par de corte
    actual.push({ x: x / 254, y: y / 254 });
    total++;
  }
  if (actual.length) trazos.push(actual);
  if (total < 2) return null;
  return { semilla, trazos };
}

/**
 * Dibuja una estela en crema con resplandor suave.
 * trazos: [[{x, y}…]…] en proporción de ventana (0..1). caja: { x0, y0, x1, y1 } en px.
 * Se reencuadra con escala uniforme para que entre centrada y con margen en la caja.
 * semilla: da el pulso de la tinta (variación leve y determinística del grosor).
 */
export function dibujarEstela(lienzo, trazos, caja = CAJA_ESTELA, semilla = 1) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of trazos) for (const p of t) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (minX === Infinity) return;

  const margen = 22;                                           // aire para el grosor y el resplandor
  const anchoCaja = caja.x1 - caja.x0 - margen * 2;
  const altoCaja = caja.y1 - caja.y0 - margen * 2;
  // Una estela mínima (dos puntos casi juntos) no se infla hasta llenar la caja.
  const w = Math.max(maxX - minX, 0.12), h = Math.max(maxY - minY, 0.12);
  const escala = Math.min(anchoCaja / w, altoCaja / h);
  const medioX = (minX + maxX) / 2, medioY = (minY + maxY) / 2;
  const cx = (caja.x0 + caja.x1) / 2, cy = (caja.y0 + caja.y1) / 2;

  const azar = mulberry32(semilla);
  const lineas = trazos.map((t) => {
    const crudos = t.map((q) => ({ x: cx + (q.x - medioX) * escala, y: cy + (q.y - medioY) * escala }));
    const p = suavizar(crudos, 3);          // tinta: bien subdividida
    const tenue = suavizar(crudos, 1);      // resplandor: es borroso, alcanza con menos segmentos
    // Pulso de la tinta: suma de dos ondas lentas con fase al azar; afina hacia las puntas.
    const f1 = azar() * 6.283, f2 = azar() * 6.283, k1 = 0.045 + azar() * 0.03, k2 = 0.011 + azar() * 0.01;
    const radio = (i, n) => {
      const u = n > 1 ? i / (n - 1) : 0.5;
      const punta = Math.min(1, 0.45 + Math.min(u, 1 - u) * 9);
      return 2.5 * punta * (1 + 0.16 * Math.sin(i * k1 + f1) + 0.12 * Math.sin(i * k2 + f2));
    };
    return { p, tenue, radio };
  });

  // Tres pasadas sobre toda la estela: resplandor amplio, resplandor cercano y tinta.
  const fijo = () => 2;
  const pasada = (difuso, alfa) => {
    for (const l of lineas) {
      const p = difuso > 0 ? l.tenue : l.p, r = difuso > 0 ? fijo : l.radio, n = p.length;
      if (n === 1) capsula(lienzo, p[0].x, p[0].y, r(0, 1), p[0].x, p[0].y, r(0, 1), difuso);
      for (let i = 0; i < n - 1; i++) capsula(lienzo, p[i].x, p[i].y, r(i, n), p[i + 1].x, p[i + 1].y, r(i + 1, n), difuso);
    }
    volcar(lienzo, CREMA, alfa);
  };
  pasada(20, 0.085);
  pasada(6, 0.17);
  pasada(0, 0.94);
}

// ───────────────────────────── Grano ─────────────────────────────

/**
 * Ruido sutil y determinístico sobre todo el lienzo (el mismo valor en los tres canales).
 * El grano va en celdas de 2x2 px: sobrevive mejor a la recompresión de las redes y deja las filas
 * impares iguales a la de arriba, con lo que el PNG pesa la mitad (ver el filtro "Up" en codificarPNG).
 */
export function grano(lienzo, semilla, intensidad = 3) {
  const { ancho, alto, px } = lienzo;
  const amplitud = intensidad * 2 + 1;
  let a = semilla >>> 0;
  for (let y = 0; y < alto; y += 2) {
    const dosFilas = y + 1 < alto;
    for (let x = 0; x < ancho; x += 2) {
      // mulberry32 en línea (es el bucle más largo de la imagen)
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      const n = Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * amplitud) - intensidad;
      if (n === 0) continue;
      const j = (y * ancho + x) * 3;
      const fin = x + 1 < ancho ? 6 : 3;
      for (let k = 0; k < fin; k++) {
        const v = px[j + k] + n;
        px[j + k] = v < 0 ? 0 : v > 255 ? 255 : v;
        if (dosFilas) {
          const w = px[j + ancho * 3 + k] + n;
          px[j + ancho * 3 + k] = w < 0 ? 0 : w > 255 ? 255 : w;
        }
      }
    }
  }
}

// ───────────────────────────── PNG ─────────────────────────────

let TABLA_CRC = null;
function crc32(datos, crc = 0xffffffff) {
  if (!TABLA_CRC) {
    TABLA_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      TABLA_CRC[n] = c >>> 0;
    }
  }
  for (let i = 0; i < datos.length; i++) crc = TABLA_CRC[(crc ^ datos[i]) & 0xff] ^ (crc >>> 8);
  return crc;
}

function bloque(tipo, datos) {
  const b = Buffer.alloc(12 + datos.length);
  b.writeUInt32BE(datos.length, 0);
  b.write(tipo, 4, 'latin1');
  datos.copy(b, 8);
  b.writeUInt32BE((crc32(b.subarray(4, 8 + datos.length)) ^ 0xffffffff) >>> 0, 8 + datos.length);
  return b;
}

/** Codifica el lienzo como PNG RGB de 8 bits (sin entrelazado). Devuelve un Buffer. */
export function codificarPNG(lienzo, nivel = 6) {
  const { ancho, alto, px } = lienzo;
  const fila = ancho * 3;
  const crudo = Buffer.alloc((fila + 1) * alto);
  for (let y = 0; y < alto; y++) {
    const o = y * (fila + 1), p = y * fila;
    // Filtro por fila: "Up" (resta de la fila de arriba) si deja más de la mitad en cero —pasa en las
    // filas impares, gemelas de la anterior por el grano de 2x2—; si no, sin filtro, que con ruido rinde más.
    let ceros = 0;
    if (y > 0) for (let i = 0; i < fila; i++) if (px[p + i] === px[p - fila + i]) ceros++;
    if (ceros * 2 > fila) {
      crudo[o] = 2;
      for (let i = 0; i < fila; i++) crudo[o + 1 + i] = px[p + i] - px[p - fila + i];
    } else {
      crudo[o] = 0;
      crudo.set(px.subarray(p, p + fila), o + 1);
    }
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0);
  cabecera.writeUInt32BE(alto, 4);
  cabecera[8] = 8;   // bits por canal
  cabecera[9] = 2;   // color verdadero RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', deflateSync(crudo, { level: nivel })),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

// ───────────────────────────── Composiciones completas ─────────────────────────────

/** Vista previa de una estela ya decodificada ({ semilla, trazos }). Devuelve el PNG. */
export function imagenEstela(estela) {
  const lienzo = crearLienzo(ANCHO, ALTO);
  dibujarEstela(lienzo, estela.trazos, CAJA_ESTELA, estela.semilla);
  grano(lienzo, estela.semilla);
  return codificarPNG(lienzo);
}

/** Vista previa de la estrella de un regalo a partir de su clave. Devuelve el PNG. */
export function imagenEstrella(clave) {
  const lienzo = crearLienzo(ANCHO, ALTO);
  const forma = formaDeClave(clave);
  dibujarAsterisco(lienzo, 650, 268, { ...forma, radio: 150 }, BERMELLON, 1);
  grano(lienzo, Math.floor(semillaDeTexto(String(clave))() * 4294967296));
  return codificarPNG(lienzo);
}
