// Verificación de regalos directamente contra la red Base (RPC público).
//
// El servidor no le cree a nadie: dado el hash de una transacción, le pregunta
// a la red si existe, si salió bien y si es un regalo a la obra según las
// mismas reglas que usa el sitio (ETH nativo con valor > 0, o USDC oficial con
// monto > 0). No hace falta ninguna clave ni servicio pago.
import S from "./salehoy-nucleo.mjs";

const RPCS = ["https://mainnet.base.org", "https://base-rpc.publicnode.com"];
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const DIR = S.DIRECCION.toLowerCase();
const USDC = S.USDC_BASE.toLowerCase();

export const DIRECCION = S.DIRECCION;
export const HASH_VALIDO = /^0x[0-9a-fA-F]{64}$/;

async function rpc(metodo, parametros) {
  let ultimo;
  for (const url of RPCS) {
    try {
      const ctrl = new AbortController();
      const reloj = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: metodo, params: parametros }),
        signal: ctrl.signal
      });
      clearTimeout(reloj);
      if (!r.ok) throw new Error(url + " " + r.status);
      const j = await r.json();
      if (j.error) throw new Error(j.error.message || "error RPC");
      return j.result;
    } catch (e) {
      ultimo = e;
    }
  }
  throw ultimo || new Error("sin RPC");
}

// Todos los regalos que contiene una transacción (casi siempre uno; cero si no
// es un regalo a la obra). Cada uno: { hash, clave, fecha, bloque, orden,
// dedicatoria }. "clave" es la semilla de la forma del asterisco, la misma que
// calcula el navegador. Tira un error solo si la red no responde.
export async function regalosDeTransaccion(hash) {
  if (!HASH_VALIDO.test(hash)) return [];
  const [tx, recibo] = await Promise.all([
    rpc("eth_getTransactionByHash", [hash]),
    rpc("eth_getTransactionReceipt", [hash])
  ]);
  if (!tx || !recibo || !tx.blockNumber || recibo.status !== "0x1") return [];

  const bloque = await rpc("eth_getBlockByNumber", [tx.blockNumber, false]);
  if (!bloque) return [];
  const fecha = parseInt(bloque.timestamp, 16) * 1000;
  const numero = parseInt(tx.blockNumber, 16);
  const regalos = [];

  // ETH nativo con valor > 0, directo a la dirección de la obra
  if (tx.to && tx.to.toLowerCase() === DIR && BigInt(tx.value) > 0n) {
    regalos.push({
      hash: tx.hash, clave: tx.hash, fecha, bloque: numero,
      orden: parseInt(tx.transactionIndex, 16) || 0,
      dedicatoria: S.leerDedicatoria(tx.input, tx.hash)
    });
  }

  // USDC oficial de Base: evento Transfer hacia la dirección, monto > 0
  for (const log of recibo.logs || []) {
    if (!log.address || log.address.toLowerCase() !== USDC) continue;
    if (!log.topics || log.topics[0] !== TRANSFER || log.topics.length < 3) continue;
    if ("0x" + log.topics[2].slice(-40).toLowerCase() !== DIR) continue;
    if (!log.data || log.data === "0x" || BigInt(log.data) <= 0n) continue;
    const indice = parseInt(log.logIndex, 16) || 0;
    regalos.push({
      hash: tx.hash, clave: tx.hash + ":" + indice, fecha, bloque: numero,
      orden: indice, dedicatoria: null
    });
  }
  return regalos;
}

// El regalo de una transacción, o null si esa transacción no es un regalo.
export async function verificarRegalo(hash) {
  const regalos = await regalosDeTransaccion(hash);
  return regalos[0] || null;
}

export function ordenar(regalos) {
  regalos.sort((a, b) => (a.fecha - b.fecha) || (a.bloque - b.bloque) || (a.orden - b.orden));
  return regalos;
}
