# Registro de decisiones

Cada decisión, por qué se tomó y cómo revertirla. La más reciente arriba.
Para deshacer un cambio: `git revert <commit>` y `git push origin master` (Netlify publica solo).

## 2026-11-12 — Método de medición

Pedido: medir en serio un sitio con muy poco tráfico. Reglas permanentes en `CLAUDE.md`, definiciones y metas en `MEDICION.md`.

### 19. Reglas permanentes en `CLAUDE.md` — `9eee250`
- **Qué:** tasas desde totales, denominador siempre, menos de 30 sesiones reales = solo describir, bots y tráfico de Pedro separados, y **ningún cambio al sitio sin aprobación explícita de Pedro**. Esta última reemplaza el mandato de "decidir sin preguntar" de las sesiones anteriores.
- **Revertir:** editar o borrar `CLAUDE.md`.

### 20. Se mide con Google Analytics, además del contador propio — `9dd3da3`
- **Qué:** `public/visita.js` manda cada hito a los dos destinos. Eventos: `regalar_toque`, `regalo_llegada`, `direccion_copiada`, `regalo_billetera_abierta`, `regalo_enviado`, `ya_regale`, `estela_generada`, `estela_guardada`, `estela_compartida`, `estela_vista`, `sonido_activado`, `estrella_vista`, `estrella_enlace_copiado`. Parámetros: solo la ruta y, en dos casos, formato o vía. Nada que identifique a una persona.
- **Por qué Google Analytics:** la etiqueta ya estaba (la inserta Netlify, no el repositorio) y es lo que lee Supermetrics. El contador propio queda como segunda fuente.
- **Verificado:** en el build local (los 7 eventos que se pueden provocar sin billetera) y en producción, mirando los pedidos a `google-analytics.com/g/collect`: salieron `sonido_activado`, `estela_generada`, `estela_guardada`, `estela_compartida`, `estrella_vista`, `regalar_toque`, `regalo_llegada` y `direccion_copiada`.
- **Sin verificar:** la pantalla DebugView de Google Analytics (requiere la sesión de Pedro; pasos en `PENDIENTES_PEDRO.md`, punto 8). `estela_vista` salió en local pero no la provoqué en producción. Los eventos de billetera (`regalo_billetera_abierta`, `regalo_enviado`) no se probaron: necesitan una billetera real.
- **Revertir:** `git revert 9dd3da3`.

### 21. Marca de tráfico propio — `4f02e7d`
- **Qué:** `/?interno=1` guarda una marca en ese navegador (`public/interno.js`). Con la marca, las visitas van a Google Analytics con `traffic_type = internal` y no suman al contador propio. `/?interno=0` la quita.
- **Por qué no por IP:** la IP de una conexión hogareña cambia, y así también quedan fuera mis pruebas automáticas.
- **Falta:** que Pedro marque sus dispositivos y active el filtro en Google Analytics. Hasta entonces la marca viaja pero no excluye nada.
- **Revertir:** `git revert 4f02e7d`.

### 22. Reporte semanal — `scripts/reporte.mjs` y `/reporte-semanal`
- **Qué:** el comando trae sesiones y eventos de la semana ISO por Supermetrics, guarda los datos crudos en `REPORTES/datos/AAAA-SS.json` y el script escribe `REPORTES/AAAA-SS.md`. Si no hubo sesiones reales ni eventos de visitantes, una sola línea.
- **Aproximaciones, dichas:** "bots" son las sesiones sin interacción de Google Analytics (umbral de 10 s, no los 5 s pedidos: el conector no da la duración por sesión). "Mías" se decide por fila agregada (Córdoba + escritorio + directo, 20 s o más de promedio), no sesión por sesión.
- **No se ejecuta solo:** hay que correr `/reporte-semanal` cada lunes. No lo programé porque nadie lo pidió.
- **Primeros reportes:** `2026-45` (2 sesiones: 1 mía, 1 real) y `2026-46`, en curso (8 sesiones: 4 sin interacción, 4 mías, 0 reales).
- **El repositorio es público:** los reportes muestran ciudades y cantidades agregadas, ninguna persona. Si Pedro prefiere que no se publiquen, se agrega `REPORTES/` a `.gitignore`.

