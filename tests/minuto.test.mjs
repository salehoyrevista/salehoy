// Tests de "El minuto": node --test tests/minuto.test.mjs
// Toda la lógica corre contra el almacén en memoria y un reloj que se pasa a mano.
// Desde el 17/11/2026 el minuto se pide gratis (no hay reserva ni pago).
import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenEnMemoria } from "../netlify/lib/almacen.mjs";
import {
  idDeInstante, instanteDeId, idUrl, consultar, pedir, leerMinutoPublico,
  listarArchivo, ahoraPublico, moderar, listarParaAdmin, borrarPruebas, controlAdmin,
  avisosPendientes, limpiar, MINUTO, DIA, ESPERA_PERSONA, TOPE_DIARIO
} from "../netlify/lib/minuto.mjs";
import { minutoVigente, esLlaveDelMinuto } from "../netlify/lib/minuto-vigente.mjs";
import { precioDe } from "../netlify/lib/precios.mjs";
import { avisar, TEXTOS } from "../netlify/lib/avisos.mjs";

const T0 = Date.UTC(2026, 10, 16, 12, 0, 0);
const BA = "America/Argentina/Buenos_Aires";
const ID = "2026-12-24T03:33Z";

const datos = (extra = {}) => ({ fecha: "2026-12-24", hora: "00:33", zona: BA, dedicatoria: "Para Lucía", lang: "es", ahora: T0, ...extra });

async function dar(alm, extra = {}) {
  const r = await pedir(alm, datos(extra));
  assert.equal(r.status, 200, JSON.stringify(r.cuerpo));
  return r.cuerpo;
}

// ------------------------------------------------------------ identificadores

test("ids: instante <-> id canónico y forma de URL", () => {
  const t = Date.UTC(2026, 11, 24, 3, 33, 27);
  assert.equal(idDeInstante(t), ID);
  assert.equal(instanteDeId(ID), Date.UTC(2026, 11, 24, 3, 33));
  assert.equal(instanteDeId("2026-12-24T03-33Z"), Date.UTC(2026, 11, 24, 3, 33));
  assert.equal(idUrl(ID), "2026-12-24T03-33Z");
  assert.equal(instanteDeId("2026-02-30T03:33Z"), null);
  assert.equal(instanteDeId("2026-12-24T24:00Z"), null);
  assert.equal(instanteDeId("hola"), null);
});

// ------------------------------------------------------------ (1) un instante tiene un solo dueño

test("pedir: forma de la respuesta y registro sin datos de la persona", async () => {
  const alm = almacenEnMemoria();
  const r = await dar(alm);
  assert.equal(r.estado, "vendido");
  assert.equal(r.id, ID);
  assert.equal(r.pagina, "/minuto/m/2026-12-24T03-33Z/");
  assert.equal(r.utc, "2026-12-24 03:33 UTC");
  assert.deepEqual(r.local, { fecha: "2026-12-24", hora: "00:33" });
  assert.ok(typeof r.llave === "string" && r.llave.length >= 30);
  const guardado = (await alm.leer("m/2026-12-24T03-33Z")).valor;
  assert.equal(guardado.moderacion, "pendiente");
  assert.equal(guardado.prueba, false);
  assert.deepEqual(guardado.pago, { gratis: true });
  assert.ok(!JSON.stringify(guardado).includes(r.llave), "la llave no se guarda en claro");
  assert.equal((await dar(almacenEnMemoria(), { lang: "en" })).pagina, "/en/minute/m/2026-12-24T03-33Z/");
});

test("dos pedidos simultáneos del mismo minuto: uno gana, el otro 409", async () => {
  const alm = almacenEnMemoria();
  const [a, b] = await Promise.all([pedir(alm, datos({ persona: "a" })), pedir(alm, datos({ persona: "b", dedicatoria: "Otra" }))]);
  const estados = [a.status, b.status].sort();
  assert.deepEqual(estados, [200, 409]);
  const perdedor = a.status === 409 ? a : b;
  assert.equal(perdedor.cuerpo.error, "ocupado");
  assert.equal((await listarParaAdmin(alm, { estado: "todas", ahora: T0 })).minutos.length, 1);
});

test("muchos pedidos simultáneos del mismo minuto: exactamente uno gana", async () => {
  const alm = almacenEnMemoria();
  const rs = await Promise.all(Array.from({ length: 12 }, (_, i) => pedir(alm, datos({ persona: "p" + i }))));
  assert.equal(rs.filter((r) => r.status === 200).length, 1);
  assert.equal(rs.filter((r) => r.status === 409).length, 11);
});

