# Resumen

## Actualización del 12 de noviembre de 2026
"Regalar una estrella" y "Frases para un regalo sin motivo" ya están en los 8 idiomas: se sumaron francés, italiano, alemán, chino y japonés (10 páginas nuevas). Todas se enlazan entre sí con `hreflang`, y el sitemap pasó de 18 a 28 direcciones. Publicado y verificado: las 28 responden 200, sin enlaces rotos y sin desbordes en celular.

Lo próximo sigue siendo lo mismo: enviar el sitemap en Search Console (ahora con 28 páginas) y hacer el primer regalo con dedicatoria. Ver `PENDIENTES_PEDRO.md`.

---

## Sesión del 11 de noviembre de 2026

## En una línea
El sitio dejó de ser una sola página que hay que presentar: ahora tiene 18 páginas indexables en hasta 8 idiomas, un regalo que se puede dedicar y mandar, instrucciones para agentes de IA y medición propia. Sigue con 0 regalos: eso no se inventa.

## Qué cambié
1. **Dedicatorias.** Quien regala ETH puede escribir hasta 80 caracteres que quedan dentro de la transacción. El sitio los muestra en el asterisco, en el registro y en el título del enlace `?n=N`.
2. **Una portada por idioma.** `/`, `/en/`, `/pt/`, `/fr/`, `/it/`, `/de/`, `/zh/`, `/ja/`, con texto traducido en el HTML, `canonical`, `hreflang` y datos estructurados.
3. **Páginas que responden búsquedas.** "Regalar una estrella" y "Frases para un regalo sin motivo" (español, inglés, portugués) y "Sobre la obra" (español, inglés).
4. **Para IA y agentes.** `/agentes/` con instrucciones exactas para regalar, `/obra.json` como manifiesto y `llms.txt` ampliado.
5. **Medición.** Visitas anónimas y conteo de crawlers, sin cookies ni cuentas externas: https://salehoy.com.ar/estadisticas/
6. **Técnica.** Sitemap con alternativas por idioma, `og.png` 64% más liviana, `/api/regalos` ya no falla en cada visita.

## Qué decidí y por qué
- **El concepto no se toca.** No financia nada, no tiene precio, no muestra montos. Es lo que hace única a la obra.
- **El ingreso son los regalos, y la dedicatoria es lo que puede multiplicarlos.** Convierte "regalame algo" en "regalale una estrella a alguien", que es algo que la gente ya busca y ya paga, y le da a cada persona un enlace que quiere mandar.
- **No vendo lo que no es.** La página de estrellas dice que ningún registro de nombres es oficial y que esto es una obra de arte.
- **Nada falso.** El cielo sigue vacío hasta que alguien regale.

El detalle, con cómo revertir cada cosa, está en `DECISIONES.md`.

## Qué probé y qué no
- **Probado en producción:** las 26 direcciones responden 200; la medición cuenta visitas y crawlers.
- **Probado con datos simulados, en local:** dedicatorias (lectura, escritura, límite, bloqueo de enlaces), portadas por idioma, páginas en celular y escritorio, enlaces internos.
- **Sin probar:** un regalo real con dedicatoria desde una billetera real. Es el primer pendiente.
- **Sin verificar:** cómo aparece hoy el sitio en Google; la herramienta de búsqueda que tenía no respeta `site:`.

## Qué tenés que hacer vos
Está en `PENDIENTES_PEDRO.md`. Lo que más rinde, en 15 minutos:
1. Enviar `sitemap.xml` en Google Search Console.
2. Hacer el primer regalo con dedicatoria.

## Qué recomiendo para la próxima sesión
1. Mirar `/estadisticas/` después de 2 o 3 semanas y decidir con `MEJORA.md` en la mano.
2. Traducir "regalar una estrella" y "frases" a los otros 5 idiomas.
3. Vista previa propia por asterisco al compartir `?n=N` (necesita la clave de Blockscout).
4. Si la gente llega a regalar y no puede, diseñar el camino sin cripto.

## Dónde está cada cosa
| Archivo | Para qué |
|---|---|
| `AUDITORIA.md` | Diagnóstico del punto de partida |
| `ESTRATEGIA.md` | Qué se decidió hacer y por qué |
| `DECISIONES.md` | Registro de decisiones, con cómo revertirlas |
| `MEJORA.md` | Métricas, cómo leerlas y qué probar después |
| `PENDIENTES_PEDRO.md` | Lo que requiere una cuenta o una decisión tuya |
