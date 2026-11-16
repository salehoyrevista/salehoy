# Registro de decisiones

Cada decisión, por qué se tomó y cómo revertirla. La más reciente arriba.
Para deshacer un cambio: `git revert <commit>` y `git push origin master` (Netlify publica solo).

## 2026-11-17 — El minuto deja de ser una venta

### 33. El minuto es gratis; el aporte es aparte y voluntario — `90d9278`, `1933720`
- **Pedido de Pedro:** que no sea una venta (eligió la opción 1 de tres).
- **Por qué:** si el pago es condición para recibir el minuto, es una venta aunque se llame regalo o donación, con obligaciones de vendedor (identificarse, jurisdicción, reembolsos). Separando el minuto del aporte, cero es una opción real y no hay venta.
- **Qué cambió:**
  - `POST /api/minuto/pedir` reemplaza `reservar` y `pagar` (borrados). El minuto queda de quien lo pidió en el acto, con la dedicatoria pendiente.
  - Contra abuso, ahora que no cuesta: un minuto por persona cada 7 días (firma de IP + semana; la IP no se guarda), 50 pedidos por día en todo el sitio, y las mismas protecciones contra bots que El interruptor (origen del sitio, JSON, navegador no automático).
  - **El interruptor solo obedece a minutos aprobados.** Antes alcanzaba con pagar; ahora tu aprobación es lo que da el control de la luz.
  - **Rechazar libera el minuto** (se borra). No hay reembolsos.
  - **Aporte voluntario** al final del pedido, solo con `SALES_ADDRESS`, siempre en Base. El servidor no lo verifica ni lo registra: no cambia nada.
  - Términos nuevos (vigentes desde el 17/11/2026): no es una compra; aportes voluntarios que no se devuelven. Se sacó la línea de jurisdicción pendiente.
  - /admin/ sin precios, reembolsos, pagos huérfanos ni modo prueba. `MINUTO_MODO` ya no se usa.
  - Se conservan `netlify/lib/pago.mjs` y `precios.mjs`: el primero verifica pagos en la cadena y sirve para un posible candado pago (decisión 31); del segundo solo se usa el nombre de los minutos especiales ("11:11").
- **Verificado en local** (servidor de Netlify, celular y escritorio): pedir gratis, llave guardada, aporte con todas las advertencias, ninguna palabra de compra o venta en la página, límite semanal, aprobación, rechazo que libera el minuto (su página da 404), bloqueos de bots, de otros sitios y sin contraseña. 77 pruebas automáticas.
- **No publicado:** Netlify se quedó sin créditos de compilación. Ver `PENDIENTES_PEDRO.md`, punto 0.
- **Revertir:** `git revert 1933720 90d9278`.

## 2026-11-16 — Dos obras nuevas: "El interruptor" y "El minuto"

Pedido de Pedro: sumar dos obras junto a "Sin motivo", que no se toca. Pedido completo en el historial de la sesión.

### Estado al cierre: publicado, El minuto en modo prueba
- **Publicado y verificado:** las dos obras, en español e inglés. Commits `a76b758` (El interruptor), `34f79cb` (El minuto, servidor), `dbbb021` (El minuto, páginas), `46acd9f` (medición).
- **Modo prueba:** sin `SALES_ADDRESS` el pago de El minuto es simulado. Ver `PENDIENTES_PEDRO.md`, sección "Obras nuevas".
- **Cómo se construyó:** tres agentes en paralelo (El interruptor; servidor de El minuto; páginas de El minuto) contra un contrato fijo de rutas y formas de respuesta, y la integración, las pruebas de punta a punta y la publicación en esta sesión. Los primeros tres agentes se cortaron por límite de uso y se relanzaron con otro modelo sobre lo que ya estaba escrito.

### 24. Base compartida — `9930044`
- **Almacén con escrituras condicionales** (`netlify/lib/almacen.mjs`): sobre Netlify Blobs con consistencia fuerte. `crear` solo si la clave no existe y `reemplazar` solo si nadie la cambió desde que se leyó. Es lo que impide vender un instante dos veces o usar dos veces el mismo pago, sin una base de datos aparte. Tiene una versión en memoria para los tests.
- **Ajustes por variables de entorno** (`netlify/lib/ajustes.mjs`): `SALES_ADDRESS`, `MINUTO_MODO`, `ADMIN_PASSWORD`, `FIREBASE_DB_URL`, `FIREBASE_SERVICE_ACCOUNT`, `AVISO_URL`. Ninguna es obligatoria: sin ellas todo queda en modo prueba. **Si `SALES_ADDRESS` fuera la dirección de "Sin motivo", se ignora**: un pago de un minuto nunca puede volverse estrella.
- **Plantilla y navegación** (`src/layouts/Obra.astro`, `NavObras.astro`, `src/lib/obras.js`): una línea en mono que une las tres obras.
- **Revertir:** `git revert 9930044` (antes hay que revertir lo que se apoya en esto).

