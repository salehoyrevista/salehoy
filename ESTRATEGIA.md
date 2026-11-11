# Estrategia

Fecha: 11 de noviembre de 2026.

## Decisión de fondo: el concepto se mantiene, el regalo se vuelve regalable

**Se mantiene** "Sin motivo" tal como es: no es una donación, no financia nada, todos los regalos valen lo mismo, el monto nunca se muestra. Ese rigor es lo único que distingue a la obra; cambiarlo por una tienda la volvería una más.

**Lo que cambia** es que el regalo deja de ser mudo. Desde ahora, quien regala puede escribir una **dedicatoria** que queda grabada en la propia transacción, pública y permanente. Con eso la obra pasa de "regalame algo" a también "regalale una estrella a alguien":

- Hay un motivo para mandar el enlace (`?n=N`) a otra persona: *"te regalé una estrella"*.
- Esa persona llega, ve nacer el asterisco con su nombre, y es una visita que nadie tuvo que promocionar.
- Es coherente con la obra: la dedicatoria no la guarda el sitio, la guarda la blockchain. Sigue siendo un regalo, sin precio fijo.

**De dónde sale la rentabilidad**
1. **Ahora:** los regalos. Es el único ingreso que no requiere cuentas externas ni logística, y la dedicatoria es lo que puede hacerlos frecuentes (regalar una estrella es un mercado real: la gente paga por "ponerle nombre a una estrella").
2. **Después (necesita cuentas de Pedro, ver `PENDIENTES_PEDRO.md`):** ediciones físicas. La "carta del cielo" anual impresa y láminas de constelaciones por fecha. Recién tiene sentido cuando haya estrellas que imprimir.

No vendo nada que no exista ni prometo nada que la obra no cumpla. Las páginas nuevas dicen explícitamente que esto es una obra de arte y no un registro astronómico.

## Cómo llega el tráfico sin promoción manual

Ordenado por impacto sobre esfuerzo.

### 1. Páginas que responden búsquedas reales
La portada es una obra y no debe cargarse de texto. El texto va en páginas propias, estáticas, rápidas, enlazadas entre sí y con el cielo:

| Página | Qué búsqueda responde | Idiomas |
|---|---|---|
| Regalar una estrella | "regalar una estrella", "ponerle nombre a una estrella", "name a star gift" | es, en, pt |
| Frases para un regalo sin motivo | "frases para regalar sin motivo", "regalo porque sí frases" | es, en, pt |
| Sobre la obra (con preguntas frecuentes) | "qué es Sin motivo", y es la página que citan los modelos de IA | es, en |
| Para agentes | instrucciones exactas para que un agente de IA con billetera regale | en + es |

Son útiles por sí mismas (la de estrellas explica con honestidad que ningún registro de nombres de estrellas es oficial) y cada una termina en el cielo.

### 2. Una dirección por idioma, con `hreflang`
La portada se genera en 8 direcciones (`/`, `/en/`, `/pt/`, `/fr/`, `/it/`, `/de/`, `/zh/`, `/ja/`) con el texto ya traducido en el HTML, `canonical` y `hreflang`. Hoy Google ve una sola página en español.

### 3. El enlace que se manda solo
Dedicatoria en la transacción + `?n=N` + nacimiento del asterisco al abrirlo. Cada regalo produce un enlace que su autor quiere compartir.

### 4. Visibilidad para IA y agentes
- `llms.txt` ampliado con todas las páginas y el protocolo de la dedicatoria.
- `obra.json`: manifiesto legible por máquinas (dirección, red, tokens, reglas, formato de la dedicatoria).
- Página `/agentes/`: la obra invita explícitamente a agentes de IA a regalar. Hasta donde sé es un ángulo poco transitado y verdadero: en Base hay agentes con billetera.
- Datos estructurados (JSON-LD) en todas las páginas: `VisualArtwork`, `FAQPage`, `Person`.

### 5. SEO técnico
`canonical`, `hreflang`, sitemap con alternativas por idioma, `og.png` liviana, títulos y descripciones propios por página e idioma.

### 6. Medición
Contador propio, sin cookies ni datos personales: un número por día, por página, por idioma y por origen. Sin cuentas externas.

## Lo que decidí no hacer (y por qué)

- **No resucitar la revista vieja.** Traería búsquedas, pero de un tema (juego y azar) ajeno a la obra y con otro tipo de riesgo.
- **No aceptar pagos con tarjeta ni Mercado Pago todavía.** Requiere cuentas a nombre de Pedro; queda en `PENDIENTES_PEDRO.md` con el diseño propuesto.
- **No inventar actividad.** El cielo sigue vacío hasta que alguien regale. Las páginas nuevas lo dicen.
- **No publicar en sitios ajenos ni automatizar redes.**
- **No RSS por ahora.** No hay contenido periódico; cuando haya regalos, un feed de estrellas nuevas tiene sentido.

## Cómo sé si funciona

Ver `MEJORA.md`: métricas, umbrales y qué probar después.
