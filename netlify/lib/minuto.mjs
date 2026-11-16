// "El minuto": la lógica de venta, sin red ni reloj propios.
//
// Se vende un minuto como regalo. Quien compra elige una fecha y una hora en su zona, escribe una
// dedicatoria corta y paga en USDC. Cuando llega ese minuto, la dedicatoria (si el dueño la aprobó)
// ocupa la portada para todos durante 60 segundos.
//
// Todas las funciones reciben el almacén (`almacen("minuto")` o `almacenEnMemoria()`) y la hora
// actual como parámetros: así se prueban sin red y sin esperar.
//
// Claves del almacén:
//   m/<idurl>              un registro por instante (reservado o vendido). Se crea con crear(): atómico.
//   tx/<hash>              hash de pago ya usado. Se crea ANTES de marcar vendido: un pago, un minuto.
//   monto/<unidades>       reserva vigente que tiene ese monto exacto (ata un pago a una reserva).
//   vencidas/<ficha>       reserva vencida que otra persona retomó (para registrar un pago tardío).
//   huerfanos/<hash>       pago verificado que llegó tarde: se devuelve a mano.
//   indice/vendidos        lista ordenada { id, instante } de los minutos vendidos.
//   limite/<firma>         reservas recientes de una persona (firma de IP + día; la IP no se guarda).
//   admin-fallos/<firma>   intentos fallidos de contraseña de administración.
//   avisos/<idurl>-<tipo>  avisos ya enviados al dueño (ver avisos.mjs).
//
// Nada de lo que se guarda identifica a quien compra: ni su dirección, ni su IP, ni su nombre.
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { actualizar } from "./almacen.mjs";
import { REDES } from "./ajustes.mjs";
import { aInstante, aLocal, zonaValida } from "./zonas.mjs";
import { precioDe } from "./precios.mjs";
import { revisar, normalizar } from "./filtro.mjs";
import { verificarPago, crearRpc, HASH_VALIDO } from "./pago.mjs";

export const MINUTO = 60 * 1000;
export const HORA = 60 * MINUTO;
export const DIA = 24 * HORA;
export const RESERVA_MS = 15 * MINUTO;          // lo que dura una reserva sin pagar
export const ANTICIPO_MIN = 5 * MINUTO;         // no se vende un minuto que empieza en menos de 5 min
export const HORIZONTE = 730 * DIA;             // ni uno que está a más de 2 años
export const MAX_VIGENTES = 3;                  // reservas vigentes por persona
export const MAX_POR_HORA = 10;                 // reservas por persona en una hora
export const TOLERANCIA_RELOJ = 30 * 1000;      // el bloque del pago puede marcar hasta 30 s antes de la reserva
export const ADMIN_FALLOS = 10;                 // intentos fallidos…
export const ADMIN_VENTANA = 10 * MINUTO;       // …en 10 minutos bloquean…
export const ADMIN_BLOQUEO = 10 * MINUTO;       // …durante 10 minutos

const RE_ID = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})[:-](\d{2})Z$/;
const RE_RESERVA = /^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}Z)\.([0-9a-f]{64})$/;
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

const claveRed = (red) => (red && red.chainId === REDES.real.chainId ? "real" : "prueba");

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
 * GET /api/minuto/precio
 * @returns {Promise<{ status: number, cuerpo: object }>}
 */
export async function consultar(alm, { fecha, hora, zona, ahora }) {
  const c = convertir({ fecha, hora, zona });
  if (c.error) return { status: 422, cuerpo: { error: c.error } };
  const id = idDeInstante(c.instante);
  const { precioUsd, especial } = precioDe({ fecha, hora });
  let motivo = motivoTiempo(c.instante, ahora);
  if (!motivo) {
    const r = await alm.leer(claveDe(id));
    motivo = motivoOcupado(r && r.valor, ahora);
  }
  return {
    status: 200,
    cuerpo: {
      id, instante: c.instante, utc: utcDe(c.instante), zona: c.zona, local: { fecha, hora },
      precioUsd, especial, disponible: !motivo, motivo, ambigua: c.ambigua
    }
  };
}

// ---------------------------------------------------------------- reservar

async function revisarLimite(alm, persona, ahora) {
  if (!persona) return null;
  const r = await alm.leer("limite/" + persona);
  const lista = (r && Array.isArray(r.valor.reservas)) ? r.valor.reservas : [];
  const vigentes = lista.filter((x) => x.vence > ahora).length;
  const enLaHora = lista.filter((x) => x.t > ahora - HORA).length;
  if (vigentes >= MAX_VIGENTES) return { error: "espera", motivo: "reservas", hasta: Math.min(...lista.filter((x) => x.vence > ahora).map((x) => x.vence)) };
  if (enLaHora >= MAX_POR_HORA) return { error: "espera", motivo: "hora", hasta: Math.min(...lista.filter((x) => x.t > ahora - HORA).map((x) => x.t)) + HORA };
  return null;
}

