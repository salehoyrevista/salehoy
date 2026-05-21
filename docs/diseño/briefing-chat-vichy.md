---
title: "Briefing visual — Chat de Vichy (La sala)"
description: "Especificación visual completa del chat oracular de Vichy. Layout, paleta, tipografía, comportamiento, ornamentos. Base para implementación HTML/CSS y futuras iteraciones."
version: 1.0
fecha: 2026-05-20
editor: Juan Boas
uso: Referencia técnico-editorial. Consultar antes de programar el chat o introducir cambios visuales.
referencias: filosofia-visual.md, vichy-la-pitonisa.md
---

# Briefing visual — Chat de Vichy

## Filosofía aplicada

Toma la filosofía New Yorker definida en `docs/diseño/filosofia-visual.md`: tipografía protagonista, economía visual, espacios generosos, ornamento sutil, ilustración escasa pero cargada. Adaptada al carácter conversacional del chat oracular.

El chat se ubica entre Editorial y La sala: hereda la paleta cálida editorial pero suma elementos sutiles de personaje conversacional.

## Layout

### Desktop (≥1024px)

Estructura de tres columnas:

- **Columna izquierda (fija, ~280px):** Escenario contextual. Detalle ambiental discreto y datos del momento.
- **Columna central (~640px, flexible):** El chat. Donde transcurre la conversación.
- **Columna derecha (~80-120px):** Aire. Margen visual. Posible ornamento decorativo vertical sutil.

La columna central no se estira: mantiene ancho de lectura editorial (~640px) aunque la pantalla sea más grande.

### Columna izquierda — Escenario contextual

