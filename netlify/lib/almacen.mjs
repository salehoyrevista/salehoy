// Almacén de las obras nuevas ("El interruptor" y "El minuto").
//
// Una capa finita sobre Netlify Blobs con lo único que hace falta para que
// nada se venda ni se toque dos veces: escrituras condicionales.
//   crear(clave, valor)            -> solo si la clave no existe (atómico)
//   reemplazar(clave, valor, etag) -> solo si nadie la cambió desde que se leyó
// Las lecturas son de consistencia fuerte: siempre ven la última escritura.
//
// Para los tests hay una versión en memoria con el mismo contrato
// (almacenEnMemoria). Las funciones reciben el almacén como parámetro, así la
// lógica se prueba sin red.
import { getStore } from "@netlify/blobs";

/**
 * @typedef {Object} Almacen
 * @property {(clave: string) => Promise<{ valor: any, etag: string } | null>} leer
 * @property {(clave: string, valor: any) => Promise<boolean>} crear        true si la creó; false si ya existía
 * @property {(clave: string, valor: any, etag: string) => Promise<boolean>} reemplazar  false si cambió en el medio
 * @property {(clave: string, valor: any) => Promise<void>} guardar         sin condiciones (pisar)
 * @property {(clave: string) => Promise<void>} borrar
 * @property {(prefijo?: string) => Promise<string[]>} listar               claves que empiezan con el prefijo
 */

/** Almacén real. `nombre` separa los datos de cada obra: "interruptor", "minuto". @returns {Almacen} */
export function almacen(nombre) {
  const s = getStore({ name: nombre, consistency: "strong" });
  return {
    async leer(clave) {
      const r = await s.getWithMetadata(clave, { type: "json" });
      return r ? { valor: r.data, etag: r.etag } : null;
    },
    async crear(clave, valor) {
      const r = await s.setJSON(clave, valor, { onlyIfNew: true });
      return r.modified;
    },
    async reemplazar(clave, valor, etag) {
      const r = await s.setJSON(clave, valor, { onlyIfMatch: etag });
      return r.modified;
    },
    async guardar(clave, valor) { await s.setJSON(clave, valor); },
    async borrar(clave) { await s.delete(clave); },
    async listar(prefijo = "") {
      const r = await s.list({ prefix: prefijo });
      return r.blobs.map((b) => b.key);
    }
  };
}

/** Mismo contrato, en memoria. Solo para tests. @returns {Almacen} */
export function almacenEnMemoria() {
  const datos = new Map();   // clave -> { json, etag }
  let n = 0;
  const copia = (v) => JSON.parse(JSON.stringify(v));
  return {
    async leer(clave) {
      const d = datos.get(clave);
      return d ? { valor: JSON.parse(d.json), etag: d.etag } : null;
    },
    async crear(clave, valor) {
      if (datos.has(clave)) return false;
      datos.set(clave, { json: JSON.stringify(valor), etag: "e" + ++n });
      return true;
    },
    async reemplazar(clave, valor, etag) {
      const d = datos.get(clave);
      if (!d || d.etag !== etag) return false;
      datos.set(clave, { json: JSON.stringify(valor), etag: "e" + ++n });
      return true;
    },
    async guardar(clave, valor) { datos.set(clave, { json: JSON.stringify(copia(valor)), etag: "e" + ++n }); },
    async borrar(clave) { datos.delete(clave); },
    async listar(prefijo = "") { return [...datos.keys()].filter((k) => k.startsWith(prefijo)).sort(); }
  };
}

/**
 * Lee, cambia y guarda sin pisar a nadie: reintenta si otro escribió en el medio.
 * `cambio(valorActual | null)` devuelve el valor nuevo, o `undefined` para no tocar nada.
 * Devuelve el valor que quedó guardado (o el actual, si no se tocó).
 */
export async function actualizar(alm, clave, cambio, intentos = 6) {
  for (let i = 0; i < intentos; i++) {
    const actual = await alm.leer(clave);
    const nuevo = await cambio(actual ? actual.valor : null);
    if (nuevo === undefined) return actual ? actual.valor : null;
    const ok = actual ? await alm.reemplazar(clave, nuevo, actual.etag) : await alm.crear(clave, nuevo);
    if (ok) return nuevo;
  }
  throw new Error("almacen: demasiadas escrituras simultáneas en " + clave);
}