async function anotarLimite(alm, persona, ahora, vence) {
  if (!persona) return;
  try {
    await actualizar(alm, "limite/" + persona, (v) => {
      const viejas = (v && Array.isArray(v.reservas)) ? v.reservas : [];
      const reservas = viejas.filter((x) => x.vence > ahora || x.t > ahora - HORA);
      reservas.push({ t: ahora, vence });
      return { reservas, t: ahora };
    });
  } catch (e) { /* el límite es una cortesía: si no se pudo anotar, la reserva vale igual */ }
}

/** Toma un monto libre: precio + n centésimos de centavo (n de 1 a 99). null si no queda ninguno. */
async function tomarMonto(alm, precioUsd, valor, ahora) {
  const inicio = randomInt(99);
  for (let k = 0; k < 99; k++) {
    const n = ((inicio + k) % 99) + 1;
    const unidades = precioUsd * 1_000_000 + n * 100;
    const clave = "monto/" + unidades;
    if (await alm.crear(clave, valor)) return unidades;
    const ex = await alm.leer(clave);
    if (ex && !(ex.valor && ex.valor.vence > ahora) && await alm.reemplazar(clave, valor, ex.etag)) return unidades;
  }
  return null;
}

async function soltarMonto(alm, unidades, ficha) {
  try {
    const clave = "monto/" + unidades;
    const ex = await alm.leer(clave);
    if (ex && ex.valor && ex.valor.ficha === ficha) await alm.borrar(clave);
  } catch (e) { /* si queda, vence solo */ }
}

/**
 * POST /api/minuto/reservar
 * @param {object} p
 * @param {string} p.fecha  @param {string} p.hora  @param {string} p.zona
 * @param {string} p.dedicatoria  @param {string} [p.lang]
 * @param {number} p.ahora
 * @param {string|null} [p.persona]  firma de IP + día (nunca la IP); null: sin límite (tests)
 * @param {{ modo: string, direccion: string, red: object }} p.ventas  lo que devuelve ventas()
 * @returns {Promise<{ status: number, cuerpo: object }>}
 */
export async function reservar(alm, { fecha, hora, zona, dedicatoria, lang, ahora, persona = null, ventas }) {
  const rev = revisar(dedicatoria);
  if (!rev.ok) return { status: 422, cuerpo: { error: "dedicatoria", detalle: rev.detalle } };

  const c = convertir({ fecha, hora, zona });
  if (c.error) return { status: 422, cuerpo: { error: c.error } };
  const instante = c.instante;
  const id = idDeInstante(instante);
  const clave = claveDe(id);

  const tiempo = motivoTiempo(instante, ahora);
  if (tiempo) return { status: 409, cuerpo: { error: "ocupado", motivo: tiempo } };

  const limite = await revisarLimite(alm, persona, ahora);
  if (limite) return { status: 429, cuerpo: limite };

  const previo = await alm.leer(clave);
  const ocupado = motivoOcupado(previo && previo.valor, ahora);
  if (ocupado) return { status: 409, cuerpo: { error: "ocupado", motivo: ocupado } };

  const secretoReserva = randomBytes(32).toString("hex");
  const ficha = sha(secretoReserva);
  const vence = ahora + RESERVA_MS;
  const { precioUsd } = precioDe({ fecha, hora });

  const unidades = await tomarMonto(alm, precioUsd, { id, ficha, vence }, ahora);
  if (unidades === null) return { status: 429, cuerpo: { error: "espera", motivo: "montos", hasta: ahora + MINUTO } };

  const registro = {
    id, instante, zona: c.zona, local: { fecha, hora },
    estado: "reservado",
    reserva: { ficha, vence, montoUnidades: unidades },
    dedicatoria: rev.texto,
    lang: lang === "en" ? "en" : "es",
    precioUsd,
    creado: ahora
  };

  let ok;
  if (previo) {
    // Reserva vencida de otra persona: se retoma sin pisar a nadie (etag). Se guarda lo justo de la
    // anterior para que, si igual pagó tarde, el pago quede registrado para devolverlo.
    ok = await alm.reemplazar(clave, registro, previo.etag);
    if (ok && previo.valor && previo.valor.reserva) {
      const v = previo.valor;
      try {
        await alm.crear("vencidas/" + v.reserva.ficha, { id, montoUnidades: v.reserva.montoUnidades, creado: v.creado, t: ahora });
      } catch (e) {}
    }
  } else {
    ok = await alm.crear(clave, registro);
  }
  if (!ok) {
    await soltarMonto(alm, unidades, ficha);
    const ahoraHay = await alm.leer(clave);
    return { status: 409, cuerpo: { error: "ocupado", motivo: motivoOcupado(ahoraHay && ahoraHay.valor, ahora) || "reservado" } };
  }

  await anotarLimite(alm, persona, ahora, vence);

  return {
    status: 200,
    cuerpo: {
      reserva: idUrl(id) + "." + secretoReserva,
      id, instante, zona: c.zona, local: { fecha, hora }, ambigua: c.ambigua,
      precioUsd,
      montoUsdc: montoUsdc(unidades),
      montoUnidades: String(unidades),
      vence,
      pago: { modo: ventas.modo, red: redPublica(ventas.red), direccion: ventas.direccion || "" }
    }
  };
}

