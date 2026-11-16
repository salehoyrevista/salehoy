// "El minuto": la lógica de la obra, sin red ni reloj propios.
//
// Un minuto se pide gratis, como regalo. Quien lo pide elige una fecha y una hora en su zona y escribe
// una dedicatoria corta. Cuando llega ese minuto, la dedicatoria (si el autor la aprobó) ocupa la
// portada para todos durante 60 segundos. No hay venta: el aporte a la obra es aparte, voluntario, y
// no pasa por acá (ver ajustes.mjs, aporte()).
//
// Todas las funciones reciben el almacén (`almacen("minuto")` o `almacenEnMemoria()`) y la hora
// actual como parámetros: así se prueban sin red y sin esperar.
//
// Claves del almacén:
//   m/<idurl>              un registro por instante. Se crea con crear(): atómico. "vendido" = ya es de alguien.
//   indice/vendidos        lista ordenada { id, instante } de los minutos que ya son de alguien.
//   pedidos/<firma>        último pedido de una persona (firma de IP + semana; la IP no se guarda).
//   diario/<AAAA-MM-DD>    cuántos minutos se pidieron ese día (tope global).
//   tx/, monto/, vencidas/, huerfanos/, limite/   de cuando El minuto se vendía (hasta el 17/11/2026).
//   admin-fallos/<firma>   intentos fallidos de contraseña de administración.
//   avisos/<idurl>-<tipo>  avisos ya enviados al dueño (ver avisos.mjs).
//
// Nada de lo que se guarda identifica a quien pide: ni su IP, ni su nombre, ni una billetera.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { actualizar } from "./almacen.mjs";
import { REDES } from "./ajustes.mjs";
import { aInstante, aLocal, zonaValida } from "./zonas.mjs";
import { precioDe } from "./precios.mjs";
import { revisar, normalizar } from "./filtro.mjs";
import { HASH_VALIDO } from "./pago.mjs";

export const MINUTO = 60 * 1000;
export const HORA = 60 * MINUTO;
export const DIA = 24 * HORA;
export const ANTICIPO_MIN = 5 * MINUTO;         // no se pide un minuto que empieza en menos de 5 min
export const HORIZONTE = 730 * DIA;             // ni uno que está a más de 2 años
export const ESPERA_PERSONA = 7 * DIA;          // un minuto por persona cada 7 días
export const TOPE_DIARIO = 50;                  // minutos pedidos por día en todo el mundo (contra avalanchas)
export const ADMIN_FALLOS = 10;                 // intentos fallidos…
export const ADMIN_VENTANA = 10 * MINUTO;       // …en 10 minutos bloquean…
export const ADMIN_BLOQUEO = 10 * MINUTO;       // …durante 10 minutos

const RE_ID = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})[:-](\d{2})Z$/;
const INDICE = "indice/vendidos";

const sha = (t) => createHash("sha256").update(String(t)).digest("hex");

