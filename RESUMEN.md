# Resumen — dos obras nuevas (16 de noviembre de 2026)

El resumen anterior (sesión "director creativo", 12 de noviembre) está en el historial de git: `git show 46acd9f:RESUMEN.md`.

## En una línea
salehoy.com.ar ahora tiene tres obras de Solzimer: **Sin motivo** (sin cambios), **El interruptor** (una sola luz para todo el mundo, gratis) y **El minuto** (se regala un minuto exacto; cuando llega, su dedicatoria ocupa la portada para todos). Las dos nuevas están publicadas; El minuto está en modo prueba y no cobra nada hasta que vos lo actives.

## Qué construí

### El interruptor — https://salehoy.com.ar/interruptor/ · /en/switch/
- **Una tecla de pared** dibujada en el centro. Prendida: la pantalla es crema. Apagada: tinta, con un rescoldo bermellón que se apaga un instante después. Al tocar, la tecla se mueve, el teléfono vibra y suena un clic sintetizado (distinto para prender y apagar). Nunca suena sin un toque.
- **Es la misma luz para todo el mundo.** El cambio de otra persona se ve mientras mirás. Sin la configuración de Firebase (ver abajo) se actualiza cada 4 segundos; con ella, al instante.
- **Historia:** hace cuánto está así, récord prendida, récord apagada, cantidad de toques y las últimas 12 ciudades que la tocaron ("Córdoba, Argentina la apagó · hace 4 min"). Solo ciudad y país: nunca se guarda la IP.
- **Tu huella:** después de tocar aparece "tu huella →". Tiene un enlace propio cuya vista previa dice "Apagué la luz del mundo. Lleva 2 h 14 min así." y la cifra sigue creciendo mientras nadie la cambie. También se guarda como imagen vertical para historias.
- **Antiabuso sin captcha:** un toque por persona cada 5 minutos, un mínimo de 1,5 segundos entre dos toques cualquiera, una ficha que se pide al cargar la página (un bot que llama directo a la API no la tiene) y rechazo de navegadores automáticos. "Persona" se reconoce por una huella cifrada de la conexión que cambia cada día y no se puede revertir.

### El minuto — https://salehoy.com.ar/minuto/ · /en/minute/
- **La portada es un reloj.** "Este minuto no es de nadie." Cuando llega un minuto regalado, su dedicatoria ocupa la pantalla durante 60 segundos para todos, con un hilo que se consume, y debajo "la luz es suya → El interruptor".
- **Comprar** (/minuto/elegir/): fecha, hora, zona horaria, dedicatoria de hasta 80 caracteres, reserva de 15 minutos, resumen claro antes de pagar (red, token, monto exacto, comisión, que no se puede revertir), MetaMask, verificación en la blockchain y final con certificado y llave.
- **Quien compra recibe** una página permanente del minuto con cuenta regresiva ("Para verlo juntos: abran salehoy.com.ar/minuto a esa hora"), botón de calendario, un certificado vertical para mandar por WhatsApp y una **llave**: durante su minuto controla El interruptor y nadie más puede tocarlo.
- **Archivo público** (/minuto/archivo/) con una página indexable por minuto pasado, y sitemap propio.
- **Moderación:** toda dedicatoria pasa un filtro automático (sin enlaces, correos, teléfonos, documentos ni insultos) y queda pendiente hasta que la aprobás en /admin/. Si llega su minuto sin aprobar, se muestra "Este minuto es de alguien."
- **Términos** cortos en /minuto/terminos/, con la política de reembolso: si rechazás una dedicatoria, la persona elige texto neutro o reembolso manual en USDC dentro de 14 días.

### Precios (en `netlify/lib/precios.mjs`, se cambian ahí)
| Minuto | USD |
|---|---|
| Cualquiera | 5 |
| 11:11, 22:22, 12:12, 21:21, 10:10, 20:20, 23:23, 12:34, 01:23, 00:00, 23:59, 12:00 | 15 |
| 01:11, 02:22, 03:33, 04:44, 05:55 | 10 |
| 00:00 del 1 de enero y 23:59 del 31 de diciembre | 50 |
| Cualquier minuto del 14 de febrero | +5 |

La hora que cuenta es la del comprador: 11:11 es 11:11 donde vive.

### Pago
- **USDC en Base**, la misma red que Sin motivo: comisión de menos de un centavo de dólar. No encontré razón para otra red.
- **Va a una dirección de ventas propia** (`SALES_ADDRESS`), nunca a la de Sin motivo. Si alguien cargara la de Sin motivo, el sitio la ignora.
- **Cada reserva tiene un monto propio** (por ejemplo 5,0074 USDC): así un pago queda atado a una sola reserva.
- **El servidor verifica en la blockchain** destino, token, monto exacto, confirmaciones y que el hash no se haya usado antes. Recién ahí el minuto pasa a vendido.
- El sitio nunca pide, guarda ni usa claves privadas ni frases semilla.

### Navegación
Una línea en mono arriba de las páginas nuevas (Sin motivo · El interruptor · El minuto) y una línea chica al pie del cielo de Sin motivo. El cielo, la dirección y la portada de Sin motivo no cambiaron.

## Cómo lo verifiqué
- **79 pruebas automáticas, todas pasan** (`node --test tests/*.test.mjs`). Entre ellas:
  - un minuto no se vende dos veces, ni con 12 pedidos simultáneos ni pedido desde dos zonas horarias distintas;
  - un hash de pago no sirve dos veces, tampoco en simultáneo;
  - las zonas horarias: cambio de horario, hora inexistente, hora ambigua, fin de año en Tokio;
  - el pago: destino, token o monto equivocado por un centésimo, transacción fallida, pocas confirmaciones;
  - el límite de toques.
