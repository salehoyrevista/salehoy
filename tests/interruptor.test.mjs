// Tests de "El interruptor": node --test tests/interruptor.test.mjs
// Toda la lógica corre contra el almacén en memoria y un reloj que se pasa a mano.
import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenEnMemoria } from "../netlify/lib/almacen.mjs";
import {
  leerEstado, tocar, leerHuella, estadoPublico, emitirFicha, verificarFicha, personaDe, limpiarLimites,
  duracion, lineaDuracion, fraseHuella, lugar, idHuella,
  LIMITE_PERSONA, RAFAGA, RAFAGA_LLAVE, FICHA_MINIMA, FICHA_MAXIMA, MAX_ULTIMAS, ID_HUELLA
} from "../netlify/lib/interruptor.mjs";

const T0 = Date.UTC(2026, 10, 16, 12, 0, 0);
const SEG = 1000, MIN = 60 * SEG;
const SEC = "secreto-de-prueba-0123456789";
const ana = "a".repeat(32), beto = "b".repeat(32), caro = "c".repeat(32);

test("estado inicial: prendida, desde ahora, sin récords", async () => {
  const alm = almacenEnMemoria();
  const e = await leerEstado(alm, T0);
  assert.deepEqual(e, { prendida: true, desde: T0, toques: 0, recordPrendida: 0, recordApagada: 0, ultimas: [], huellaVigente: null });
  const otra = await leerEstado(alm, T0 + 5 * SEG);
  assert.equal(otra.desde, T0, "el estado inicial se crea una sola vez");
});

test("un toque apaga la luz para todos y deja huella", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  const r = await tocar(alm, { ahora: T0 + 10 * SEG, persona: ana, ciudad: "Córdoba", pais: "Argentina", cc: "AR" });
  assert.equal(r.ok, true);
  assert.equal(r.huella.accion, "apago");
  assert.match(r.huella.id, ID_HUELLA);
  assert.equal(r.hasta, T0 + 10 * SEG + LIMITE_PERSONA);
  const e = await leerEstado(alm, T0 + 11 * SEG);
  assert.equal(e.prendida, false);
  assert.equal(e.desde, T0 + 10 * SEG);
  assert.equal(e.toques, 1);
  assert.equal(e.recordPrendida, 10 * SEG);
  assert.equal(e.huellaVigente, r.huella.id);
  const h = await leerHuella(alm, r.huella.id);
  assert.deepEqual(h, { id: r.huella.id, accion: "apago", t: T0 + 10 * SEG, fin: null, ciudad: "Córdoba", pais: "Argentina", cc: "AR" });
});

test("límite: un toque por persona cada 5 minutos", async () => {
  const alm = almacenEnMemoria();
  const t1 = T0 + 10 * SEG;
  assert.equal((await tocar(alm, { ahora: t1, persona: ana })).ok, true);

  // la misma persona, dentro de los 5 minutos: rechazado, y el estado no cambia
  const r2 = await tocar(alm, { ahora: t1 + 2 * MIN, persona: ana });
  assert.deepEqual(r2, { ok: false, estado: 429, error: "espera", hasta: t1 + LIMITE_PERSONA, motivo: "persona" });
  assert.equal((await leerEstado(alm, t1)).toques, 1);

  // justo antes de cumplirse sigue rechazado; al cumplirse, pasa
  assert.equal((await tocar(alm, { ahora: t1 + LIMITE_PERSONA - 1, persona: ana })).ok, false);
  const r3 = await tocar(alm, { ahora: t1 + LIMITE_PERSONA, persona: ana });
  assert.equal(r3.ok, true);
  assert.equal(r3.huella.accion, "prendio");
  assert.equal((await leerEstado(alm, t1)).toques, 2);
});

test("límite: personas distintas no se bloquean entre sí", async () => {
  const alm = almacenEnMemoria();
  assert.equal((await tocar(alm, { ahora: T0 + 10 * SEG, persona: ana })).ok, true);
  assert.equal((await tocar(alm, { ahora: T0 + 20 * SEG, persona: beto })).ok, true);
  assert.equal((await tocar(alm, { ahora: T0 + 30 * SEG, persona: caro })).ok, true);
  const e = await leerEstado(alm, T0);
  assert.equal(e.toques, 3);
  assert.equal(e.prendida, false);
});

