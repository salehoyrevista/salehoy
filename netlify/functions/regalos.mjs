// /api/regalos — caché compartida de los regalos recibidos en Base.
//
// Devuelve las transacciones y transferencias de USDC que llegaron a la
// dirección de la obra, en el formato de Blockscout pero recortadas: sin
// remitente. El filtro antispam lo aplica el navegador con
// SaleHoy.filtrarRegalos (public/salehoy.js), así hay una sola regla.
//
// El CDN de Netlify guarda la respuesta 60 s para todos los visitantes, así que
// Blockscout recibe como mucho un pedido por minuto. Si esto falla, la página
// consulta Blockscout directo, como antes.
//
// Fuentes, en orden:
//   1. api.blockscout.com con BLOCKSCOUT_API_KEY, si la variable existe;
//   2. base.blockscout.com, la API pública (a veces pide un desafío de
//      Cloudflare a quien no es un navegador: en ese caso, se pasa de largo).

const DIRECCION = "0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PAGINAS = 20;
const LIMITE_MS = 8000;

function fuentes() {
  const lista = [];
  const clave = process.env.BLOCKSCOUT_API_KEY;
  if (clave) {
    lista.push({ nombre: "blockscout-pro", base: "https://api.blockscout.com/8453/api/v2", apikey: clave });
  }
  lista.push({ nombre: "blockscout", base: "https://base.blockscout.com/api/v2" });
  return lista;
}

async function traerTodo(fuente, ruta, senal) {
  let items = [];
  let params = null;
  for (let i = 0; i < PAGINAS; i++) {
    const url = new URL(fuente.base + "/addresses/" + DIRECCION + ruta);
    if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    if (fuente.apikey) url.searchParams.set("apikey", fuente.apikey);
    const r = await fetch(url, { signal: senal, headers: { accept: "application/json" } });
    const tipo = r.headers.get("content-type") || "";
    if (!r.ok || !tipo.includes("application/json")) throw new Error(fuente.nombre + " " + r.status);
    const j = await r.json();
    items = items.concat(j.items || []);
    if (!j.next_page_params) break;
    params = j.next_page_params;
  }
  return items;
}

// Lo justo para que el navegador filtre y ordene. Sin "from".
function recortarTx(tx) {
  return {
    hash: tx.hash, status: tx.status, result: tx.result, value: tx.value,
    to: tx.to ? { hash: tx.to.hash } : null,
    timestamp: tx.timestamp, block_number: tx.block_number, position: tx.position
  };
}
function recortarTransferencia(tr) {
  return {
    transaction_hash: tr.transaction_hash, log_index: tr.log_index,
    token: tr.token ? { address_hash: tr.token.address_hash } : null,
    to: tr.to ? { hash: tr.to.hash } : null,
    total: tr.total ? { value: tr.total.value } : null,
    timestamp: tr.timestamp, block_number: tr.block_number
  };
}

function json(cuerpo, estado, cdn) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": cdn,
      "access-control-allow-origin": "*"
    }
  });
}

export default async function () {
  const errores = [];
  for (const fuente of fuentes()) {
    const ctrl = new AbortController();
    const reloj = setTimeout(() => ctrl.abort(), LIMITE_MS);
    try {
      const [txs, transferencias] = await Promise.all([
        traerTodo(fuente, "/transactions?filter=to", ctrl.signal),
        traerTodo(fuente, "/token-transfers?type=ERC-20&filter=to&token=" + USDC_BASE, ctrl.signal)
      ]);
      return json({
        transacciones: txs.map(recortarTx),
        transferencias: transferencias.map(recortarTransferencia),
        fuente: fuente.nombre,
        actualizado: new Date().toISOString()
      }, 200, "public, durable, s-maxage=60, stale-while-revalidate=600");
    } catch (e) {
      errores.push(String(e && e.message || e));
    } finally {
      clearTimeout(reloj);
    }
  }
  // Un error se guarda poco, para no martillar a las fuentes ni quedar pegado.
  return json({ error: "sin fuente", detalle: errores }, 503, "public, s-maxage=15");
}

export const config = { path: "/api/regalos" };