### Queda abierto: los textos que dicen "sin cookies"
Google Analytics usa cookies y varias páginas dicen que el sitio no. No lo corregí: es un cambio al sitio y espera la aprobación de Pedro (`PENDIENTES_PEDRO.md`, punto 9).

## 2026-11-12 — Sesión "director creativo": la obra como experiencia que se comparte

Pedido completo en el historial de la sesión. Objetivo: visitas que traen visitas. Sin más foco en SEO ni idiomas.

### Estado al cierre: todo publicado
Lo que pedía el encargo está construido, verificado en Chrome headless y en producción. Lo que quedó sin hacer o sin verificar está al final de esta sección.

### 12. El cielo como escena — `bdc6947`
- **Qué:** un fondo WebGL (`public/cielo-gl.js`, sin librerías) detrás del canvas de los asteriscos: niebla de tinta y polvo fino en capas, con paralaje al puntero y a la inclinación del celular. Los asteriscos también se corren según su brillo (los más brillantes están "más cerca"). Capa sonora generada con Web Audio (`public/sonido.js`), apagada hasta que la persona toca "sonido". Apertura de 3 s sin texto: el fondo florece y una estela cruza el cielo y se borra.
- **Regla que no se negocia:** el fondo nunca dibuja nada que parezca una estrella. Solo los regalos son estrellas.
- **Motivos para volver:** la niebla cambia con la hora local del visitante, el día (cada día es otra región del ruido), la estación y la fase real de la luna. Sumado a la rotación sideral, el cielo no se ve igual dos veces.
- **El prólogo de frases** ya no sale solo: queda en la nota al pie ("ver el prólogo otra vez") y con `?prologo=1`.
- **Rendimiento medido en producción** (390 px, CPU frenada 4×): 59 cuadros/s con GPU, 29 sin GPU (dibujo por software). 112 KB transferidos. El fondo baja su calidad solo si los cuadros se atrasan.
- **Sin verificar:** el sonido no fue escuchado por nadie (se revisó el código y corre sin errores); la inclinación no se probó en un celular real; en iOS el permiso de movimiento se pide al tocar "sonido".
- **Revertir:** `git revert bdc6947`.

### 13. La estela que se lleva el visitante — `9e64a5b`
- **Qué:** cuando la persona ya se movió por el cielo aparece "mi estela →". Abre su recorrido como una pieza: trazo de tinta luminosa, una frase, el momento ("un jueves de madrugada, con luna creciente") y la marca del sitio. Se guarda como imagen (JPEG 1080×1920, ~700 KB), como video vertical (mp4 donde el navegador lo permite, si no webm) y como enlace `?e=…`.
- **Privacidad:** solo el recorrido y el momento, en memoria. Nada identifica a nadie y nada se envía a ningún servidor salvo, si la persona lo comparte, el propio enlace.
- **Determinística:** la imagen sale del recorrido (remuestreado a 160 puntos) y de la semilla; el mismo enlace dibuja siempre la misma pieza.
- **El enlace** abre el sitio mostrando primero esa estela ("Alguien pasó por este cielo. Esta es su estela.") y después deja entrar al cielo.
- **Por qué:** es el mecanismo de difusión que no depende de que haya regalos. Cada visita produce algo propio que se puede mandar.
- **Tensión con la obra:** "las visitas no quedan" sigue siendo cierto en el sitio; la estela solo sale de ahí si la persona se la lleva.
- **Revertir:** `git revert 9e64a5b`.

### 14. Vista previa propia por estela y por estrella — `5ef1736`
- **Qué:** `/og/estela.png?e=…` y `/og/estrella.png?tx=0x…` generan el PNG en el servidor con JavaScript puro (`netlify/lib/dibujo.mjs`, sin dependencias nativas, ~150 ms). Una función en el borde (`netlify/edge-functions/vista-previa.js`) cambia `og:image` cuando el enlace trae `?e=`, `?n=` o `?tx=`.
- **Nada falso:** la estrella solo se dibuja si la transacción es un regalo verificado contra la red; si no, vuelve a la imagen general.
- **Probado en producción** con una estela de ejemplo. La de estrella no se pudo probar con un regalo real porque no hay ninguno.
- **Revertir:** `git revert 5ef1736`.