test("en el límite solo se guarda { hasta }: nada de la persona", async () => {
  const alm = almacenEnMemoria();
  await tocar(alm, { ahora: T0, persona: ana, ciudad: "Lima", pais: "Peru", cc: "PE" });
  const claves = await alm.listar("limite/");
  assert.deepEqual(claves, ["limite/" + ana]);
  assert.deepEqual((await alm.leer(claves[0])).valor, { hasta: T0 + LIMITE_PERSONA });
});

test("persona: HMAC que no contiene la IP, estable en el día y distinto al día siguiente", () => {
  const p1 = personaDe(SEC, "203.0.113.7", T0);
  assert.match(p1, /^[0-9a-f]{32}$/);
  assert.ok(!p1.includes("203"));
  assert.equal(personaDe(SEC, "203.0.113.7", T0 + 3600 * SEG), p1);
  assert.notEqual(personaDe(SEC, "203.0.113.8", T0), p1);
  assert.notEqual(personaDe(SEC, "203.0.113.7", T0 + 24 * 3600 * SEG), p1);
  assert.notEqual(personaDe("otro-secreto-0123456789", "203.0.113.7", T0), p1);
});

test("ráfaga global: mínimo de 1,5 s entre toques de cualquiera", async () => {
  const alm = almacenEnMemoria();
  const t1 = T0 + 10 * SEG;
  assert.equal((await tocar(alm, { ahora: t1, persona: ana })).ok, true);
  const r = await tocar(alm, { ahora: t1 + 800, persona: beto });
  assert.deepEqual(r, { ok: false, estado: 429, error: "espera", hasta: t1 + RAFAGA, motivo: "rafaga" });
  // el rechazo por ráfaga no le gasta el turno a quien lo sufrió
  assert.equal((await alm.leer("limite/" + beto)), null);
  const r2 = await tocar(alm, { ahora: t1 + RAFAGA, persona: beto });
  assert.equal(r2.ok, true);
  assert.equal((await leerEstado(alm, t1)).toques, 2);
});

test("dos toques simultáneos no dejan el estado inconsistente", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  const ahora = T0 + 10 * SEG;
  const [a, b] = await Promise.all([
    tocar(alm, { ahora, persona: ana, ciudad: "Córdoba", pais: "Argentina", cc: "AR" }),
    tocar(alm, { ahora, persona: beto, ciudad: "Madrid", pais: "Spain", cc: "ES" })
  ]);
  const entraron = [a, b].filter((r) => r.ok);
  const rechazados = [a, b].filter((r) => !r.ok);
  assert.equal(entraron.length, 1, "entra exactamente uno");
  assert.equal(rechazados[0].estado, 429);
  assert.equal(rechazados[0].motivo, "rafaga");

  const e = await leerEstado(alm, ahora);
  assert.equal(e.toques, 1);
  assert.equal(e.prendida, false);
  assert.equal(e.ultimas.length, 1);
  assert.equal(e.huellaVigente, entraron[0].huella.id);
  assert.deepEqual(await alm.listar("huella/"), ["huella/" + e.huellaVigente], "una sola huella");
  // quien perdió conserva su turno; quien ganó lo gastó
  assert.equal((await alm.listar("limite/")).length, 1);
});

test("muchos toques simultáneos: entra uno solo y todo cierra", async () => {
  const alm = almacenEnMemoria();
  const ahora = T0 + 10 * SEG;
  const personas = Array.from({ length: 12 }, (_, i) => String(i).padStart(32, "0"));
  const rs = await Promise.all(personas.map((persona) => tocar(alm, { ahora, persona })));
  assert.equal(rs.filter((r) => r.ok).length, 1);
  assert.ok(rs.filter((r) => !r.ok).every((r) => r.estado === 429));
  const e = await leerEstado(alm, ahora);
  assert.equal(e.toques, 1);
  assert.equal((await alm.listar("huella/")).length, 1);
  assert.equal((await alm.listar("limite/")).length, 1);
});

test("la misma persona dos veces a la vez: pasa una sola", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  const ahora = T0 + 10 * SEG;
  const rs = await Promise.all([tocar(alm, { ahora, persona: ana }), tocar(alm, { ahora, persona: ana })]);
  assert.equal(rs.filter((r) => r.ok).length, 1);
  assert.equal((await leerEstado(alm, ahora)).toques, 1);
});

