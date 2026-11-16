// Tests de "El minuto": node --test tests/minuto.test.mjs
// Toda la lógica corre contra el almacén en memoria, un reloj que se pasa a mano y un RPC falso.
import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenEnMemoria } from "../netlify/lib/almacen.mjs";
import { REDES } from "../netlify/lib/ajustes.mjs";
import {
  idDeInstante, instanteDeId, idUrl, montoUsdc, consultar, reservar, confirmarPago, leerMinutoPublico,
  listarArchivo, ahoraPublico, moderar, anotarReembolso, listarParaAdmin, borrarPruebas, controlAdmin,
  avisosPendientes, RESERVA_MS, MINUTO, DIA, MAX_VIGENTES
} from "../netlify/lib/minuto.mjs";
import { minutoVigente, esLlaveDelMinuto } from "../netlify/lib/minuto-vigente.mjs";
import { precioDe, PRECIOS, preciosPublicos } from "../netlify/lib/precios.mjs";
import { avisar, TEXTOS } from "../netlify/lib/avisos.mjs";

const T0 = Date.UTC(2026, 10, 16, 12, 0, 0);
const VENTAS = "0x1111111111111111111111111111111111111111";
const SIMULADO = { modo: "simulado", prueba: true, direccion: "", red: REDES.prueba };
const TESTNET = { modo: "testnet", prueba: true, direccion: VENTAS, red: REDES.prueba };
const REAL = { modo: "real", prueba: false, direccion: VENTAS, red: REDES.real };
const BA = "America/Argentina/Buenos_Aires";
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const hash = (n) => "0x" + String(n).repeat(64).slice(0, 64);
const hex = (n) => "0x" + BigInt(n).toString(16);

/** RPC falso: una transacción confirmada que transfiere a ventas cada uno de los `montos`. */
function rpcCon(red, montos, { fecha = T0 + MINUTO, confirmado = true } = {}) {
  return async (metodo) => {
    if (metodo === "eth_getTransactionReceipt") return {
      status: "0x1", blockNumber: hex(500), blockHash: "0xbb",
      logs: montos.map((m) => ({ address: red.usdc, topics: [TRANSFER, "0x" + "0".repeat(64), "0x" + "0".repeat(24) + VENTAS.slice(2)], data: hex(m) }))
    };
    if (metodo === "eth_getBlockByNumber") return { hash: "0xbb", timestamp: hex(Math.floor(fecha / 1000)) };
    if (metodo === "eth_blockNumber") return hex(confirmado ? 600 : 500);
    return null;
  };
}

const pedido = (extra = {}) => ({ fecha: "2026-12-24", hora: "00:33", zona: BA, dedicatoria: "Para Lucía", lang: "es", ahora: T0, ventas: SIMULADO, ...extra });

async function vender(alm, extra = {}) {
  const r = await reservar(alm, pedido(extra));
  assert.equal(r.status, 200, JSON.stringify(r.cuerpo));
  const p = await confirmarPago(alm, { reserva: r.cuerpo.reserva, simulado: true, ahora: T0 + MINUTO, ventas: SIMULADO });
  assert.equal(p.status, 200, JSON.stringify(p.cuerpo));
  return { reserva: r.cuerpo, pago: p.cuerpo };
}

// ------------------------------------------------------------ identificadores

test("ids: instante <-> id canónico y forma de URL", () => {
  const t = Date.UTC(2026, 11, 24, 3, 33, 27);
  assert.equal(idDeInstante(t), "2026-12-24T03:33Z");
  assert.equal(instanteDeId("2026-12-24T03:33Z"), Date.UTC(2026, 11, 24, 3, 33));
  assert.equal(instanteDeId("2026-12-24T03-33Z"), Date.UTC(2026, 11, 24, 3, 33));
  assert.equal(idUrl("2026-12-24T03:33Z"), "2026-12-24T03-33Z");
  assert.equal(instanteDeId("2026-02-30T03:33Z"), null);
  assert.equal(instanteDeId("2026-12-24T24:00Z"), null);
  assert.equal(instanteDeId("hola"), null);
  assert.equal(montoUsdc(5003700), "5.0037");
  assert.equal(montoUsdc(50009900), "50.0099");
});