- **Recorrido completo en local** con el servidor de Netlify, en celular y escritorio: toqué la luz (y el segundo toque se rechazó con la cuenta regresiva), compré un minuto para 7 minutos después, lo aprobé en /admin/, esperé: la dedicatoria ocupó la portada y, con la llave, controlé la luz mientras otro visitante recibía "Durante este minuto la luz es de alguien".
- **En producción**, sin dejar rastro público: dos reservas simultáneas del mismo minuto (una ganó, la otra recibió "ocupado": las escrituras atómicas funcionan en el Netlify real), dedicatoria con enlace rechazada, pago falso rechazado, toque sin ficha rechazado, todas las páginas en celular y escritorio sin desbordes ni errores de consola.

## Qué NO pude verificar
- **Un pago con MetaMask**, ni de prueba ni real: requiere una billetera. Lo podés probar en Base Sepolia (PENDIENTES, punto E).
- **El tiempo real con Firebase**: hace falta tu cuenta.
- **Un toque real del interruptor en producción.** No toqué la luz en el sitio en vivo porque quedaría en la historia pública como actividad. El primer toque va a ser el tuyo o el de un visitante.
- **El sonido**, la vibración, compartir y guardar imágenes en un celular real (sobre todo iPhone).
- **Los avisos al teléfono** y la función que revisa cada 15 minutos (corren en Netlify, no se pueden disparar a mano).
- **Cómo se ve la vista previa dentro de WhatsApp.** Verifiqué que la página entrega la imagen correcta.

## Qué tenés que hacer vos
Todo está en `PENDIENTES_PEDRO.md`, sección "Obras nuevas", paso a paso:
1. **`ADMIN_PASSWORD`** en Netlify (2 minutos). Sin esto no podés aprobar dedicatorias.
2. **Firebase** para que la luz cambie al instante en todo el mundo (15 minutos, gratis, recomendado).
3. **`AVISO_URL`** con ntfy para enterarte en el teléfono cuando hay algo para aprobar (opcional).
4. **Cuando quieras cobrar:** crear una cuenta "SaleHoy ventas" en MetaMask y cargar su dirección en **`SALES_ADDRESS`** → pasa a prueba en Base Sepolia → hacer una compra de prueba → en /admin/ "borrar minutos de prueba" → **`MINUTO_MODO=real`**.
5. **Completar en los términos** quién vende y qué jurisdicción aplica (no lo inventé).
6. **Tocar la luz.** Y mandarla a alguien.

## Qué medir en las primeras dos semanas
Las reglas de `CLAUDE.md` siguen: sesiones reales separadas de bots y de las tuyas, siempre con denominador, y con menos de 30 sesiones reales solo se describe. Los eventos nuevos ya llegan a Google Analytics:

| Evento | Qué es | Qué dice |
|---|---|---|
| `interruptor_toque` | alguien cambió la luz | la obra se entiende y da ganas de tocar |
| `huella_compartida` | guardó, compartió o copió su huella | el motor de tráfico funciona o no |
| visitas a `/interruptor/?h=` | alguien llegó por la huella de otro | **la métrica principal**: visitas que traen visitas |
| `minuto_compra_inicio` | reservó un minuto | interés real en El minuto |
| `minuto_metamask_conectada` | conectó la billetera | dónde se cae la compra |
| `minuto_pagado` | compró | ventas (también se ven en /admin/) |
| `minuto_en_vivo` | alguien vio un minuto regalado mientras ocurría | si la gente "lo ve junta" |

Preguntas concretas para el 30 de noviembre:
1. **De las sesiones reales en /interruptor/, ¿cuántas tocaron?** (toques ÷ sesiones reales en esa página). Si casi nadie toca, la página no se entiende en tres segundos.
2. **¿Cuántas huellas se compartieron y cuántas visitas llegaron por `?h=`?** Si se comparten y no llega nadie, la vista previa no convence. Si no se comparten, "tu huella →" está escondido.
3. **¿Alguien empezó una compra de El minuto?** Mientras esté en modo prueba no puede haber ventas; sí reservas.

## Lo que dejé documentado y sin hacer
- **Un "candado" pago para El interruptor** (dejar la luz fija por un tiempo a cambio de un pago): diseño y riesgos en `DECISIONES.md`, decisión 31. No está implementado.

## Dónde está cada cosa
| Qué | Dónde |
|---|---|
| Lógica del interruptor | `netlify/lib/interruptor.mjs`, `difusion.mjs`; funciones `netlify/functions/interruptor*.mjs`, `og-huella.mjs`; página `src/components/Interruptor.astro`, `public/interruptor.js` |
| Lógica de El minuto | `netlify/lib/minuto.mjs`, `zonas.mjs`, `precios.mjs`, `filtro.mjs`, `pago.mjs`, `avisos.mjs`, `minuto-vigente.mjs` (la conexión con el interruptor) |
| Páginas de El minuto | `src/pages/minuto*`, `src/pages/en/minute*`, `src/pages/admin.astro`, `public/minuto*.js`, `netlify/lib/minuto-html.mjs` |
| Base común | `netlify/lib/almacen.mjs` (escrituras atómicas), `ajustes.mjs` (variables), `letras.mjs` (texto en imágenes), `src/layouts/Obra.astro` |
| Pruebas | `tests/` → `node --test tests/*.test.mjs` |
| Decisiones y cómo revertir | `DECISIONES.md`, 24 a 32 |
