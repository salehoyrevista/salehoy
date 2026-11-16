// Conexión entre las dos obras: durante su minuto, quien lo compró controla el interruptor.
//
// "El interruptor" llama a estas dos funciones antes de aceptar un toque. El contrato es fijo;
// la implementación es de "El minuto".
//
//   minutoVigente(ahoraMs) -> null si ese minuto no es de nadie, o
//       { id, desde, hasta }  (id: "2026-12-24T03:33Z"; desde/hasta en milisegundos UTC)
//       Solo cuenta un minuto vendido (pagado y verificado), aunque su dedicatoria no esté aprobada.
//   esLlaveDelMinuto(id, llave) -> true si `llave` es la llave secreta que recibió quien compró ese minuto.

/** @returns {Promise<{ id: string, desde: number, hasta: number } | null>} */
export async function minutoVigente(ahoraMs) {
  return null;
}

/** @returns {Promise<boolean>} */
export async function esLlaveDelMinuto(id, llave) {
  return false;
}