// ------------------------------------------------------------ (1) un instante no se vende dos veces

test("dos reservas simultáneas del mismo minuto: una gana, la otra 409", async () => {
  const alm = almacenEnMemoria();
  const [a, b] = await Promise.all([reservar(alm, pedido()), reservar(alm, pedido({ dedicatoria: "Otra" }))]);
  const estados = [a.status, b.status].sort();
  assert.deepEqual(estados, [200, 409]);
  const perdedor = a.status === 409 ? a : b;
  assert.equal(perdedor.cuerpo.error, "ocupado");
  assert.equal(perdedor.cuerpo.motivo, "reservado");
  // el monto de la que perdió quedó libre: solo hay un monto tomado
  assert.equal((await alm.listar("monto/")).length, 1);
});

test("muchas reservas simultáneas del mismo minuto: exactamente una gana", async () => {
  const alm = almacenEnMemoria();
  const rs = await Promise.all(Array.from({ length: 12 }, () => reservar(alm, pedido())));
  assert.equal(rs.filter((r) => r.status === 200).length, 1);
});

test("el mismo instante desde dos zonas choca: 00:33 en Buenos Aires = 03:33 UTC", async () => {
  const alm = almacenEnMemoria();
  const a = await reservar(alm, pedido());
  assert.equal(a.status, 200);
  assert.equal(a.cuerpo.id, "2026-12-24T03:33Z");
  const b = await reservar(alm, pedido({ hora: "03:33", zona: "UTC" }));
  assert.equal(b.status, 409);
  assert.equal(b.cuerpo.motivo, "reservado");
  const c = await consultar(alm, { fecha: "2026-12-23", hora: "22:33", zona: "America/New_York", ahora: T0 });
  assert.equal(c.cuerpo.id, "2026-12-24T03:33Z");
  assert.equal(c.cuerpo.disponible, false);
  assert.equal(c.cuerpo.motivo, "reservado");
});

test("una reserva vencida se retoma; el monto de la vieja queda libre", async () => {
  const alm = almacenEnMemoria();
  const a = await reservar(alm, pedido());
  const tarde = T0 + RESERVA_MS + 1;
  const b = await reservar(alm, pedido({ ahora: tarde, dedicatoria: "Nueva" }));
  assert.equal(b.status, 200);
  // la reserva vieja ya no paga
  const p = await confirmarPago(alm, { reserva: a.cuerpo.reserva, simulado: true, ahora: tarde, ventas: SIMULADO });
  assert.equal(p.status, 409);
  assert.equal(p.cuerpo.error, "reserva-vencida");
  // la nueva sí
  const q = await confirmarPago(alm, { reserva: b.cuerpo.reserva, simulado: true, ahora: tarde, ventas: SIMULADO });
  assert.equal(q.status, 200);
});

test("un minuto vendido nunca se vuelve a reservar ni a pagar", async () => {
  const alm = almacenEnMemoria();
  const { reserva } = await vender(alm);
  const mucho = T0 + 30 * DIA - 10 * MINUTO;   // antes del minuto, mucho después de la reserva
  const r = await reservar(alm, pedido({ ahora: mucho }));
  assert.equal(r.status, 409);
  assert.equal(r.cuerpo.motivo, "vendido");
  const otra = await confirmarPago(alm, { reserva: reserva.reserva, simulado: true, ahora: mucho, ventas: SIMULADO });
  assert.equal(otra.cuerpo.error, "ya-vendido");
  const c = await consultar(alm, { fecha: "2026-12-24", hora: "03:33", zona: "UTC", ahora: T0 });
  assert.equal(c.cuerpo.motivo, "vendido");
});

