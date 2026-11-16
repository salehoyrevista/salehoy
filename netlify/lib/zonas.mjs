// Zonas horarias de "El minuto", sin dependencias.
//
// Quien compra elige una fecha y una hora "de pared" en su zona (el minuto en que nació alguien,
// donde nació). Acá se convierte a un instante UTC único, que es lo que se vende.
//
//   aInstante({ fecha: "2026-12-24", hora: "00:33", zona: "America/Argentina/Buenos_Aires" })
//       -> { instante: ms UTC, ambigua: bool }
//       lanza un Error con .codigo = "formato" | "zona" | "hora-inexistente"
//   aLocal(instante, zona) -> { fecha: "2026-12-24", hora: "00:33" }
//
// Dos rarezas de los cambios de horario:
//   - hora inexistente: en el salto de primavera el reloj pasa de 01:59 a 03:00; las 02:30 no existen.
//   - hora ambigua: en otoño la 01:30 ocurre dos veces. Se toma la primera y se avisa (ambigua: true).

const DIA = 86400000;

function fallo(codigo) {
  const e = new Error("zonas: " + codigo);
  e.codigo = codigo;
  return e;
}

const formatos = new Map();   // zona canónica -> Intl.DateTimeFormat

let listaDeZonas = null;
function zonasConocidas() {
  if (listaDeZonas === null) {
    try { listaDeZonas = new Set(Intl.supportedValuesOf("timeZone").map((z) => z.toLowerCase())); }
    catch { listaDeZonas = false; }
  }
  return listaDeZonas;
}

/**
 * Devuelve el nombre de la zona tal como lo entiende el motor (o null si no es una zona IANA).
 * Se acepta "UTC", lo que figura en Intl.supportedValuesOf("timeZone") y también los nombres viejos
 * que algunos navegadores todavía informan ("America/Buenos_Aires", "Asia/Calcutta"): no están en
 * esa lista pero el motor los resuelve. No se aceptan desfases sueltos como "+03:00".
 */
export function zonaValida(zona) {
  if (typeof zona !== "string" || zona.length > 64) return null;
  if (/^(utc|etc\/utc|gmt|etc\/gmt)$/i.test(zona)) return "UTC";
  if (!/^[A-Za-z][A-Za-z0-9_+\-]*(\/[A-Za-z0-9_+\-]+){1,2}$/.test(zona)) return null;
  const conocidas = zonasConocidas();
  try {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: zona });
    const nombre = f.resolvedOptions().timeZone;
    if (conocidas && !conocidas.has(zona.toLowerCase()) && !conocidas.has(String(nombre).toLowerCase())) {
      // Alias viejo: el motor lo aceptó (si no, habría lanzado). Vale igual.
    }
    // Se devuelve el nombre que mandó el navegador (si es válido): el motor a veces lo "canoniza" a un
    // alias viejo ("America/Argentina/Buenos_Aires" -> "America/Buenos_Aires") y eso se ve raro.
    return nombre ? zona : null;
  } catch {
    return null;
  }
}

function formato(zona) {
  let f = formatos.get(zona);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zona, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    formatos.set(zona, f);
  }
  return f;
}

function partes(ms, zona) {
  const o = {};
  for (const p of formato(zona).formatToParts(new Date(ms))) o[p.type] = p.value;
  return o;
}

/** Desfase de la zona en ese instante, en milisegundos (hora local − UTC). Buenos Aires: −3 h. */
export function desfase(ms, zona) {
  const p = partes(ms, zona);
  const comoUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return comoUtc - Math.floor(ms / 1000) * 1000;
}

const dos = (n) => String(n).padStart(2, "0");

/** Lee "YYYY-MM-DD" y "HH:MM" como números, o lanza "formato". No acepta fechas que no existen (30 de febrero). */
export function leerFechaHora(fecha, hora) {
  const f = typeof fecha === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const h = typeof hora === "string" && /^(\d{2}):(\d{2})$/.exec(hora);
  if (!f || !h) throw fallo("formato");
  const [a, m, d, H, M] = [+f[1], +f[2], +f[3], +h[1], +h[2]];
  if (a < 1970 || m < 1 || m > 12 || d < 1 || d > 31 || H > 23 || M > 59) throw fallo("formato");
  const local = Date.UTC(a, m - 1, d, H, M);
  const v = new Date(local);
  if (v.getUTCFullYear() !== a || v.getUTCMonth() !== m - 1 || v.getUTCDate() !== d) throw fallo("formato");
  return { a, m, d, H, M, local };
}

/**
 * Hora de pared en una zona -> instante UTC.
 * Se prueban los desfases que la zona tiene alrededor de esa fecha (un día antes, ese momento, un día
 * después) y se conservan los instantes que, vistos desde la zona, dan exactamente la hora pedida.
 * Ninguno: la hora no existe. Dos: es ambigua (se devuelve la primera).
 */
export function aInstante({ fecha, hora, zona } = {}) {
  const { local } = leerFechaHora(fecha, hora);
  const z = zonaValida(zona);
  if (!z) throw fallo("zona");
  const desfases = new Set([desfase(local - DIA, z), desfase(local, z), desfase(local + DIA, z)]);
  const validos = [...new Set([...desfases].map((o) => local - o))]
    .filter((t) => desfase(t, z) === local - t)
    .sort((x, y) => x - y);
  if (!validos.length) throw fallo("hora-inexistente");
  return { instante: validos[0], ambigua: validos.length > 1 };
}

/** Instante UTC -> fecha y hora de pared en la zona. */
export function aLocal(instante, zona) {
  const z = zonaValida(zona);
  if (!z) throw fallo("zona");
  if (!Number.isFinite(instante)) throw fallo("formato");
  const p = partes(instante, z);
  return { fecha: `${p.year.padStart(4, "0")}-${p.month}-${p.day}`, hora: `${dos(+p.hour)}:${p.minute}` };
}
