# Medición

Cómo se mide SaleHoy, qué número tiene que moverse para decir que algo funciona y cuándo se revisa. Las reglas de cálculo están en `CLAUDE.md`; acá están las definiciones y las metas.

## De dónde salen los datos

1. **Google Analytics** (propiedad «Salehoy», etiqueta `G-5E838TVWKD`). La etiqueta la inserta Netlify en todas las páginas; no está en el repositorio. Se consulta con el conector de Supermetrics.
2. **Contador propio** (`/api/visita`, visible en https://salehoy.com.ar/estadisticas/). Solo números por día, sin cookies. Sirve de segunda fuente: si Google Analytics y el contador propio no se parecen, se dice.
3. **La cadena.** Los regalos se cuentan en Base (`/api/cielo`), no en Google Analytics. Es el único dato que no depende de ningún medidor.

Google Analytics cuenta de menos: no ve a quien bloquea rastreadores. Los números son un piso, no un censo.

## Tres clases de sesión

Con tan poco tráfico, mezclar las tres clases cambia cualquier lectura. Se separan siempre.

| clase | cómo se reconoce | qué se pidió | diferencia |
|---|---|---|---|
| **Probablemente bots** | sesiones sin interacción según Google Analytics: menos de 10 s, una sola página y ningún evento clave | menos de 5 s y sin interacción | Google Analytics no entrega la duración de cada sesión por el conector, solo si hubo interacción, y su umbral es 10 s. Queda un poco más amplio que lo pedido: alguna visita humana de 6 a 9 s cae acá. |
| **Probablemente mías** | Córdoba + escritorio + entrada directa, con 20 s o más de uso promedio por sesión | Córdoba, escritorio, directo, muy largas | Se evalúa por fila (día, ciudad, dispositivo, canal), no sesión por sesión. Otra persona de Córdoba que entre directo desde una computadora se contaría como mía. |
| **Reales** | todo lo demás, con su origen (canal, fuente, ciudad, dispositivo) | | Una sesión mía desde el celular o por Google entra acá hasta que el dispositivo esté marcado (abajo). |

Cuando el filtro de tráfico interno de Google Analytics esté activo (`PENDIENTES_PEDRO.md`, punto 8), mis sesiones dejan de llegar a los reportes y la fila «probablemente mías» debería quedar en cero. Si no queda en cero, falta marcar algún dispositivo.

Las pruebas automáticas contra el sitio en vivo se hacen con el navegador marcado (`/?interno=1`), así que tampoco cuentan.

## Eventos que se miden

Los manda `public/visita.js`. Ninguno lleva datos de la persona: solo el nombre del evento, la ruta de la página y, en dos casos, el formato o la vía.

| evento en Google Analytics | cuándo ocurre |
|---|---|
| `regalar_toque` | toque en cualquier enlace «regalar» del sitio |
| `regalo_llegada` | se cargó la página de regalo |
| `direccion_copiada` | copió la dirección de la obra |
| `regalo_billetera_abierta` | tocó el botón que abre la billetera |
| `regalo_enviado` | la billetera confirmó el envío desde el botón |
| `ya_regale` | tocó «ya regalé» |
| `estela_generada` | abrió «mi estela» |
| `estela_guardada` | guardó la imagen o el video (`formato`) |
| `estela_compartida` | copió el enlace o usó el menú de compartir (`via`) |
| `estela_vista` | alguien entró por el enlace de una estela |
| `sonido_activado` | activó el sonido |
| `estrella_vista` | visita a la página de una estrella (`?n=` o `?tx=`) |
| `estrella_enlace_copiado` | copió el enlace de una estrella |

Empezaron a medirse el **12 de noviembre de 2026**. Antes de esa fecha no hay datos de estos eventos.

## Punto de partida

Del 15 de octubre al 12 de noviembre de 2026 (29 días): 30 sesiones en total. Descontando las sin interacción y las mías, quedan 2 o 3 sesiones reales en cuatro semanas, llegadas por buscadores. Ningún regalo.

Es decir: hoy el número de partida es **menos de 1 sesión real por semana**.

## Qué número tiene que moverse

En orden. Cada uno depende del anterior, así que no tiene sentido mirar el segundo si el primero no se movió.

1. **Sesiones reales por semana.** Es el número principal.
   - Señal mínima: **10 o más sesiones reales por semana durante dos semanas seguidas**.
   - Mientras un período tenga menos de 30 sesiones reales, se describe y no se concluye. Con el ritmo actual eso es todo el tiempo; por eso la revisión se hace sobre cuatro semanas juntas, no semana a semana.
2. **Toques en «regalar»** (`regalar_toque`) sobre sesiones reales. No tiene meta en porcentaje hasta juntar 30 sesiones reales en el período. Antes de eso, el dato es el conteo: «2 toques en 14 sesiones reales».
3. **El circuito de la estela:** `estela_compartida` y, sobre todo, `estela_vista`. Una sola `estela_vista` desde un dispositivo que no sea mío ya dice que alguien compartió y otro entró: es la prueba de que la obra puede traer visitas sola.
4. **Regalos en la cadena.** El primero de alguien que no sea yo. No se mide en porcentaje: se cuenta.

Lo que **no** se usa para decidir: páginas vistas, tasa de rebote, duración media y tasa de interacción de Google Analytics. Son promedios sobre muy pocos casos.

## Cuándo se revisa

| fecha | qué se mira | qué se decide |
|---|---|---|
| cada lunes | reporte de la semana anterior (`/reporte-semanal`) | nada; solo se registra |
| **lunes 14 de diciembre de 2026** | semanas 2026-47 a 2026-50 juntas | si las sesiones reales siguen por debajo de 10 por semana, el problema sigue siendo que nadie llega: lo que hay que cambiar es la difusión (`COMUNIDADES.md`), no el sitio |
| **lunes 8 de febrero de 2027** | semanas 2026-47 a 2027-05 juntas (unas 12) | si hay 30 o más sesiones reales en el período, primera lectura de la tasa de toque en «regalar». Si no, se dice que no alcanzó para concluir y se decide si seguir igual |

Ningún cambio al sitio se aplica por un reporte sin la aprobación de Pedro.

## Cómo comprobar que los eventos llegan

- En Google Analytics: Administrar → Visualización de datos → **DebugView**. Abrir el sitio con `?depurar=1` (por ejemplo `https://salehoy.com.ar/?depurar=1`) y hacer las acciones; aparecen en segundos.
- Verificado el 12 de noviembre de 2026 desde un navegador automático: los pedidos a `google-analytics.com/g/collect` salen con `en=` igual a cada evento, y con `tt=internal` cuando el dispositivo está marcado. Lo que no pude ver es la pantalla de DebugView, porque requiere la sesión de Google de Pedro.