test("20 personas pidiendo minutos distintos a la vez: todos quedan en el índice", async () => {
  const alm = almacenEnMemoria();
  const rs = await Promise.all(Array.from({ length: 20 }, (_, i) => pedir(alm, datos({ hora: "02:" + String(i).padStart(2, "0"), persona: "p" + i }))));
  assert.ok(rs.every((r) => r.status === 200));
  assert.equal((await listarParaAdmin(alm, { estado: "todas", ahora: T0 })).minutos.length, 20);
});

test("el mismo instante desde dos zonas choca: 00:33 en Buenos Aires = 03:33 UTC = 22:33 en Nueva York", async () => {
  const alm = almacenEnMemoria();
  await dar(alm);
  const utc = await pedir(alm, datos({ hora: "03:33", zona: "UTC", persona: "otra" }));
  assert.equal(utc.status, 409);
  assert.equal(utc.cuerpo.motivo, "vendido");
  const ny = await pedir(alm, datos({ fecha: "2026-12-23", hora: "22:33", zona: "America/New_York", persona: "otra2" }));
  assert.equal(ny.status, 409);
  const c = await consultar(alm, { fecha: "2026-12-24", hora: "03:33", zona: "UTC", ahora: T0 });
  assert.equal(c.cuerpo.disponible, false);
  assert.equal(c.cuerpo.motivo, "vendido");
  assert.equal("precioUsd" in c.cuerpo, false, "ya no hay precio");
});

test("pasado y lejano", async () => {
  const alm = almacenEnMemoria();
  const enUnRato = new Date(T0 + 2 * MINUTO);
  const r = await pedir(alm, datos({ fecha: enUnRato.toISOString().slice(0, 10), hora: enUnRato.toISOString().slice(11, 16), zona: "UTC" }));
  assert.deepEqual(r.cuerpo, { error: "ocupado", motivo: "pasado" });
  const lejos = await pedir(alm, datos({ fecha: "2029-01-01" }));
  assert.deepEqual(lejos.cuerpo, { error: "ocupado", motivo: "lejano" });
});

test("pedir: errores de formato, zona, hora inexistente y dedicatoria", async () => {
  const alm = almacenEnMemoria();
  assert.deepEqual((await pedir(alm, datos({ zona: "Nada/Nada" }))).cuerpo, { error: "zona" });
  assert.deepEqual((await pedir(alm, datos({ fecha: "24/12/2026" }))).cuerpo, { error: "formato" });
  const inex = await pedir(alm, datos({ fecha: "2027-03-14", hora: "02:30", zona: "America/New_York" }));
  assert.deepEqual(inex.cuerpo, { error: "hora-inexistente" });
  assert.deepEqual((await pedir(alm, datos({ dedicatoria: "www.algo.com" }))).cuerpo, { error: "dedicatoria", detalle: "enlace" });
  assert.deepEqual((await pedir(alm, datos({ dedicatoria: "   " }))).cuerpo, { error: "dedicatoria", detalle: "vacia" });
});

// ------------------------------------------------------------ límites

test("un minuto por persona cada 7 días; personas distintas no se bloquean", async () => {
  const alm = almacenEnMemoria();
  assert.equal((await pedir(alm, datos({ persona: "p" }))).status, 200);
  const segundo = await pedir(alm, datos({ hora: "00:34", persona: "p" }));
  assert.equal(segundo.status, 429);
  assert.equal(segundo.cuerpo.motivo, "semana");
  assert.equal(segundo.cuerpo.hasta, T0 + ESPERA_PERSONA);
  assert.equal((await pedir(alm, datos({ hora: "00:34", persona: "q" }))).status, 200);
  assert.equal((await pedir(alm, datos({ hora: "00:35", persona: "p", ahora: T0 + ESPERA_PERSONA + 1 }))).status, 200);
});

test("la misma persona pidiendo dos minutos a la vez: solo uno", async () => {
  const alm = almacenEnMemoria();
  const rs = await Promise.all([pedir(alm, datos({ persona: "p" })), pedir(alm, datos({ hora: "00:40", persona: "p" }))]);
  assert.deepEqual(rs.map((r) => r.status).sort(), [200, 429]);
});

test("un pedido que pierde el minuto no gasta la semana de esa persona", async () => {
  const alm = almacenEnMemoria();
  await dar(alm, { persona: "a" });
  assert.equal((await pedir(alm, datos({ persona: "b" }))).status, 409);
  assert.equal((await pedir(alm, datos({ hora: "00:50", persona: "b" }))).status, 200);
});

test("tope global por día", async () => {
  const alm = almacenEnMemoria();
  for (let i = 0; i < TOPE_DIARIO; i++) {
    const h = `${String(1 + Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`;
    assert.equal((await pedir(alm, datos({ hora: h, persona: "p" + i }))).status, 200, h);
  }
  const lleno = await pedir(alm, datos({ hora: "05:00", persona: "otra" }));
  assert.equal(lleno.status, 429);
  assert.equal(lleno.cuerpo.motivo, "dia");
  assert.equal(lleno.cuerpo.hasta, Date.UTC(2026, 10, 17));
  // y esa persona no gastó su semana
  assert.equal((await pedir(alm, datos({ hora: "05:00", persona: "otra", ahora: T0 + DIA }))).status, 200);
});

