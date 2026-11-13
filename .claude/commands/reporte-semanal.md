---
description: Genera el reporte semanal de medición en REPORTES/AAAA-SS.md con datos de Google Analytics (Supermetrics)
argument-hint: "[AAAA-SS] (sin argumento: la última semana completa)"
---

Generá el reporte semanal de SaleHoy. Semana pedida: `$ARGUMENTS` (si está vacío, la última semana completa).

Seguí las reglas de `CLAUDE.md` (tasas desde totales, denominador siempre, menos de 30 sesiones reales = solo describir, bots y tráfico de Pedro separados).

1. Corré `node scripts/reporte.mjs fechas $ARGUMENTS`. Devuelve `{"id","desde","hasta"}` (semana ISO, lunes a domingo).

2. Con el conector de Supermetrics (`data_query`), fuente `GAWA`, cuenta `537607935` (propiedad "Salehoy"), `date_range_type: custom`, `start_date` = desde, `end_date` = hasta, `timezone: America/Argentina/Buenos_Aires`, `compress: true`, hacé dos consultas:
   - sesiones: `date,city,deviceCategory,sessionDefaultChannelGrouping,sessionSource,sessions,engagedSessions,userEngagementDuration`
   - eventos: `eventName,city,deviceCategory,sessionDefaultChannelGrouping,eventCount`

   Si el conector no responde o pide autorización, frená y decíselo a Pedro: no inventes ni estimes datos.

3. Guardá `REPORTES/datos/<id>.json` con esta forma, copiando en cada clave el texto del campo `data` de la respuesta tal cual (tabla compacta). Si una consulta vuelve sin filas, poné `""`.

   ```json
   { "semana": "<id>", "consultado": "<fecha de hoy>", "sesiones": "...", "eventos": "..." }
   ```

4. Corré `node scripts/reporte.mjs generar <id>`. Escribe `REPORTES/<id>.md`.

5. Mostrale a Pedro el reporte tal como quedó. No agregues interpretación si hay menos de 30 sesiones reales. Commit chico: `Reporte semanal <id>` (solo `REPORTES/`).

No toques el sitio: este comando solo lee datos y escribe en `REPORTES/`.
