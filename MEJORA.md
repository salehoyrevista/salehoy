# Ciclo de mejora

Cómo seguir mejorando el sitio sin adivinar. Se revisa una vez por semana; lleva diez minutos.

## Dónde mirar

| Qué | Dónde |
|---|---|
| Visitas, páginas, idiomas, orígenes, crawlers | https://salehoy.com.ar/estadisticas/ |
| Los mismos datos en JSON | https://salehoy.com.ar/api/estadisticas |
| Regalos reales | https://base.blockscout.com/address/0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36 o el "registro" en la nota al pie del cielo |
| Qué búsquedas traen gente | Google Search Console (ver `PENDIENTES_PEDRO.md`) |

## Las cinco métricas

1. **Visitas por semana.** ¿Llega alguien sin que lo presenten?
2. **Origen.** Cuántas vienen de buscadores (`google.com`, `bing.com`, `duckduckgo.com`), de IA (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`) y directas.
3. **Crawlers.** Qué bots pasan y por qué páginas. Si GPTBot, ClaudeBot o PerplexityBot no aparecen en un mes, algo los frena.
4. **Camino al regalo.** Visitas a `/regalo.html` → `clic-regalar` → `regalo-enviado`. Dice dónde se cae la gente.
5. **Regalos y enlaces de asterisco.** Cantidad de regalos, cuántos con dedicatoria, y `porEnlaceDeAsterisco` (visitas que llegaron por `?n=`): es la medida de si la obra se difunde sola.

## Cómo leerlas

| Si pasa esto | Entonces |
|---|---|
| Pocas visitas y casi ninguna de buscadores después de 4 a 6 semanas | Las páginas no rankean. Revisar en Search Console qué consultas muestran el sitio y reescribir títulos; sumar más páginas de texto (abajo). |
| Entran a las páginas de texto pero no pasan al cielo ni a regalar | El final de esas páginas no convence. Probar otro cierre y otro texto en el enlace. |
| Llegan a `/regalo.html` y no hacen `clic-regalar` | La barrera es la cripto. Es la señal para sumar un camino sin cripto (ver `PENDIENTES_PEDRO.md`). |
| Hay `clic-regalar` pero no `regalo-enviado` | Falla o asusta el paso de la billetera. Probarlo con una billetera real y simplificar. |
| Hay regalos pero `porEnlaceDeAsterisco` es 0 | Nadie comparte su asterisco. Hacer más visible "copiar enlace" después de regalar y proponer el mensaje a enviar. |
| Los crawlers de IA pasan pero los modelos describen mal la obra | Ajustar `llms.txt` y la página "Sobre": decir primero lo que se está diciendo mal. |

## Qué probar después (en orden)

1. **Probar un regalo real con dedicatoria.** Un envío mínimo de ETH en Base desde la página de regalo. Verifica todo el circuito y deja el n.º 1.
2. ~~Páginas de texto en los otros 5 idiomas~~ — hecho el 12/11/2026. Lo que queda: "Sobre la obra" en pt, fr, it, de, zh y ja.
3. **Vista previa propia por asterisco.** Que `?n=N` muestre en WhatsApp o X la imagen de ese asterisco y su dedicatoria. Necesita una función que arme la imagen y una fuente de datos que un servidor pueda leer (la clave de Blockscout).
4. **Más búsquedas cercanas:** "regalos originales para alguien que tiene todo", "qué regalar sin motivo", "regalo simbólico", y en inglés "just because gift ideas". Una página por intención, siempre útil por sí misma.
5. **Camino sin cripto**, si las métricas muestran que ahí se cae la gente.
6. **Feed RSS de estrellas nuevas**, cuando haya regalos con cierta frecuencia.
7. **Ediciones físicas**: la carta del cielo anual impresa. Cuando haya estrellas.
8. **Modo proyección**: el cielo a pantalla completa, sin textos, para una muestra.

## Reglas para cualquier cambio

- Un cambio por commit, con mensaje que diga qué y por qué.
- Antes de publicar: `npm run build` sin errores y mirar el sitio en celular y escritorio.
- Anotar la decisión en `DECISIONES.md`, con cómo revertirla.
- No tocar la dirección de recepción. No inventar actividad. No esconder texto para buscadores.
- Las páginas de prueba con regalos simulados se arman solo en `dist/` y nunca se publican.
