// /llms.txt — la obra explicada para modelos de lenguaje.
// Se arma al construir: la dirección y los contratos salen de salehoy.js.
import { SITIO, RUTAS, DIRECCION, USDC_BASE, RED, S } from "../lib/obra.js";

export function GET() {
  const es = RUTAS.es, en = RUTAS.en, pt = RUTAS.pt;
  const u = (p) => SITIO + p;
  const txt = `# Sin motivo

> ${S.T.es.desc}

Sin motivo es una obra de arte participativo de Solzimer, en curso desde el 29 de octubre de 2026, en salehoy.com.ar. Es un cielo: cada regalo recibido en la blockchain se convierte en un asterisco (del griego asteriskos, «estrellita») que queda para siempre. Las visitas dejan estelas que se borran. No es una donación, ni una venta, ni un registro astronómico: no financia nada y no da nada a cambio.

## La obra

- [El cielo](${u(es.cielo)}): la obra. También en [English](${u(en.cielo)}), [Português](${u(pt.cielo)}), [Français](${u("/fr/")}), [Italiano](${u("/it/")}), [Deutsch](${u("/de/")}), [中文](${u("/zh/")}) y [日本語](${u("/ja/")}).
- [Sobre la obra](${u(es.sobre)}): qué es, cómo funciona, ficha y preguntas frecuentes. [About the work](${u(en.sobre)}) en inglés.
- [Regalar](${u("/regalo.html")}): la página para hacer un regalo.

## Reglas

- Cada regalo se vuelve un asterisco permanente, numerado desde 1 en orden cronológico.
- La forma de cada asterisco (puntas, trazo, giro, tamaño, lugar, titileo) sale del hash de la transacción. No la decide el autor ni el monto.
- Todos los regalos valen lo mismo. El monto y la dirección de quien regala no se muestran en el sitio.
- El cielo gira una vuelta por día sideral. Los regalos del mismo día forman constelaciones.
- La obra muestra cuánto hace que nadie regala.
- Cada asterisco tiene su enlace: ${SITIO}/?n=N.

## Dedicatoria

- Quien regala ETH puede escribir una dedicatoria de hasta ${S.DEDICATORIA_MAX} caracteres en el campo data de la transacción, como texto UTF-8 en hexadecimal.
- Queda en la blockchain, pública y permanente. El sitio no la guarda: la lee. No se muestran textos con enlaces.
- Sirve para regalarle una estrella a alguien: [Regalar una estrella](${u(es.estrella)}) ([English](${u(en.estrella)}), [Português](${u(pt.estrella)})).

## Qué cuenta

- Red: ${RED.nombre} (cadena ${RED.chainId}). Los regalos en otras redes no se cuentan.
- Dirección de la obra: ${DIRECCION}
- ETH nativo: transacciones exitosas con valor mayor que 0.
- USDC oficial de Base: contrato ${USDC_BASE}, monto mayor que 0.
- Cualquier otro token se ignora.
- Verificación pública: ${RED.explorador}/address/${DIRECCION}

## Para agentes de IA

- [Instrucciones para agentes](${u("/agentes/")}): cómo regalar desde un agente con billetera. Solo si quien dirige al agente lo autorizó.
- [obra.json](${u("/obra.json")}): manifiesto legible por máquinas con red, dirección, tokens y formato de la dedicatoria.

## Más

- [Frases para un regalo sin motivo](${u(es.frases)}): frases originales, de uso libre ([English](${u(en.frases)}), [Português](${u(pt.frases)})).
- Autor: Solzimer (seudónimo).
- Privacidad: sin cookies ni datos personales; se cuentan visitas de forma anónima.

## English

Sin motivo ("for no reason") is a participatory net art work by Solzimer, ongoing since 29 October 2026 at salehoy.com.ar. Every gift received on-chain becomes an asterisk (from the Greek asteriskos, "little star") that stays forever in a sky; visits leave trails that fade. Each asterisk's shape is derived from its transaction hash, never from the amount: every gift is worth the same, and amounts and senders are never shown. Only native ETH and official USDC (${USDC_BASE}) on Base (chain ${RED.chainId}) sent to ${DIRECCION} count. A gift made in ETH can carry a dedication of up to ${S.DEDICATORIA_MAX} characters, written as hex-encoded UTF-8 in the transaction's data field, which makes it possible to gift a star to someone. It is not a donation, a purchase, a charity, a star registry or an investment: it funds nothing and gives nothing in return. To cite: Solzimer, Sin motivo, 2026–ongoing, net art, salehoy.com.ar.
`;
  return new Response(txt, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