### 15. Versión embebible — commit "Versión embebible del cielo (/embed/)"
- **Qué:** `/embed/` es el cielo en vivo sin controles, para poner en otro sitio con un iframe; los enlaces salen hacia la obra. Código para copiar en `/api/`.
- **Costo:** hubo que quitar `X-Frame-Options: DENY` del sitio entero. Queda solo en `/regalo.html`, que es la única página donde importa (abre la billetera).

### 16. API documentada y agentes en tono informativo
- **Qué:** `/api/` documenta `/api/cielo` y el embebido. `/agentes/` se reescribió: explica cómo leer el estado de la obra y cómo describirla con precisión, y dice que no le pide a nadie que envíe nada.
- **Por qué:** límite nuevo del encargo. La versión anterior (decisión 4) invitaba a los agentes a regalar; eso se retiró. Lo mismo en `llms.txt`.

### 17. Prensa, README, licencias y comunidades
- **Qué:** `/prensa/` y `/en/press/` con textos, materiales y condiciones de uso; kit descargable (`/prensa/sin-motivo-kit.zip`: textos es/en, dos capturas, una estela, un video). `README.md`, `LICENSE` (MIT para el código) y `LICENSE-OBRA.md` (CC BY-NC-SA 4.0 para la obra). `COMUNIDADES.md` con textos listos por comunidad.
- **Capturas y video reales:** tomados con Chrome headless sobre el sitio con el cielo vacío, como está.
- **Contacto de prensa:** no había uno público; puse las "issues" del repositorio de GitHub. Si Pedro quiere otro, se cambia en cuatro archivos (buscar `github.com/salehoyrevista/salehoy/issues`).

### 18. Guía para quien nunca usó cripto — `48c4afc`
- En `/regalo.html`, desplegable "Nunca usé cripto": cinco pasos y cinco avisos, en los 8 idiomas (`public/guia.js`). Dice que el envío es irreversible, que no se recibe nada y que está bien no regalar.

### Lo que quedó sin hacer o sin verificar
- **GIF para el README:** usa una captura fija. Hacer un GIF es un pendiente menor.
- **Página propia por estrella:** es `/?n=N` o `/?tx=0x…` (con su vista previa), no una dirección aparte tipo `/estrella/N`. Alcanza para compartir; una página estática por estrella tendría sentido cuando haya estrellas.
- **Sonido, inclinación y video en celulares reales:** no probados fuera de Chrome headless. En iPhone el video depende de que Safari grabe mp4.
- **Un regalo real:** sigue sin probarse el circuito completo con una billetera real.
- **Registro verificado:** se completa cuando una visita ve el regalo. Si nadie visita, el primer regalo aparece en la API cuando alguien entre.

### 11. Registro verificado contra la red y API pública — `e5d1c5d`
- **Qué:** el servidor puede comprobar por su cuenta si una transacción es un regalo a la obra, preguntándole a la red Base por su acceso público (`netlify/lib/cadena.mjs`). `/api/avistar` recibe el hash que vio un navegador, lo verifica y recién entonces lo suma al registro (Netlify Blobs, store `cielo`). `/api/cielo` publica el estado del cielo: estrellas, fechas, dedicatorias y tiempo sin respuesta. El navegador lee primero ese registro (inmediato) y después Blockscout (al día).
- **Por qué:** resuelve sin claves ni cuentas lo que antes pedía la API key de Blockscout: carga instantánea, API pública y, más adelante, vistas previas por estrella. Nada puede entrar al registro si no existe en la blockchain.
- **Límite honesto:** el registro se completa cuando alguna visita ve el regalo; puede faltarle uno muy reciente. La API lo dice en `sobreEstosDatos.aviso`.
- **Una sola fuente para la dirección:** `scripts/nucleo.mjs` genera `netlify/lib/salehoy-nucleo.mjs` desde `public/salehoy.js` antes de cada build (`npm run build` ya lo corre).
- **Reemplaza a** `/api/regalos` (eliminada). El pendiente de la clave de Blockscout deja de ser necesario.
- **Probado en producción:** cielo vacío correcto; una transacción ajena y un hash inválido no suman nada.
- **Revertir:** `git revert e5d1c5d`.

