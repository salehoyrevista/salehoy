# Auditoría de salehoy.com.ar

Fecha: 11 de noviembre de 2026. Punto de partida: commit `1214982`.

## En una línea

La obra está bien hecha y nadie llega porque el sitio es una sola página, en un solo idioma indexable, sin nada que la gente busque, sin enlaces entrantes, y con una barrera de entrada (tener cripto en Base) que deja afuera a casi todos.

## Estado real

| Qué | Dato | Cómo lo medí |
|---|---|---|
| Regalos recibidos | 0 | Blockscout, desde un navegador |
| Transacciones de la dirección | 0, nunca se usó; saldo vacío | Blockscout (`/addresses/<dir>`, `/transactions`, `/token-transfers`) |
| Páginas indexables | 2 (`/` y `/regalo.html`) | `sitemap.xml` |
| Idiomas indexables | 1 (español). Los otros 7 existen solo vía JavaScript | HTML servido sin JS |
| `canonical` / `hreflang` / JSON-LD en la portada | ninguno | `curl` |
| Peso de la portada | 39 KB (10,7 KB comprimida) + `salehoy.js` 41 KB (14 KB) + fuentes 58 KB | `curl` |
| `og.png` | 639 KB (pesada para una vista previa) | `curl` |
| `/api/regalos` | 503: no hay fuente que un servidor pueda leer sin API key | `curl` |
| Medición de visitas | no hay | código |
| Presencia en buscadores | No pude verificarla: la herramienta de búsqueda disponible no respeta `site:`. Pedro reporta que está indexada en Google y aparece en Gemini | — |

## Qué funciona

- **La obra.** Cielo en canvas, rotación sideral, nacimiento de asteriscos, constelaciones, prólogo, nota al pie, registro verificable. Sin errores de consola.
- **El filtro antispam**, probado con datos reales: solo cuentan ETH nativo y USDC oficial en Base.
- **Regalo en un clic** desde una billetera del navegador, y aviso cuando el regalo aparece.
- **Base técnica.** HTTPS, HSTS, encabezados de seguridad, fuentes propias, sin cookies, 404 real, redirecciones 301 del sitio viejo.
- **Texto para máquinas.** `llms.txt`, `robots.txt` abierto a GPTBot, ClaudeBot, PerplexityBot y Google-Extended, bloque de texto estático y `<noscript>`.

## Qué no funciona

1. **No hay demanda de búsqueda para lo que el sitio dice.** Nadie busca "Sin motivo net art" ni "Solzimer". El sitio no tiene ninguna página que responda una pregunta que la gente ya se hace.
2. **Una sola URL carga con todo.** Los 8 idiomas viven en la misma dirección y se cambian con JavaScript. Para Google hay una página en español; las otras 7 lenguas no existen. No hay `hreflang`.
3. **No hay nada que compartir.** `?n=N` es el único enlace personal, y solo existe después de regalar. Sin regalos, no hay enlaces; sin enlaces, no hay visitas.
4. **Cero enlaces entrantes.** El sitio viejo (revista) tenía 15 artículos y varias secciones; todo se borró y hoy redirige a la portada. Ese contenido era el que traía búsquedas.
5. **El regalo es anónimo y mudo.** Quien regala no puede decir nada ni dedicárselo a nadie. No hay motivo para mandarle el enlace a otra persona, que es el único canal de difusión que no depende de Pedro.
6. **La barrera de entrada.** Hace falta ETH o USDC en la red Base. Es una fracción mínima de los visitantes.
7. **La portada no explica.** Es correcto como obra, pero un visitante que llega desde un buscador no tiene a dónde ir a entender qué es, y un modelo de IA no tiene una página "sobre" para citar.
8. **No se mide nada.** No se sabe cuánta gente entra, de dónde, ni dónde abandona.
9. **`/api/regalos` gasta una invocación por visita y siempre falla** (503). No rompe nada, pero no aporta.

## Cómo lo leen buscadores y crawlers de IA

- **Bien:** HTML con título, descripción, texto estático en español e inglés (oculto a la vista, no al texto), `llms.txt` claro, `robots.txt` permisivo, `sitemap.xml`.
- **Mal:** sin `canonical`; sin datos estructurados en la portada (solo `regalo.html` tiene JSON-LD); sin páginas por idioma; sin una página "sobre la obra" con preguntas y respuestas; el contenido de la obra (los regalos) se carga con JS desde un tercero, así que un crawler nunca ve el estado del cielo; no hay un manifiesto legible por máquinas con la dirección, la red y las reglas.
- **Agentes de IA:** hoy un agente con billetera no encuentra en ningún lado instrucciones precisas para regalar (red, tokens, formato). `regalo.html` depende de JS y de una billetera de navegador.

## Por qué no llega nadie (causa raíz)

El sitio depende de que alguien lo presente. No tiene ningún mecanismo propio de llegada:
- no responde búsquedas,
- no genera enlaces que la gente quiera mandar,
- no tiene contenido en otros idiomas que se indexe,
- y el único acto que produce algo compartible (regalar) exige cripto.

La estrategia (ver `ESTRATEGIA.md`) ataca esos cuatro puntos en ese orden.