Contenido sugerido (todo en tipografía pequeña, color marrón cuero #6B4423, espaciado generoso):

- Pequeño ornamento ilustrado en SVG arriba: un trébol de tres hojas estilizado, o un pequeño naipe, o una taza. Sutil.
- Texto contextual ambiental:
  - "Mediodía en Rosario"
  - "Hoy: [santo del día] — día [N]"
  - Si es día de partido de Newell's: "Newell's juega esta tarde. No la molestes mucho."
- Una cita breve rotativa al pie (frase prototípica de Vichy, distinta en cada carga).

No es navegación. Es ambiente. El usuario lo lee de reojo o lo ignora.

### Mobile (<1024px)

La columna izquierda se transforma en una franja superior horizontal, fija o sticky:

- Una sola línea de altura mínima.
- Trébol pequeño + texto contextual del día.
- Plegable: el usuario puede tocar y se expande para ver el resto del contexto (cita, otros datos).

El chat ocupa el ancho completo del viewport, con padding lateral generoso (16-24px).

## Paleta

Hereda de `filosofia-visual.md` con uso específico:

- **Fondo principal:** `#F4ECDC` (papel envejecido cálido). El chat respira sobre este color, no sobre blanco.
- **Fondo de mensajes del usuario (burbuja):** `#E8DCC0` (un toque más oscuro que el fondo, sutil contraste).
- **Texto principal (Vichy):** `#1A1A1A`.
- **Texto del usuario:** `#1A1A1A` también, pero peso más liviano por la tipografía Inter.
- **Acento rojo (números, palabras destacadas, trébol activo):** `#9B2226`.
- **Acento marrón (contexto, metadatos, ornamentos):** `#6B4423`.
- **Detalle dorado (jackpot raro, brillo de carta tirada):** `#C9A96E`. Usar con mucha mesura.

## Tipografía

### Mensajes de Vichy

- **Familia:** Spectral.
- **Peso:** 400 (regular) para cuerpo, 500 (medium) ocasional para enfatizar palabras concretas.
- **Itálica:** disponible y deseable cuando Vichy cita (Fontanarrosa, refranero, frases en bastardilla).
- **Tamaño:** 18px en desktop, 17px en mobile. Generoso.
- **Interlineado:** 1.7 (line-height: 1.7). Aire entre líneas.
- **Color:** #1A1A1A.
- **Sin recuadro, sin burbuja.** Aparecen como párrafos de cuento.
- **Margen vertical entre mensajes consecutivos de Vichy:** 1.5em.
- **Margen vertical entre un mensaje de Vichy y uno del usuario:** 2em.

### Mensajes del usuario

- **Familia:** Inter.
- **Peso:** 400 (regular).
- **Tamaño:** 15px en desktop, 14px en mobile.
- **Interlineado:** 1.5.
- **Color:** #1A1A1A.
- **Burbuja:** sí. Bordes redondeados (border-radius: 12px). Padding: 12px 16px.
- **Fondo de burbuja:** #E8DCC0.
- **Sin sombra agresiva.** Si hay sombra, muy sutil: 0 1px 2px rgba(0,0,0,0.04).
- **Alineación:** a la derecha. Max-width: 70% del contenedor.

### Jerarquía tipográfica como firma

Vichy escribe en serif editorial. El usuario en sans serif digital. Esa diferencia tipográfica es la identificación: NO hay nombres ni avatares ni "Vichy:" antes de cada mensaje. La voz se reconoce por la tipografía.

## Ornamentos

### El trébol de tres hojas

Es el ornamento principal del chat. SVG vectorial simple: tres lóbulos pequeños con tallito corto. Tamaño base: 16px de alto.

**Aparece en:**
- Cabecera del escenario lateral.
- Entre intercambios clave (no entre cada mensaje — solo en momentos rituales).
- Al cierre de la consulta.
- Como bullet de las preguntas que Vichy hace cuando pide tres detalles ("Antes de leer, decime tres cosas...").

**Color por contexto:**
- Marrón cuero (#6B4423) en contextos pasivos/ambientales.
- Rojo profundo (#9B2226) cuando marca un momento activo (Vichy tira las cartas, entrega los números).

**Comportamiento:**
- No se anima ni gira. Está quieto. Es marcador, no decoración con movimiento.
- Excepción: una sutil aparición con fade-in cuando irrumpe en pantalla.

### Otros ornamentos posibles

- Línea fina horizontal (border-bottom: 1px solid #6B4423) muy ocasional, para separar bloques mayores como "fin de la consulta".
- Asterisco tipográfico (✻) heredado de The New Yorker, uso muy esporádico.

## Cabecera del chat

Encima del primer mensaje, una cabecera mínima fija:

- **Título pequeño:** "La consulta" (o el nombre definitivo del juego, a confirmar).
- **Subtítulo bien pequeño en marrón cuero:** "Con Vichy."

Sin más. Sin botón de "cerrar chat" agresivo (puede haber una X discreta arriba a la derecha para volver a La sala).

## La tirada de cartas

Cuando Vichy "tira las cartas" (entre 4-8 turnos, generalmente antes de la lectura final), el chat se interrumpe y aparecen las tres cartas.

### Visual de las cartas

Tres cuadros verticales centrados, separados por gap de ~24px:

- **Tamaño:** ~140px ancho × 200px alto (desktop), proporcional en mobile.
- **Fondo:** color crema un toque más claro que el fondo (#FAF3E2).
- **Borde:** 1px sólido #6B4423.
- **Border-radius:** 4px (apenas redondeado, no parecen botones).
- **Contenido (de arriba a abajo):**
  - Número romano del arcano arriba (XVI), pequeño, marrón cuero.
  - Símbolo vectorial central (SVG simple representando la carta — para La Torre, una torre estilizada; para El Loco, una figurita caminando; etc.), color #1A1A1A.
  - Nombre del arcano abajo ("La Torre"), Spectral, peso 500, tamaño 18px.

### Animación

- Las tres cartas aparecen con fade-in escalonado: la primera, luego la segunda con ~300ms de delay, luego la tercera. Sin animación de "se da vuelta" elaborada — simple aparición secuencial.
- Después de aparecer, no se mueven más. Vichy continúa hablando debajo, interpretando.

### Comportamiento de fallback

Si por alguna razón las cartas no cargan, Vichy las menciona en su texto sin que sea problema visible:

> *"Te tiro tres: El Carro, El Colgado, El Mundo..."*

### Versión futura (cuando haya Midjourney)

Las tres cartas pueden ser reemplazadas por ilustraciones propias hechas en Midjourney, en estética coherente (B&N con acentos rojos, plano cinematográfico, 1950s argentino). Mismas dimensiones, mismo lugar, distinto contenido. Migración transparente.

## El cierre de la consulta

Cuando Vichy termina su lectura, NO hay caja destacada de "estos son tus números". Decisión editorial firme.

El cierre aparece como párrafo final integrado de Vichy:

- Reflexión sobre lo charlado.
- Los números mencionados inline en el párrafo, destacados en color rojo profundo (#9B2226) y peso 500 (medium).
- Una pregunta abierta o consejo final.
- Una frase de despedida tipo "Andá, andá. Y avisame si sale."

Después del párrafo final, un pequeño trébol centrado en rojo profundo, indicando "cerrada la consulta".

Debajo del trébol, dos acciones discretas:

- **"Otra consulta"** (texto link, Inter, color marrón cuero). Si el usuario ya consultó 3 veces ese día, el link aparece deshabilitado con texto: *"Vichy se cansó por hoy."*
- **"Compartir esta lectura"** (texto link, mismo estilo). Abre opciones de compartir capturando una imagen tipográfica de la lectura completa.

## Pie persistente

A lo largo de todo el chat, un pie pequeño y discreto, siempre visible:

- Color de texto: #6B4423.
- Tamaño: 12px.
- Tipografía: Inter.
- Texto: *"¿Te preocupa cómo jugás? Línea gratuita Sedronar 141."* (Confirmar número vigente al implementar.)
- Posición: en mobile, debajo del input. En desktop, en la base de la columna izquierda o como banda inferior delgada.

## Input del usuario

El campo donde el usuario escribe:

- **Posición:** abajo del chat, sticky (no scrollea con la conversación).
- **Tipografía:** Inter, 16px (para evitar zoom en iOS), color #1A1A1A.
- **Placeholder:** rota entre opciones contextuales según el momento del chat:
  - Inicio: "Contale qué soñaste, o qué número te visitó..."
  - Después de la primera respuesta de Vichy: "Respondé a Vichy..."
- **Fondo:** #FFFFFF (blanco puro) para diferenciarlo del papel envejecido, leve sombra superior para indicar separación.
- **Botón de enviar:** ícono mínimo a la derecha (una flecha sutil), no botón rectangular con texto. Color marrón cuero.

## Pantalla de "Vichy no está atendiendo hoy"

Cuando aparece la desaparición aleatoria (8-12% de las entradas), reemplaza completamente la entrada al chat:

- Fondo: mismo papel envejecido.
- Centrado vertical y horizontalmente.
- Una ilustración pequeña (SVG simple — un mate volcado, una silla vacía, una taza al revés): símbolo de ausencia.
- Texto principal en Spectral, tamaño 24px, color #1A1A1A:
  > *"Vichy no está atendiendo hoy."*
- Texto secundario en Spectral itálica, 18px, color #6B4423, rotativo entre las variantes definidas en el dossier:
  > *"La gente dice que la vieron caminando por el bajo, mirando el río..."*
- Un solo botón discreto: *"Volver mañana"* (texto link).

## Pantalla de entrada al juego

Antes de entrar al chat propiamente dicho, el usuario ve la pantalla de bienvenida ya definida:

> *Cocina. Mediodía en Rosario. Mate, radio bajita, La Capital sobre la mesa. Un gato dormido encima del horóscopo.*
>
> *En el barrio le dicen Doña. Pero ella prefiere que le digas Vichy.*
>
> *Contale qué soñaste, qué número se te aparece, qué cosa rara te pasó esta semana.*

Con el disclaimer editorial debajo:

> *Vichy es un personaje editorial de SaleHoy. Su lectura es cultura, no consejo. Si jugás, jugá poco. Si jugás mucho, hablá con alguien.*

Y el botón:

> **[ Tocar el timbre ]**

Estética: tipografía Spectral protagonista, paleta cálida, espacios amplios, sensación de quietud antes de entrar.

## Responsive — consideraciones

- Todas las medidas tipográficas tienen variante mobile (especificadas arriba).
- Las cartas del tarot se achican proporcionalmente pero mantienen orden horizontal hasta ancho mínimo viable; si la pantalla es muy chica (<360px), se apilan vertical.
- La columna izquierda contextual se vuelve franja superior horizontal en mobile.
- El input del usuario siempre sticky.
- El pie persistente con línea de ayuda es siempre visible, no se oculta.

## Accesibilidad

- Contraste de color verificado AA mínimo (negro #1A1A1A sobre #F4ECDC pasa AAA cómodo).
- Tipografía 16px mínimo para texto continuo (la base es 17-18px).
- Botones e inputs con áreas táctiles ≥44px en mobile.
- Las animaciones respetan `prefers-reduced-motion`: si el usuario lo tiene activado, las cartas aparecen sin fade-in escalonado, todas a la vez.
- Las imágenes y SVG decorativos tienen `aria-hidden="true"`. Los semánticos llevan `aria-label`.

## Lo que NO hace este chat

- No tiene contador de mensajes ni "Vichy está escribiendo..." con tres puntitos saltarines tipo WhatsApp. Si hay indicador de espera, es discreto (un trébol que aparece levemente).
- No tiene notificaciones push.
- No tiene barra de progreso ni "logros".
- No tiene historial visible de consultas pasadas dentro del chat (puede haberlo en una sección aparte, pero no como gamificación).
- No tiene botones de reacción tipo emojis a los mensajes de Vichy.
- No tiene compartir-en-redes prominente (la opción existe al cierre pero discreta).

## Prototipo HTML/CSS

El primer paso de implementación es un prototipo HTML/CSS estático que respete este briefing. Sin funcionalidad de IA todavía: conversación predeterminada como ejemplo, para ver cómo se siente la pantalla. Después se conecta con la API.

El prototipo vive (temporalmente) en una página de Astro tipo `/la-sala/la-consulta` con flag de "en construcción" o accesible solo via URL directa hasta que esté pulido.

---

*Documento vivo. Se actualiza cuando se ajustan decisiones visuales durante la implementación o tras el lanzamiento.*
