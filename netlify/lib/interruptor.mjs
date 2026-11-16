// El interruptor — una sola luz para todo el mundo.
//
// Toda la lógica de la obra, sin red ni reloj propios: el almacén y la hora entran como
// parámetros, así se prueba entera con almacenEnMemoria() (tests/interruptor.test.mjs).
//
// Lo que se guarda (almacén "interruptor"):
//   estado          { prendida, desde, toques, recordPrendida, recordApagada, ultimas[≤12], huellaVigente }
//   huella/<id>     { id, accion: "prendio"|"apago", t, fin: ms|null, ciudad, pais, cc }
//   limite/<hmac>   { hasta }   — un toque por persona cada 5 minutos
//
// Nunca se guarda una IP ni nada que identifique a alguien. "Persona" es un HMAC de la IP y el día
// (personaDe): rota cada día, no se puede revertir, y la IP no se escribe en ningún lado.
// De cada toque queda solo ciudad y país, tal como los informa la red de Netlify.
import { randomBytes, timingSafeEqual } from "node:crypto";
import { actualizar } from "./almacen.mjs";
import { firmar } from "./ajustes.mjs";

export const LIMITE_PERSONA = 5 * 60 * 1000;   // un toque por persona cada 5 minutos
export const RAFAGA = 1500;                    // mínimo entre dos toques de cualquiera
export const RAFAGA_LLAVE = 400;               // mínimo entre toques de quien tiene la llave del minuto
export const FICHA_MINIMA = 1200;              // una ficha no sirve antes de 1,2 s…
export const FICHA_MAXIMA = 10 * 60 * 1000;    // …ni después de 10 minutos
export const MAX_ULTIMAS = 12;
export const ESPERA_SONDEO = 4000;

const ALFABETO = "abcdefghijklmnopqrstuvwxyz234567";   // base32
export const ID_HUELLA = /^[a-z2-7]{8}$/;

/** Identificador de una huella: 8 caracteres base32 al azar (40 bits). */
export function idHuella() {
  const b = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += ALFABETO[b[i] & 31];
  return s;
}

/** "Persona" sin guardar la IP: HMAC(secreto, ip|díaUTC), 32 hex. Cambia todos los días. */
export function personaDe(sec, ip, ahora) {
  const dia = new Date(ahora).toISOString().slice(0, 10);
  return firmar(sec, String(ip || "sin-ip") + "|" + dia).slice(0, 32);
}

// ───────────────────────────── fichas (antibots sin captcha) ─────────────────────────────
// Para tocar hay que haber pedido antes una ficha y esperar un momento: una página abierta lo hace
// sola; un guion que dispara POST a ciegas, no. La ficha es "<ms>.<firma>" y no guarda nada.

export function emitirFicha(sec, ahora) {
  const ms = Math.floor(ahora);
  return ms + "." + firmar(sec, "ficha|" + ms).slice(0, 32);
}

/** true si la ficha es nuestra y se emitió hace entre 1,2 s y 10 min. */
export function verificarFicha(sec, ficha, ahora) {
  if (typeof ficha !== "string" || ficha.length > 64) return false;
  const m = /^(\d{12,14})\.([0-9a-f]{32})$/.exec(ficha);
  if (!m) return false;
  const esperada = Buffer.from(firmar(sec, "ficha|" + m[1]).slice(0, 32));
  const recibida = Buffer.from(m[2]);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return false;
  const edad = ahora - Number(m[1]);
  return edad >= FICHA_MINIMA && edad <= FICHA_MAXIMA;
}

// ───────────────────────────── estado ─────────────────────────────

const estadoInicial = (ahora) => ({
  prendida: true, desde: ahora, toques: 0, recordPrendida: 0, recordApagada: 0, ultimas: [], huellaVigente: null
});

/** Lee el estado. La primera vez lo crea: prendida, desde ahora, sin récords. */
export async function leerEstado(alm, ahora) {
  const r = await alm.leer("estado");
  if (r) return r.valor;
  const nuevo = estadoInicial(ahora);
  if (await alm.crear("estado", nuevo)) return nuevo;
  const otra = await alm.leer("estado");      // otro lo creó en el mismo instante
  return otra ? otra.valor : nuevo;
}

/**
 * Lo que se le muestra a cualquiera (GET /api/interruptor y espejo de tiempo real).
 * Los récords incluyen el tramo en curso: si la luz lleva prendida más que nunca, el récord es ese.
 */
