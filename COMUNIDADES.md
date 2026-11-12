# Comunidades

Textos listos para publicar, si querés. Nada de esto se publica solo: vos decidís dónde, cuándo y si vale la pena.

Cada texto dice tres cosas que no se negocian: que la obra es propia, que hoy el cielo está vacío y que no es una donación.

Lo que no pude confirmar está marcado como «buscar: …» o «revisar las normas antes de publicar». No lo des por cierto.

## Cinco reglas para publicar sin hacer spam

1. **Una vez por comunidad.** Un solo aviso. Si no prende, no se repite ni se «sube». Se puede volver cuando haya algo nuevo de verdad (el primer regalo, por ejemplo).
2. **Leé las normas antes.** Muchas comunidades prohíben la autopromoción o los pedidos de dinero. Esta obra recibe dinero: si las normas lo prohíben, o si dudás, no publiques o preguntale antes a quien modera.
3. **No cruces el mismo texto.** Cada comunidad tiene su código. Abajo hay un texto distinto para cada una. No pegues el de una en otra, y no publiques en todas el mismo día.
4. **Quedate a responder.** Publicá cuando tengas un par de horas para contestar. Respondé también las críticas, sin defenderte: «es cripto», «es pedir plata» y «no hay nada» son lecturas legítimas de la obra.
5. **Nada falso y nada empujado.** No pidas votos, no uses cuentas secundarias, no digas que hay regalos si no los hay. No pongas la dirección de la billetera en el texto: está en el sitio, para quien la busque.

Antes de publicar cualquier texto: abrí https://salehoy.com.ar y confirmá que el cielo sigue vacío. Si ya hay regalos, cambiá las frases que dicen «vacío» por el dato real.

---

## 1. Net art y arte digital

### Rhizome