/** Compara dos cadenas en tiempo constante. */
function iguales(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ---------------------------------------------------------------- identificadores

/** ms -> "2026-12-24T03:33Z" (truncado al minuto). */
export function idDeInstante(ms) {
  return new Date(Math.floor(ms / MINUTO) * MINUTO).toISOString().slice(0, 16) + "Z";
}

/** "2026-12-24T03:33Z" o "2026-12-24T03-33Z" -> ms, o null si no es un id válido. */
export function instanteDeId(id) {
  const m = typeof id === "string" && RE_ID.exec(id);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  if (!Number.isFinite(t) || +m[1] < 1970) return null;
  return idDeInstante(t) === `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}Z` ? t : null;
}

/** Cualquiera de las dos formas -> "2026-12-24T03-33Z" (la de URLs y claves), o null. */
export function idUrl(id) {
  const t = instanteDeId(id);
  return t === null ? null : idDeInstante(t).replace(":", "-");
}

const canonico = (id) => { const t = instanteDeId(id); return t === null ? null : idDeInstante(t); };
const claveDe = (id) => "m/" + idUrl(id);
export const utcDe = (instante) => idDeInstante(instante).replace("T", " ").replace("Z", " UTC");

/** Unidades de USDC (6 decimales) -> "5.0037". */
export function montoUsdc(unidades) {
  const u = Number(unidades);
  return `${Math.floor(u / 1e6)}.${String(u % 1e6).padStart(6, "0").slice(0, 4)}`;
}

export const paginaDe = (id, lang = "es") =>
  (lang === "en" ? "/en/minute/m/" : "/minuto/m/") + idUrl(id) + "/";

/** Datos públicos de una red (sin nada que no haga falta del lado del navegador). */
export function redPublica(red) {
  if (!red) return null;
  const { nombre, chainId, chainIdHex, usdc, explorador, rpcs, confirmaciones } = red;
  return { nombre, chainId, chainIdHex, usdc, explorador, rpcs: [...(rpcs || [])], confirmaciones };
}

// ---------------------------------------------------------------- consultar

const reservaVigente = (v, ahora) => v && v.estado === "reservado" && v.reserva && v.reserva.vence > ahora;

function motivoOcupado(v, ahora) {
  if (!v) return null;
  if (v.estado === "vendido") return "vendido";
  if (reservaVigente(v, ahora)) return "reservado";
  return null;
}

function convertir({ fecha, hora, zona }) {
  try {
    const z = zonaValida(zona);
    const { instante, ambigua } = aInstante({ fecha, hora, zona });
    return { instante, ambigua, zona: z };
  } catch (e) {
    return { error: (e && e.codigo) || "formato" };
  }
}

function motivoTiempo(instante, ahora) {
  if (instante < ahora + ANTICIPO_MIN) return "pasado";
  if (instante > ahora + HORIZONTE) return "lejano";
  return null;
}

/**
 * GET /api/minuto/precio (el nombre quedó de cuando se vendía: ya no hay precio, solo disponibilidad)
 * @returns {Promise<{ status: number, cuerpo: object }>}
 */
export async function consultar(alm, { fecha, hora, zona, ahora }) {
  const c = convertir({ fecha, hora, zona });
  if (c.error) return { status: 422, cuerpo: { error: c.error } };
  const id = idDeInstante(c.instante);
  const { especial } = precioDe({ fecha, hora });
  let motivo = motivoTiempo(c.instante, ahora);
  if (!motivo) {
    const r = await alm.leer(claveDe(id));
    motivo = motivoOcupado(r && r.valor, ahora);
  }
  return {
    status: 200,
    cuerpo: {
      id, instante: c.instante, utc: utcDe(c.instante), zona: c.zona, local: { fecha, hora },
      especial, disponible: !motivo, motivo, ambigua: c.ambigua
    }
  };
}

// ---------------------------------------------------------------- pedir

/**
 * Lugar de una persona para pedir: un minuto cada 7 días. Se toma ANTES de crear el minuto, con
 * escritura condicional, para que dos pedidos simultáneos de la misma persona no pasen los dos.
 * Devuelve null si lo tomó, o la respuesta de rechazo. `persona` es una firma (IP + semana): la IP
 * no se guarda.
 */
async function tomarLugar(alm, persona, ahora) {
  if (!persona) return { ok: true, soltar: async () => {} };
  const clave = "pedidos/" + persona;
  const valor = { t: ahora };
  if (await alm.crear(clave, valor)) return { ok: true, soltar: () => alm.borrar(clave).catch(() => {}) };
  const ex = await alm.leer(clave);
  if (ex && ex.valor && ex.valor.t > ahora - ESPERA_PERSONA) {
    return { ok: false, respuesta: { status: 429, cuerpo: { error: "espera", motivo: "semana", hasta: ex.valor.t + ESPERA_PERSONA } } };
  }
  if (ex && await alm.reemplazar(clave, valor, ex.etag)) return { ok: true, soltar: () => alm.borrar(clave).catch(() => {}) };
  return { ok: false, respuesta: { status: 429, cuerpo: { error: "espera", motivo: "semana", hasta: ahora + ESPERA_PERSONA } } };
}

/**
 * Tope global de pedidos por día (UTC). Es un freno contra avalanchas, no una cuenta exacta: se lee
 * antes de pedir y se suma solo si el pedido salió bien (dos pedidos simultáneos pueden pasarlo por uno).
 */
async function diaLleno(alm, ahora) {
  const d = new Date(ahora);
  const r = await alm.leer("diario/" + d.toISOString().slice(0, 10));
  if (!(r && r.valor && r.valor.n >= TOPE_DIARIO)) return null;
  return { status: 429, cuerpo: { error: "espera", motivo: "dia", hasta: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) } };
}

async function sumarAlDia(alm, ahora) {
  const dia = new Date(ahora).toISOString().slice(0, 10);
  try { await actualizar(alm, "diario/" + dia, (v) => ({ n: ((v && v.n) || 0) + 1 }), 20); } catch (e) { /* el tope es aproximado */ }
}