export function estadoPublico(est, { ahora, minuto = null, vivo = null, espera = ESPERA_SONDEO } = {}) {
  const tramo = Math.max(0, ahora - est.desde);
  return {
    ahora,
    prendida: !!est.prendida,
    desde: est.desde,
    toques: est.toques || 0,
    recordPrendida: est.prendida ? Math.max(est.recordPrendida || 0, tramo) : est.recordPrendida || 0,
    recordApagada: est.prendida ? est.recordApagada || 0 : Math.max(est.recordApagada || 0, tramo),
    ultimas: (est.ultimas || []).map((u) => ({ ciudad: u.ciudad || "", pais: u.pais || "", cc: u.cc || "", accion: u.accion, t: u.t })),
    minuto: minuto ? { id: minuto.id, hasta: minuto.hasta } : null,
    vivo: vivo || null,
    espera
  };
}

const limpio = (s, max = 60) =>
  typeof s === "string" ? s.replace(/[\u0000-\u001f<>"&\\]/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "";

const enRafaga = (est, ahora, pausa) => est.toques > 0 && ahora - est.desde < pausa;
const espera = (hasta, motivo) => ({ ok: false, estado: 429, error: "espera", hasta, motivo });

/**
 * Un toque. Cambia la luz para todos, cierra la huella anterior y abre una nueva.
 *
 *   persona      HMAC de personaDe() — clave del límite de 5 minutos
 *   minuto       null, o { id, desde, hasta } si este minuto es de alguien (minutoVigente)
 *   llaveValida  true si quien toca trajo la llave de ese minuto
 *
 * Devuelve { ok: true, estado, huella: { id, accion, t }, hasta }  (hasta: cuándo puede volver a tocar; null con llave)
 *       o  { ok: false, estado: 429, error: "espera", hasta, motivo: "persona" | "rafaga" }
 *       o  { ok: false, estado: 423, error: "minuto", id, hasta }
 */
export async function tocar(alm, { ahora, persona, ciudad = "", pais = "", cc = "", llaveValida = false, minuto = null }) {
  if (minuto && !llaveValida) return { ok: false, estado: 423, error: "minuto", id: minuto.id, hasta: minuto.hasta };
  const conLlave = !!minuto;
  const pausa = conLlave ? RAFAGA_LLAVE : RAFAGA;

  // 1. Ráfaga: si alguien acaba de tocar, ni siquiera se gasta el turno de esta persona.
  const previo = await leerEstado(alm, ahora);
  if (enRafaga(previo, ahora, pausa)) return espera(previo.desde + pausa, "rafaga");

  // 2. Un toque por persona cada 5 minutos. La clave se toma con escritura condicional:
  //    dos pedidos simultáneos de la misma persona no pasan los dos.
  let claveLimite = null;
  if (!conLlave) {
    if (typeof persona !== "string" || !persona) throw new Error("interruptor: falta la persona");
    claveLimite = "limite/" + persona;
    let tomado = false, ocupadoHasta = 0;
    await actualizar(alm, claveLimite, (v) => {
      tomado = false;
      if (v && v.hasta > ahora) { ocupadoHasta = v.hasta; return undefined; }
      tomado = true;
      return { hasta: ahora + LIMITE_PERSONA };
    });
    if (!tomado) return espera(ocupadoHasta, "persona");
  }

  // 3. El cambio de la luz, también condicional: si otro escribió en el medio se vuelve a mirar.
  const id = idHuella();
  let rechazo = 0, hecho = null;
  let est;
  try {
    est = await actualizar(alm, "estado", (v) => {
      const e = v || estadoInicial(ahora);
      rechazo = 0; hecho = null;
      if (enRafaga(e, ahora, pausa)) { rechazo = e.desde + pausa; return undefined; }
      const t = Math.max(ahora, e.desde);            // relojes de dos servidores pueden diferir unos ms
      const tramo = t - e.desde;
      const accion = e.prendida ? "apago" : "prendio";
      hecho = { accion, t, anterior: e.huellaVigente || null };
      return {
        prendida: !e.prendida,
        desde: t,
        toques: (e.toques || 0) + 1,
        recordPrendida: e.prendida ? Math.max(e.recordPrendida || 0, tramo) : e.recordPrendida || 0,
        recordApagada: e.prendida ? e.recordApagada || 0 : Math.max(e.recordApagada || 0, tramo),
        ultimas: [{ ciudad: limpio(ciudad), pais: limpio(pais), cc: limpio(cc, 2), accion, t, h: id }]
          .concat(e.ultimas || []).slice(0, MAX_ULTIMAS),
        huellaVigente: id
      };
    });
  } catch (error) {
    // demasiadas escrituras a la vez: el toque no entró, la persona no pierde su turno
    if (claveLimite) await alm.borrar(claveLimite);
    return espera(ahora + pausa, "rafaga");
  }
  if (!hecho) {
    if (claveLimite) await alm.borrar(claveLimite);
    return espera(rechazo || ahora + pausa, "rafaga");
  }

  // 4. Huellas. La anterior se cierra; la nueva se abre. Las dos escrituras fusionan en vez de
  //    pisar, así el orden en que lleguen no importa (si el cierre llega antes que la apertura,
  //    deja anotado el final y la apertura lo respeta).
  const { accion, t, anterior } = hecho;
  await Promise.all([
    anterior
      ? actualizar(alm, "huella/" + anterior, (h) => (h && h.fin != null ? undefined : { ...(h || {}), fin: t }))
      : null,
    actualizar(alm, "huella/" + id, (h) => ({
      id, accion, t, fin: h && h.fin != null ? h.fin : null, ciudad: limpio(ciudad), pais: limpio(pais), cc: limpio(cc, 2)
    }))
  ]);

  return { ok: true, estado: est, huella: { id, accion, t }, hasta: conLlave ? null : ahora + LIMITE_PERSONA };
}

/**
 * Limpieza perezosa: borra hasta `max` claves limite/ vencidas. Se llama después de cada toque.
 * Mira un tramo distinto de la lista cada vez para que ninguna quede olvidada.
 */
export async function limpiarLimites(alm, ahora, max = 20) {
  const claves = await alm.listar("limite/");
  if (!claves.length) return 0;
  const inicio = claves.length > max ? Math.floor(ahora / 1000) % claves.length : 0;
  const tramo = [];
  for (let i = 0; i < Math.min(max, claves.length); i++) tramo.push(claves[(inicio + i) % claves.length]);
  let borradas = 0;
  await Promise.all(tramo.map(async (clave) => {
    const r = await alm.leer(clave);
    if (r && !(r.valor && r.valor.hasta > ahora)) { await alm.borrar(clave); borradas++; }
  }));
  return borradas;
}

/**
 * Una huella: { id, accion, t, fin (null = sigue vigente), ciudad, pais, cc } o null si no existe.
 * Si quedó abierta por un corte entre dos escrituras, se cierra acá con el dato del estado.
 */
export async function leerHuella(alm, id) {
  if (typeof id !== "string" || !ID_HUELLA.test(id)) return null;
  const r = await alm.leer("huella/" + id);
  if (!r || !r.valor || !r.valor.t) return null;
  const h = r.valor;
  let fin = h.fin != null ? h.fin : null;
  if (fin == null) {
    const e = await alm.leer("estado");
    if (e && e.valor.huellaVigente !== id) {
      const ult = e.valor.ultimas || [];
      const i = ult.findIndex((u) => u.h === id);
      fin = i > 0 ? ult[i - 1].t : h.t;          // el toque siguiente es el que la cerró
      await actualizar(alm, "huella/" + id, (v) => (v && v.fin == null ? { ...v, fin } : undefined));
    }
  }
  return { id: h.id || id, accion: h.accion, t: h.t, fin, ciudad: h.ciudad || "", pais: h.pais || "", cc: h.cc || "" };
}

// ───────────────────────────── textos (vista previa e imagen) ─────────────────────────────

/** "37 s", "14 min 7 s", "2 h 14 min", "3 d 4 h": las dos unidades más grandes. Igual en es y en. */
export function duracion(ms, lang = "es") {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
  if (d) return d + " d" + (h ? " " + h + " h" : "");
  if (h) return h + " h" + (m ? " " + m + " min" : "");
  if (m) return m + " min" + (seg ? " " + seg + " s" : "");
  return seg + " s";
}

/** Nombre del país en el idioma pedido, a partir del código; si no se puede, el que vino. */
export function nombrePais(cc, pais, lang = "es") {
  try {
    if (/^[A-Z]{2}$/.test(cc || "")) {
      const n = new Intl.DisplayNames([lang === "en" ? "en" : "es"], { type: "region" }).of(cc);
      if (n && n !== cc) return n;
    }
  } catch (e) {}
  return pais || "";
}

/** "Córdoba, Argentina", "Argentina" o "". */
export function lugar(h, lang = "es") {
  const p = nombrePais(h.cc, h.pais, lang);
  return h.ciudad && p ? h.ciudad + ", " + p : h.ciudad || p || "";
}

export function fraseHuella(accion, lang = "es") {
  const apago = accion === "apago";
  if (lang === "en") return apago ? "I turned off the light of the world." : "I turned on the light of the world.";
  return apago ? "Apagué la luz del mundo." : "Prendí la luz del mundo.";
}

/** "Duró 2 h 14 min." o, si sigue vigente, "Lleva 2 h 14 min así." */
export function lineaDuracion(h, ahora, lang = "es") {
  const vigente = h.fin == null;
  const d = duracion((vigente ? ahora : h.fin) - h.t, lang);
  if (lang === "en") return vigente ? d + " and counting." : "It lasted " + d + ".";
  return vigente ? "Lleva " + d + " así." : "Duró " + d + ".";
}
