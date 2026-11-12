# Resumen — sesión "director creativo" (12 de noviembre de 2026)

## En una línea
El sitio dejó de depender de que alguien regale para tener algo que compartir: ahora cada visita produce una pieza propia (su estela, como imagen, video y enlace con vista previa), el cielo es una escena viva que cambia con la hora y la luna, y la obra se puede embeber, leer por API y citar sin pedirle nada a nadie. Sigue con 0 regalos, y eso no se inventa.

## Qué construí y por qué debería traer visitas

| Qué | Dónde | Por qué trae visitas |
|---|---|---|
| **La estela que te llevás.** Imagen 1080×1920, video vertical y enlace propio | "mi estela →" en el cielo | Es lo único que no necesita regalos: cada visitante sale con algo hermoso y propio, hecho para historias y reels, con la dirección del sitio legible |
| **Vista previa propia** al pegar el enlace | `?e=…`, `?n=N`, `?tx=0x…` | En WhatsApp, Instagram o X se ve *esa* estela o *esa* estrella, no una imagen genérica. La gente toca lo que ve |
| **El cielo como escena.** Fondo WebGL con profundidad, respuesta al toque, al mouse y a la inclinación; sonido opcional; apertura de 3 s sin texto | portada | Los primeros segundos deciden si alguien se queda y si lo muestra |
| **El cielo cambia.** Hora local, día, estación, luna real, rotación sideral | portada | Motivo para volver: nunca se ve igual |
| **Registro verificado y API pública** | `/api/cielo`, `/api/` | El servidor comprueba cada regalo contra la red Base, sin claves. Desarrolladores, bots y agentes pueden leer y citar el estado del cielo |
| **Versión embebible** | `/embed/` | Cualquier blog puede pegar el cielo en vivo; cada uno es un enlace de vuelta |
| **Prensa** con kit descargable | `/prensa/`, `/en/press/` | Un medio o un curador puede publicar sin escribirte |
| **README y licencias** | repositorio | Las comunidades técnicas enlazan repositorios bien presentados |
| **Textos para comunidades** | `COMUNIDADES.md` | Listos para que los uses si querés |
| **Guía "Nunca usé cripto"** | `/regalo.html` | Baja la barrera sin presionar |

Todo lo que la obra muestra sigue siendo real: el fondo nunca dibuja nada que parezca una estrella, y una estrella solo aparece (en el cielo, en la API o en una vista previa) si la transacción existe en la blockchain.

## Qué cambió de criterio
- **`/agentes/` ahora es solo informativa.** Explica cómo leer y describir la obra y dice que no le pide a nadie que envíe nada. La versión anterior invitaba a los agentes a regalar; la retiré.
- **La clave de Blockscout ya no hace falta.**
- **El prólogo de frases ya no sale solo.** La apertura se entiende sin leer; el prólogo queda a pedido.

## Cómo lo verifiqué
- **Chrome headless** en escritorio y celular: capturas, consola sin errores propios, sin desbordes.
- **La estela de punta a punta:** recorrido simulado → botón → imagen (730 KB) → video mp4 → enlace → el servidor decodifica la misma estela → una visita nueva la ve primero.
- **Producción:** todas las direcciones responden 200; la vista previa cambia con `?e=`; un enlace inválido o una transacción ajena vuelven a la imagen general; `/api/cielo` informa el cielo vacío.
- **Rendimiento en producción** (390 px, CPU frenada 4×): 59 cuadros/s con GPU, 29 sin GPU. 112 KB transferidos.

## Qué NO pude verificar
- **El sonido:** nadie lo escuchó.
- **La inclinación y el video en un celular real**, sobre todo en iPhone.
- **Un regalo real:** nunca se probó con una billetera de verdad; por eso tampoco la vista previa de una estrella.
- **Cómo se ve la vista previa dentro de WhatsApp, Instagram y X:** verifiqué que la página entrega la imagen correcta, no cómo la muestra cada aplicación.

## Qué medir
En https://salehoy.com.ar/estadisticas/ :
1. **"por el enlace de una estela"**: visitas que llegaron porque alguien compartió su estela. Es *la* métrica: visitas que traen visitas.
2. **estela-imagen, estela-video, estela-enlace**: cuánta gente se lleva su estela. Si muchos la guardan y nadie llega por enlace, se comparte como imagen suelta (igual sirve: lleva la dirección).
3. **`/embed/` en páginas y los dominios de origen**: en qué sitios está embebida.
4. **sonido**: cuántos lo activan.
5. **Regalos**: `/api/cielo`.

Si después de un mes "por el enlace de una estela" sigue en cero con visitas entrando, el botón "mi estela" está demasiado escondido o llega tarde: hay que mostrarlo antes y con más peso.

## Qué tenés que hacer vos
Está en `PENDIENTES_PEDRO.md`. Lo esencial, 15 minutos:
1. Abrirlo en tu celular: escuchar el sonido, inclinarlo, guardar tu estela.
2. Compartir tu estela una vez, para ver el circuito real.
3. Si querés, publicar en una o dos comunidades con los textos de `COMUNIDADES.md`.

## La próxima apuesta más ambiciosa
**Un cielo compartido en tiempo real.** Hoy cada visitante ve solo su propia estela. La apuesta es que veas, tenues, las estelas de quienes están en el cielo en ese mismo momento, en cualquier lugar del mundo: puntos de luz que se mueven y se borran, sin nombres ni datos. Convierte una obra que se mira en un lugar donde se está con otros, y eso es lo que más hace que alguien diga "entrá ahora". Necesita un canal en tiempo real (hay opciones sin servidor propio) y cuidado para que siga sin guardar nada.

Segunda opción, más simple: **un modo proyección** a pantalla completa para muestras y eventos, donde quien regala ve nacer su asterisco en la pared.

## Dónde está cada cosa
| Archivo | Para qué |
|---|---|
| `DECISIONES.md` | Cada decisión, por qué, y cómo revertirla |
| `PENDIENTES_PEDRO.md` | Lo que requiere tus manos o tu criterio |
| `COMUNIDADES.md` | Textos listos por comunidad |
| `MEJORA.md` | Cómo leer las métricas y qué probar después |
| `README.md` | Presentación del repositorio |
| `AUDITORIA.md`, `ESTRATEGIA.md` | Diagnóstico y estrategia de la sesión anterior |
