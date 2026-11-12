// /api/avistar — "vi este regalo".
//
// El navegador de cada visitante descubre los regalos leyendo un explorador
// de bloques. Cuando ve uno que el registro del sitio todavía no tiene, avisa
// acá con el hash. El servidor NO confía en el aviso: verifica la transacción
// directamente contra la red Base y solo entonces la suma al registro. Así el
// registro se arma solo, sin claves, y no puede contener nada que no exista.
import { getStore } from "@netlify/blobs";
import { regalosDeTransaccion, ordenar, HASH_VALIDO } from "../lib/cadena.mjs";

const TOPE_POR_PEDIDO = 5;

function responder(cuerpo, estado) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export default async function (req) {
  if (req.method !== "POST") return responder({ error: "solo POST" }, 405);
  let d;
  try { d = await req.json(); } catch { return responder({ error: "cuerpo inválido" }, 400); }

  const pedidos = (Array.isArray(d.hashes) ? d.hashes : [d.hash])
    .filter((h) => typeof h === "string" && HASH_VALIDO.test(h))
    .map((h) => h.toLowerCase());
  const hashes = [...new Set(pedidos)].slice(0, TOPE_POR_PEDIDO);
  if (!hashes.length) return responder({ error: "falta un hash válido" }, 400);

  const store = getStore("cielo");
  const registro = (await store.get("regalos", { type: "json" })) || { regalos: [] };
  const conocidos = new Set(registro.regalos.map((r) => r.hash.toLowerCase()));
  const nuevos = hashes.filter((h) => !conocidos.has(h));
  if (!nuevos.length) return responder({ sumados: 0, total: registro.regalos.length }, 200);

  let sumados = 0;
  try {
    for (const hash of nuevos) {
      const regalos = await regalosDeTransaccion(hash);
      for (const r of regalos) { registro.regalos.push(r); sumados++; }
    }
  } catch (e) {
    return responder({ error: "la red no respondió; se reintenta en la próxima visita" }, 503);
  }

  if (sumados) {
    ordenar(registro.regalos);
    registro.actualizado = new Date().toISOString();
    await store.setJSON("regalos", registro);
  }
  return responder({ sumados, total: registro.regalos.length }, 200);
}

export const config = { path: "/api/avistar" };
