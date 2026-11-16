# Pendientes de Pedro

Lo que solo vos podés hacer. Nada es urgente: el sitio funciona sin ninguno. Ordenado por cuánto mueve la aguja.

## Obras nuevas: lo que solo vos podés hacer

Las dos obras ya están publicadas y funcionan sin nada de esto. El interruptor anda completo; El minuto está en **modo prueba**: se puede recorrer la compra entera, pero el pago es simulado y nadie paga nada. Todo lo de abajo se carga en Netlify → tu sitio → **Site configuration → Environment variables → Add a variable**. Después de cargar o cambiar una variable: **Deploys → Trigger deploy → Deploy site** (las funciones leen las variables al publicarse).

### A. Contraseña de administración (2 minutos) — hacelo primero
Sin esto nadie puede aprobar dedicatorias.
1. Variable `ADMIN_PASSWORD`, con una contraseña de 8 caracteres o más que no uses en otro lado.
2. Volvé a publicar (Trigger deploy).
3. Entrá a https://salehoy.com.ar/admin/ y escribila.

### B. Aprobar dedicatorias
1. https://salehoy.com.ar/admin/ → aparecen primero las pendientes, con la hora, la dedicatoria y cuánto falta.
2. **Aprobar** o **Rechazar** (con una nota opcional, que solo ves vos).
3. Si rechazás un minuto pagado, la persona tiene derecho a pedir el reembolso (lo dicen los términos). Mandale el monto en USDC desde tu billetera de ventas a la dirección que pagó (la ves en el enlace "ver pago ↗", campo *From*), y después pegá el hash de tu envío en "anotar reembolso".
4. Si aparece un bloque "pago sin minuto · reembolsar": alguien pagó cuando su reserva ya había vencido y otra persona tomó ese minuto. No compró nada: devolvé el monto igual que arriba.
5. Si una dedicatoria no está aprobada cuando llega su minuto, la portada muestra "Este minuto es de alguien." y no el texto.

### C. Avisos cuando hay algo para aprobar (opcional, 5 minutos)
Sin esto tenés que entrar a /admin/ para ver si hay pendientes. Con esto te llega un aviso al teléfono.
1. Instalá la aplicación **ntfy** (gratuita, Android e iPhone) y suscribite a un tema con un nombre difícil de adivinar, por ejemplo `salehoy-` seguido de letras al azar.
2. Variable `AVISO_URL` = `https://ntfy.sh/<ese nombre>`.
3. Volvé a publicar. Te avisa al venderse un minuto, cuando falta menos de un día y sigue pendiente, y si un minuto pasó sin aprobar. Nunca manda el texto de la dedicatoria.

### D. Tiempo real para El interruptor (15 minutos, opcional pero recomendado)
Sin esto, cada navegador pregunta el estado cada 4 segundos: funciona, pero no es instantáneo. Con esto, cuando alguien apaga la luz se ve al instante en todo el mundo. Es gratis y no pide tarjeta.
1. Entrá a https://console.firebase.google.com con tu cuenta de Google → **Crear un proyecto** (nombre: `salehoy`; Google Analytics del proyecto: no hace falta).
2. Menú **Compilación → Realtime Database → Crear base de datos**. Ubicación: Estados Unidos. Modo: **bloqueado**.
3. Pestaña **Reglas**, reemplazá todo por esto y **Publicar**:
   ```json
   { "rules": { ".read": false, ".write": false, "interruptor": { "publico": { ".read": true } } } }
   ```
   (Cualquiera puede leer el estado de la luz; nadie puede escribir salvo el servidor del sitio.)
4. Copiá la dirección que aparece arriba en la pestaña Datos (termina en `firebaseio.com` o `firebasedatabase.app`) → variable `FIREBASE_DB_URL`.
5. Engranaje → **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Se baja un archivo `.json`. Abrilo con el Bloc de notas, copiá **todo** el contenido → variable `FIREBASE_SERVICE_ACCOUNT`. Después borrá ese archivo de tu computadora. (Esta clave solo sirve para escribir el estado de la luz en esa base; no tiene nada que ver con billeteras.)
6. Volvé a publicar.