test("pasado y lejano", async () => {
  const alm = almacenEnMemoria();
  const enUnRato = new Date(T0 + 3 * MINUTO);
  const r = await reservar(alm, pedido({ fecha: enUnRato.toISOString().slice(0, 10), hora: enUnRato.toISOString().slice(11, 16), zona: "UTC" }));
  assert.equal(r.cuerpo.motivo, "pasado");
  const lejos = await reservar(alm, pedido({ fecha: "2029-01-01" }));
  assert.equal(lejos.cuerpo.motivo, "lejano");
  const c = await consultar(alm, { fecha: "2020-01-01", hora: "00:00", zona: "UTC", ahora: T0 });
  assert.equal(c.cuerpo.disponible, false);
  assert.equal(c.cuerpo.motivo, "pasado");
});

test("reservar: errores de formato, zona, hora inexistente y dedicatoria", async () => {
  const alm = almacenEnMemoria();
  assert.deepEqual((await reservar(alm, pedido({ zona: "Nada/Nada" }))).cuerpo, { error: "zona" });
  assert.deepEqual((await reservar(alm, pedido({ fecha: "24/12/2026" }))).cuerpo, { error: "formato" });
  const inex = await reservar(alm, pedido({ fecha: "2027-03-14", hora: "02:30", zona: "America/New_York" }));
  assert.equal(inex.status, 422);
  assert.deepEqual(inex.cuerpo, { error: "hora-inexistente" });
  assert.deepEqual((await reservar(alm, pedido({ dedicatoria: "www.algo.com" }))).cuerpo, { error: "dedicatoria", detalle: "enlace" });
  const amb = await consultar(alm, { fecha: "2026-11-01", hora: "01:30", zona: "America/New_York", ahora: T0 - 30 * DIA });
  assert.equal(amb.cuerpo.ambigua, true);
});

test("reservar: forma de la respuesta y monto único por reserva", async () => {
  const alm = almacenEnMemoria();
  const r = await reservar(alm, pedido({ ventas: TESTNET }));
  const c = r.cuerpo;
  assert.match(c.reserva, /^2026-12-24T03-33Z\.[0-9a-f]{64}$/);
  assert.equal(c.precioUsd, 5);
  assert.match(c.montoUsdc, /^5\.00\d\d$/);
  assert.equal(Number(c.montoUnidades) % 100, 0);
  assert.ok(Number(c.montoUnidades) > 5_000_000 && Number(c.montoUnidades) < 5_010_000);
  assert.equal(c.vence, T0 + RESERVA_MS);
  assert.equal(c.pago.modo, "testnet");
  assert.equal(c.pago.direccion, VENTAS);
  assert.equal(c.pago.red.chainId, 84532);
  // se guarda solo el hash del token, nunca el token
  const reg = (await alm.leer("m/2026-12-24T03-33Z")).valor;
  assert.ok(!JSON.stringify(reg).includes(c.reserva.split(".")[1]));
  // 30 minutos distintos al mismo precio: todos con montos distintos
  const montos = new Set([c.montoUnidades]);
  for (let i = 0; i < 30; i++) {
    const x = await reservar(alm, pedido({ hora: `0${Math.floor(i / 10) + 1}:${String(40 + (i % 10)).padStart(2, "0")}`, ventas: TESTNET }));
    if (x.status === 200 && x.cuerpo.precioUsd === 5) montos.add(x.cuerpo.montoUnidades);
  }
  assert.ok(montos.size >= 25);
});

