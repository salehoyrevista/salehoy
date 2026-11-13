# Sin motivo

Un cielo donde cada regalo en blockchain se vuelve un asterisco permanente. Hoy está vacío.

![Sin motivo](public/prensa/cielo-escritorio.png)

**[salehoy.com.ar](https://salehoy.com.ar)** · obra de net art de Solzimer · 2026–en curso

---

## Qué es

*Sin motivo* es una obra participativa de net art, en curso desde el 29 de octubre de 2026.

Es un cielo. Hay una dirección en la red Base. Cada regalo en ETH o USDC que llega a esa dirección se vuelve un asterisco (del griego *asteriskos*, «estrellita») que queda para siempre. Las visitas, en cambio, dejan estelas que se borran.

No es una donación: no financia nada ni promete nada. Tampoco es una venta: quien regala no recibe nada, ni siquiera un token. Es una pregunta: **¿alguien regala algo porque sí?**

A la fecha de este texto (12 de noviembre de 2026) nadie respondió. El cielo está vacío, la obra lo muestra y este repositorio no lo disimula: no hay datos de ejemplo ni estrellas de relleno.

## Cómo funciona

### La forma sale del hash, nunca del monto

Cada asterisco se dibuja con un generador pseudoaleatorio sembrado con el hash de la transacción. De ahí salen la cantidad de puntas, el largo de cada brazo, el grosor, el giro, el tamaño, el titileo y el lugar en el cielo. El mismo hash dibuja siempre el mismo asterisco, en cualquier navegador. El monto no entra en el cálculo en ningún punto. Tampoco se muestra, y tampoco se muestra quién regala.

### El cielo gira con la hora real

No hay animación en bucle. El ángulo del cielo se calcula con la hora del reloj y la duración del día sideral (86 164,0905 segundos): una vuelta completa cada 23 h 56 min 4 s, en sentido horario, como se ve el cielo desde el hemisferio sur. Dos personas que miran al mismo tiempo ven el cielo en la misma posición. Cada asterisco tiene un lugar fijo; lo que se mueve es el cielo entero.

### Constelaciones y silencio

Los regalos del mismo día se unen en una constelación por el camino más corto entre ellos (un árbol de expansión mínima). Y la obra muestra cuánto hace que nadie regala.

### Un registro verificado contra la red, sin claves

El servidor verifica cada regalo directamente contra la red Base, a través de un nodo público (RPC). No usa claves de API ni servicios pagos. De ahí sale un registro verificado, y de ese registro sale la API pública `/api/cielo`.

Cuentan solo dos cosas, ambas en Base (cadena 8453):

- ETH nativo: transacciones exitosas con valor mayor que 0.
- USDC oficial de Base (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`): transferencias con monto mayor que 0.

Cualquier otro token se ignora, para que el cielo no se llene de basura.

Dirección de la obra: `0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36` ([verla en el explorador](https://base.blockscout.com/address/0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36)). La dirección y el contrato están escritos una sola vez, en `public/salehoy.js`; el resto del sitio los lee de ahí al construirse.

### Dedicatorias en el calldata

Un regalo en ETH puede llevar una dedicatoria de hasta 80 caracteres. No hay base de datos ni formulario: el texto viaja en el campo `data` de la transacción, como UTF-8 en hexadecimal. Queda en la blockchain, público y permanente. El sitio no lo guarda: lo lee.

```
"For no reason."  →  0x466f72206e6f20726561736f6e2e
```

Al leerlo, el sitio descarta lo que no es texto UTF-8 válido, quita caracteres invisibles, no muestra textos con enlaces y lo escribe siempre como texto plano, nunca como HTML. USDC no lleva dedicatoria: una transferencia de token no tiene dónde.

### La escena

El cielo es una escena en tiempo real, con profundidad, que responde al toque, al mouse y a la inclinación del celular. Cada visitante puede guardar su propia estela como imagen y como video vertical, y compartirla con un enlace propio.

### El sonido

Hay una capa sonora opcional, generada en el navegador con Web Audio: sin archivos de audio y sin dependencias. Nunca arranca sola; solo suena si la persona la activa.

### Sin frameworks de interfaz

La obra está escrita en JavaScript sin frameworks de interfaz. Astro se usa solo para generar HTML estático: una portada por idioma (español, inglés, portugués, francés, italiano, alemán, chino, japonés), las páginas de texto, el sitemap, `llms.txt` y `obra.json`. Las tipografías se sirven desde el propio sitio.

## Cómo correrlo

Hace falta Node.js 20 o más nuevo.

```bash
npm install
npm run dev      # servidor local de Astro
npm run build    # genera el sitio en dist/
npm run preview  # sirve lo que quedó en dist/
```

`npm run dev` levanta el sitio estático. Las funciones de `netlify/functions/` (regalos, visitas, estadísticas) corren en Netlify; para probarlas en local hace falta la CLI de Netlify (`netlify dev`).

## Estructura

```
public/
  salehoy.js          núcleo de la obra: dirección, contrato, textos en 8 idiomas,
                      filtro de regalos y dedicatorias. Única fuente de esos datos
  sonido.js           capa sonora opcional (Web Audio)
  visita.js           visitas y eventos: contador propio y Google Analytics
  regalo.html         página para regalar
  fonts/              tipografías (Instrument Serif, IBM Plex Mono)
  prensa/             kit de prensa: textos, imágenes y video
  og.png              imagen para compartir
  _redirects          redirecciones
src/
  components/
    Cielo.astro       el cielo: la obra
    ListaFrases.astro
  layouts/
    Pagina.astro      plantilla de las páginas de texto
  lib/
    obra.js           lee public/salehoy.js al construir: rutas, idiomas, red
    textos-paginas.js textos de «Regalar una estrella» y «Frases»
    textos-sobre.js   textos de «Sobre la obra»
  pages/              una portada por idioma, páginas de texto, prensa,
                      agentes, estadísticas, sitemap.xml, llms.txt, obra.json
netlify/
  functions/          funciones del servidor: regalos, visitas, estadísticas
  edge-functions/     conteo de crawlers
astro.config.mjs
netlify.toml
```

## API

`GET https://salehoy.com.ar/api/cielo` devuelve el estado del cielo en JSON: las estrellas (regalos verificados contra la red Base), sus fechas y dedicatorias, y cuánto hace que nadie regala. De solo lectura, sin clave, con CORS abierto. No incluye montos ni remitentes. Documentación: <https://salehoy.com.ar/api/>.

## Embeber

```html
<iframe src="https://salehoy.com.ar/embed/" title="Sin motivo — Solzimer"
  width="100%" height="480" style="border:0" loading="lazy"></iframe>
```

## Para máquinas

- [`/llms.txt`](https://salehoy.com.ar/llms.txt): la obra explicada para modelos de lenguaje.
- [`/obra.json`](https://salehoy.com.ar/obra.json): manifiesto con red, dirección, tokens y formato de la dedicatoria.
- [`/agentes/`](https://salehoy.com.ar/agentes/): instrucciones para agentes de IA con billetera. Solo corresponde regalar si quien dirige al agente lo autorizó.

## Privacidad

- Usa Google Analytics (con cookies) para contar visitas y eventos en números agregados. La etiqueta la inserta Netlify al publicar; no está en este repositorio.
- No pide ni guarda nombres, correos ni direcciones de billetera, y no hay cuentas.
- Fuera de la etiqueta de Google, el cielo no carga scripts de terceros. La página para regalar carga una biblioteca de códigos QR desde un CDN público (cdnjs).
- Las estelas no se guardan en ningún lado, salvo que el visitante decida guardar la suya.
- Se cuentan visitas de forma anónima: un número por día, por página, por idioma y por dominio de origen. Las cifras son públicas en [`/estadisticas/`](https://salehoy.com.ar/estadisticas/).
- El idioma elegido se recuerda en el propio navegador (`localStorage`). No sale de ahí.
- El sitio no muestra el monto ni la dirección de quien regala. Como en toda blockchain pública, esos datos siguen siendo visibles en la red.

## Licencia

Dos licencias, porque hay dos cosas:

- **El código:** MIT. Ver [`LICENSE`](LICENSE).
- **La obra, sus textos y sus imágenes:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es), autor Solzimer. Ver [`LICENSE-OBRA.md`](LICENSE-OBRA.md).

El código puede usarse para hacer otra cosa. Si se publica una copia, corresponde cambiar la dirección de `public/salehoy.js` y no presentarla como *Sin motivo*.

Para citar la obra: Solzimer, *Sin motivo*, 2026–en curso, net art, salehoy.com.ar.

## Créditos

- Obra, textos y código: Solzimer.
- Tipografías: Instrument Serif e IBM Plex Mono, de sus respectivos autores y con sus propias licencias.
- Generado con [Astro](https://astro.build), alojado en [Netlify](https://www.netlify.com).
- Red: [Base](https://base.org). Explorador público: [Blockscout](https://base.blockscout.com).
- Prensa: [salehoy.com.ar/prensa/](https://salehoy.com.ar/prensa/).

---

## English

*Sin motivo* (“for no reason”) is a participatory net art work by Solzimer, ongoing since 29 October 2026 at [salehoy.com.ar](https://salehoy.com.ar/en/).

It is a sky. Every gift of native ETH or official USDC sent on Base to the work's address becomes a permanent asterisk (from the Greek *asteriskos*, “little star”). Visits leave trails that fade. It is not a donation: it funds nothing and promises nothing, and the giver receives nothing, not even a token. It is a question: does anyone give something just because?

As of 12 November 2026 no one has. The sky is empty, and the repository ships no sample data to make it look otherwise.

What may be worth reading in the code:

- **Shape from the hash.** Each asterisk is drawn by a pseudorandom generator seeded with the transaction hash. Same hash, same asterisk. The amount is never an input and is never shown.
- **Real sidereal rotation.** The sky's angle is computed from the wall clock and the length of the sidereal day. No looped animation; everyone sees the same sky at the same moment.
- **A record verified against the network.** The server checks every gift directly against Base through a public RPC node. No API keys, no paid services. The public read-only API at `/api/cielo` comes from that record.
- **Dedications in calldata.** An ETH gift can carry up to 80 characters as hex-encoded UTF-8 in the transaction's `data` field. No database: the site reads it from the chain and renders it as plain text.
- **No UI framework.** Plain JavaScript; Astro only generates the static HTML. Optional generated sound (Web Audio) that never starts on its own.

Run it with `npm install`, then `npm run dev` or `npm run build` (Node.js 20 or newer).

Code: MIT. The work, its texts and images: CC BY-NC-SA 4.0, by Solzimer. See [`LICENSE`](LICENSE) and [`LICENSE-OBRA.md`](LICENSE-OBRA.md).

Press kit: [salehoy.com.ar/en/press/](https://salehoy.com.ar/en/press/).