// ---------------------------------------------------------------- pagar

const TEXTO_HUERFANO = {
  texto: "La reserva venció y otra persona tomó el minuto. El pago quedó registrado para reembolso.",
  textoEn: "The reservation expired and someone else took the minute. Your payment was recorded for a refund."
};

async function registrarHuerfano(alm, { hash, id, ahora }) {
  const h = hash.toLowerCase();
  try { await alm.guardar("tx/" + h, { id, huerfano: true, t: ahora }); } catch (e) {}
  try { await alm.crear("huerfanos/" + h, { hash: h, id, t: ahora, reembolso: { estado: "pendiente" } }); } catch (e) {}
  return { status: 409, cuerpo: { error: "reserva-vencida", huerfano: true, ...TEXTO_HUERFANO } };
}

function respuestaVerificacion(r) {
  if (r.esperando) return { status: 202, cuerpo: { estado: "esperando", confirmaciones: r.confirmaciones, necesarias: r.necesarias } };
  return { status: 422, cuerpo: { error: "pago-invalido", detalle: r.detalle } };
}

/**
 * POST /api/minuto/pagar
 * @param {object} p
 * @param {string} p.reserva   token devuelto por reservar
 * @param {string} [p.hash]    hash de la transacción (testnet / real)
 * @param {boolean} [p.simulado]  solo en modo "simulado"
 * @param {number} p.ahora
 * @param {{ modo: string, prueba: boolean, direccion: string, red: object }} p.ventas
 * @param {Function} [p.rpc]      cliente RPC (tests); por omisión, el real de la red del modo
 * @returns {Promise<{ status: number, cuerpo: object, vendido?: object }>}
 */