test("límite por persona: 3 reservas vigentes, 10 por hora", async () => {
  const alm = almacenEnMemoria();
  const persona = "f".repeat(64);
  for (let i = 0; i < MAX_VIGENTES; i++) {
    assert.equal((await reservar(alm, pedido({ hora: `00:4${i}`, persona }))).status, 200);
  }
  const cuarta = await reservar(alm, pedido({ hora: "00:49", persona }));
  assert.equal(cuarta.status, 429);
  // otra persona sí puede
  assert.equal((await reservar(alm, pedido({ hora: "00:49", persona: "e".repeat(64) }))).status, 200);
  // cuando vencen, vuelve a poder… hasta 10 en la hora
  let t = T0 + RESERVA_MS + 1, n = 3, ultimo;
  while (n < 12) {
    ultimo = await reservar(alm, pedido({ hora: `01:${String(n).padStart(2, "0")}`, persona, ahora: t }));
    if (ultimo.status !== 200) break;
    n++;
    if (n % 3 === 0) t += RESERVA_MS + 1;
  }
  assert.equal(n, 10);
  assert.equal(ultimo.status, 429);
  assert.equal(ultimo.cuerpo.motivo, "hora");
});

// ------------------------------------------------------------ (2) un hash no se reusa

test("el mismo hash en dos reservas: la segunda 409 hash-usado", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: TESTNET }))).cuerpo;
  const b = (await reservar(alm, pedido({ hora: "00:34", ventas: TESTNET }))).cuerpo;
  const rpc = rpcCon(REDES.prueba, [a.montoUnidades, b.montoUnidades]);
  const h = hash("a");
  const p1 = await confirmarPago(alm, { reserva: a.reserva, hash: h, ahora: T0 + 2 * MINUTO, ventas: TESTNET, rpc });
  assert.equal(p1.status, 200);
  assert.equal(p1.cuerpo.estado, "vendido");
  assert.equal(p1.cuerpo.pagina, "/minuto/m/2026-12-24T03-33Z/");
  const p2 = await confirmarPago(alm, { reserva: b.reserva, hash: h.toUpperCase().replace("0X", "0x"), ahora: T0 + 2 * MINUTO, ventas: TESTNET, rpc });
  assert.equal(p2.status, 409);
  assert.equal(p2.cuerpo.error, "hash-usado");
});

test("el mismo hash en dos reservas a la vez: una vende, la otra hash-usado", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: TESTNET }))).cuerpo;
  const b = (await reservar(alm, pedido({ hora: "00:34", ventas: TESTNET }))).cuerpo;
  const rpc = rpcCon(REDES.prueba, [a.montoUnidades, b.montoUnidades]);
  const h = hash("b");
  const rs = await Promise.all([
    confirmarPago(alm, { reserva: a.reserva, hash: h, ahora: T0 + 2 * MINUTO, ventas: TESTNET, rpc }),
    confirmarPago(alm, { reserva: b.reserva, hash: h, ahora: T0 + 2 * MINUTO, ventas: TESTNET, rpc })
  ]);
  assert.deepEqual(rs.map((r) => r.status).sort(), [200, 409]);
  assert.equal(rs.find((r) => r.status === 409).cuerpo.error, "hash-usado");
  const idx = (await alm.leer("indice/vendidos")).valor;
  assert.equal(idx.length, 1);
});