### E. Dirección de ventas para El minuto (cuando quieras empezar a cobrar)
Los pagos de El minuto **nunca** pueden ir a la dirección de Sin motivo (se volverían estrellas). Si por error cargaras esa, el sitio la ignora y sigue en modo prueba.
1. En MetaMask: **Agregar cuenta** (o crear una billetera nueva) y ponele de nombre "SaleHoy ventas". Copiá su dirección (empieza con `0x`). **Nunca** compartas su frase secreta ni su clave privada: el sitio no las necesita ni las va a pedir.
2. Variable `SALES_ADDRESS` = esa dirección. Volvé a publicar.
3. Desde ese momento El minuto pasa a **prueba en Base Sepolia**: se paga de verdad con MetaMask, pero con USDC de prueba que no vale nada. Para probar una compra entera: en MetaMask activá las redes de prueba, conseguí ETH de prueba en Base Sepolia (por ejemplo en https://www.alchemy.com/faucets/base-sepolia) y USDC de prueba en https://faucet.circle.com (elegí Base Sepolia). Hacé una compra en https://salehoy.com.ar/minuto/elegir/ y aprobala en /admin/.

### F. Salir del modo prueba y cobrar de verdad
Solo cuando hayas hecho al menos una compra completa en Base Sepolia.
1. En /admin/, abajo: **borrar minutos de prueba**. Borra todos los minutos marcados como prueba, para que no ocupen horarios reales.
2. Variable `MINUTO_MODO` = `real`. Volvé a publicar.
3. Entrá a /minuto/elegir/: el cartel de modo prueba tiene que haber desaparecido y la red tiene que decir **Base**.
4. Para volver a prueba: borrá la variable `MINUTO_MODO` y volvé a publicar.

### G. Completar los términos
En https://salehoy.com.ar/minuto/terminos/ hay una línea "Jurisdicción y datos del responsable: pendientes de completar". Antes de cobrar de verdad conviene que la completes (quién vende, desde dónde y qué ley aplica). No lo inventé. Pasame los datos y lo agrego, o consultalo con alguien que sepa de comercio electrónico en Argentina.

### H. Una variable más, recomendada
`OBRAS_SECRETO` = cualquier texto largo al azar (30 caracteres o más). Lo usan las firmas antibots y los límites por persona. Sin ella, cada obra genera la suya y la guarda; con ella quedan fijas aunque se borren datos.

### I. Revisar los precios
Están en `netlify/lib/precios.mjs`: 5 USD un minuto común; 15 los especiales (11:11, 22:22, 12:34, 00:00, 23:59, 12:00 y parecidos); 10 los triples de madrugada (03:33, 02:22…); 50 el primer y el último minuto del año; +5 cualquier minuto del 14 de febrero. Si querés otros valores, decime cuáles.

## Sin motivo

## 1. Mirarlo y escucharlo en tu celular (10 minutos)
Hay tres cosas que solo se pueden juzgar con un celular real y un par de oídos:
- **El sonido.** Tocá "sonido" abajo. Nadie lo escuchó todavía: se construyó y corre sin errores, pero el volumen y el timbre se ajustan de oído. Decime si molesta, si no se oye o si está bien.
- **La inclinación.** Mové el celular: el fondo y los asteriscos deberían correrse apenas. En iPhone el permiso se pide al tocar "sonido".
- **Tu estela.** Movete por el cielo, tocá "mi estela →" y guardá la imagen y el video. Fijate si el video se puede subir a una historia de Instagram desde tu teléfono.

## 2. Compartir tu propia estela una vez
Es el experimento más barato para saber si el mecanismo funciona: guardá tu estela y mandásela a una persona, o subila a una historia. Después mirá en https://salehoy.com.ar/estadisticas/ si aparece "por el enlace de una estela".

## 3. Hacer el primer regalo, con dedicatoria (5 minutos)
Desde `https://salehoy.com.ar/regalo.html`, con una billetera que tenga un poco de ETH en la red Base. Sigue sin probarse el circuito con una billetera real, y un cielo con una estrella invita más que uno vacío. Si no querés, también está bien: la espera es parte de la obra.

## 4. Publicar en comunidades, si querés
`COMUNIDADES.md` tiene textos listos y adaptados para net art, arte generativo, creative coding, arte cripto y comunidades en español, con dónde publicarlos y cinco reglas para no hacer spam. Nada se publica solo. Mi recomendación, en este orden:
1. **Rhizome ArtBase** (archivo de net art): una presentación, un enlace permanente desde un sitio con autoridad.
2. **Show HN en Hacker News**, con el ángulo técnico (verificación contra la red sin claves, forma desde el hash).
3. **Farcaster**, donde está la gente que ya tiene billetera en Base.

Antes de publicar, revisá las normas de cada lugar y actualizá la fecha si ya hubo algún regalo.

## 5. Revisar las licencias del repositorio
El repositorio de GitHub ya es público. Quedó presentado con `README.md`, `LICENSE` (MIT para el código) y `LICENSE-OBRA.md` (CC BY-NC-SA 4.0 para la obra, los textos y las imágenes). Revisá que estés de acuerdo con esas dos licencias; si preferís otras, se cambian esos dos archivos.

## 6. Contacto de prensa
No había un contacto público, así que en la página de prensa y en el kit puse las "issues" del repositorio (`github.com/salehoyrevista/salehoy/issues`). Si querés un correo u otra vía, pasámelo y lo cambio.

## 7. Google Search Console (5 minutos)
Enviar `https://salehoy.com.ar/sitemap.xml` (ahora tiene 37 páginas). Sigue siendo la forma más rápida de que Google vea lo nuevo.

## 8. Sacar tu propio tráfico de Google Analytics (10 minutos)
Hoy la mayoría de las sesiones que ve Google Analytics son tuyas. Son dos partes: marcar tus dispositivos y encender el filtro.

**A. Marcar cada dispositivo tuyo (una vez por navegador)**
1. En la computadora, abrí `https://salehoy.com.ar/?interno=1`. No se ve nada distinto: queda guardado en ese navegador.
2. Hacé lo mismo en el celular y en cualquier otro navegador que uses.
3. Si borrás los datos de navegación o usás una ventana privada, hay que repetirlo. Para desmarcar: `https://salehoy.com.ar/?interno=0`.

Desde ese momento tus visitas viajan a Google Analytics con la marca `traffic_type = internal` y no suman al contador propio del sitio. Uso esta marca y no tu IP porque la IP de una conexión de casa cambia.

**B. Encender el filtro en Google Analytics**
1. Entrá a https://analytics.google.com y elegí la propiedad **Salehoy**.
2. Abajo a la izquierda, **Administrar** (el engranaje).
3. En la columna de la propiedad: **Recopilación y modificación de datos → Filtros de datos**.
4. Vas a ver un filtro llamado **Internal Traffic** en estado *Prueba*. Abrilo.
5. Comprobá que diga: tipo de filtro *Tráfico interno*, operación *Excluir*, valor del parámetro `internal`.
6. Cambiá el estado a **Activo** y guardá. Google avisa que el cambio es permanente para los datos nuevos: aceptá.

Si en el paso 4 no hay ningún filtro: **Crear filtro → Tráfico interno**, nombre "Internal Traffic", operación *Excluir*, valor `internal`, estado *Activo*.

**C. Comprobar que funciona**
1. En Google Analytics: **Administrar → Visualización de datos → DebugView**.
2. En otra pestaña abrí `https://salehoy.com.ar/?depurar=1`, activá el sonido y tocá "mi estela".
3. En DebugView tienen que aparecer `sonido_activado` y `estela_generada` en unos segundos. Es además la comprobación de que los eventos nuevos llegan: yo vi salir los pedidos desde el sitio, pero esa pantalla solo la podés abrir vos.
4. Al día siguiente, en **Informes → Tiempo real**, entrá al sitio desde un dispositivo marcado: no tenés que aparecer.

El filtro no borra lo anterior: las sesiones tuyas de antes quedan en los datos viejos. El reporte semanal las sigue separando por ciudad, dispositivo y canal.

**Opcional, si tu IP es fija:** Administrar → Flujos de datos → el flujo web → **Configurar ajustes de etiquetas → Mostrar todo → Definir tráfico interno → Crear**, y cargar tu IP (la ves en https://www.whatismyip.com). Sirve como segunda red; con el paso A alcanza.

## Ya no hace falta
- **Los textos sobre cookies.** Corregidos el 13 de noviembre de 2026: ahora dicen que el sitio usa Google Analytics.
- **La clave de Blockscout.** El servidor ahora verifica los regalos directamente contra la red Base, sin claves.

## Moderar dedicatorias (solo si hace falta)
Si aparece una dedicatoria ofensiva, se oculta del sitio agregando el hash de esa transacción, en minúsculas, a la lista `OCULTAS` en `public/salehoy.js`. O pedímelo.
