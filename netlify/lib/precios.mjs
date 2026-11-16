// Precios de "El minuto". Este archivo ES la configuración: para cambiar un precio se edita acá.
//
// Todos los precios son enteros en USD y se cobran en USDC (1 USDC = 1 USD). El monto que paga cada
// persona lleva además unos centésimos de centavo propios de su reserva (5.0037): eso no es precio,
// es lo que ata un pago a una reserva (ver minuto.mjs).
//
// El precio se calcula con la hora LOCAL que eligió quien compra: las 11:11 son las 11:11 donde vive.
//
// Criterio: es un regalo, no un espacio publicitario. El precio base tiene que poder pagarse sin
// pensarlo dos veces; los minutos "con forma" cuestan más porque son pocos y muchos los quieren a la vez.

export const PRECIOS = {
  moneda: "USD",

  // Cualquier minuto de cualquier día. 5 USD: lo que cuesta una tarjeta de cumpleaños. Alcanza para
  // que comprar no sea un chiste y cubre de sobra la comisión de la red (centavos en Base).
  base: 5,

  // Horas con forma. Se repiten todos los días, así que hay 365 de cada una por año.
  especiales: [
    // Espejo y escalera: las que la gente mira en el reloj y pide un deseo. 15 USD (tres veces la base):
    // se sienten especiales sin dejar de ser un regalo chico.
    { hora: "11:11", precio: 15, nombre: "espejo" },
    { hora: "22:22", precio: 15, nombre: "espejo" },
    { hora: "12:12", precio: 15, nombre: "espejo" },
    { hora: "21:21", precio: 15, nombre: "espejo" },
    { hora: "10:10", precio: 15, nombre: "espejo" },
    { hora: "20:20", precio: 15, nombre: "espejo" },
    { hora: "23:23", precio: 15, nombre: "espejo" },
    { hora: "12:34", precio: 15, nombre: "escalera" },
    { hora: "01:23", precio: 15, nombre: "escalera" },
    // Bordes del día: el primer minuto, el último y el mediodía en punto. Mismo escalón: 15 USD.
    { hora: "00:00", precio: 15, nombre: "medianoche" },
    { hora: "23:59", precio: 15, nombre: "último minuto" },
    { hora: "12:00", precio: 15, nombre: "mediodía" },
    // Triples de madrugada (01:11 … 05:55): tienen forma pero casi nadie está despierto. 10 USD,
    // un escalón intermedio. (Agregado por criterio propio; se puede borrar sin tocar nada más.)
    { hora: "01:11", precio: 10, nombre: "triple" },
    { hora: "02:22", precio: 10, nombre: "triple" },
    { hora: "03:33", precio: 10, nombre: "triple" },
    { hora: "04:44", precio: 10, nombre: "triple" },
    { hora: "05:55", precio: 10, nombre: "triple" }
  ],

  // Fechas. "fecha" es mes-día. Con "hora" y "precio": ese minuto exacto de ese día vale eso (pisa todo
  // lo demás). Con "suma": se suma al precio que tenga cualquier minuto de ese día.
  fechas: [
    // Hay uno solo por año y por zona horaria: el primer minuto del año y el último. 50 USD.
    { fecha: "01-01", hora: "00:00", precio: 50, nombre: "primer minuto del año" },
    { fecha: "12-31", hora: "23:59", precio: 50, nombre: "último minuto del año" },
    // 14 de febrero: el día en que más se regala. +5 USD a cualquier minuto (base 10, especiales 20).
    { fecha: "02-14", suma: 5, nombre: "14 de febrero" }
  ]
};

/**
 * Precio de un minuto según la fecha y la hora locales elegidas.
 * @param {{ fecha: string, hora: string }} local  "YYYY-MM-DD", "HH:MM"
 * @returns {{ precioUsd: number, especial: string | null }}  `especial`: la hora o la fecha que lo encarece, para mostrar.
 */
export function precioDe({ fecha, hora }, tabla = PRECIOS) {
  const mesDia = String(fecha).slice(5);
  const exacta = tabla.fechas.find((f) => f.fecha === mesDia && f.hora === hora && Number.isFinite(f.precio));
  if (exacta) return { precioUsd: exacta.precio, especial: exacta.nombre };

  let precio = tabla.base;
  let especial = null;
  const deHora = tabla.especiales.find((e) => e.hora === hora);
  if (deHora) { precio = deHora.precio; especial = deHora.hora; }
  for (const f of tabla.fechas) {
    if (f.fecha === mesDia && Number.isFinite(f.suma)) {
      precio += f.suma;
      especial = especial ? especial + " · " + f.nombre : f.nombre;
    }
  }
  return { precioUsd: precio, especial };
}

/** La tabla tal como la publica GET /api/minuto/config. */
export function preciosPublicos(tabla = PRECIOS) {
  return {
    moneda: tabla.moneda,
    base: tabla.base,
    especiales: tabla.especiales.map(({ hora, precio, nombre }) => ({ hora, precio, nombre })),
    fechas: tabla.fechas.map((f) => ({ ...f }))
  };
}