test("pagar: verificación (monto, esperando), modos y huérfano", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: TESTNET }))).cuerpo;
  // monto con un centésimo de centavo de diferencia
  const mal = await confirmarPago(alm, { reserva: a.reserva, hash: hash("c"), ahora: T0 + MINUTO, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [Number(a.montoUnidades) + 100]) });
  assert.deepEqual(mal.cuerpo, { error: "pago-invalido", detalle: "monto" });
  // pocas confirmaciones
  const espera = await confirmarPago(alm, { reserva: a.reserva, hash: hash("c"), ahora: T0 + MINUTO, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [a.montoUnidades], { confirmado: false }) });
  assert.equal(espera.status, 202);
  assert.equal(espera.cuerpo.estado, "esperando");
  // un pago anterior a la reserva
  const viejo = await confirmarPago(alm, { reserva: a.reserva, hash: hash("c"), ahora: T0 + MINUTO, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [a.montoUnidades], { fecha: T0 - DIA }) });
  assert.deepEqual(viejo.cuerpo, { error: "pago-invalido", detalle: "anterior" });
  // en testnet no se simula; sin hash tampoco
  assert.equal((await confirmarPago(alm, { reserva: a.reserva, simulado: true, ahora: T0, ventas: TESTNET })).status, 422);
  assert.equal((await confirmarPago(alm, { reserva: a.reserva, ahora: T0, ventas: TESTNET })).status, 422);
  // en simulado no se manda hash
  assert.equal((await confirmarPago(alm, { reserva: a.reserva, hash: hash("c"), ahora: T0, ventas: SIMULADO })).status, 422);
  // token falso
  assert.equal((await confirmarPago(alm, { reserva: "2026-12-24T03-33Z." + "0".repeat(64), simulado: true, ahora: T0, ventas: SIMULADO })).cuerpo.error, "reserva-vencida");
  // ahora sí: y el monto queda libre
  const ok = await confirmarPago(alm, { reserva: a.reserva, hash: hash("c"), ahora: T0 + MINUTO, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [a.montoUnidades]) });
  assert.equal(ok.status, 200);
  assert.equal((await alm.listar("monto/")).length, 0);
  const reg = (await alm.leer("m/2026-12-24T03-33Z")).valor;
  assert.equal(reg.estado, "vendido");
  assert.equal(reg.moderacion, "pendiente");
  assert.equal(reg.prueba, true);
  assert.equal(reg.pago.hash, hash("c"));
  assert.equal(reg.pago.simulado, false);
  assert.ok(!JSON.stringify(reg).includes(ok.cuerpo.llave), "la llave no se guarda");
  assert.match(ok.cuerpo.llave, /^[A-Za-z0-9_-]{32}$/);
});

test("pago real: prueba false", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: REAL }))).cuerpo;
  const ok = await confirmarPago(alm, { reserva: a.reserva, hash: hash("d"), ahora: T0 + MINUTO, ventas: REAL, rpc: rpcCon(REDES.real, [a.montoUnidades]) });
  assert.equal(ok.status, 200);
  assert.equal((await alm.leer("m/2026-12-24T03-33Z")).valor.prueba, false);
});

test("pagó tarde y otra persona ya tomó el minuto: queda registrado como huérfano", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: TESTNET }))).cuerpo;
  const tarde = T0 + RESERVA_MS + 1;
  const b = (await reservar(alm, pedido({ ventas: TESTNET, ahora: tarde }))).cuerpo;
  assert.ok(b.reserva);
  const r = await confirmarPago(alm, { reserva: a.reserva, hash: hash("e"), ahora: tarde, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [a.montoUnidades]) });
  assert.equal(r.status, 409);
  assert.equal(r.cuerpo.error, "reserva-vencida");
  assert.match(r.cuerpo.texto, /reembolso/);
  assert.deepEqual((await alm.leer("tx/" + hash("e"))).valor, { id: "2026-12-24T03:33Z", huerfano: true, t: tarde });
  // el mismo hash no sirve para otra cosa
  const otra = await confirmarPago(alm, { reserva: b.reserva, hash: hash("e"), ahora: tarde, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [b.montoUnidades]) });
  assert.equal(otra.cuerpo.error, "hash-usado");
  // y aparece en la administración para devolverlo
  const adm = await listarParaAdmin(alm, { ahora: tarde });
  assert.equal(adm.huerfanos.length, 1);
  const rb = await anotarReembolso(alm, { id: hash("e"), hash: hash("f"), ahora: tarde });
  assert.deepEqual(rb.cuerpo, { estado: "hecho", hash: hash("f") });
});

test("reserva vencida que nadie retomó: el pago se acepta igual", async () => {
  const alm = almacenEnMemoria();
  const a = (await reservar(alm, pedido({ ventas: TESTNET }))).cuerpo;
  const r = await confirmarPago(alm, { reserva: a.reserva, hash: hash("1"), ahora: T0 + RESERVA_MS + 5 * MINUTO, ventas: TESTNET, rpc: rpcCon(REDES.prueba, [a.montoUnidades]) });
  assert.equal(r.status, 200);
});

