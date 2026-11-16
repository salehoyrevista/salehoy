// Verificación de pagos de "El minuto" contra la blockchain (RPC público, sin claves ni servicios pagos).
//
// El servidor no le cree a nadie: dado el hash de una transacción, le pregunta a la red si existe, si
// salió bien y si contiene una transferencia de USDC a la dirección de ventas por el monto EXACTO de la
// reserva. Solo lee datos públicos. Nunca firma, nunca envía, nunca toca una clave.
//
// Este archivo no importa nada de cadena.mjs a propósito: esa es la obra "Sin motivo" y su dirección
// no tiene nada que ver con las ventas.

export const HASH_VALIDO = /^0x[0-9a-fA-F]{64}$/;

// keccak256("Transfer(address,address,uint256)")
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/**
 * Cliente RPC real para una red de ajustes.mjs: prueba cada dirección de `red.rpcs` en orden, con
 * tiempo límite. Devuelve `rpc(metodo, parametros) -> resultado`; lanza si ninguna responde.
 */
export function crearRpc(red, { espera = 5000, traer = fetch } = {}) {
  return async function rpc(metodo, parametros) {
    let ultimo;
    for (const url of red.rpcs) {
      const ctrl = new AbortController();
      const reloj = setTimeout(() => ctrl.abort(), espera);
      try {
        const r = await traer(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: metodo, params: parametros }),
          signal: ctrl.signal
        });
        if (!r.ok) throw new Error(url + " " + r.status);
        const j = await r.json();
        if (j.error) throw new Error(j.error.message || "error RPC");
        return j.result;
      } catch (e) {
        ultimo = e;
      } finally {
        clearTimeout(reloj);
      }
    }
    throw ultimo || new Error("sin RPC");
  };
}

const aNumero = (hex) => (typeof hex === "string" && /^0x[0-9a-fA-F]+$/.test(hex) ? parseInt(hex, 16) : NaN);

/**
 * Verifica un pago.
 *
 * @param {object} p
 * @param {(metodo: string, parametros: any[]) => Promise<any>} p.rpc   cliente RPC (inyectable para tests)
 * @param {{ usdc: string, confirmaciones: number }} p.red              red del modo actual (ajustes.mjs)
 * @param {string} p.direccion        dirección de ventas
 * @param {string} p.hash             hash de la transacción
 * @param {number|bigint|string} p.montoUnidades   monto exacto en unidades de USDC (6 decimales)
 * @param {number} p.desde            ms: momento en que se creó la reserva; el bloque tiene que ser posterior
 *
 * @returns {Promise<
 *   { ok: true, bloque: number, fecha: number, confirmaciones: number } |
 *   { ok: false, esperando: true, confirmaciones: number, necesarias: number } |
 *   { ok: false, detalle: "no-encontrada" | "fallida" | "token" | "destino" | "monto" | "anterior" }
 * >}
 * Lanza solo si la red no responde.
 *
 * No se compara el remitente: paga quien quiera, desde donde quiera. Lo que ata el pago a la reserva
 * es el monto exacto, que es distinto para cada reserva vigente.
 */
export async function verificarPago({ rpc, red, direccion, hash, montoUnidades, desde }) {
  if (typeof hash !== "string" || !HASH_VALIDO.test(hash)) return { ok: false, detalle: "no-encontrada" };
  const necesarias = red.confirmaciones;
  const destino = String(direccion).toLowerCase();
  const usdc = String(red.usdc).toLowerCase();
  const monto = BigInt(montoUnidades);

  const recibo = await rpc("eth_getTransactionReceipt", [hash]);
  if (!recibo) {
    // Sin recibo: o no existe, o está enviada y todavía no entró en un bloque.
    const tx = await rpc("eth_getTransactionByHash", [hash]);
    return tx ? { ok: false, esperando: true, confirmaciones: 0, necesarias } : { ok: false, detalle: "no-encontrada" };
  }
  if (recibo.status !== "0x1") return { ok: false, detalle: "fallida" };

  // Transferencias de USDC dentro de la transacción.
  let hayUsdc = false, hayDestino = false, hayMonto = false;
  for (const log of recibo.logs || []) {
    if (!log || log.removed) continue;
    if (!log.address || log.address.toLowerCase() !== usdc) continue;
    if (!Array.isArray(log.topics) || log.topics.length < 3 || String(log.topics[0]).toLowerCase() !== TRANSFER) continue;
    hayUsdc = true;
    if ("0x" + String(log.topics[2]).slice(-40).toLowerCase() !== destino) continue;
    hayDestino = true;
    let valor;
    try { valor = BigInt(log.data); } catch { continue; }
    if (valor === monto) hayMonto = true;
  }
  if (!hayUsdc) return { ok: false, detalle: "token" };        // otro token, ETH, u otra cosa
  if (!hayDestino) return { ok: false, detalle: "destino" };   // USDC, pero a otra dirección
  if (!hayMonto) return { ok: false, detalle: "monto" };       // a ventas, pero no el monto exacto

  const numero = aNumero(recibo.blockNumber);
  if (!Number.isFinite(numero)) return { ok: false, esperando: true, confirmaciones: 0, necesarias };

  const bloque = await rpc("eth_getBlockByNumber", [recibo.blockNumber, false]);
  if (!bloque) return { ok: false, esperando: true, confirmaciones: 0, necesarias };
  // Si la cadena se reorganizó, el bloque de ese número ya no es el del recibo: esperar.
  if (bloque.hash && recibo.blockHash && String(bloque.hash).toLowerCase() !== String(recibo.blockHash).toLowerCase()) {
    return { ok: false, esperando: true, confirmaciones: 0, necesarias };
  }
  const fecha = aNumero(bloque.timestamp) * 1000;
  // Un pago anterior a la reserva no puede ser el pago de esta reserva (sería una transacción vieja reusada).
  if (!Number.isFinite(fecha) || fecha < desde) return { ok: false, detalle: "anterior" };

  const ultimo = aNumero(await rpc("eth_blockNumber", []));
  const confirmaciones = Number.isFinite(ultimo) ? Math.max(0, ultimo - numero + 1) : 0;
  if (confirmaciones < necesarias) return { ok: false, esperando: true, confirmaciones, necesarias };

  return { ok: true, bloque: numero, fecha, confirmaciones };
}