export async function confirmarPago(alm, { reserva, hash, simulado, ahora, ventas, rpc }) {
  const m = typeof reserva === "string" && RE_RESERVA.exec(reserva);
  if (!m) return { status: 409, cuerpo: { error: "reserva-vencida" } };
  const id = canonico(m[1]);
  if (!id) return { status: 409, cuerpo: { error: "reserva-vencida" } };
  const ficha = sha(m[2]);
  const clave = claveDe(id);

  const esSimulado = simulado === true;
  if (esSimulado !== (ventas.modo === "simulado")) {
    // En "simulado" no hay a dónde pagar; en testnet/real no se simula.
    return { status: 422, cuerpo: { error: "pago-invalido", detalle: esSimulado ? "simulado" : "no-encontrada" } };
  }
  const h = esSimulado ? null : (typeof hash === "string" && HASH_VALIDO.test(hash) ? hash.toLowerCase() : "");
  if (h === "") return { status: 422, cuerpo: { error: "pago-invalido", detalle: "no-encontrada" } };

  const actual = await alm.leer(clave);
  const v = actual && actual.valor;
  const esMia = v && v.reserva && iguales(v.reserva.ficha, ficha);

  if (!esMia) {
    if (esSimulado) return { status: 409, cuerpo: { error: "reserva-vencida" } };
    // ¿Era una reserva que venció y retomó otra persona? Si pagó igual, se registra para devolver.
    const vieja = await alm.leer("vencidas/" + ficha);
    if (!vieja) return { status: 409, cuerpo: { error: "reserva-vencida" } };
    if (await alm.leer("tx/" + h)) return { status: 409, cuerpo: { error: "hash-usado" } };
    const r = await verificar({ rpc, ventas, hash: h, montoUnidades: vieja.valor.montoUnidades, desde: vieja.valor.creado });
    if (!r.ok) return respuestaVerificacion(r);
    if (!(await alm.crear("tx/" + h, { id, t: ahora }))) return { status: 409, cuerpo: { error: "hash-usado" } };
    return registrarHuerfano(alm, { hash: h, id, ahora });
  }
  if (v.estado === "vendido") return { status: 409, cuerpo: { error: "ya-vendido" } };

  let pago;
  if (esSimulado) {
    pago = { hash: null, red: null, bloque: null, simulado: true };
  } else {
    if (await alm.leer("tx/" + h)) return { status: 409, cuerpo: { error: "hash-usado" } };
    const r = await verificar({ rpc, ventas, hash: h, montoUnidades: v.reserva.montoUnidades, desde: v.creado });
    if (!r.ok) return respuestaVerificacion(r);
    // Un pago, un minuto: el hash se anota antes de vender. Si ya estaba, otro llegó primero.
    if (!(await alm.crear("tx/" + h, { id, t: ahora }))) return { status: 409, cuerpo: { error: "hash-usado" } };
    pago = { hash: h, red: claveRed(ventas.red), bloque: r.bloque, simulado: false };
  }

  const llave = randomBytes(24).toString("base64url");
  for (let i = 0; i < 4; i++) {
    const act = i === 0 ? actual : await alm.leer(clave);
    const w = act && act.valor;
    if (!w || !w.reserva || !iguales(w.reserva.ficha, ficha) || w.estado === "vendido") {
      if (w && w.estado === "vendido" && w.reserva && iguales(w.reserva.ficha, ficha) && !h) return { status: 409, cuerpo: { error: "ya-vendido" } };
      if (h) return registrarHuerfano(alm, { hash: h, id, ahora });
      return { status: 409, cuerpo: { error: "reserva-vencida" } };
    }
    const vendido = {
      ...w,
      estado: "vendido",
      vendido: ahora,
      pago,
      moderacion: "pendiente",
      llaveHash: sha(llave),
      prueba: ventas.modo !== "real"
    };
    if (await alm.reemplazar(clave, vendido, act.etag)) {
      await soltarMonto(alm, w.reserva.montoUnidades, ficha);
      await actualizar(alm, INDICE, (lista) => {
        const l = Array.isArray(lista) ? lista.filter((x) => x.id !== id) : [];
        l.push({ id, instante: w.instante });
        l.sort((a, b) => a.instante - b.instante);
        return l;
      });
      return { status: 200, cuerpo: { estado: "vendido", id, llave, pagina: paginaDe(id, w.lang) }, vendido };
    }
  }
  if (h) return registrarHuerfano(alm, { hash: h, id, ahora });
  return { status: 409, cuerpo: { error: "reserva-vencida" } };
}

async function verificar({ rpc, ventas, hash, montoUnidades, desde }) {
  return verificarPago({
    rpc: rpc || crearRpc(ventas.red),
    red: ventas.red,
    direccion: ventas.direccion,
    hash,
    montoUnidades,
    desde: Number(desde) - TOLERANCIA_RELOJ
  });
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
export async function ahoraPublico(alm, { ahora, modo }) {
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
  return { ahora, modo, minuto, proximos };
}

// ---------------------------------------------------------------- conexión con "El interruptor"

/** El minuto vendido que contiene `ahora` (aprobado o no, de prueba o no), o null. */
export async function vigenteEn(alm, ahora) {
  const indice = await leerIndice(alm);
  const x = indice.find((e) => e.instante <= ahora && ahora < e.instante + MINUTO);
  if (!x) return null;
  const v = await leerVendido(alm, x.id);
  return v ? { id: x.id, desde: v.instante, hasta: v.instante + MINUTO } : null;
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

/** POST /api/admin/moderar { id, decision: "aprobar" | "rechazar", nota? } */
export async function moderar(alm, { id, decision, nota, ahora = Date.now() }) {
  const c = canonico(id);
  if (!c) return { status: 404, cuerpo: { error: "no-existe" } };
  if (decision !== "aprobar" && decision !== "rechazar") return { status: 422, cuerpo: { error: "decision" } };
  let existe = true;
  const final = await actualizar(alm, claveDe(c), (v) => {
    if (!v || v.estado !== "vendido") { existe = false; return undefined; }
    const n = { ...v, moderado: ahora };
    if (decision === "aprobar") {
      n.moderacion = "aprobada";
      delete n.nota;
      if (n.reembolso && n.reembolso.estado === "pendiente") delete n.reembolso;
    } else {
      n.moderacion = "rechazada";
      const t = normalizar(typeof nota === "string" ? nota : "").slice(0, 300);
      if (t) n.nota = t; else delete n.nota;
      if (!n.reembolso || n.reembolso.estado !== "hecho") n.reembolso = { estado: "pendiente" };
    }
    return n;
  });
  if (!existe) return { status: 404, cuerpo: { error: "no-existe" } };
  return { status: 200, cuerpo: { id: c, estado: final.moderacion, nota: final.nota || null, reembolso: final.reembolso || null } };
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
