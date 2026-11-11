// /obra.json — manifiesto de la obra para máquinas.
// Se arma al construir, con los mismos datos que usa el sitio.
import { SITIO, DIRECCION, USDC_BASE, AUTOR, INICIO, RED, S } from "../lib/obra.js";

export function GET() {
  const obra = {
    nombre: "Sin motivo",
    autor: AUTOR,
    tipo: "net art, obra participativa en curso",
    inicio: INICIO,
    url: SITIO + "/",
    resumen: S.T.es.desc,
    summary: S.T.en.desc,
    idiomas: S.IDIOMAS,
    regalo: {
      red: RED.nombre,
      chainId: RED.chainId,
      direccion: DIRECCION,
      eip681: `ethereum:${DIRECCION}@${RED.chainId}`,
      cuentan: [
        { token: "ETH", tipo: "nativo", condicion: "transacción exitosa con valor mayor que 0" },
        { token: "USDC", contrato: USDC_BASE, condicion: "transferencia con monto mayor que 0" }
      ],
      seIgnora: "cualquier otro token y cualquier otra red",
      aCambio: "nada",
      dedicatoria: {
        opcional: true,
        solo: "ETH",
        formato: "texto UTF-8 en hexadecimal, en el campo data de la transacción",
        maximoCaracteres: S.DEDICATORIA_MAX,
        sinEnlaces: true,
        ejemplo: { texto: "For no reason.", data: S.codificarDedicatoria("For no reason.") }
      }
    },
    reglas: [
      "Cada regalo se vuelve un asterisco permanente.",
      "La forma de cada asterisco sale del hash de la transacción, nunca del monto.",
      "El monto y la dirección de quien regala no se muestran en el sitio.",
      "No es una donación: no financia nada ni promete nada."
    ],
    enlaces: {
      asterisco: SITIO + "/?n={N}",
      regalar: SITIO + "/regalo.html",
      sobre: SITIO + "/sobre/",
      about: SITIO + "/en/about/",
      agentes: SITIO + "/agentes/",
      llms: SITIO + "/llms.txt",
      verificar: `${RED.explorador}/address/${DIRECCION}`
    }
  };
  return new Response(JSON.stringify(obra, null, 2) + "\n", {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
