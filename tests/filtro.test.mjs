// Tests del filtro de dedicatorias: node --test tests/filtro.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { revisar, normalizar, DEDICATORIA_MAX } from "../netlify/lib/filtro.mjs";

const detalle = (t) => { const r = revisar(t); return r.ok ? "ok" : r.detalle; };

test("normaliza: NFC, sin saltos ni control ni invisibles, espacios colapsados", () => {
  assert.equal(normalizar("  hola\n\tmundo  "), "hola mundo");
  assert.equal(normalizar("a b c\u0007d"), "a b c d");
  assert.equal(normalizar("ma​ma﻿"), "mama");
  assert.equal(normalizar("Lucía"), "Lucía");
  assert.equal(revisar("  Para   Lucía \n con amor ").texto, "Para Lucía con amor");
});

test("vacía y larga", () => {
  assert.equal(detalle(""), "vacia");
  assert.equal(detalle("   \n "), "vacia");
  assert.equal(detalle(null), "vacia");
  assert.equal(detalle("a".repeat(DEDICATORIA_MAX)), "ok");
  assert.equal(detalle("a".repeat(DEDICATORIA_MAX + 1)), "larga");
  assert.equal(detalle("ñ".repeat(DEDICATORIA_MAX)), "ok", "cuenta caracteres, no bytes");
});

test("enlaces", () => {
  for (const t of ["mirá https://x.co", "entrá a www .algo", "visitá algo.com", "seguime en @lucia_99", "t.me/canal", "pagina.com.ar/hola"]) {
    assert.equal(detalle(t), "enlace", t);
  }
});

test("datos de contacto: correos, teléfonos, DNI, CUIT", () => {
  for (const t of ["escribime a ana@mail.com", "llamame 11 4567 8901", "+54 9 11 4567-8901", "DNI 12.345.678", "CUIT 20-12345678-9"]) {
    assert.equal(detalle(t), "contacto", t);
  }
});

test("insultos (con y sin tildes), con límites de palabra", () => {
  for (const t of ["sos un pelotudo", "Pelotúdo", "hijo de puta", "fuck you", "you are a bitch", "MIERDA"]) {
    assert.equal(detalle(t), "insulto", t);
  }
});

test("pocos falsos positivos", () => {
  for (const t of [
    "Para Lucía, que llegó a las 00:33. Te quiero.",
    "Feliz cumpleaños, boludo querido",
    "Nació el 24/12/1990 a las 3:33",
    "Desde 1990 hasta siempre",
    "Computadora, disputa, reputación, Shitake no",
    "Recuerdo la concha marina de Mar del Plata",
    "For Grandma, who taught me to count to 11:11",
    "Te amo.Siempre",
    "Scunthorpe y Essex"
  ]) {
    assert.equal(detalle(t), "ok", t);
  }
});
