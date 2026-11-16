# Pendientes de Pedro

Lo que solo vos podés hacer. Nada es urgente: el sitio funciona sin ninguno. Ordenado por cuánto mueve la aguja.

## Obras nuevas: lo que solo vos podés hacer

### 0. Publicar la última versión (cuando vuelvan los créditos de Netlify) — importante
El 17 de noviembre de 2026 El minuto pasó a ser **gratis** (ver `DECISIONES.md`, decisión 33). Ese cambio está en GitHub (`master`) pero **no está publicado**: Netlify se quedó sin créditos de compilación y no armó el sitio. Mientras tanto, salehoy.com.ar sigue mostrando la versión anterior de El minuto (la de venta en modo prueba). Esa versión no cobra nada y funciona, así que no hay apuro, pero no es la que querés.
- **Opción 1, sin hacer nada:** cuando se renueven los créditos (al empezar el próximo ciclo de facturación de Netlify), entrá a Netlify → tu sitio → **Deploys → Trigger deploy → Deploy site**. Publica lo último de `master`.
- **Opción 2, ahora:** subir el plan o comprar créditos en Netlify → **Billing**, y después Trigger deploy igual que arriba.
- Cómo saber que salió: https://salehoy.com.ar/minuto/elegir/ tiene que decir "Pedirlo es gratis" y no mostrar precios.
- **Ojo con los créditos:** cada `git push` a `master` intenta una compilación. Si los créditos son justos, conviene juntar cambios y publicar menos veces.

### A. Contraseña de administración (2 minutos) — hacelo primero
Sin esto nadie puede aprobar dedicatorias.
1. Variable `ADMIN_PASSWORD`, con una contraseña de 8 caracteres o más que no uses en otro lado.
2. Volvé a publicar (Trigger deploy).
3. Entrá a https://salehoy.com.ar/admin/ y escribila.

### B. Aprobar dedicatorias
1. https://salehoy.com.ar/admin/ → aparecen primero las pendientes, con la hora, la dedicatoria y cuánto falta.
2. **Aprobar**: la dedicatoria se muestra cuando llega su minuto y la persona controla El interruptor durante ese minuto.
3. **Rechazar**: el minuto vuelve a quedar libre y su página desaparece. No hay nada que devolver, porque pedirlo es gratis.
4. Si una dedicatoria no está aprobada cuando llega su minuto, la portada muestra "Este minuto es de alguien." y la luz sigue siendo de todos.

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

### E. Dirección para aportes voluntarios (opcional)
El minuto es gratis. Si cargás esta dirección, al final de cada pedido aparece, aparte y sin presión, "Aportar a la obra (opcional)", con USDC en Base. Sin ella, no se muestra nada de aportes.
1. En MetaMask: **Agregar cuenta** y ponele de nombre "SaleHoy aportes". Copiá su dirección (empieza con `0x`). **Nunca** compartas su frase secreta ni su clave privada: el sitio no las necesita ni las va a pedir.
2. Variable `SALES_ADDRESS` = esa dirección. Tiene que ser distinta de la de Sin motivo: si cargaras esa, el sitio la ignora (un aporte se volvería estrella).
3. Volvé a publicar.
4. Para probarlo: pedí un minuto vos y mandá un aporte de 1 USD. Necesitás USDC y un poco de ETH en la red Base en MetaMask.

La variable `MINUTO_MODO` ya no se usa: no hay modo prueba ni venta.

### F. Una variable más, recomendada
`OBRAS_SECRETO` = cualquier texto largo al azar (30 caracteres o más). Lo usan las firmas antibots y los límites por persona. Sin ella, cada obra genera la suya y la guarda; con ella quedan fijas aunque se borren datos.

### G. Si llegan demasiados pedidos
Hoy: un minuto por persona cada 7 días y como mucho 50 pedidos por día en todo el sitio. Si se llena de pedidos basura, decime y lo bajo (`ESPERA_PERSONA` y `TOPE_DIARIO` en `netlify/lib/minuto.mjs`).

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