test("cierre de huellas: cada toque cierra la anterior", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  const t1 = T0 + 1 * MIN, t2 = T0 + 4 * MIN, t3 = T0 + 10 * MIN;
  const r1 = await tocar(alm, { ahora: t1, persona: ana });
  const r2 = await tocar(alm, { ahora: t2, persona: beto });
  const r3 = await tocar(alm, { ahora: t3, persona: caro });
  assert.deepEqual([r1.huella.accion, r2.huella.accion, r3.huella.accion], ["apago", "prendio", "apago"]);
  assert.equal((await leerHuella(alm, r1.huella.id)).fin, t2);
  assert.equal((await leerHuella(alm, r2.huella.id)).fin, t3);
  assert.equal((await leerHuella(alm, r3.huella.id)).fin, null, "la última sigue vigente");
});

test("una huella que quedó abierta por un corte se cierra al leerla", async () => {
  const alm = almacenEnMemoria();
  const r1 = await tocar(alm, { ahora: T0 + 1 * MIN, persona: ana });
  const r2 = await tocar(alm, { ahora: T0 + 3 * MIN, persona: beto });
  // se simula que el cierre de la primera nunca llegó a escribirse
  const h1 = (await alm.leer("huella/" + r1.huella.id)).valor;
  await alm.guardar("huella/" + r1.huella.id, { ...h1, fin: null });
  assert.equal((await leerHuella(alm, r1.huella.id)).fin, T0 + 3 * MIN);
  assert.equal((await alm.leer("huella/" + r1.huella.id)).valor.fin, T0 + 3 * MIN, "queda corregida");
  assert.equal((await leerHuella(alm, r2.huella.id)).fin, null);
});

test("huella inexistente o con identificador inválido: null", async () => {
  const alm = almacenEnMemoria();
  assert.equal(await leerHuella(alm, "abcdefgh"), null);
  assert.equal(await leerHuella(alm, "../estado"), null);
  assert.equal(await leerHuella(alm, "ABCDEFGH"), null);
  assert.equal(await leerHuella(alm, undefined), null);
  for (let i = 0; i < 50; i++) assert.match(idHuella(), ID_HUELLA);
});

test("récords: se actualizan al cerrar un tramo y solo si lo superan", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  await tocar(alm, { ahora: T0 + 10 * MIN, persona: ana });            // prendida 10 min
  await tocar(alm, { ahora: T0 + 13 * MIN, persona: beto });           // apagada 3 min
  await tocar(alm, { ahora: T0 + 15 * MIN, persona: caro });           // prendida 2 min: no supera
  let e = await leerEstado(alm, T0);
  assert.equal(e.recordPrendida, 10 * MIN);
  assert.equal(e.recordApagada, 3 * MIN);
  await tocar(alm, { ahora: T0 + 22 * MIN, persona: ana });            // apagada 7 min: supera
  e = await leerEstado(alm, T0);
  assert.equal(e.recordPrendida, 10 * MIN);
  assert.equal(e.recordApagada, 7 * MIN);
  assert.equal(e.prendida, true);
});

test("estado público: el récord cuenta el tramo en curso y no expone identificadores de huella", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  await tocar(alm, { ahora: T0 + 10 * MIN, persona: ana, ciudad: "Córdoba", pais: "Argentina", cc: "AR" });
  const e = await leerEstado(alm, T0);
  const p = estadoPublico(e, { ahora: T0 + 45 * MIN });
  assert.equal(p.ahora, T0 + 45 * MIN);
  assert.equal(p.prendida, false);
  assert.equal(p.recordPrendida, 10 * MIN);
  assert.equal(p.recordApagada, 35 * MIN, "lleva apagada más que nunca: ese es el récord");
  assert.deepEqual(p.ultimas, [{ ciudad: "Córdoba", pais: "Argentina", cc: "AR", accion: "apago", t: T0 + 10 * MIN }]);
  assert.equal(p.minuto, null);
  assert.equal(p.vivo, null);
  assert.equal(p.espera, 4000);
  assert.ok(!("huellaVigente" in p));
  const conTodo = estadoPublico(e, { ahora: T0, minuto: { id: "2026-11-16T12:00Z", desde: T0, hasta: T0 + MIN }, vivo: "https://x.firebaseio.com/interruptor/publico.json" });
  assert.deepEqual(conTodo.minuto, { id: "2026-11-16T12:00Z", hasta: T0 + MIN });
  assert.equal(conTodo.vivo, "https://x.firebaseio.com/interruptor/publico.json");
});