// ------------------------------------------------------------ lecturas públicas, moderación, archivo

test("público: la dedicatoria solo aparece aprobada; neutra si no", async () => {
  const alm = almacenEnMemoria();
  await vender(alm);
  const id = "2026-12-24T03:33Z";
  const desde = instanteDeId(id);
  let m = await leerMinutoPublico(alm, "2026-12-24T03-33Z", T0);
  assert.deepEqual(m, {
    id, instante: desde, zona: BA, local: { fecha: "2026-12-24", hora: "00:33" },
    estado: "pendiente", dedicatoria: null, prueba: true, vendido: T0 + MINUTO, pasado: false
  });
  let a = await ahoraPublico(alm, { ahora: desde + 10_000, modo: "simulado" });
  assert.deepEqual(a.minuto, { id, desde, hasta: desde + MINUTO, estado: "neutra", dedicatoria: null, prueba: true });
  const antes = await ahoraPublico(alm, { ahora: desde - 3600_000, modo: "simulado" });
  assert.equal(antes.minuto, null);
  assert.deepEqual(antes.proximos, [{ id, desde }]);

  assert.equal((await moderar(alm, { id, decision: "aprobar", ahora: T0 })).cuerpo.estado, "aprobada");
  m = await leerMinutoPublico(alm, id, desde + MINUTO);
  assert.equal(m.dedicatoria, "Para Lucía");
  assert.equal(m.pasado, true);
  a = await ahoraPublico(alm, { ahora: desde + 59_999, modo: "simulado" });
  assert.equal(a.minuto.estado, "aprobada");
  assert.equal(a.minuto.dedicatoria, "Para Lucía");
  assert.equal((await ahoraPublico(alm, { ahora: desde + MINUTO, modo: "simulado" })).minuto, null);

  const rech = await moderar(alm, { id, decision: "rechazar", nota: "no", ahora: T0 });
  assert.deepEqual(rech.cuerpo, { id, estado: "rechazada", nota: "no", reembolso: { estado: "pendiente" } });
  assert.equal((await leerMinutoPublico(alm, id, T0)).dedicatoria, null);
  assert.deepEqual((await anotarReembolso(alm, { id, hash: hash("9") })).cuerpo, { estado: "hecho", hash: hash("9") });
  assert.equal((await moderar(alm, { id: "2027-01-01T00:00Z", decision: "aprobar" })).status, 404);
  assert.equal(await leerMinutoPublico(alm, "2027-01-01T00:00Z"), null);
});

test("archivo: solo pasados, del más reciente al más viejo, paginado", async () => {
  const alm = almacenEnMemoria();
  for (const hora of ["00:10", "00:11", "00:12", "00:13"]) await vender(alm, { hora });
  const ahora = instanteDeId("2026-12-24T03:12Z") + 30_000;   // 03:10 y 03:11 pasaron; 03:12 está en curso
  const l = await listarArchivo(alm, { n: 1, ahora });
  assert.deepEqual(l.minutos.map((m) => m.id), ["2026-12-24T03:11Z"]);
  assert.equal(l.sigue, instanteDeId("2026-12-24T03:11Z"));
  const l2 = await listarArchivo(alm, { n: 1, antes: l.sigue, ahora });
  assert.deepEqual(l2.minutos.map((m) => m.id), ["2026-12-24T03:10Z"]);
  assert.equal(l2.sigue, null);
  assert.deepEqual(Object.keys(l2.minutos[0]).sort(), ["dedicatoria", "estado", "id", "instante", "prueba"]);
});