### 25. Texto en las imágenes del servidor — `letras.mjs`
- **Qué:** las vistas previas de las obras nuevas escriben con Instrument Serif e IBM Plex Mono reales. Un atlas de glifos generado una vez con Chrome, sin dependencias en producción (311 KB, ~150 ms por imagen).
- **Por qué:** la huella del interruptor y el certificado del minuto son texto; con el rasterizador de "Sin motivo" solo se podían dibujar trazos.

### 26. Tiempo real: Netlify Blobs + Firebase Realtime Database como espejo
- **Qué:** el estado de la luz vive en Netlify Blobs (la verdad). Si Pedro crea un proyecto gratuito de Firebase y carga dos variables, el servidor copia cada cambio a Firebase y los navegadores lo reciben al instante. Sin Firebase, los navegadores preguntan cada 4 segundos, con caché de 3 segundos en el CDN para no gastar invocaciones.
- **Por qué Firebase:** plan gratuito sin tarjeta, no se pausa por inactividad (Supabase gratuito sí), se escucha desde el navegador sin librerías, y solo el servidor escribe. Netlify solo no tiene conexiones persistentes.
- **Por qué no confiar en Firebase para la verdad:** si Firebase falla o no está, la obra sigue andando.

### 27. Red y moneda de pago: USDC en Base
- **Qué:** El minuto se cobra en USDC oficial en Base, la misma red que usa "Sin motivo".
- **Por qué no otra red:** la comisión en Base ya es menor a un centavo de dólar por transferencia; otra red no la baja de forma que importe y obligaría al comprador a otra configuración en MetaMask.
- **Cada reserva tiene un monto propio** (precio + entre 0,0001 y 0,0099 USDC). Así un pago queda atado a una reserva y nadie puede usar la transacción de otro para su minuto.
- **Modo prueba:** sin `SALES_ADDRESS`, el pago es simulado (no se puede pagar). Con `SALES_ADDRESS` y sin `MINUTO_MODO=real`, se paga con USDC de prueba en Base Sepolia. Solo con `MINUTO_MODO=real` se cobra.

### 28. Enlaces a las obras nuevas desde "Sin motivo" — `b7a0bb4`
- **Qué:** una línea chica al pie del cielo ("El interruptor · El minuto"), oculta en la versión embebida. Además sitemap, `robots.txt` (`/admin/` fuera de buscadores; sitemap de minutos), `llms.txt` (aclara que los pagos de El minuto no van a la dirección de "Sin motivo") y cabeceras (`/minuto/elegir/` y `/admin/` nunca dentro de un marco ajeno).
- **Lo que no cambió:** el cielo, la dirección, el concepto y la portada.
- **Revertir:** `git revert b7a0bb4`.


### 29. El interruptor: reglas de uso — `a76b758`
- **Un toque por persona cada 5 minutos** y 1,5 s como mínimo entre dos toques de cualquiera. Cinco minutos alcanzan para que una persona sola no pueda pelear la luz contra otra, y son cortos para quien vuelve.
- **"Persona" sin guardar datos:** una firma de la conexión y el día (HMAC con un secreto del sitio), recortada. No se guarda la IP, se renueva cada día y no se puede revertir. Si Netlify no informa la IP, todas las personas comparten el límite (queda global, más estricto, nunca más laxo).
- **Contra bots, sin captcha:** ficha firmada que se pide al cargar la página y vale de 1,2 s a 10 min, origen del propio sitio, y rechazo de navegadores automáticos ("HeadlessChrome" incluido; por eso las pruebas automáticas se hacen con otro agente de usuario).
- **Ciudad y país** salen de la geolocalización de Netlify. Se guardan las últimas 12, sin nada más.
- **Revertir:** `git revert a76b758` (saca la obra; el enlace del pie queda roto hasta revertir también `b7a0bb4`).

