// Conexión entre las dos obras: durante su minuto, quien lo compró controla el interruptor.
//
// "El interruptor" llama a estas dos funciones antes de aceptar un toque. El contrato es fijo;
// la implementación es de "El minuto".
//
//   minutoVigente(ahoraMs) -> null si ese minuto no es de nadie, o
//       { id, desde, hasta }  (id: "2026-12-24T03:33Z"; desde/hasta en milisegundos UTC)
//       Solo cuenta un minuto vendido (pagado y verificado), aunque su dedicatoria no esté aprobada.
//   esLlaveDelMinuto(id, llave) -> true si `llave` es la llave secreta que recibió quien compró ese minuto.
//
// Se lee el índice de vendidos de almacen("minuto") y el registro del minuto. La llave se guarda solo
// como SHA-256 y se compara en tiempo constante. El último parámetro (almacén) es para los tests.
import { almacen } from "./almacen.mjs";
import { vigenteEn, esLlaveEn } from "./minuto.mjs";

let propio = null;
const almacenMinuto = () => propio || (propio = almacen("minuto"));

/** @returns {Promise<{ id: string, desde: number, hasta: number } | null>} */
export async function minutoVigente(ahoraMs, alm = almacenMinuto()) {
  if (!Number.isFinite(ahoraMs)) return null;
  return vigenteEn(alm, ahoraMs);
}

/** @returns {Promise<boolean>} */
export async function esLlaveDelMinuto(id, llave, alm = almacenMinuto()) {
  return esLlaveEn(alm, id, llave);
}
