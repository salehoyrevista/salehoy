// Avisos al dueño de "El minuto".
//
// Si hay AVISO_URL, se le manda un POST de texto plano, corto, cuando hay algo para moderar. El aviso
// nunca lleva el texto de la dedicatoria ni ningún dato de quien compró: solo qué minuto es y el enlace
// a la página de administración. Sin AVISO_URL no hace nada (los pendientes igual se ven en /admin/).
//
// Cada aviso se manda una sola vez: se anota en el almacén con crear() (atómico) antes de enviarlo.
//   avisos/<idurl>-vendido   se vendió un minuto: hay una dedicatoria para aprobar
//   avisos/<idurl>-pronto    faltan menos de 24 h y sigue pendiente
//   avisos/<idurl>-neutro    llegó (o pasó) el minuto sin dedicatoria aprobada: se mostró el mensaje neutro
import { avisoUrl } from "./ajustes.mjs";

const ADMIN = "https://salehoy.com.ar/admin/";

const utcDe = (id) => String(id).replace("T", " ").replace(/Z$/, " UTC").replace(/(\d{2})-(\d{2}) UTC$/, "$1:$2 UTC");

export const TEXTOS = {
  vendido: (id) => `El minuto: hay una dedicatoria para aprobar (${utcDe(id)}). ${ADMIN}`,
  pronto: (id) => `El minuto: faltan menos de 24 h para un minuto con la dedicatoria sin aprobar (${utcDe(id)}). ${ADMIN}`,
  neutro: (id) => `El minuto: llegó un minuto sin dedicatoria aprobada (${utcDe(id)}); se mostró el mensaje neutro. ${ADMIN}`
};

/**
 * Manda un aviso, una sola vez por minuto y por tipo.
 * @param {import("./almacen.mjs").Almacen} alm
 * @param {"vendido" | "pronto" | "neutro"} tipo
 * @param {string} id   "2026-12-24T03:33Z" (o la forma de URL)
 * @returns {Promise<boolean>} true si se envió
 */
export async function avisar(alm, tipo, id, { url = avisoUrl(), enviar = fetch, espera = 4000 } = {}) {
  if (!url || !TEXTOS[tipo]) return false;
  const clave = `avisos/${String(id).replace(/:/g, "-")}-${tipo}`;
  try {
    if (!(await alm.crear(clave, { t: Date.now() }))) return false;   // ya avisado
  } catch { return false; }

  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), espera);
  try {
    const r = await enviar(url, {
      method: "POST",
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: TEXTOS[tipo](id),
      signal: ctrl.signal
    });
    if (!r || !r.ok) throw new Error("aviso " + (r && r.status));
    return true;
  } catch (e) {
    // No salió: se borra la marca para que el vigía lo vuelva a intentar.
    try { await alm.borrar(clave); } catch {}
    console.error("avisos: no se pudo enviar (" + tipo + ")");
    return false;
  } finally {
    clearTimeout(reloj);
  }
}