/**
 * POST /api/minuto/pedir — el minuto se pide gratis y queda de quien lo pidió en el acto.
 * La dedicatoria queda pendiente hasta que el autor la apruebe. No hay pago: el aporte a la obra es
 * aparte y voluntario, y no cambia nada del minuto.
 * Internamente el registro sigue usando `estado: "vendido"` (= ya es de alguien) para no tocar las
 * lecturas; no hay ninguna venta.
 * @param {object} p
 * @param {string} p.fecha  @param {string} p.hora  @param {string} p.zona
 * @param {string} p.dedicatoria  @param {string} [p.lang]
 * @param {number} p.ahora
 * @param {string|null} [p.persona]  firma de IP + semana (nunca la IP); null: sin límite (tests)
 * @returns {Promise<{ status: number, cuerpo: object }>}
 */
export async function pedir(alm, { fecha, hora, zona, dedicatoria, lang, ahora, persona = null }) {
  const rev = revisar(dedicatoria);
  if (!rev.ok) return { status: 422, cuerpo: { error: "dedicatoria", detalle: rev.detalle } };

  const c = convertir({ fecha, hora, zona });
  if (c.error) return { status: 422, cuerpo: { error: c.error } };
  const instante = c.instante;
  const id = idDeInstante(instante);
  const clave = claveDe(id);

  const tiempo = motivoTiempo(instante, ahora);
  if (tiempo) return { status: 409, cuerpo: { error: "ocupado", motivo: tiempo } };

  const previo = await alm.leer(clave);
  const ocupado = motivoOcupado(previo && previo.valor, ahora);
  if (ocupado) return { status: 409, cuerpo: { error: "ocupado", motivo: ocupado } };

  const lleno = await diaLleno(alm, ahora);
  if (lleno) return lleno;
  const lugar = await tomarLugar(alm, persona, ahora);
  if (!lugar.ok) return lugar.respuesta;

  const llave = randomBytes(24).toString("base64url");
  const local = { fecha, hora };
  const registro = {
    id, instante, zona: c.zona, local,
    estado: "vendido",            // = ya es de alguien (ver arriba)
    dedicatoria: rev.texto,
    lang: lang === "en" ? "en" : "es",
    creado: ahora,
    vendido: ahora,
    pago: { gratis: true },
    moderacion: "pendiente",
    llaveHash: sha(llave),
    prueba: false
  };

  // Un instante, un dueño: crear() es atómico; si había un registro viejo libre, se reemplaza con etag.
  const ok = previo ? await alm.reemplazar(clave, registro, previo.etag) : await alm.crear(clave, registro);
  if (!ok) {
    await lugar.soltar();
    return { status: 409, cuerpo: { error: "ocupado", motivo: "vendido" } };
  }

  await sumarAlDia(alm, ahora);
  await actualizar(alm, INDICE, (lista) => {
    const l = Array.isArray(lista) ? lista.filter((x) => x.id !== id) : [];
    l.push({ id, instante });
    l.sort((a, b) => a.instante - b.instante);
    return l;
  }, 30);

  return {
    status: 200,
    cuerpo: { estado: "vendido", id, llave, pagina: paginaDe(id, registro.lang), local, zona: c.zona, utc: utcDe(instante) }
  };
}

// ---------------------------------------------------------------- lecturas públicas

async function leerIndice(alm) {
  const r = await alm.leer(INDICE);
  return r && Array.isArray(r.valor) ? r.valor : [];
}

async function leerVendido(alm, id) {
  const r = await alm.leer(claveDe(id));
  return r && r.valor && r.valor.estado === "vendido" ? r.valor : null;
}

const aprobada = (v) => v.moderacion === "aprobada";

/** Igual que GET /api/minuto/m. null si no existe o no está vendido. */
export async function leerMinutoPublico(alm, id, ahora = Date.now()) {
  const c = canonico(id);
  if (!c) return null;
  const v = await leerVendido(alm, c);
  if (!v) return null;
  return {
    id: c,
    instante: v.instante,
    zona: v.zona,
    local: v.local,
    estado: v.moderacion || "pendiente",
    dedicatoria: aprobada(v) ? v.dedicatoria : null,
    prueba: !!v.prueba,
    vendido: v.vendido,
    pasado: ahora >= v.instante + MINUTO
  };
}

