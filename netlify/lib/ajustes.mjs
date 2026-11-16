// Ajustes de las obras nuevas, leídos de variables de entorno de Netlify.
// Ninguna es obligatoria: sin ellas todo funciona en modo prueba.
//
//   SALES_ADDRESS             dirección que recibe los aportes voluntarios a "El minuto". NUNCA la de "Sin motivo".
//   MINUTO_MODO               ya no se usa (era para cobrar; el minuto ahora es gratis).
//   ADMIN_PASSWORD            contraseña de la página de administración.
//   OBRAS_SECRETO             (opcional) secreto para firmas; si falta se genera uno y se guarda en el almacén.
//   FIREBASE_DB_URL           (opcional) https://<proyecto>-default-rtdb.firebaseio.com  — tiempo real.
//   FIREBASE_SERVICE_ACCOUNT  (opcional) JSON de la cuenta de servicio de ese proyecto.
//   AVISO_URL                 (opcional) dirección a la que se manda un POST de texto cuando hay algo para moderar.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { DIRECCION as DIRECCION_SIN_MOTIVO } from "./cadena.mjs";

const env = (n) => {
  try { if (globalThis.Netlify && Netlify.env) return Netlify.env.get(n) || ""; } catch (e) {}
  return (typeof process !== "undefined" && process.env && process.env[n]) || "";
};

export const REDES = {
  // Red real: la misma que usa "Sin motivo".
  real: {
    nombre: "Base", chainId: 8453, chainIdHex: "0x2105",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    rpcs: ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
    explorador: "https://basescan.org",
    confirmaciones: 12            // ~24 s en Base
  },
  // Red de prueba: dinero sin valor.
  prueba: {
    nombre: "Base Sepolia (prueba)", chainId: 84532, chainIdHex: "0x14a34",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    rpcs: ["https://sepolia.base.org", "https://base-sepolia-rpc.publicnode.com"],
    explorador: "https://sepolia.basescan.org",
    confirmaciones: 3
  }
};

const DIRECCION_VALIDA = /^0x[0-9a-fA-F]{40}$/;

/**
 * Estado de las ventas de "El minuto".
 *   modo "real"      -> hay SALES_ADDRESS válida y MINUTO_MODO=real: se cobra en Base.
 *   modo "testnet"   -> hay SALES_ADDRESS válida pero no está activado: se paga con USDC de prueba en Base Sepolia.
 *   modo "simulado"  -> no hay SALES_ADDRESS: no se puede pagar; la compra se simula y queda marcada como prueba.
 * La dirección de ventas nunca puede ser la de "Sin motivo": si lo fuera, se trata como si no estuviera.
 */
export function ventas() {
  let direccion = env("SALES_ADDRESS").trim();
  if (!DIRECCION_VALIDA.test(direccion) || direccion.toLowerCase() === DIRECCION_SIN_MOTIVO.toLowerCase()) direccion = "";
  const modo = !direccion ? "simulado" : env("MINUTO_MODO").trim().toLowerCase() === "real" ? "real" : "testnet";
  return { modo, prueba: modo !== "real", direccion, red: modo === "real" ? REDES.real : REDES.prueba };
}

/**
 * Aporte voluntario a "El minuto" (desde el 17/11/2026 el minuto es gratis y no se vende).
 * null si no hay SALES_ADDRESS válida: entonces no se muestra nada de aportes. Siempre en Base, la
 * red real: un aporte de prueba no tiene sentido. Nunca la dirección de "Sin motivo".
 */
export function aporte() {
  const v = ventas();
  return v.direccion ? { direccion: v.direccion, red: REDES.real, sugeridos: [1, 5, 15] } : null;
}

export function tiempoReal() {
  const url = env("FIREBASE_DB_URL").trim().replace(/\/+$/, "");
  const cuenta = env("FIREBASE_SERVICE_ACCOUNT").trim();
  return /^https:\/\/[\w.-]+$/.test(url) && cuenta ? { url, cuenta } : null;
}

export const avisoUrl = () => { const u = env("AVISO_URL").trim(); return /^https:\/\//.test(u) ? u : ""; };

/** Compara la contraseña de administración en tiempo constante. Sin ADMIN_PASSWORD nadie entra. */
export function esAdmin(clave) {
  const real = env("ADMIN_PASSWORD");
  if (!real || real.length < 8 || typeof clave !== "string") return false;
  const a = createHmac("sha256", "admin").update(clave).digest();
  const b = createHmac("sha256", "admin").update(real).digest();
  return timingSafeEqual(a, b);
}
export const hayAdmin = () => env("ADMIN_PASSWORD").length >= 8;

let secretoEnMemoria = null;
/** Secreto para firmar (límites de toques, llaves de dueños). Se genera una vez y queda en el almacén. */
export async function secreto(alm) {
  if (secretoEnMemoria) return secretoEnMemoria;
  const fijo = env("OBRAS_SECRETO");
  if (fijo.length >= 16) return (secretoEnMemoria = fijo);
  const guardado = await alm.leer("_secreto");
  if (guardado) return (secretoEnMemoria = guardado.valor);
  const nuevo = randomBytes(32).toString("hex");
  if (await alm.crear("_secreto", nuevo)) return (secretoEnMemoria = nuevo);
  return (secretoEnMemoria = (await alm.leer("_secreto")).valor);
}

/** HMAC-SHA256 en hexadecimal. */
export const firmar = (sec, texto) => createHmac("sha256", sec).update(String(texto)).digest("hex");