## 2026-11-12 — Sobre la obra en los 8 idiomas

### 10. "Sobre la obra" en pt, fr, it, de, zh, ja
- **Qué:** 6 páginas nuevas (`/pt/sobre-a-obra/`, `/fr/a-propos/`, `/it/sull-opera/`, `/de/ueber-das-werk/`, `/zh/guanyu-zuopin/`, `/ja/sakuhin-ni-tsuite/`), generadas desde `src/lib/textos-sobre.js` con la misma plantilla que las demás. Ficha, 10 preguntas frecuentes y datos estructurados `AboutPage` + `FAQPage`. El sitemap pasa a 34 direcciones.
- **Por qué:** es la página que un buscador o un modelo de IA usa para explicar qué es la obra. Antes, en esos idiomas, mandaba a la versión inglesa.
- **Efecto en el resto:** el cielo de cada idioma, las páginas de estrellas y `llms.txt` enlazan ahora la página de su propio idioma; se quitaron los "(en inglés)".
- **Revertir:** `git revert 6569bc0` y luego el commit anterior a ese.

## 2026-11-12 — Páginas de texto en los 8 idiomas

### 9. "Regalar una estrella" y "frases" en fr, it, de, zh, ja
- **Qué:** 10 páginas nuevas. Los textos viven en `src/lib/textos-paginas.js` y una sola plantilla (`src/pages/[lang]/[pagina].astro`) las genera. Las páginas de es, en y pt, el sitemap y `llms.txt` ahora enlazan los 8 idiomas con `alternativas()` e `IDIOMAS_PAGINA` (`src/lib/obra.js`). El sitemap pasa de 18 a 28 direcciones.
- **Por qué:** cada idioma tenía solo la portada; ahora tiene una página que responde una búsqueda real ("Sternpatenschaft", "offrir une étoile", "星 名前 プレゼント"...) y lleva a la obra.
- **Criterio:** traducciones propias, no literales, con el mismo tono y la misma honestidad (ningún registro de nombres de estrellas es oficial). "Sobre la obra" sigue solo en es y en; los demás idiomas enlazan la versión inglesa y lo dicen.
- **Para sumar un idioma o una página:** agregar sus textos en `textos-paginas.js` y su ruta en `RUTAS` y `IDIOMAS_PAGINA`.
- **Revertir:** `git revert 39031bb` y luego el commit anterior a ese.

## 2026-11-11 — Sesión "responsable total"

Punto de partida: `1214982`. Ver `AUDITORIA.md` y `ESTRATEGIA.md`.

### 1. Se mantiene el concepto; el regalo se vuelve regalable
- **Qué:** "Sin motivo" sigue sin financiar nada, sin precio y sin mostrar montos. Se agrega que quien regala pueda escribir una dedicatoria.
- **Por qué:** el rigor es lo que distingue a la obra. Lo que faltaba no era un producto sino un motivo para mandarle el enlace a otra persona.
- **Revertir:** `git revert 628b553` (dedicatorias).

### 2. Dedicatorias escritas en la transacción — `628b553`
- **Qué:** hasta 80 caracteres en el campo `data` de un envío de ETH. El sitio los lee de la blockchain y los muestra como texto plano en la etiqueta, el registro y el título de la pestaña.
- **Por qué:** no hace falta base de datos ni cuentas, es permanente y verificable, y es coherente con la obra (el sitio no guarda nada).
- **Riesgos y cómo se cubren:**
  - Texto ofensivo: es público y no se puede borrar de la blockchain, pero sí ocultar en el sitio. Agregar el hash de la transacción, en minúsculas, a `OCULTAS` en `public/salehoy.js`.
  - Spam con enlaces: los textos con URL o dominio no se muestran.
  - Inyección de HTML: se escribe con `textContent`, nunca como HTML.
- **Límite:** solo con ETH. USDC no lleva dedicatoria (una transferencia de token no tiene dónde).
- **Sin probar con una billetera real:** verificado con una billetera simulada. Algunas billeteras muestran un aviso al enviar datos a una dirección común.