/** Igual que GET /api/minuto/archivo: minutos que ya pasaron, del más reciente al más viejo. */
export async function listarArchivo(alm, { antes = null, n = 50, ahora = Date.now() } = {}) {
  const tope = Math.max(1, Math.min(200, Math.floor(Number(n)) || 50));
  const limite = Number.isFinite(Number(antes)) && antes !== null ? Math.min(Number(antes), ahora - MINUTO + 1) : ahora - MINUTO + 1;
  const candidatos = (await leerIndice(alm)).filter((x) => x.instante < limite).sort((a, b) => b.instante - a.instante);
  const pagina = candidatos.slice(0, tope);
  const regs = await Promise.all(pagina.map((x) => leerVendido(alm, x.id)));
  const minutos = [];
  pagina.forEach((x, i) => {
    const v = regs[i];
    if (!v) return;
    minutos.push({ id: x.id, instante: v.instante, dedicatoria: aprobada(v) ? v.dedicatoria : null, estado: v.moderacion || "pendiente", prueba: !!v.prueba });
  });
  const sigue = candidatos.length > tope ? pagina[pagina.length - 1].instante : null;
  return { minutos, sigue };
}

/** GET /api/minuto/ahora */
export async function ahoraPublico(alm, { ahora }) {
  const indice = await leerIndice(alm);
  let minuto = null;
  const actual = indice.find((x) => x.instante <= ahora && ahora < x.instante + MINUTO);
  if (actual) {
    const v = await leerVendido(alm, actual.id);
    if (v) {
      const ok = aprobada(v);
      minuto = {
        id: actual.id, desde: v.instante, hasta: v.instante + MINUTO,
        estado: ok ? "aprobada" : "neutra",
        dedicatoria: ok ? v.dedicatoria : null,
        prueba: !!v.prueba
      };
    }
  }
  const proximos = indice
    .filter((x) => x.instante > ahora && x.instante <= ahora + DIA)
    .slice(0, 20)
    .map((x) => ({ id: x.id, desde: x.instante }));
  return { ahora, minuto, proximos };
}

// ---------------------------------------------------------------- conexión con "El interruptor"

/**
 * El minuto que contiene `ahora`, si su dedicatoria está aprobada; si no, null. Como pedir un minuto
 * es gratis, la aprobación del autor es lo que da el control de El interruptor: un minuto sin
 * aprobar no le quita la luz a nadie.
 */
export async function vigenteEn(alm, ahora) {
  const indice = await leerIndice(alm);
  const x = indice.find((e) => e.instante <= ahora && ahora < e.instante + MINUTO);
  if (!x) return null;
  const v = await leerVendido(alm, x.id);
  return v && aprobada(v) ? { id: x.id, desde: v.instante, hasta: v.instante + MINUTO } : null;
}

/** true si `llave` es la llave que recibió quien compró ese minuto. */
export async function esLlaveEn(alm, id, llave) {
  if (typeof llave !== "string" || !llave || llave.length > 200) return false;
  const c = canonico(id);
  if (!c) return false;
  const v = await leerVendido(alm, c);
  return !!(v && iguales(v.llaveHash, sha(llave)));
}

// ---------------------------------------------------------------- administración

/**
 * Portero de las rutas de administración. Devuelve null si pasa, o la respuesta de rechazo.
 * Tras ADMIN_FALLOS intentos fallidos en ADMIN_VENTANA, esa persona queda afuera ADMIN_BLOQUEO.
 * `persona` es una firma (IP + secreto); la IP no se guarda.
 */
export async function controlAdmin(alm, { clave, persona, ahora, esAdmin, hayAdmin }) {
  if (!hayAdmin()) return { status: 503, cuerpo: { error: "sin-clave" } };
  const k = "admin-fallos/" + (persona || "anonimo");
  const r = await alm.leer(k);
  const reg = r ? r.valor : null;
  if (reg && reg.bloqueo > ahora) return { status: 429, cuerpo: { error: "espera", hasta: reg.bloqueo } };
  if (esAdmin(clave)) return null;
  try {
    await actualizar(alm, k, (v) => {
      const fallos = ((v && v.fallos) || []).filter((t) => t > ahora - ADMIN_VENTANA);
      fallos.push(ahora);
      return fallos.length >= ADMIN_FALLOS ? { fallos: [], bloqueo: ahora + ADMIN_BLOQUEO } : { fallos, bloqueo: 0 };
    });
  } catch (e) {}
  return { status: 401, cuerpo: { error: "clave" } };
}

