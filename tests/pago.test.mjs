// Tests de la verificación de pagos con un RPC falso: node --test tests/pago.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { verificarPago, crearRpc } from "../netlify/lib/pago.mjs";
import { REDES } from "../netlify/lib/ajustes.mjs";

const red = REDES.prueba;
const VENTAS = "0x1111111111111111111111111111111111111111";
const OTRA = "0x2222222222222222222222222222222222222222";
const OTRO_TOKEN = "0x3333333333333333333333333333333333333333";
const HASH = "0x" + "ab".repeat(32);
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const T_RESERVA = Date.UTC(2026, 10, 16, 12, 0, 0);
const MONTO = 5003700n;   // 5.0037 USDC

const tema = (dir) => "0x" + "0".repeat(24) + dir.slice(2).toLowerCase();
const hex = (n) => "0x" + BigInt(n).toString(16);

/** RPC falso: una transacción con una transferencia, en el bloque 100, con `ultimo` como último bloque. */
function rpcFalso({ token = red.usdc, destino = VENTAS, valor = MONTO, status = "0x1", fecha = T_RESERVA + 60_000, ultimo = 110, sinRecibo = false, pendiente = false } = {}) {
  return async (metodo) => {
    if (metodo === "eth_getTransactionReceipt") {
      if (sinRecibo) return null;
      return {
        status, blockNumber: hex(100), blockHash: "0xbb",
        logs: [{ address: token, topics: [TRANSFER, tema(OTRA), tema(destino)], data: "0x" + valor.toString(16).padStart(64, "0") }]
      };
    }
    if (metodo === "eth_getTransactionByHash") return pendiente ? { hash: HASH, blockNumber: null } : null;
    if (metodo === "eth_getBlockByNumber") return { hash: "0xbb", timestamp: hex(Math.floor(fecha / 1000)) };
    if (metodo === "eth_blockNumber") return hex(ultimo);
    throw new Error("método inesperado " + metodo);
  };
}

const verificar = (rpc, extra = {}) =>
  verificarPago({ rpc, red, direccion: VENTAS, hash: HASH, montoUnidades: MONTO, desde: T_RESERVA, ...extra });

test("caso bueno: USDC de la red, a ventas, monto exacto, confirmado", async () => {
  const r = await verificar(rpcFalso());
  assert.equal(r.ok, true);
  assert.equal(r.bloque, 100);
  assert.equal(r.confirmaciones, 11);
});

test("destino equivocado", async () => {
  assert.deepEqual(await verificar(rpcFalso({ destino: OTRA })), { ok: false, detalle: "destino" });
});

test("token equivocado", async () => {
  assert.deepEqual(await verificar(rpcFalso({ token: OTRO_TOKEN })), { ok: false, detalle: "token" });
  // USDC de la red real no vale en modo prueba
  assert.deepEqual(await verificar(rpcFalso({ token: REDES.real.usdc })), { ok: false, detalle: "token" });
});

test("monto con un centésimo de centavo de diferencia (y más, y menos)", async () => {
  assert.deepEqual(await verificar(rpcFalso({ valor: MONTO + 100n })), { ok: false, detalle: "monto" });
  assert.deepEqual(await verificar(rpcFalso({ valor: MONTO - 100n })), { ok: false, detalle: "monto" });
  assert.deepEqual(await verificar(rpcFalso({ valor: MONTO * 2n })), { ok: false, detalle: "monto" });
});

test("transacción fallida", async () => {
  assert.deepEqual(await verificar(rpcFalso({ status: "0x0" })), { ok: false, detalle: "fallida" });
});

test("pocas confirmaciones: esperando", async () => {
  const r = await verificar(rpcFalso({ ultimo: 101 }));
  assert.deepEqual(r, { ok: false, esperando: true, confirmaciones: 2, necesarias: red.confirmaciones });
  const p = await verificar(rpcFalso({ sinRecibo: true, pendiente: true }));
  assert.equal(p.esperando, true);
  assert.equal(p.confirmaciones, 0);
});

test("no encontrada y hash inválido", async () => {
  assert.deepEqual(await verificar(rpcFalso({ sinRecibo: true })), { ok: false, detalle: "no-encontrada" });
  assert.deepEqual(await verificar(rpcFalso(), { hash: "0x123" }), { ok: false, detalle: "no-encontrada" });
});

test("bloque anterior a la reserva", async () => {
  assert.deepEqual(await verificar(rpcFalso({ fecha: T_RESERVA - 3600_000 })), { ok: false, detalle: "anterior" });
});

test("crearRpc: prueba el segundo RPC si el primero falla, y lanza si ninguno responde", async () => {
  const llamadas = [];
  const traer = async (url) => {
    llamadas.push(url);
    if (url === red.rpcs[0]) return { ok: false, status: 503 };
    return { ok: true, json: async () => ({ result: "0x10" }) };
  };
  assert.equal(await crearRpc(red, { traer })("eth_blockNumber", []), "0x10");
  assert.deepEqual(llamadas, red.rpcs);
  const nunca = crearRpc(red, { traer: async () => { throw new Error("sin red"); } });
  await assert.rejects(nunca("eth_blockNumber", []));
});