### 30. El minuto: venta, moderación y reembolsos — `34f79cb`, `dbbb021`
- **Precios** (en `netlify/lib/precios.mjs`): 5 USD base; 15 los espejos, escaleras y bordes del día; 10 los triples de madrugada; 50 el primer y el último minuto del año; +5 el 14 de febrero. Se calculan con la hora local del comprador. Cinco dólares es lo que cuesta una tarjeta: un regalo, no una inversión.
- **Se vende** desde 5 minutos en el futuro hasta 2 años. Reserva de 15 minutos; máximo 3 reservas vigentes y 10 por hora por persona.
- **Un pago se acepta solo si:** es USDC de la red activa, va a `SALES_ADDRESS`, por el monto exacto de esa reserva, la transacción salió bien, tiene 12 confirmaciones en Base (3 en prueba), es posterior a la reserva y su hash no se usó. Si llega cuando la reserva ya era de otro, queda anotado como "pago sin minuto" para reembolso manual.
- **Moderación:** filtro automático + aprobación en /admin/. Sin aprobar, la portada muestra "Este minuto es de alguien."
- **Reembolsos** (escrito en los términos): si rechazás una dedicatoria, la persona elige texto neutro o reembolso en USDC a la dirección que pagó, dentro de 14 días, menos la comisión del envío. Sin reembolso por arrepentimiento ni por minutos ya ocurridos. Si el sitio no anda durante un minuto: otro minuto de igual precio o reembolso. Los reembolsos los hace Pedro a mano desde su billetera; el sitio solo anota el hash.
- **Privacidad:** no se guarda la dirección del comprador (se ve en la blockchain si hace falta reembolsar), ni nombres, ni correos.
- **Pendiente de Pedro:** jurisdicción y datos del responsable en los términos.
- **Revertir:** `git revert dbbb021 34f79cb`.

### 31. Posible paso siguiente, NO implementado: un "candado" pago para El interruptor
- **Idea:** pagar para dejar la luz fija (prendida o apagada) durante un tiempo, por ejemplo una hora, con una dedicatoria corta que se vea en la página mientras dura.
- **Cómo se haría con lo que ya existe:** es un minuto más largo. La misma reserva, el mismo pago verificado en USDC, la misma moderación y la misma llave; `minutoVigente` pasaría a devolver también los candados vigentes, y El interruptor ya rechaza los toques ajenos con `423` durante ese tiempo.
- **Precio sugerido para empezar:** 10 USD la hora, máximo 6 horas seguidas por compra, y nunca dos candados encimados.
- **Riesgos:** convierte la obra gratuita en algo que se compra y puede desanimar a quien llega a tocar. Por eso conviene esperar a ver cuánto se usa el interruptor gratis (al menos un mes de datos) antes de decidir.

### 32. Verificación antes de publicar
- 79 pruebas automáticas (`node --test tests/*.test.mjs`).
- Recorrido completo con el servidor local de Netlify (`netlify dev`, instalado fuera del repositorio): toque y límite, huella y su vista previa, compra simulada, aprobación, minuto en vivo, llave controlando la luz y otro visitante bloqueado.
- En producción, sin rastro público: reservas simultáneas (una gana), filtro, pago falso, toque sin ficha, páginas en celular y escritorio sin desbordes ni errores.
- **No se tocó la luz en producción** para no dejar una ciudad falsa en la historia. **No se probó ningún pago con billetera.**

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

### 23. Los textos dicen que el sitio usa Google Analytics — `df595f3` (2026-11-13)
- **Qué:** donde decía "sin cookies" ahora dice que el sitio usa Google Analytics, que pone cookies, para contar visitas en números agregados, y que no pide ni guarda nombres, correos ni direcciones de billetera. Cambió en Sobre la obra (8 idiomas), prensa en español e inglés y su kit (`.md` y `.zip`), la página de la API, estadísticas, `llms.txt` y el README.
- **Por qué:** Google Analytics queda como fuente de la medición y usa cookies; el texto anterior era falso.
- **Aprobado por Pedro** ("Sí, corregilos").
- **Se mantiene:** el contador propio sigue sin cookies, y así lo dicen la página de estadísticas y los comentarios del código.
- **No hecho:** no hay aviso de consentimiento de cookies. Para visitantes de la Unión Europea puede corresponder uno; es una decisión de Pedro.
- **Revertir:** `git revert df595f3` (solo tiene sentido si además se saca la etiqueta de Google en Netlify).

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