test("últimas ciudades: como máximo 12, la más reciente primero, sin HTML", async () => {
  const alm = almacenEnMemoria();
  for (let i = 0; i < 15; i++) {
    const r = await tocar(alm, { ahora: T0 + (i + 1) * 10 * SEG, persona: String(i).padStart(32, "0"), ciudad: i === 14 ? '<b>Río "Cuarto"</b>' : "C" + i, pais: "Argentina", cc: "AR" });
    assert.equal(r.ok, true);
  }
  const e = await leerEstado(alm, T0);
  assert.equal(e.toques, 15);
  assert.equal(e.ultimas.length, MAX_ULTIMAS);
  assert.equal(e.ultimas[0].ciudad, "bRío Cuarto/b");
  assert.equal(e.ultimas[1].ciudad, "C13");
  assert.equal(e.ultimas[MAX_ULTIMAS - 1].ciudad, "C3");
});

test("fichas: válida solo entre 1,2 s y 10 min, y solo con nuestra firma", () => {
  const f = emitirFicha(SEC, T0);
  assert.match(f, /^\d+\.[0-9a-f]{32}$/);
  assert.equal(verificarFicha(SEC, f, T0), false, "demasiado nueva");
  assert.equal(verificarFicha(SEC, f, T0 + FICHA_MINIMA - 1), false, "demasiado nueva");
  assert.equal(verificarFicha(SEC, f, T0 + FICHA_MINIMA), true);
  assert.equal(verificarFicha(SEC, f, T0 + 5 * MIN), true);
  assert.equal(verificarFicha(SEC, f, T0 + FICHA_MAXIMA), true);
  assert.equal(verificarFicha(SEC, f, T0 + FICHA_MAXIMA + 1), false, "vencida");
  assert.equal(verificarFicha(SEC, f, T0 - 5 * SEG), false, "del futuro");

  // firma falsa
  const [ms, firma] = f.split(".");
  const falsa = ms + "." + (firma[0] === "0" ? "1" : "0") + firma.slice(1);
  assert.equal(verificarFicha(SEC, falsa, T0 + 5 * SEG), false);
  assert.equal(verificarFicha(SEC, ms + "." + "0".repeat(32), T0 + 5 * SEG), false);
  // hora cambiada con la firma de otra hora
  assert.equal(verificarFicha(SEC, (Number(ms) + 1) + "." + firma, T0 + 5 * SEG), false);
  // firmada con otro secreto
  assert.equal(verificarFicha("otro-secreto-0123456789", f, T0 + 5 * SEG), false);
  // basura
  for (const mala of ["", "hola", ms, ms + ".", "." + firma, null, undefined, 123, {}, ms + "." + firma + "00", "x".repeat(500)]) {
    assert.equal(verificarFicha(SEC, mala, T0 + 5 * SEG), false);
  }
});

test("minuto vigente: sin llave 423, con llave pasa", async () => {
  const alm = almacenEnMemoria();
  await leerEstado(alm, T0);
  const minuto = { id: "2026-11-16T12:01Z", desde: T0 + MIN, hasta: T0 + 2 * MIN };
  const t = T0 + MIN + 5 * SEG;

  const sin = await tocar(alm, { ahora: t, persona: ana, minuto, llaveValida: false });
  assert.deepEqual(sin, { ok: false, estado: 423, error: "minuto", id: minuto.id, hasta: minuto.hasta });
  assert.equal((await leerEstado(alm, t)).toques, 0);
  assert.equal((await alm.listar("limite/")).length, 0, "el rechazo no gasta el turno");

  const con = await tocar(alm, { ahora: t, persona: beto, minuto, llaveValida: true });
  assert.equal(con.ok, true);
  assert.equal(con.hasta, null);
  assert.equal((await leerEstado(alm, t)).prendida, false);
});

