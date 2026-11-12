# Registro de decisiones

Cada decisión, por qué se tomó y cómo revertirla. La más reciente arriba.
Para deshacer un cambio: `git revert <commit>` y `git push origin master` (Netlify publica solo).

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
