---
title: "La Data — Informe mensual de la Quiniela"
description: "Sección de análisis estadístico mensual de la quiniela argentina. Vive en La sala. Firma fija de Tomás Vera. Reemplaza la idea original de Quiniela del día."
version: 1.0
fecha: 2026-05-22
editor: Juan Boas
uso: Referencia técnico-editorial de la sección. Consultar antes de programar el dashboard o redactar cada informe mensual.
---

# La Data — Informe mensual de la Quiniela

## Concepto

Sección mensual de análisis estadístico de la quiniela argentina. Vive en La sala. Reemplaza la idea original de Quiniela del día (descartada por insostenible y por competir con blogs amarillos). Firma fija: Tomás Vera.

**Diferenciación editorial:** mientras los blogs tradicionales analizan la quiniela a dos cifras (fríos y calientes), La Data mira también a tres y cuatro cifras, territorios prácticamente vírgenes en análisis argentinos. Eso le da material periodístico único y resonancia con el perfil de Tomás (matemático Berkeley).

## Estructura del dashboard

Dashboard interactivo con cuatro zonas, una por quiniela y una comparativa:

**Zona Nacional.** Paleta tentativa: azul profundo + verde fosforescente. Estética terminal financiera tipo Bloomberg.
**Zona Buenos Aires.** Paleta tentativa: marrón profundo + ámbar. Más cálida, textura porteña.
**Zona Córdoba.** Paleta tentativa: verde oscuro + celeste técnico.
**Zona comparativa.** Paleta neutra, todos los colores conviviendo, blanco hueso de fondo. Análisis cruzado entre las tres quinielas.

Cada zona tiene gráficos interactivos propios, datos específicos, prosa editorial de Tomás integrada. El lector entra a la zona que le interesa, no está obligado a ver el cruce primero.

## Portada

Marquesina arriba con identificador del mes ("LA DATA - INFORME [MES] [AÑO]"). Display tipo terminal vieja mostrando el dato más impactante del mes en grande. Cuatro botones grandes de entrada a cada zona. Ticker horizontal con cinco números más salidos del mes. Firma: "Por Tomás Vera".

## Frecuencia

Primer fin de semana de cada mes. Junto con la edición quincenal correspondiente. Cierra el mes anterior, sale fresco.

## Método operativo mensual

1. Juan baja los Excels del mes anterior de Rutas1000 (Nacional, Buenos Aires, Córdoba). 10 minutos.
2. Abre Claude. Pasa los tres Excels.
3. Claude procesa con código y devuelve análisis técnico (15-30 minutos).
4. Juan elige foco editorial del mes (algo del cruce o algo específico).
5. Claude tira borrador del informe en voz de Tomás (30 minutos).
6. Juan edita (30 minutos a 2 horas).
7. Juan sube a la sección.
8. Claude anota fecha del próximo cierre en memoria del proyecto.

Tiempo total estimado de Juan: 2-4 horas mensuales.

## Análisis técnico que hace Tomás

**Datos fijos (siempre aparecen):**
- Top 5 números más salidos del mes a 2 cifras.
- Bottom 5 números menos salidos del mes a 2 cifras.
- Distribución por décadas (00-09, 10-19, etc.).
- Comparación con promedio histórico (desde el segundo mes publicado en adelante).

**Datos variables (uno o dos por mes, rotativos):**
- Análisis de terminaciones.
- Análisis de iniciales.
- Comparación entre sorteos (Primera, Matutina, Vespertina, Nocturna).
- Pares vs impares.
- Repetidos entre sorteos del mismo día.
- Rachas (números en días consecutivos).
- Números fríos largos.

**Análisis a tres cifras:**
- Distribución por centena.
- Repeticiones notables.
- Capicúas y tríadas.

**Análisis a cuatro cifras (territorio único):**
- Rangos del número a primera (descubrimiento original de Juan: muchos caen en 4000-5000).
- Distribución de las cuatro cifras del premio mayor.
- Patrones de simetría.
- Análisis de milares.

**Tema editorial del mes (prosa de Tomás):** un foco específico desarrollado con prosa, gráficos al servicio del argumento. Esto es el corazón editorial. No números fríos, sino narrativa.

## Estructura del informe escrito

1. Apertura editorial (500-700 palabras, voz de Tomás).
2. Vista general con gráficos (top, bottom, distribución, comentario de Tomás).
3. Tema del mes editorial (500-1000 palabras, dos o tres gráficos).
4. Comparación con meses anteriores (a partir del segundo número).
5. Lo que vimos a tres y cuatro cifras (la sección distintiva).
6. Cierre reflexivo (sin recomendar números nunca).

Total estimado: 2500-3500 palabras + 5-8 gráficos interactivos.

## Tecnología sugerida

- Recharts para gráficos simples y eficientes (matchea bien con Astro/React).
- D3.js o Observable Plot si después se quieren visualizaciones más sofisticadas.
- Datos del mes cargados como JSON desde el procesamiento del Excel.
- Componentes Astro/React específicos para el dashboard.

## Salvaguardas editoriales

La Data respeta el manifiesto editorial completo, especialmente:
- Máxima 2: SaleHoy no da picks. La prosa siempre desarma la tentación predictiva.
- Máxima 22: Juego responsable como contenido. Pie con línea Sedronar 141 en cada informe.
- Máxima 8: La subjetividad atraviesa, no se declara.

Cada informe cierra reafirmando que esto es análisis cultural, no soplo. Los números aparecen como ejemplo de argumento, no como conclusión.

---

*Documento vivo. Se actualiza con la práctica.*
