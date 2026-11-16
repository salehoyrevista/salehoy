// Tiempo real de "El interruptor": un espejo opcional en Firebase Realtime Database.
//
// La verdad vive en Netlify Blobs. Después de cada toque aceptado, el servidor copia el estado
// público a <FIREBASE_DB_URL>/interruptor/publico.json; las páginas abiertas lo escuchan con
// EventSource (la base de Firebase habla "server-sent events" por REST) y cambian en el acto.
// Si no está configurado, o si la copia falla, no pasa nada: el toque ya quedó guardado y las
// páginas se enteran igual, preguntando cada pocos segundos.
//
// Para que las páginas puedan leer, las reglas de la base deben permitir lectura pública de
// /interruptor/publico y ninguna escritura (el servidor escribe con la cuenta de servicio):
//   { "rules": { ".read": false, ".write": false, "interruptor": { "publico": { ".read": true } } } }
import { createSign } from "node:crypto";
import { tiempoReal } from "./ajustes.mjs";

const RUTA = "/interruptor/publico.json";
const ALCANCES = "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email";
const MARGEN = 5 * 60 * 1000;     // el token se renueva 5 minutos antes de vencer
const PLAZO = 2500;               // ms: si Firebase no contesta, se sigue de largo

let ficha = null;                 // { token, vence, correo } — en memoria, mientras viva la función

const b64url = (dato) => Buffer.from(dato).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

function leerCuenta(texto) {
  let c = null;
  try { c = JSON.parse(texto); } catch (e) {
    try { c = JSON.parse(Buffer.from(texto, "base64").toString("utf8")); } catch (e2) {}   // también vale en base64
  }
  if (!c || typeof c.client_email !== "string" || typeof c.private_key !== "string") return null;
  return c;
}

/** JWT RS256 firmado con la clave de la cuenta de servicio (la clave no sale de acá ni se registra). */
function afirmacion(cuenta, ahoraSeg) {
  const cabecera = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cuerpo = b64url(JSON.stringify({
    iss: cuenta.client_email,
    scope: ALCANCES,
    aud: cuenta.token_uri || "https://oauth2.googleapis.com/token",
    iat: ahoraSeg,
    exp: ahoraSeg + 3600
  }));
  const firma = createSign("RSA-SHA256").update(cabecera + "." + cuerpo).sign(cuenta.private_key);
  return cabecera + "." + cuerpo + "." + b64url(firma);
}

async function tokenDeAcceso(textoCuenta, pedir = fetch) {
  const ahora = Date.now();
  const cuenta = leerCuenta(textoCuenta);
  if (!cuenta) throw new Error("difusion: FIREBASE_SERVICE_ACCOUNT no es una cuenta de servicio válida");
  if (ficha && ficha.correo === cuenta.client_email && ahora < ficha.vence - MARGEN) return ficha.token;
  const r = await pedir(cuenta.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") +
      "&assertion=" + afirmacion(cuenta, Math.floor(ahora / 1000)),
    signal: AbortSignal.timeout(PLAZO)
  });
  if (!r.ok) throw new Error("difusion: no se pudo obtener el token (" + r.status + ")");
  const d = await r.json();
  if (!d.access_token) throw new Error("difusion: respuesta sin token");
  ficha = { token: d.access_token, vence: ahora + (Number(d.expires_in) || 3600) * 1000, correo: cuenta.client_email };
  return ficha.token;
}

/** Dirección que escuchan las páginas, o null si el tiempo real no está configurado. */
export function urlVivo() {
  const tr = tiempoReal();
  return tr ? tr.url + RUTA : null;
}

/**
 * Copia el estado público al espejo. Nunca lanza: devuelve true si quedó copiado, false si no
 * hay espejo o falló (el toque ya está guardado; las páginas lo verán al volver a preguntar).
 */
export async function difundir(publico, pedir = fetch) {
  const tr = tiempoReal();
  if (!tr) return false;
  try {
    const token = await tokenDeAcceso(tr.cuenta, pedir);
    const r = await pedir(tr.url + RUTA, {
      method: "PUT",
      headers: { authorization: "Bearer " + token, "content-type": "application/json" },
      body: JSON.stringify(publico),
      signal: AbortSignal.timeout(PLAZO)
    });
    if (r.status === 401 || r.status === 403) ficha = null;    // token rechazado: la próxima pide otro
    if (!r.ok) throw new Error("difusion: el espejo respondió " + r.status);
    return true;
  } catch (error) {
    console.error("difusion:", error && error.message ? error.message : "falló");
    return false;
  }
}