test("minuto vigente: quien tiene la llave toca sin el límite de 5 min, con tope de 400 ms", async () => {
  const alm = almacenEnMemoria();
  const minuto = { id: "2026-11-16T12:01Z", desde: T0 + MIN, hasta: T0 + 2 * MIN };
  const t = T0 + MIN + 5 * SEG;
  assert.equal((await tocar(alm, { ahora: t, persona: ana, minuto, llaveValida: true })).ok, true);
  const rapido = await tocar(alm, { ahora: t + 200, persona: ana, minuto, llaveValida: true });
  assert.deepEqual(rapido, { ok: false, estado: 429, error: "espera", hasta: t + RAFAGA_LLAVE, motivo: "rafaga" });
  assert.equal((await tocar(alm, { ahora: t + RAFAGA_LLAVE, persona: ana, minuto, llaveValida: true })).ok, true);
  assert.equal((await tocar(alm, { ahora: t + 2 * RAFAGA_LLAVE, persona: ana, minuto, llaveValida: true })).ok, true);
  assert.equal((await leerEstado(alm, t)).toques, 3);
  assert.equal((await alm.listar("limite/")).length, 0, "con llave no se anota límite");
  // terminado el minuto, vuelve a ser de todos: la misma persona entra con el límite normal
  assert.equal((await tocar(alm, { ahora: T0 + 2 * MIN + SEG, persona: ana })).ok, true);
  assert.equal((await tocar(alm, { ahora: T0 + 3 * MIN, persona: ana })).motivo, "persona");
});

test("limpieza perezosa: borra los límites vencidos, hasta 20 por vez", async () => {
  const alm = almacenEnMemoria();
  for (let i = 0; i < 30; i++) await alm.guardar("limite/" + String(i).padStart(32, "0"), { hasta: T0 - SEG });
  await alm.guardar("limite/" + ana, { hasta: T0 + MIN });
  const borradas = await limpiarLimites(alm, T0);
  assert.ok(borradas === 19 || borradas === 20, "mira 20 claves; el vigente puede caer en el tramo y no se borra");
  const quedan = await alm.listar("limite/");
  assert.equal(quedan.length, 31 - borradas);
  assert.ok(quedan.includes("limite/" + ana));
  await limpiarLimites(alm, T0 + 7 * SEG);
  await limpiarLimites(alm, T0 + 13 * SEG);
  await limpiarLimites(alm, T0 + 19 * SEG);
  assert.deepEqual(await alm.listar("limite/"), ["limite/" + ana], "el vigente nunca se borra");
  assert.equal(await limpiarLimites(almacenEnMemoria(), T0), 0);
});

test("textos: duraciones, frases y lugares en español e inglés", () => {
  assert.equal(duracion(0), "0 s");
  assert.equal(duracion(37 * SEG), "37 s");
  assert.equal(duracion(14 * MIN + 7 * SEG), "14 min 7 s");
  assert.equal(duracion(14 * MIN), "14 min");
  assert.equal(duracion(2 * 60 * MIN + 14 * MIN + 59 * SEG), "2 h 14 min");
  assert.equal(duracion(3 * 24 * 60 * MIN + 4 * 60 * MIN + 5 * MIN), "3 d 4 h");
  assert.equal(duracion(-5), "0 s");

  const cerrada = { accion: "apago", t: T0, fin: T0 + 134 * MIN, ciudad: "Córdoba", pais: "Argentina", cc: "AR" };
  const vigente = { ...cerrada, fin: null };
  assert.equal(lineaDuracion(cerrada, T0 + 999 * MIN, "es"), "Duró 2 h 14 min.");
  assert.equal(lineaDuracion(vigente, T0 + 134 * MIN, "es"), "Lleva 2 h 14 min así.");
  assert.equal(lineaDuracion(cerrada, T0, "en"), "It lasted 2 h 14 min.");
  assert.equal(lineaDuracion(vigente, T0 + 134 * MIN, "en"), "2 h 14 min and counting.");

  assert.equal(fraseHuella("apago", "es"), "Apagué la luz del mundo.");
  assert.equal(fraseHuella("prendio", "es"), "Prendí la luz del mundo.");
  assert.equal(fraseHuella("apago", "en"), "I turned off the light of the world.");
  assert.equal(fraseHuella("prendio", "en"), "I turned on the light of the world.");

  assert.equal(lugar(cerrada, "es"), "Córdoba, Argentina");
  assert.equal(lugar({ ciudad: "", pais: "Spain", cc: "" }, "es"), "Spain");
  assert.equal(lugar({ ciudad: "", pais: "", cc: "" }, "es"), "");
  assert.equal(lugar({ ciudad: "Lima", pais: "", cc: "" }, "en"), "Lima");
});
