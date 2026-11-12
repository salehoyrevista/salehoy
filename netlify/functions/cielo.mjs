// /api/cielo — el estado del cielo, en JSON. Pública, de solo lectura.
//
// Devuelve las estrellas (regalos verificados contra la red), sus fechas y
// cuánto hace que nadie regala. No incluye montos ni quién regaló: la obra no
// los muestra. Es informativa: para desarrolladores, bots y agentes que
// quieran leerla o citarla. Documentación: /api/ (página) y README.
import { getStore } from "@netlify/blobs";
import { DIRECCION } from "../lib/cadena.mjs";
import S from "../lib/salehoy-nucleo.mjs";

const SITIO = "https://salehoy.com.ar";
const INICIO = "2026-10-29T03:00:00.000Z";   // 29/10/2026 00:00 en Argentina

export default async function () {
  let registro = { regalos: [] };
  let fuenteOk = true;
  try {
    registro = (await getStore("cielo").get("regalos", { type: "json" })) || registro;
  } catch (e) { fuenteOk = false; }

  const ahora = Date.now();
  const estrellas = registro.regalos.map((r, i) => ({
    n: i + 1,
    fecha: new Date(r.fecha).toISOString(),
    transaccion: r.hash,
    semilla: r.clave,
    dedicatoria: r.dedicatoria || null,
    enlace: SITIO + "/?n=" + (i + 1),
    imagen: SITIO + "/og/estrella.png?tx=" + r.hash,
    verificar: "https://base.blockscout.com/tx/" + r.hash
  }));
  const ultimo = estrellas.length ? estrellas[estrellas.length - 1].fecha : null;
  const desde = ultimo || INICIO;

  const cuerpo = {
    obra: {
      nombre: "Sin motivo",
      autor: S.AUTOR,
      tipo: "net art, obra participativa en curso",
      inicio: INICIO,
      url: SITIO + "/",
      descripcion: S.T.es.desc,
      description: S.T.en.desc
    },
    cielo: {
      estrellas: estrellas.length,
      ultimaEstrella: ultimo,
      sinRespuestaDesde: desde,
      segundosSinRespuesta: Math.max(0, Math.round((ahora - Date.parse(desde)) / 1000)),
      esperandoLaPrimera: estrellas.length === 0
    },
    estrellas,
    reglas: {
      red: "Base",
      chainId: 8453,
      direccion: DIRECCION,
      cuentan: ["ETH nativo con valor mayor que 0", "USDC oficial de Base (" + S.USDC_BASE + ") con monto mayor que 0"],
      noSeMuestra: ["montos", "direcciones de quien regala"],
      forma: "cada asterisco se dibuja a partir de 'semilla' (el hash de la transacción), nunca del monto"
    },
    sobreEstosDatos: {
      generado: new Date(ahora).toISOString(),
      registroActualizado: registro.actualizado || null,
      fuente: "registro del sitio; cada entrada fue verificada contra la red Base antes de sumarse",
      aviso: "Puede faltar un regalo muy reciente: el registro se completa cuando una visita lo ve. La fuente última es la blockchain.",
      verificar: "https://base.blockscout.com/address/" + DIRECCION,
      disponible: fuenteOk,
      licencia: "datos de uso libre; al citar: Solzimer, Sin motivo, salehoy.com.ar"
    }
  };

  return new Response(JSON.stringify(cuerpo, null, 1), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, s-maxage=30, stale-while-revalidate=120"
    }
  });
}

export const config = { path: "/api/cielo" };