test("admin: listado con montos y explorador; borrar pruebas", async () => {
  const alm = almacenEnMemoria();
  await vender(alm);
  const a = (await reservar(alm, pedido({ hora: "00:50", ventas: REAL }))).cuerpo;
  await confirmarPago(alm, { reserva: a.reserva, hash: hash("7"), ahora: T0 + MINUTO, ventas: REAL, rpc: rpcCon(REDES.real, [a.montoUnidades]) });
  const l = await listarParaAdmin(alm, { estado: "todas", ahora: T0 });
  assert.equal(l.minutos.length, 2);
  const real = l.minutos.find((m) => !m.prueba);
  assert.equal(real.explorador, "https://basescan.org/tx/" + hash("7"));
  assert.equal(real.montoUsdc, montoUsdc(a.montoUnidades));
  assert.equal(real.local.hora, "00:50");
  assert.equal(real.dedicatoria, "Para Lucía");
  const b = await borrarPruebas(alm);
  assert.equal(b.borrados, 1);
  assert.equal((await listarParaAdmin(alm, { estado: "todas" })).minutos.length, 1);
  assert.equal(await leerMinutoPublico(alm, "2026-12-24T03:33Z"), null);
});

test("admin: sin clave 503, clave mala 401, diez fallos bloquean 10 minutos", async () => {
  const alm = almacenEnMemoria();
  const esAdmin = (c) => c === "contraseña-buena";
  assert.equal((await controlAdmin(alm, { clave: "x", persona: "p", ahora: T0, esAdmin, hayAdmin: () => false })).status, 503);
  for (let i = 0; i < 10; i++) {
    assert.equal((await controlAdmin(alm, { clave: "mala", persona: "p", ahora: T0 + i, esAdmin, hayAdmin: () => true })).status, 401);
  }
  assert.equal((await controlAdmin(alm, { clave: "contraseña-buena", persona: "p", ahora: T0 + 20, esAdmin, hayAdmin: () => true })).status, 429);
  assert.equal(await controlAdmin(alm, { clave: "contraseña-buena", persona: "q", ahora: T0 + 20, esAdmin, hayAdmin: () => true }), null);
  assert.equal(await controlAdmin(alm, { clave: "contraseña-buena", persona: "p", ahora: T0 + 11 * MINUTO, esAdmin, hayAdmin: () => true }), null);
});

// ------------------------------------------------------------ (6) conexión con El interruptor

test("minutoVigente y esLlaveDelMinuto", async () => {
  const alm = almacenEnMemoria();
  const { pago } = await vender(alm);
  const id = "2026-12-24T03:33Z";
  const desde = instanteDeId(id);
  assert.equal(await minutoVigente(desde - 1, alm), null);
  assert.deepEqual(await minutoVigente(desde, alm), { id, desde, hasta: desde + MINUTO });
  assert.deepEqual(await minutoVigente(desde + 59_999, alm), { id, desde, hasta: desde + MINUTO });
  assert.equal(await minutoVigente(desde + MINUTO, alm), null);
  // cuenta aunque la dedicatoria esté rechazada
  await moderar(alm, { id, decision: "rechazar" });
  assert.ok(await minutoVigente(desde + 1, alm));
  assert.equal(await esLlaveDelMinuto(id, pago.llave, alm), true);
  assert.equal(await esLlaveDelMinuto("2026-12-24T03-33Z", pago.llave, alm), true);
  assert.equal(await esLlaveDelMinuto(id, pago.llave.slice(0, -1) + "A", alm), pago.llave.endsWith("A"));
  assert.equal(await esLlaveDelMinuto(id, "", alm), false);
  assert.equal(await esLlaveDelMinuto(id, null, alm), false);
  assert.equal(await esLlaveDelMinuto("2026-12-24T03:34Z", pago.llave, alm), false);
  // una reserva sin pagar no es un minuto vigente
  const r = await reservar(alm, pedido({ hora: "00:40" }));
  assert.equal(r.status, 200);
  assert.equal(await minutoVigente(instanteDeId("2026-12-24T03:40Z") + 1, alm), null);
});

// ------------------------------------------------------------ (7) precios