/** GET /api/admin/minutos?estado=pendiente|todas */
export async function listarParaAdmin(alm, { estado = "pendiente", ahora = Date.now() } = {}) {
  const indice = await leerIndice(alm);
  const regs = [];
  for (let i = 0; i < indice.length; i += 25) {
    regs.push(...await Promise.all(indice.slice(i, i + 25).map((x) => leerVendido(alm, x.id))));
  }
  const minutos = [];
  for (const v of regs) {
    if (!v) continue;
    const mod = v.moderacion || "pendiente";
    if (estado === "pendiente" && mod !== "pendiente") continue;
    const red = v.pago && v.pago.red ? REDES[v.pago.red] : null;
    const unidades = v.reserva && v.reserva.montoUnidades;
    minutos.push({
      id: v.id, idurl: idUrl(v.id), instante: v.instante, utc: utcDe(v.instante),
      zona: v.zona, local: v.local, dedicatoria: v.dedicatoria, lang: v.lang,
      estado: mod, nota: v.nota || null, reembolso: v.reembolso || null,
      prueba: !!v.prueba, precioUsd: v.precioUsd,
      montoUsdc: unidades ? montoUsdc(unidades) : null,
      pago: v.pago || null,
      explorador: red && v.pago.hash ? `${red.explorador}/tx/${v.pago.hash}` : null,
      vendido: v.vendido, pasado: ahora >= v.instante + MINUTO
    });
  }
  const huerfanos = [];
  for (const k of await alm.listar("huerfanos/")) {
    const h = await alm.leer(k);
    if (h && h.valor && (estado !== "pendiente" || !h.valor.reembolso || h.valor.reembolso.estado !== "hecho")) huerfanos.push(h.valor);
  }
  return { minutos, huerfanos };
}

/**
 * POST /api/admin/moderar { id, decision: "aprobar" | "rechazar", nota? }
 * Aprobar: la dedicatoria se muestra y la llave controla El interruptor durante ese minuto.
 * Rechazar: el minuto vuelve a quedar libre (se borra el registro). Quien lo pidió puede pedirlo de
 * nuevo con otro texto cuando pase su semana. No hay nada que devolver: pedir es gratis.
 */
export async function moderar(alm, { id, decision, nota, ahora = Date.now() }) {
  const c = canonico(id);
  if (!c) return { status: 404, cuerpo: { error: "no-existe" } };
  if (decision !== "aprobar" && decision !== "rechazar") return { status: 422, cuerpo: { error: "decision" } };
  const actual = await alm.leer(claveDe(c));
  if (!actual || !actual.valor || actual.valor.estado !== "vendido") return { status: 404, cuerpo: { error: "no-existe" } };

  if (decision === "rechazar") {
    if (!(await alm.reemplazar(claveDe(c), { ...actual.valor, estado: "liberado", moderacion: "rechazada", moderado: ahora }, actual.etag))) {
      return { status: 409, cuerpo: { error: "cambio" } };
    }
    await alm.borrar(claveDe(c));
    await actualizar(alm, INDICE, (l) => (Array.isArray(l) ? l.filter((x) => x.id !== c) : []));
    for (const tipo of ["vendido", "pronto", "neutro"]) await alm.borrar(`avisos/${idUrl(c)}-${tipo}`).catch(() => {});
    const t = normalizar(typeof nota === "string" ? nota : "").slice(0, 300);
    return { status: 200, cuerpo: { id: c, estado: "rechazada", liberado: true, nota: t || null } };
  }

  const final = await actualizar(alm, claveDe(c), (v) => {
    if (!v || v.estado !== "vendido") return undefined;
    const n = { ...v, moderacion: "aprobada", moderado: ahora };
    delete n.nota;
    if (n.reembolso && n.reembolso.estado === "pendiente") delete n.reembolso;
    return n;
  });
  if (!final || final.moderacion !== "aprobada") return { status: 404, cuerpo: { error: "no-existe" } };
  return { status: 200, cuerpo: { id: c, estado: "aprobada", nota: null } };
}

/**
 * POST /api/admin/reembolso { id, hash }: anota el hash del reembolso hecho a mano.
 * `id` es el de un minuto, o el hash de un pago huérfano (ver listarParaAdmin().huerfanos).
 */