- **Dirección:** https://rhizome.org
- **Qué es:** organización dedicada al arte nacido en internet. Mantiene ArtBase, un archivo de net art (https://artbase.rhizome.org).
- **Formato y normas:** no sé si hoy ArtBase recibe propuestas abiertas ni por qué vía. Revisar en el sitio antes de escribir. Si hay un formulario o un correo de contacto, el texto de abajo sirve como presentación. buscar: «Rhizome ArtBase submit» y «Rhizome community».
- **Idioma:** inglés.

**Asunto:** Sin motivo — an ongoing net art work (2026)

**Cuerpo:**

Hello,

I am writing to share a work of my own, in case it is of interest to Rhizome.

Sin motivo (“for no reason”) is a participatory net art work, ongoing since 29 October 2026 at https://salehoy.com.ar/en/

It is a sky. An address on the Base network receives gifts. Each gift becomes a permanent asterisk, whose shape is derived from the transaction hash and never from the amount. Amounts and givers are not shown. Visits leave trails that fade. The sky turns once per sidereal day, and the work shows how long it has been since anyone gave.

It is not a donation: it funds nothing and promises nothing, and the giver receives nothing, not even a token. The blockchain is used as a public record, not as a market. The work is a question: does anyone give something just because?

As of today no one has. The sky is empty, and the work counts that silence.

The code is open. Fact sheet, texts and images: https://salehoy.com.ar/en/press/

Thank you for your time.

Solzimer

---

### Are.na

- **Dirección:** https://www.are.na
- **Qué es:** plataforma para armar colecciones («canales») de enlaces, imágenes y textos. La usa mucha gente de arte, diseño e internet.
- **Formato y normas:** no es un foro: no se «publica» para una audiencia. Lo que corresponde es crear un canal propio de la obra y sumar ahí el enlace con una descripción breve. Agregar el enlace a canales ajenos solo si el canal es abierto y la obra encaja con su tema; hacerlo en muchos canales es spam. Revisar las normas antes de publicar.
- **Idioma:** inglés (o español, en un canal propio).

**Título del bloque:** Sin motivo — Solzimer, 2026–ongoing

**Descripción:**

Net art. A sky where every gift sent on-chain becomes a permanent asterisk. Its shape comes from the transaction hash, never from the amount. Not a donation: it funds nothing, promises nothing, returns nothing. Visits leave trails that fade. The sky is currently empty. (My own work.)

https://salehoy.com.ar/en/

---

### Listas de correo y comunidades de net art

- **Dirección:** buscar: «nettime mailing list», «netbehaviour mailing list», «net art mailing list». Sé que existieron y fueron importantes; no puedo asegurar que sigan activas ni cómo se suscriben hoy.
- **Formato y normas:** en las listas de correo se espera texto plano, sin imágenes, con un asunto claro, y que quien escribe esté suscripto y lea las respuestas. Los anuncios de obra propia suelen marcarse en el asunto. Revisar las normas antes de publicar.
- **Idioma:** inglés.

**Asunto:** [announce] Sin motivo — a sky that waits for gifts (net art, ongoing)

**Cuerpo:**

Hello all,

A short announcement of a work of my own.

Sin motivo ("for no reason") is a net art work, ongoing since 29 October 2026.
https://salehoy.com.ar/en/

It is a sky. Whoever visits leaves a trail that fades. Whoever sends a gift
to the address of the work leaves an asterisk that stays. The shape of each
asterisk is derived from the transaction hash, never from the amount. Amounts
and givers are not shown: a cent and a fortune draw the same thing.

It is not a donation and not a sale. It funds nothing. Nothing is minted,
nothing is owned, nothing can be resold. The chain is there only as a public
record that a gift took place. The money goes to the author, and the work
says so.

The question is whether anyone gives something just because. So far no one
has: the sky is empty, and the work shows how long the silence has lasted.

The code is open. I would be glad to read what you think, including
objections.

Solzimer

---

## 2. Arte generativo y creative coding

### r/generative

- **Dirección:** https://www.reddit.com/r/generative/
- **Qué es:** comunidad de arte generativo en Reddit.
- **Formato y normas:** lo habitual es publicar una imagen o un video de la pieza y explicar la técnica en un comentario. Revisar las normas antes de publicar, en especial las de autopromoción y las que traten sobre cripto o NFT. Sirve `public/prensa/sin-motivo.webm` o una captura.
- **Idioma:** inglés.

**Título:** A sky that turns once per sidereal day and has no stars yet — each one will be drawn from a transaction hash

**Comentario:**

My own work. It is called Sin motivo ("for no reason"). What you see is the empty state, which is also the current state.

How it is generated:

- Each asterisk is drawn by a small PRNG seeded with a transaction hash. The seed decides the number of points, the length of each arm, stroke width, rotation, size, flicker and position. Same hash, same asterisk, on any device.
- The rotation is not a loop. The angle comes from the wall clock divided by the length of the sidereal day (86,164.0905 s), so everyone sees the same sky at the same moment.
- Asterisks from the same day are joined into a constellation with a minimum spanning tree.
- Visitors leave a trail that fades. You can save yours as an image or a video.
- Plain JavaScript, no UI framework. The sound layer is generated with Web Audio and never starts on its own.

Being upfront: the hashes come from gifts sent on the Base network. It is not a donation and not an NFT. Nothing is minted, the amount never affects the drawing and is never shown. No one has sent anything yet, so the sky is empty.

Live: https://salehoy.com.ar/en/
Code: https://github.com/salehoyrevista/salehoy

---

### r/creativecoding

- **Dirección:** https://www.reddit.com/r/creativecoding/
- **Qué es:** comunidad de programación creativa en Reddit.
- **Formato y normas:** similar a la anterior, con más interés por el código y el proceso. Revisar las normas antes de publicar. Conviene enlazar el repositorio.
- **Idioma:** inglés.

**Título:** I built a sky in plain JavaScript where the only input is a transaction hash (and the clock)

**Cuerpo:**

This is my own project, an art piece called Sin motivo. A few things in it that might be interesting if you make this kind of work:

**Deterministic shapes.** Every asterisk is generated from a transaction hash: hash → 32-bit seed → small PRNG → points, arm lengths, stroke, rotation, size, flicker, position. Nothing is stored. The drawing can be rebuilt from the hash alone.

**Real sidereal time.** The sky's angle is `Date.now() / siderealDay % 1`. No animation loop to keep in sync: two people looking at the same time see the same sky. It turns clockwise, as seen from the southern hemisphere.

**No backend state for the art.** The record is the blockchain itself (Base). The server verifies each entry directly against a public RPC node, with no API keys, and exposes a read-only JSON endpoint.

**Text in calldata.** A sender can attach up to 80 characters as hex-encoded UTF-8 in the transaction's data field. The site reads it, rejects anything that is not valid text or contains a link, and renders it as plain text.

**No framework, no cookies.** Astro only generates static HTML. Sound is generated with Web Audio and is off until you turn it on.

What it is as a piece: each gift sent to the work's address becomes a permanent asterisk. It is not a donation and nothing is minted or sold. The amount is never an input. Right now no one has sent anything, so the sky is empty. That is the honest state of it.

Live: https://salehoy.com.ar/en/
Code: https://github.com/salehoyrevista/salehoy

Happy to answer questions about any of it.

---

### Hacker News — Show HN

- **Dirección:** https://news.ycombinator.com/show · normas: https://news.ycombinator.com/showhn.html
- **Qué es:** sección de Hacker News para mostrar algo hecho por uno mismo.
- **Formato y normas:** el título empieza con «Show HN:». Tiene que ser algo que la gente pueda probar en el momento, sin registrarse. El enlace va al sitio; el contexto va en un primer comentario propio. Se espera que quien publica se quede a responder. Títulos sobrios: sin adjetivos ni signos de exclamación. No se piden votos. Revisar las normas antes de publicar. Esperá escepticismo con todo lo que toque cripto: conviene decirlo antes de que lo pregunten.
- **Idioma:** inglés.

**Título:** Show HN: Sin motivo – A sky where each on-chain gift becomes an asterisk

**URL:** https://salehoy.com.ar/en/

**Primer comentario:**

Author here. This is an art project, not a product.

There is an address on Base. Each transfer of ETH or USDC to it becomes a permanent asterisk in a sky. The shape is derived from the transaction hash, never from the amount, and the amount and sender are not shown on the site. It is not a donation: it funds nothing, nothing is minted, and the sender gets nothing back. The money goes to me, and the site says so. The piece is the question of whether anyone gives something for no reason.

So far the answer is no: the sky is empty. The site shows how long it has been.

Technical notes:

- Plain JavaScript, no UI framework. Astro generates the static HTML; hosted on Netlify.
- Shapes: transaction hash → seed → PRNG → geometry. Fully reproducible from the hash.
- The sky rotates once per sidereal day, computed from the wall clock, so there is no shared animation state.
- The server verifies each gift directly against a public Base RPC node. No API keys, no paid indexer. There is a read-only JSON API at /api/cielo.
- Optional dedications (80 chars max) travel as UTF-8 in the calldata of a plain ETH transfer. No database.
- No cookies, no personal data. Visit counts are anonymous and public.
- Sound is generated with Web Audio and never starts on its own.

Code: https://github.com/salehoyrevista/salehoy

I know on-chain anything is a hard sell here. I used a chain because I needed a public record that I do not control. Criticism of that choice is welcome.

---

### Mastodon y Bluesky (creative coding)

- **Dirección:** Mastodon: https://joinmastodon.org (cada persona elige un servidor). Bluesky: https://bsky.app. buscar: servidores de Mastodon dedicados al arte y al arte generativo, y feeds de creative coding en Bluesky.
- **Formato y normas:** publicación corta con un video o una imagen. En Mastodon se espera texto alternativo en las imágenes y pocas etiquetas, escritas con mayúsculas internas. Algunos servidores piden marcar como contenido sensible o con aviso todo lo que toque cripto. Revisar las normas del servidor antes de publicar.
- **Idioma:** inglés (abajo hay una versión en español).

**Texto (inglés):**

Sin motivo: a sky that turns once per sidereal day. Each star will be drawn from a transaction hash. Never from the amount, which is not shown.

It is not a donation. Nothing is minted. It only asks whether anyone gives something for no reason.

So far, no one. The sky is empty.

My own work, plain JavaScript, code open.
https://salehoy.com.ar/en/

#CreativeCoding #GenerativeArt #NetArt

**Texto alternativo para la imagen:** A dark, almost empty sky on a web page, with a faint trail of light left by the cursor and a line of small text.

**Texto (español):**

Sin motivo: un cielo que gira una vuelta por día sideral. Cada estrella se va a dibujar a partir del hash de una transacción. Nunca del monto, que no se muestra.

No es una donación. No se emite nada. Solo pregunta si alguien regala algo porque sí.

Por ahora, nadie. El cielo está vacío.

Obra propia, JavaScript sin frameworks, código abierto.
https://salehoy.com.ar

#ArteGenerativo #NetArt #CreativeCoding

---

## 3. Arte cripto y ecosistema Base

### Farcaster

- **Dirección:** https://farcaster.xyz
- **Qué es:** red social descentralizada, con mucha actividad del ecosistema Base y de arte en cadena.
- **Formato y normas:** publicaciones cortas («casts»), organizadas en canales. buscar: los canales de arte y de Base que estén activos hoy, y las normas de cada uno. Acá la cadena no hay que explicarla: lo que distingue a la obra es lo que no hace (no emite, no vende, no muestra montos). Revisar las normas antes de publicar.
- **Idioma:** inglés.

**Texto:**

Sin motivo is an artwork on Base. My own.

No mint. No token. No leaderboard.

You send ETH or USDC to an address and a permanent asterisk appears in a sky. Its shape comes from the tx hash. The amount is never shown and changes nothing.

It is not a donation. It funds nothing. You get nothing back.

The sky is empty. It has been since 29 October.

https://salehoy.com.ar/en/

**Respuesta propia, a continuación:**

Details for the curious: an ETH gift can carry a dedication, up to 80 characters, as plain UTF-8 in the calldata. The site keeps no database. It verifies each gift against a public RPC and reads the rest from the chain. Agents with a wallet are welcome too, if their principal allows it: https://salehoy.com.ar/agentes/

---

### Otras comunidades de arte en cadena

- **Dirección:** buscar: comunidades y foros de arte en cadena y del ecosistema Base (canales de Discord, foros, boletines). No puedo confirmar cuáles están activas.
- **Formato y normas:** revisar las normas antes de publicar. En estos espacios abunda la promoción de colecciones; conviene abrir diciendo que no hay nada para comprar.
- **Idioma:** inglés.

**Título:** An on-chain artwork with nothing to buy

**Cuerpo:**

This is my own work, and it is not a drop.

Sin motivo is a sky on the web. Each gift of ETH or USDC sent on Base to the work's address becomes a permanent asterisk. Its shape is derived from the transaction hash. Amounts and senders are never shown on the site.

Nothing is minted. There is no token, no edition, no allowlist, no roadmap. It is not a donation either: it funds nothing. The chain is used only as a public record that someone gave something for no reason.

No one has yet. The sky is empty and the work shows for how long.

https://salehoy.com.ar/en/

---

## 4. Comunidades en español de arte y tecnología

- **Dirección:** buscar: listas de correo, foros y grupos de arte y tecnología en español (arte electrónico, arte digital, medialabs, carreras de artes electrónicas, grupos de programación creativa). No puedo confirmar direcciones concretas.
- **Formato y normas:** revisar las normas antes de publicar. En los grupos de mensajería, pedir permiso a quien administra antes de pasar un enlace propio.
- **Idioma:** español.

### Texto para comunidades de arte

**Título:** Sin motivo: un cielo que espera regalos (net art, en curso)

**Cuerpo:**

Hola. Comparto una obra propia, por si a alguien le interesa mirarla o discutirla.

Se llama Sin motivo y está en curso desde el 29 de octubre de 2026: https://salehoy.com.ar

Es un cielo. Quien lo visita deja una estela que se borra. Quien manda un regalo a la dirección de la obra deja un asterisco que queda para siempre. La forma de cada asterisco sale del identificador de la transacción, nunca del monto. El monto y quién regala no se muestran: un centavo y una fortuna dibujan lo mismo.

No es una donación. No financia nada ni promete nada. Tampoco es una venta: no se emite ni se entrega nada. El dinero va al autor, y la obra lo dice. La blockchain está solo como registro público de que alguien regaló algo porque sí.

Hasta hoy nadie lo hizo. El cielo está vacío, y la obra muestra cuánto dura ese silencio.

Me interesa leer qué les parece, también las objeciones.

Solzimer

### Texto para comunidades técnicas

**Título:** Un cielo en JavaScript sin frameworks donde cada estrella sale de un hash

**Cuerpo:**

Hola. Es un proyecto propio, una obra de arte en la web: https://salehoy.com.ar

Lo que puede interesar desde lo técnico:

- Cada asterisco se dibuja con un generador pseudoaleatorio sembrado con el hash de una transacción. El mismo hash dibuja siempre lo mismo.
- El cielo gira una vuelta por día sideral, calculada con la hora real. No hay animación en bucle: todos ven el mismo cielo al mismo tiempo.
- El servidor verifica cada regalo directamente contra un nodo público de la red Base, sin claves de API. Hay una API de solo lectura.
- Las dedicatorias (hasta 80 caracteres) viajan como UTF-8 en los datos de la transacción. No hay base de datos.
- Sin cookies, sin frameworks de interfaz. Astro solo genera el HTML estático.
- El sonido se genera con Web Audio y nunca arranca solo.

Qué es como obra: cada regalo en ETH o USDC que llega a la dirección se vuelve un asterisco permanente. No es una donación ni un NFT: no financia nada y no se emite nada. El monto nunca entra en el dibujo ni se muestra. Hoy no hay ningún regalo, así que el cielo está vacío.

El código es abierto: https://github.com/salehoyrevista/salehoy

### Texto corto para redes

Sin motivo es un cielo. Cada regalo se vuelve un asterisco que queda para siempre. Las visitas dejan estelas que se borran.

No es una donación: no financia nada ni promete nada. Es una pregunta: ¿alguien regala algo porque sí?

Por ahora, nadie. El cielo está vacío.

Obra propia. https://salehoy.com.ar

---

## 5. Directorios y convocatorias

No listo convocatorias concretas: no tengo fechas ni bases confirmadas, y no las voy a inventar. Van los criterios para elegir cuando aparezca una.

### Dónde buscar

- buscar: «net art open call», «convocatoria net art», «convocatoria arte digital», «convocatoria arte y tecnología», «online exhibition open call».
- buscar: directorios y archivos de net art que acepten propuestas, y listas mantenidas por la comunidad (por ejemplo, las listas «awesome» de creative coding en GitHub). Revisar si aceptan obras o solo herramientas, y cómo se propone un enlace.
- Boletines y agendas de instituciones de arte y tecnología que sigas o conozcas.

### Criterios para elegir

**Conviene presentarse si:**

- Aceptan obra en línea, en curso, sin objeto físico ni versión final.
- Aceptan seudónimo. Si piden datos legales del autor, decidí antes cuánto querés revelar.
- No cobran por participar, o el costo es bajo y está explicado.
- No exigen exclusividad ni cesión de derechos más allá de exhibir y difundir. La obra va con CC BY-NC-SA 4.0: tiene que ser compatible.
- Entienden que la obra no se puede «entregar»: se enlaza. Si piden un archivo, sirven el video y las capturas del kit de prensa.
- Hay una persona o institución identificable detrás, con ediciones anteriores que se puedan ver.

**Mejor no presentarse si:**

- Piden acuñar la obra como NFT, venderla o ponerle precio. Contradice la obra.
- Cobran por «exhibir» o por figurar en un catálogo, sin jurado ni criterio visible.
- Piden cifras (visitas, ventas, comunidad). La obra no tiene nada de eso para mostrar, y no se inventa.
- Exigen modificar las reglas: mostrar montos, nombrar a quienes regalan, prometer algo a cambio.
- No queda claro quién organiza.

### Qué mandar

- Texto: el corto, el medio o el largo de `public/prensa/sin-motivo-prensa-es.md` (o la versión en inglés), según lo que pidan.
- Ficha técnica: la del mismo archivo.
- Imágenes y video: los de `public/prensa/`.
- Biografía: «Solzimer es el seudónimo del autor de *Sin motivo*.» No hay más datos públicos; no agregar nada que no sea cierto.
- Declarar siempre el estado real de la obra el día del envío. Hoy: ningún regalo.

---

## Marcadores que quedan en este archivo

- `https://github.com/salehoyrevista/salehoy`: la dirección pública del código, cuando decidas publicarlo. Aparece en los textos de r/generative, r/creativecoding, Show HN y comunidades técnicas en español.
- Todos los «buscar: …» y «revisar las normas antes de publicar».
