// Filtro automático de dedicatorias de "El minuto".
//
// Es la primera de dos barreras: pasar este filtro NO publica nada. Toda dedicatoria queda pendiente
// hasta que el dueño la aprueba a mano. Por eso el filtro prefiere dejar pasar algo dudoso (lo frena
// la moderación) antes que rechazar una dedicatoria inocente.
//
//   revisar(texto) -> { ok: true, texto }  (texto ya normalizado: es el que se guarda)
//                   | { ok: false, detalle: "vacia" | "larga" | "contacto" | "enlace" | "insulto" }

export const DEDICATORIA_MAX = 80;

/** NFC, sin saltos de línea ni caracteres de control o invisibles, espacios colapsados. */
export function normalizar(texto) {
  if (typeof texto !== "string") return "";
  return texto
    .slice(0, 2000)
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ")   // control y saltos de línea
    .replace(/[\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, "")   // invisibles y de dirección
    .replace(/\s+/gu, " ")
    .trim();
}

// Para comparar: minúsculas y sin tildes ("Pelotúdo" -> "pelotudo").
const plano = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const CORREO = /[a-z0-9._%+\-]+\s?@\s?[a-z0-9\-]+(\.[a-z0-9\-]+)+/i;

// Dominios: solo terminaciones que no son palabras comunes ("te quiero.me voy" no es un enlace).
const TLD = "com|net|org|edu|gov|ar|io|ly|app|dev|xyz|info|biz|mx|br|cl|uy|uk|fr|tv|gg|link|site|online|shop|store|ru|cn|eth";
const ENLACES = [
  /https?:\/\//i,
  /\bwww\s?\./i,
  new RegExp("[a-z0-9\\-]{2,}\\.(?:" + TLD + ")(?![a-z0-9])", "i"),
  /(^|[^a-z0-9])@[a-z0-9_.]{2,}/i,                 // @usuario
  /\b(t\.me|wa\.me|bit\.ly)\b/i
];

// Fechas escritas con números: "24-12-1990", "24/12/90", "1990-12-24". No son teléfonos.
const FECHAS = /\b\d{1,2}[\-./ ]\d{1,2}[\-./ ]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
// Siete o más dígitos seguidos o separados por espacios, guiones, puntos o paréntesis:
// teléfonos, DNI (12.345.678), CUIT (20-12345678-9).
const NUMERO_LARGO = /(?:\d[\s\-.()]*){7,}/;

// Lista corta. Solo lo que es insulto casi siempre; lo que entre amigos es cariño ("boludo", "tonto")
// no está: lo mira el dueño al moderar.
const INSULTOS = [
  // español
  "put[oa]s?", "hij[oa]s? de (?:re)?mil put[oa]s?", "hij[oa]s? de put[oa]", "hdp", "pelotud[oa]s?", "mierdas?",
  "conchud[oa]s?", "concha de tu (?:madre|hermana)", "la concha de","sorete", "pajer[oa]s?", "trol[oa]s?", "maricon(?:es)?",
  "culiad[oa]s?", "culia[oa]", "chupame", "chupala", "la pija", "la verga", "mogolic[oa]s?", "violador(?:es)?",
  "te voy a matar", "ojala te mueras", "morite", "matate",
  // inglés
  "fuck\\w*", "motherfuck\\w*", "shit(?:s|ty|head|hole)?", "bullshit", "bitch(?:es)?", "asshole", "cunts?", "whores?", "sluts?", "fagg?ots?", "fags?",
  "nigg(?:er|a)s?", "retard(?:ed|s)?", "kill yourself", "kys", "go die"
];
const INSULTO = new RegExp("(?<![a-z0-9])(?:" + INSULTOS.join("|") + ")(?![a-z0-9])");

/**
 * Revisa una dedicatoria. El orden importa: un correo es "contacto" aunque también parezca un enlace.
 * @returns {{ ok: true, texto: string } | { ok: false, detalle: "vacia" | "larga" | "contacto" | "enlace" | "insulto" }}
 */
export function revisar(texto) {
  const t = normalizar(texto);
  if (!t) return { ok: false, detalle: "vacia" };
  if ([...t].length > DEDICATORIA_MAX) return { ok: false, detalle: "larga" };

  if (CORREO.test(t)) return { ok: false, detalle: "contacto" };
  if (ENLACES.some((r) => r.test(t))) return { ok: false, detalle: "enlace" };
  if (NUMERO_LARGO.test(t.replace(FECHAS, " fecha "))) return { ok: false, detalle: "contacto" };
  if (INSULTO.test(plano(t))) return { ok: false, detalle: "insulto" };

  return { ok: true, texto: t };
}
