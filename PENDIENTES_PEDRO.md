# Pendientes de Pedro

Lo que solo vos podés hacer, porque requiere una cuenta o una decisión de autor. Ordenado por impacto. Nada de esto es urgente: el sitio funciona sin ninguno.

## 1. Google Search Console: enviar el sitemap (5 minutos)
El sitio ya está verificado (existe `google8e1f665f197be771.html`).
1. Entrá a https://search.google.com/search-console con la cuenta que verificó el sitio.
2. En "Sitemaps", agregá `https://salehoy.com.ar/sitemap.xml`.
3. En "Inspección de URLs", pedí la indexación de `https://salehoy.com.ar/regalar-una-estrella/` y `https://salehoy.com.ar/en/gift-a-star/`.

Sirve para que Google encuentre las 18 páginas nuevas en días y no en semanas, y es donde vas a ver qué búsquedas traen gente.

## 2. Bing Webmaster Tools (5 minutos, opcional pero útil)
https://www.bing.com/webmasters → agregar el sitio (se puede importar desde Search Console) y enviar el mismo sitemap. Bing alimenta a ChatGPT y a Copilot.

## 3. Hacer el primer regalo, con dedicatoria (5 minutos)
Desde `https://salehoy.com.ar/regalo.html`, con una billetera que tenga un poco de ETH en la red Base. Escribí una dedicatoria y mandá el mínimo.
- Verifica el circuito completo con una billetera real (hasta ahora se probó con una simulada).
- Deja el n.º 1 en el cielo, que es lo que hace que el siguiente se anime.
- Si algo falla o la billetera muestra un aviso raro, contámelo en la próxima sesión.

## 4. Clave de Blockscout (10 minutos, opcional)
Hace que el cielo cargue al instante y habilita la vista previa propia por asterisco.
1. Crear una cuenta gratuita en Blockscout y generar una API key.
2. En Netlify → Site configuration → Environment variables, crear `BLOCKSCOUT_API_KEY`.
3. Volver a publicar el sitio.

No pude confirmar el formato exacto en que la API espera la clave; lo ajusto cuando exista.

## 5. Moderar dedicatorias (solo si hace falta)
Las dedicatorias son públicas y no se pueden borrar de la blockchain. Si aparece una ofensiva, se oculta del sitio: agregar el hash de esa transacción, en minúsculas, a la lista `OCULTAS` en `public/salehoy.js` y publicar. O pedímelo.

## 6. Decisiones de autor (cuando quieras)
- **Camino sin cripto.** Aceptar Mercado Pago o tarjeta y convertir cada aporte en un regalo en la blockchain, mostrado distinto ("regalo traducido"). Necesita una cuenta de cobro a tu nombre. Lo recomiendo solo si las estadísticas muestran que la gente llega a la página de regalo y se va.
- **Ediciones físicas.** Lámina anual con la carta del cielo. Necesita imprenta o servicio de impresión y un medio de cobro.
- **Finitud.** Decidir si el cielo se cierra en una fecha o en un número de regalos.

## Qué no tenés que hacer
No hace falta promocionar nada. El sitio ahora tiene páginas que responden búsquedas, una dirección por idioma y un enlace que quien regala quiere mandar. Lo único que acelera todo es el punto 1.