test("limpieza: lugares y contadores viejos", async () => {
  const alm = almacenEnMemoria();
  await dar(alm, { persona: "p" });
  assert.equal(await limpiar(alm, T0 + DIA), 0);
  assert.ok(await limpiar(alm, T0 + ESPERA_PERSONA + 5 * DIA) >= 2);
  assert.deepEqual(await alm.listar("pedidos/"), []);
  assert.deepEqual(await alm.listar("diario/"), []);
});

// ------------------------------------------------------------ lecturas públicas, moderación, archivo

test("público: la dedicatoria solo aparece aprobada; neutra si no", async () => {
  const alm = almacenEnMemoria();
  await dar(alm);
  const desde = instanteDeId(ID);
  let m = await leerMinutoPublico(alm, "2026-12-24T03-33Z", T0);
  assert.deepEqual(m, {
    id: ID, instante: desde, zona: BA, local: { fecha: "2026-12-24", hora: "00:33" },
    estado: "pendiente", dedicatoria: null, prueba: false, vendido: T0, pasado: false
  });
  let a = await ahoraPublico(alm, { ahora: desde + 10_000 });
  assert.deepEqual(a.minuto, { id: ID, desde, hasta: desde + MINUTO, estado: "neutra", dedicatoria: null, prueba: false });
  const antes = await ahoraPublico(alm, { ahora: desde - 3600_000 });
  assert.equal(antes.minuto, null);
  assert.deepEqual(antes.proximos, [{ id: ID, desde }]);

  assert.equal((await moderar(alm, { id: ID, decision: "aprobar", ahora: T0 })).cuerpo.estado, "aprobada");
  m = await leerMinutoPublico(alm, ID, desde + MINUTO);
  assert.equal(m.dedicatoria, "Para Lucía");
  assert.equal(m.pasado, true);
  a = await ahoraPublico(alm, { ahora: desde + 59_999 });
  assert.equal(a.minuto.estado, "aprobada");
  assert.equal(a.minuto.dedicatoria, "Para Lucía");
  assert.equal((await ahoraPublico(alm, { ahora: desde + MINUTO })).minuto, null);
  assert.equal((await moderar(alm, { id: "2027-01-01T00:00Z", decision: "aprobar" })).status, 404);
  assert.equal(await leerMinutoPublico(alm, "2027-01-01T00:00Z"), null);
});

test("rechazar libera el minuto: desaparece y se puede volver a pedir", async () => {
  const alm = almacenEnMemoria();
  await dar(alm, { persona: "a" });
  const r = await moderar(alm, { id: ID, decision: "rechazar", nota: "no", ahora: T0 });
  assert.deepEqual(r.cuerpo, { id: ID, estado: "rechazada", liberado: true, nota: "no" });
  assert.equal(await leerMinutoPublico(alm, ID, T0), null);
  assert.equal((await ahoraPublico(alm, { ahora: T0 })).proximos.length, 0);
  assert.equal((await consultar(alm, { fecha: "2026-12-24", hora: "00:33", zona: BA, ahora: T0 })).cuerpo.disponible, true);
  assert.equal((await pedir(alm, datos({ persona: "b", dedicatoria: "Otra cosa" }))).status, 200);
  assert.equal((await moderar(alm, { id: "2026-12-25T00:00Z", decision: "rechazar" })).status, 404);
});

test("archivo: solo pasados, del más reciente al más viejo, paginado", async () => {
  const alm = almacenEnMemoria();
  for (const hora of ["00:10", "00:11", "00:12", "00:13"]) await dar(alm, { hora });
  const ahora = instanteDeId("2026-12-24T03:12Z") + 30_000;   // 03:10 y 03:11 pasaron; 03:12 está en curso
  const l = await listarArchivo(alm, { n: 1, ahora });
  assert.deepEqual(l.minutos.map((m) => m.id), ["2026-12-24T03:11Z"]);
  assert.equal(l.sigue, instanteDeId("2026-12-24T03:11Z"));
  const l2 = await listarArchivo(alm, { n: 1, antes: l.sigue, ahora });
  assert.deepEqual(l2.minutos.map((m) => m.id), ["2026-12-24T03:10Z"]);
  assert.equal(l2.sigue, null);
  assert.deepEqual(Object.keys(l2.minutos[0]).sort(), ["dedicatoria", "estado", "id", "instante", "prueba"]);
});