export async function anotarReembolso(alm, { id, hash, ahora = Date.now() }) {
  if (typeof hash !== "string" || !HASH_VALIDO.test(hash)) return { status: 422, cuerpo: { error: "hash" } };
  const h = hash.toLowerCase();
  const reembolso = { estado: "hecho", hash: h, t: ahora };
  if (typeof id === "string" && HASH_VALIDO.test(id)) {
    let existe = true;
    await actualizar(alm, "huerfanos/" + id.toLowerCase(), (v) => { if (!v) { existe = false; return undefined; } return { ...v, reembolso }; });
    if (!existe) return { status: 404, cuerpo: { error: "no-existe" } };
    return { status: 200, cuerpo: { estado: "hecho", hash: h } };
  }
  const c = canonico(id);
  if (!c) return { status: 404, cuerpo: { error: "no-existe" } };
  let existe = true;
  await actualizar(alm, claveDe(c), (v) => { if (!v || v.estado !== "vendido") { existe = false; return undefined; } return { ...v, reembolso }; });
  if (!existe) return { status: 404, cuerpo: { error: "no-existe" } };
  return { status: 200, cuerpo: { estado: "hecho", hash: h } };
}

/**
 * POST /api/admin/borrar-pruebas: borra los minutos vendidos con `prueba: true` (y sus hashes y avisos).
 * Es lo que se corre una vez al pasar a modo real. Los minutos reales no se tocan.
 */
export async function borrarPruebas(alm) {
  const indice = await leerIndice(alm);
  const borrar = new Set();
  for (const x of indice) {
    const r = await alm.leer(claveDe(x.id));
    const v = r && r.valor;
    if (!v || !v.prueba) continue;
    borrar.add(x.id);
    await alm.borrar(claveDe(x.id));
    if (v.pago && v.pago.hash) await alm.borrar("tx/" + v.pago.hash);
    for (const tipo of ["vendido", "pronto", "neutro"]) await alm.borrar(`avisos/${idUrl(x.id)}-${tipo}`);
  }
  if (borrar.size) await actualizar(alm, INDICE, (l) => (Array.isArray(l) ? l.filter((x) => !borrar.has(x.id)) : []));
  return { borrados: borrar.size, ids: [...borrar] };
}

// ---------------------------------------------------------------- vigía

/** Avisos que corresponde mandar ahora: [{ id, tipo: "pronto" | "neutro" }]. avisar() deduplica. */
export async function avisosPendientes(alm, ahora) {
  const indice = await leerIndice(alm);
  const salida = [];
  for (const x of indice) {
    if (x.instante > ahora + DIA || x.instante < ahora - 3 * DIA) continue;
    const v = await leerVendido(alm, x.id);
    if (!v || (v.moderacion || "pendiente") !== "pendiente") continue;
    salida.push({ id: x.id, tipo: x.instante <= ahora ? "neutro" : "pronto" });
  }
  return salida;
}

/** Limpieza de claves auxiliares viejas (montos y límites vencidos). Tope por vuelta. */
export async function limpiar(alm, ahora, tope = 200) {
  let n = 0;
  for (const k of await alm.listar("monto/")) {
    if (n >= tope) break;
    const r = await alm.leer(k);
    if (r && !(r.valor && r.valor.vence > ahora - HORA)) { await alm.borrar(k); n++; }
  }
  for (const k of await alm.listar("limite/")) {
    if (n >= tope) break;
    const r = await alm.leer(k);
    if (r && !(r.valor && r.valor.t > ahora - 2 * DIA)) { await alm.borrar(k); n++; }
  }
  for (const k of await alm.listar("pedidos/")) {
    if (n >= tope) break;
    const r = await alm.leer(k);
    if (r && !(r.valor && r.valor.t > ahora - ESPERA_PERSONA)) { await alm.borrar(k); n++; }
  }
  for (const k of await alm.listar("diario/")) {
    if (n >= tope) break;
    if (k.slice(7) < new Date(ahora - 3 * DIA).toISOString().slice(0, 10)) { await alm.borrar(k); n++; }
  }
  for (const k of await alm.listar("admin-fallos/")) {
    if (n >= tope) break;
    const r = await alm.leer(k);
    const v = r && r.valor;
    if (v && !(v.bloqueo > ahora) && !(v.fallos || []).some((t) => t > ahora - ADMIN_VENTANA)) { await alm.borrar(k); n++; }
  }
  return n;
}

// ---------------------------------------------------------------- respuestas HTTP

export const SIN_CACHE = { "cache-control": "no-store" };

export function json(cuerpo, status = 200, cabeceras = SIN_CACHE) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", ...cabeceras }
  });
}

/** Lee un cuerpo JSON chico. null si no es JSON o es demasiado grande. */
export async function leerCuerpo(req, max = 4000) {
  try {
    const t = await req.text();
    if (t.length > max) return null;
    const d = JSON.parse(t);
    return d && typeof d === "object" && !Array.isArray(d) ? d : null;
  } catch (e) { return null; }
}
