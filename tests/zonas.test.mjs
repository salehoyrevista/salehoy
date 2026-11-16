// Tests de zonas horarias de "El minuto": node --test tests/zonas.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { aInstante, aLocal, zonaValida } from "../netlify/lib/zonas.mjs";

const iso = (ms) => new Date(ms).toISOString().slice(0, 16) + "Z";
const fallaCon = (fn, codigo) => assert.throws(fn, (e) => e.codigo === codigo);

test("zona sin horario de verano: Buenos Aires (UTC−3)", () => {
  const r = aInstante({ fecha: "2026-12-24", hora: "00:33", zona: "America/Argentina/Buenos_Aires" });
  assert.equal(iso(r.instante), "2026-12-24T03:33Z");
  assert.equal(r.ambigua, false);
});

test("zona con horario de verano: Nueva York en invierno y en verano", () => {
  assert.equal(iso(aInstante({ fecha: "2026-01-15", hora: "12:00", zona: "America/New_York" }).instante), "2026-01-15T17:00Z");
  assert.equal(iso(aInstante({ fecha: "2026-07-15", hora: "12:00", zona: "America/New_York" }).instante), "2026-07-15T16:00Z");
  assert.equal(iso(aInstante({ fecha: "2026-07-15", hora: "12:00", zona: "Europe/Madrid" }).instante), "2026-07-15T10:00Z");
});

test("hora inexistente: 02:30 del salto de primavera en Nueva York", () => {
  fallaCon(() => aInstante({ fecha: "2027-03-14", hora: "02:30", zona: "America/New_York" }), "hora-inexistente");
  // un minuto antes y la hora siguiente existen
  assert.equal(iso(aInstante({ fecha: "2027-03-14", hora: "01:59", zona: "America/New_York" }).instante), "2027-03-14T06:59Z");
  assert.equal(iso(aInstante({ fecha: "2027-03-14", hora: "03:00", zona: "America/New_York" }).instante), "2027-03-14T07:00Z");
});

test("hora ambigua: 01:30 del 1 de noviembre de 2026 en Nueva York, primera ocurrencia", () => {
  const r = aInstante({ fecha: "2026-11-01", hora: "01:30", zona: "America/New_York" });
  assert.equal(r.ambigua, true);
  assert.equal(iso(r.instante), "2026-11-01T05:30Z");   // EDT (−4), no la segunda (06:30Z, EST)
});

test("cruce de día y de año: 23:59 del 31/12 en Tokio es el 31/12 a las 14:59 UTC", () => {
  const r = aInstante({ fecha: "2026-12-31", hora: "23:59", zona: "Asia/Tokyo" });
  assert.equal(iso(r.instante), "2026-12-31T14:59Z");
  // y al revés: 00:30 del 1/1 en Buenos Aires es 03:30 UTC del mismo día; 22:00 del 31/12 en BA ya es 2027 en UTC
  assert.equal(iso(aInstante({ fecha: "2026-12-31", hora: "22:00", zona: "America/Argentina/Buenos_Aires" }).instante), "2027-01-01T01:00Z");
  assert.deepEqual(aLocal(Date.UTC(2027, 0, 1, 1, 0), "America/Argentina/Buenos_Aires"), { fecha: "2026-12-31", hora: "22:00" });
});

test("ida y vuelta en varias zonas", () => {
  const zonas = ["UTC", "America/Argentina/Buenos_Aires", "America/New_York", "Europe/Madrid", "Asia/Kolkata", "Asia/Tokyo", "Australia/Adelaide", "Pacific/Chatham", "Asia/Kathmandu"];
  const fechas = [["2026-03-29", "01:15"], ["2026-06-21", "13:37"], ["2026-12-31", "23:59"], ["2027-01-01", "00:00"]];
  for (const zona of zonas) for (const [fecha, hora] of fechas) {
    let r;
    try { r = aInstante({ fecha, hora, zona }); } catch (e) { assert.equal(e.codigo, "hora-inexistente"); continue; }
    assert.deepEqual(aLocal(r.instante, zona), { fecha, hora }, `${zona} ${fecha} ${hora}`);
  }
});

test("UTC aceptada y errores de zona y de formato", () => {
  assert.equal(zonaValida("UTC"), "UTC");
  assert.equal(iso(aInstante({ fecha: "2026-05-05", hora: "05:05", zona: "UTC" }).instante), "2026-05-05T05:05Z");
  fallaCon(() => aInstante({ fecha: "2026-05-05", hora: "05:05", zona: "Marte/Olympus" }), "zona");
  fallaCon(() => aInstante({ fecha: "2026-05-05", hora: "05:05", zona: "+03:00" }), "zona");
  fallaCon(() => aInstante({ fecha: "2026-02-30", hora: "05:05", zona: "UTC" }), "formato");
  fallaCon(() => aInstante({ fecha: "2026-05-05", hora: "24:00", zona: "UTC" }), "formato");
  fallaCon(() => aInstante({ fecha: "5/5/2026", hora: "05:05", zona: "UTC" }), "formato");
});