test("admin: listado con la dedicatoria; borrar pruebas no toca minutos reales", async () => {
  const alm = almacenEnMemoria();
  await dar(alm);
  await dar(alm, { hora: "00:50" });
  const l = await listarParaAdmin(alm, { estado: "todas", ahora: T0 });
  assert.equal(l.minutos.length, 2);
  const m = l.minutos.find((x) => x.local.hora === "00:50");
  assert.equal(m.dedicatoria, "Para Lucía");
  assert.equal(m.estado, "pendiente");
  assert.equal((await listarParaAdmin(alm, { estado: "pendiente", ahora: T0 })).minutos.length, 2);
  await moderar(alm, { id: ID, decision: "aprobar" });
  assert.equal((await listarParaAdmin(alm, { estado: "pendiente", ahora: T0 })).minutos.length, 1);
  assert.equal((await borrarPruebas(alm)).borrados, 0);
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

// ------------------------------------------------------------ conexión con El interruptor

test("minutoVigente solo con dedicatoria aprobada; esLlaveDelMinuto", async () => {
  const alm = almacenEnMemoria();
  const { llave } = await dar(alm);
  const desde = instanteDeId(ID);
  // sin aprobar: no le quita la luz a nadie
  assert.equal(await minutoVigente(desde + 1, alm), null);
  await moderar(alm, { id: ID, decision: "aprobar" });
  assert.equal(await minutoVigente(desde - 1, alm), null);
  assert.deepEqual(await minutoVigente(desde, alm), { id: ID, desde, hasta: desde + MINUTO });
  assert.deepEqual(await minutoVigente(desde + 59_999, alm), { id: ID, desde, hasta: desde + MINUTO });
  assert.equal(await minutoVigente(desde + MINUTO, alm), null);
  assert.equal(await esLlaveDelMinuto(ID, llave, alm), true);
  assert.equal(await esLlaveDelMinuto("2026-12-24T03-33Z", llave, alm), true);
  assert.equal(await esLlaveDelMinuto(ID, llave.slice(0, -1) + (llave.endsWith("A") ? "B" : "A"), alm), false);
  assert.equal(await esLlaveDelMinuto(ID, "", alm), false);
  assert.equal(await esLlaveDelMinuto(ID, null, alm), false);
  assert.equal(await esLlaveDelMinuto("2026-12-24T03:34Z", llave, alm), false);
});

// ------------------------------------------------------------ minutos especiales (ya sin precio)

test("especiales: se reconocen por la hora LOCAL", () => {
  assert.equal(precioDe({ fecha: "2026-12-24", hora: "11:11" }).especial, "11:11");
  assert.equal(precioDe({ fecha: "2026-12-24", hora: "00:33" }).especial, null);
});

test("consultar informa el especial sin precio", async () => {
  const alm = almacenEnMemoria();
  const c = await consultar(alm, { fecha: "2026-12-24", hora: "11:11", zona: BA, ahora: T0 });
  assert.equal(c.cuerpo.especial, "11:11");
  assert.equal(c.cuerpo.id, "2026-12-24T14:11Z");
  assert.equal(c.cuerpo.disponible, true);
});

// ------------------------------------------------------------ avisos

test("avisos: sin la dedicatoria, una sola vez por tipo; vigía", async () => {
  const alm = almacenEnMemoria();
  await dar(alm);
  const enviados = [];
  const enviar = async (url, op) => { enviados.push(op.body); return { ok: true }; };
  assert.equal(await avisar(alm, "vendido", ID, { url: "https://aviso.test/x", enviar }), true);
  assert.equal(await avisar(alm, "vendido", ID, { url: "https://aviso.test/x", enviar }), false);
  assert.equal(enviados[0], "El minuto: hay una dedicatoria para aprobar (2026-12-24 03:33 UTC). https://salehoy.com.ar/admin/");
  assert.ok(!enviados.join(" ").includes("Lucía"));
  assert.equal(TEXTOS.pronto("2026-12-24T03-33Z").includes("2026-12-24 03:33 UTC"), true);
  const desde = instanteDeId(ID);
  assert.deepEqual(await avisosPendientes(alm, desde - 2 * DIA), []);
  assert.deepEqual(await avisosPendientes(alm, desde - 3600_000), [{ id: ID, tipo: "pronto" }]);
  assert.deepEqual(await avisosPendientes(alm, desde + MINUTO), [{ id: ID, tipo: "neutro" }]);
  await moderar(alm, { id: ID, decision: "aprobar" });
  assert.deepEqual(await avisosPendientes(alm, desde + MINUTO), []);
  assert.equal(await avisar(alm, "pronto", ID, { url: "https://aviso.test/x", enviar: async () => ({ ok: false, status: 500 }) }), false);
  assert.equal(await avisar(alm, "pronto", ID, { url: "https://aviso.test/x", enviar }), true);
});