test("precios: base, especiales, fechas y suma del 14 de febrero", () => {
  assert.deepEqual(precioDe({ fecha: "2026-12-24", hora: "00:33" }), { precioUsd: 5, especial: null });
  assert.equal(precioDe({ fecha: "2026-12-24", hora: "11:11" }).precioUsd, 15);
  assert.equal(precioDe({ fecha: "2026-12-24", hora: "11:11" }).especial, "11:11");
  for (const h of ["22:22", "12:34", "12:12", "21:21", "10:10", "20:20", "01:23", "23:23", "00:00", "23:59", "12:00"]) {
    assert.equal(precioDe({ fecha: "2026-06-01", hora: h }).precioUsd, 15, h);
  }
  assert.equal(precioDe({ fecha: "2026-06-01", hora: "03:33" }).precioUsd, 10);
  assert.equal(precioDe({ fecha: "2027-01-01", hora: "00:00" }).precioUsd, 50);
  assert.equal(precioDe({ fecha: "2026-12-31", hora: "23:59" }).precioUsd, 50);
  assert.equal(precioDe({ fecha: "2027-02-14", hora: "09:41" }).precioUsd, 10);
  assert.equal(precioDe({ fecha: "2027-02-14", hora: "11:11" }).precioUsd, 20);
  for (const e of PRECIOS.especiales) assert.ok(Number.isInteger(e.precio));
  assert.equal(preciosPublicos().base, 5);
});

test("el precio sale de la hora LOCAL: 11:11 en Buenos Aires vale 15", async () => {
  const alm = almacenEnMemoria();
  const r = await reservar(alm, pedido({ hora: "11:11" }));
  assert.equal(r.cuerpo.precioUsd, 15);
  assert.equal(r.cuerpo.id, "2026-12-24T14:11Z");
  assert.ok(Number(r.cuerpo.montoUnidades) > 15_000_000 && Number(r.cuerpo.montoUnidades) < 15_010_000);
});

// ------------------------------------------------------------ avisos

test("avisos: sin la dedicatoria, una sola vez por tipo; vigía", async () => {
  const alm = almacenEnMemoria();
  await vender(alm);
  const enviados = [];
  const enviar = async (url, op) => { enviados.push(op.body); return { ok: true }; };
  assert.equal(await avisar(alm, "vendido", "2026-12-24T03:33Z", { url: "https://aviso.test/x", enviar }), true);
  assert.equal(await avisar(alm, "vendido", "2026-12-24T03:33Z", { url: "https://aviso.test/x", enviar }), false);
  assert.equal(enviados[0], "El minuto: hay una dedicatoria para aprobar (2026-12-24 03:33 UTC). https://salehoy.com.ar/admin/");
  assert.ok(!enviados.join(" ").includes("Lucía"));
  assert.equal(TEXTOS.pronto("2026-12-24T03-33Z").includes("2026-12-24 03:33 UTC"), true);
  const desde = instanteDeId("2026-12-24T03:33Z");
  assert.deepEqual(await avisosPendientes(alm, desde - 2 * DIA), []);
  assert.deepEqual(await avisosPendientes(alm, desde - 3600_000), [{ id: "2026-12-24T03:33Z", tipo: "pronto" }]);
  assert.deepEqual(await avisosPendientes(alm, desde + MINUTO), [{ id: "2026-12-24T03:33Z", tipo: "neutro" }]);
  await moderar(alm, { id: "2026-12-24T03:33Z", decision: "aprobar" });
  assert.deepEqual(await avisosPendientes(alm, desde + MINUTO), []);
  // si no sale, se puede reintentar
  assert.equal(await avisar(alm, "pronto", "2026-12-24T03:33Z", { url: "https://aviso.test/x", enviar: async () => ({ ok: false, status: 500 }) }), false);
  assert.equal(await avisar(alm, "pronto", "2026-12-24T03:33Z", { url: "https://aviso.test/x", enviar }), true);
});