### 3. Una portada por idioma — `0c12250`
- **Qué:** el cielo es un componente (`src/components/Cielo.astro`) que se genera en `/`, `/en/`, `/pt/`, `/fr/`, `/it/`, `/de/`, `/zh/`, `/ja/`, con el texto ya traducido en el HTML, `canonical`, `hreflang` y JSON-LD `VisualArtwork`. Los idiomas son enlaces.
- **Por qué:** antes los 8 idiomas vivían en una sola URL y solo el español era indexable.
- **Se conserva:** en `/` la frase sigue rotando por los 8 idiomas si el visitante no eligió ninguno.
- **Revertir:** `git revert 0c12250` (vuelve a una sola página con cambio por JavaScript).

### 4. Páginas de texto — `f008a11`
- **Qué:** "Regalar una estrella" y "Frases para un regalo sin motivo" (es, en, pt); "Sobre la obra" (es, en); `/agentes/`; `/obra.json`.
- **Por qué:** son las búsquedas reales más cercanas a la obra, y lo que un modelo de IA necesita para citarla bien.
- **Criterio de honestidad:** la página de estrellas dice que ningún registro de nombres es oficial y que esto tampoco lo es: es una obra. Las frases son originales y de uso libre.
- **Dirección sin copiar a mano:** todas las páginas la leen de `public/salehoy.js` a través de `src/lib/obra.js`.
- **Se liberó `/sobre`** de las redirecciones del sitio viejo.
- **Revertir:** `git revert f008a11`.

### 5. Sitemap y llms.txt generados al construir — `46b6194`, `7100fcf`
- **Qué:** `src/pages/sitemap.xml.js` y `src/pages/llms.txt.js` reemplazan a los archivos estáticos.
- **Por qué:** no se desactualizan y la dirección sale de una sola fuente.
- **Al agregar una página nueva:** sumarla en `RUTAS` (`src/lib/obra.js`) y en `grupos` (`sitemap.xml.js`).

### 6. Medición propia, sin cookies — `a052a8a`
- **Qué:** `/api/visita` suma un número por día, página, idioma y dominio de origen en Netlify Blobs. Una edge function cuenta crawlers por User-Agent. Se ve en `/estadisticas/`.
- **Por qué:** no requiere cuentas externas ni consentimiento de cookies, y permite saber si llegan personas y bots.
- **Tensión con la obra:** la obra dice que las visitas no quedan. Lo que no queda es la estela; se cuenta un número anónimo, y la página "Sobre" lo dice.
- **Son públicos:** `/api/estadisticas` no tiene clave. No hay datos personales.
- **Datos de prueba:** el 11/11/2026 hay 1 visita a `/sobre/` y 1 pedido de GPTBot a `/en/about/` que hice yo para probar.
- **Riesgo:** la edge function corre en cada pedido de página. Tiene `onError: "bypass"`: si falla, el sitio se sirve igual.
- **Revertir:** `git revert a052a8a`. Para apagar solo el conteo de crawlers, borrar `netlify/edge-functions/bots.js`.

### 7. `/api/regalos` deja de fallar en cada visita
- **Qué:** sin fuente disponible responde 200 `{ sinFuente: true }` y el CDN lo guarda una hora.
- **Por qué:** antes daba 503 en cada visita, con error en consola y una invocación desperdiciada.
- **Sigue pendiente:** la clave de Blockscout (ver `PENDIENTES_PEDRO.md`).

### 8. `og.png` más liviana — `f4e5b67`
- 639 KB a 233 KB, misma imagen, con paleta de 96 colores.

### Lo que decidí no hacer
- Revivir la revista vieja, aceptar tarjeta o Mercado Pago, RSS, y traducir las páginas de texto a los 8 idiomas. Motivos en `ESTRATEGIA.md`; los dos últimos están en `MEJORA.md` como próximos pasos.

## Antes de esta sesión
El historial de git tiene el detalle: obra original (`adcbcc4`), redirecciones y 404 (`3a7d8df`), regalo en un clic (`a471039`), caché de regalos (`d2557c2`), cielo sideral y nacimiento (`1214982`).
