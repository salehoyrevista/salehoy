# SaleHoy · Sin motivo — reglas permanentes

Sitio de la obra de net art "Sin motivo", de Solzimer (Pedro). Astro + Netlify; `master` se publica solo. Antes de trabajar, leer `RESUMEN.md`, `DECISIONES.md`, `MEDICION.md` y `PENDIENTES_PEDRO.md`.

## Cambios al sitio
- **No aplicar cambios al sitio sin aprobación explícita de Pedro.** Proponer, mostrar qué cambiaría y esperar el sí. Vale para código, textos, diseño y configuración. Los documentos de trabajo (reportes, `DECISIONES.md`, `MEDICION.md`) sí se pueden actualizar.
- Commits chicos, uno por cambio, y cada decisión anotada en `DECISIONES.md` con cómo revertirla.

## Medición: cómo calcular y cómo decir
- **Tasas y porcentajes se calculan desde los totales**, nunca promediando porcentajes. Ejemplo: tasa de toque en "regalar" = toques totales ÷ sesiones reales totales del período, no el promedio de las tasas diarias.
- **Indicar siempre el denominador.** "3 de 12 sesiones reales (25%)", nunca "25%" solo.
- **Con menos de 30 sesiones reales en un período, no sacar conclusiones: solo describir.** Nada de "subió", "funciona" o "no funciona"; se dice qué pasó y cuántas veces.
- **Separar siempre el tráfico de bots y el de Pedro del tráfico real.** Ningún número se informa mezclado. Las definiciones están en `MEDICION.md`.
- No usar métricas ya promediadas por Google Analytics (tasa de interacción, duración media) sumándolas o promediándolas entre filas: recalcular desde sesiones y segundos totales.
- Si un dato no se pudo verificar, decirlo.

## Tráfico propio
- Las pruebas automáticas contra el sitio en vivo cuentan como visitas. Antes de probar en producción, abrir una vez `https://salehoy.com.ar/?interno=1` en ese navegador (marca el dispositivo como tráfico propio) o probar contra el build local.
- Los dispositivos de Pedro se marcan igual; ver `PENDIENTES_PEDRO.md`.

## Límites de siempre
- No cambiar la dirección de recepción (se lee de `public/salehoy.js`, nunca se escribe a mano) ni pedir o usar claves privadas.
- No inventar regalos, estrellas, visitas, contadores ni actividad.
- Nada que identifique personas en la medición: sin nombres, correos, direcciones de billetera ni hashes de transacción en los eventos.
- Nada de textos dirigidos a que un bot o agente de IA envíe dinero: lo que se escribe para máquinas es informativo.
- No crear cuentas a nombre de Pedro ni publicar en sitios ajenos.

## Reporte semanal
`/reporte-semanal` (ver `.claude/commands/reporte-semanal.md`): trae los datos de Google Analytics por Supermetrics (propiedad "Salehoy", cuenta `537607935`) y genera `REPORTES/AAAA-SS.md` con `scripts/reporte.mjs`.
