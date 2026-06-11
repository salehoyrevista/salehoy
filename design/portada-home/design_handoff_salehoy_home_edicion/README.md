# Handoff: SaleHoy — Home + Página de edición

## Resumen

Paquete de handoff para implementar dos pantallas de **SaleHoy** (*Revista cultural del juego y el azar*, editorial digital argentina) en un codebase real:

1. **Home** — portada del sitio (hero con la portada de la edición, sumario de artículos, bloque "La sala", newsletter, footer).
2. **Página de edición** (`/ediciones/01`) — portada a sangre, carta del editor y grilla de las cinco notas.

Ambas son **responsive** (escritorio + mobile), con **modo día/noche** real y persistente, y micro-interacciones editoriales (reveal al scrollear, hover de tarjetas).

---

## Sobre los archivos de este bundle

Los archivos `.html` / `.jsx` / `.css` incluidos son **referencias de diseño creadas en HTML** — prototipos que muestran el look y el comportamiento buscados, **no código de producción para copiar tal cual**.

La tarea es **recrear estos diseños en el entorno del codebase destino** (React, Vue, Astro, SvelteKit, etc.) usando sus patrones y librerías establecidos. Si todavía no hay entorno, elegí el framework más apropiado (para una revista editorial con buen SEO, **Astro** o **Next.js** son candidatos naturales) e implementá ahí.

El prototipo está construido con React 18 + Babel standalone en el navegador (sin build step) sólo para poder iterar rápido en el diseño. **No** lo lleves así a producción.

---

## Fidelidad

**Alta fidelidad (hi-fi).** Colores, tipografía, espaciado e interacciones son finales y están alineados al **SaleHoy Design System**. Recreá la UI de forma pixel-perfect usando las librerías y patrones del codebase, respetando los tokens de la sección *Design Tokens*.

> Regla de marca clave: **un solo acento por pantalla**. El rojo (`--rojo`) es para una sola cosa por vista. Los colores de acento de cada narrador se usan **sólo** dentro del contenido que ellos firman (byline, eyebrow), nunca en el chrome (masthead/footer/nav). El wordmark "Sale**Hoy**" siempre lleva el rojo en "Hoy".

---

## Pantallas / Vistas

### Pantalla 1 — Home

**Propósito:** entrada al sitio. Presenta la última edición y deja entrar a la zona lúdica.

**Layout (escritorio):** ancho de contenido máx. **1200px** centrado (`.shell`, padding lateral 40px). Secciones apiladas verticalmente separadas por hairline superior y ~80px de padding vertical.

Orden de secciones:
1. **Masthead** (sticky)
2. **Hero** (portada horizontal a todo el ancho)
3. **El sumario** (grilla de 5 artículos)
4. **La sala** (4 tarjetas de dispositivos)
5. **Newsletter**
6. **Footer** (3 columnas + bloque de marca)

**Mobile:** una sola columna; el hero usa la **portada vertical**; la nav secundaria (La sala, Sobre, Newsletter) se colapsa dejando sólo "Ediciones" + toggle.

#### Componentes

**Masthead** (`.mast`, sticky top, `z-index: 40`)
- Fondo: `--paper-warm` al 92% de opacidad; borde inferior `1px solid var(--ink)`.
- Fila (`.mast-row`): altura ~50px, `display:flex; gap:28px; align-items:center`.
  - **Wordmark** izquierda: Spectral 700, 26px, `letter-spacing:-0.01em`. "Sale" en `--ink`, "Hoy" en `--rojo`.
  - **Nav** (`.mast-nav`): Spectral en small-caps (`font-variant-caps: all-small-caps`), 16px, `letter-spacing:0.1em`, color `--ink`. Items: *Ediciones · La sala · Sobre*. `white-space:nowrap`.
  - **Derecha** (`margin-left:auto`): "Newsletter" (Inter 13px, borde inferior rojo) + **toggle día/noche**.
- **Sub-fila** sólo en Home (`.mast-sub`): Inter 11px uppercase, `letter-spacing:0.08em`, color `--cuero`. Izq: "Edición #01 · La quiniela al diván"; der: "Editor · Juan Boas". Oculta en mobile.
- Hover de links: color `--ink → --rojo`, 120ms. Item activo: `--rojo`.

**Toggle día/noche** (`.daynight`)
- Píldora (`border-radius:999px`) con dos íconos SVG (sol / luna), 1.6px stroke.
- Estado activo del lado correspondiente: fondo `--ink` (día) o `--dorado` (noche), con el ícono en color papel.
- Persiste en `localStorage` bajo la clave `sh-theme` (`"light"` | `"dark"`). Aplica `data-theme` en `<html>`.

**Hero** (`.hero`, `.hero-desktop`)
- Imagen de portada a todo el ancho. `object-fit:cover`.
  - Escritorio: `aspect-ratio: 1376 / 620`, portada **horizontal**.
  - Mobile: `aspect-ratio: 768 / 1100`, portada **vertical**.
- **Velo (scrims)** — degradados oscuros sutiles SÓLO donde va el texto (la foto es rica y cargada). Intensidad multiplicada por `--hero-overlay` (default 1, ajustable):
  - Top (`.hero-scrim-top`): 34% de alto, `rgba(8,6,4,0.55*overlay) → transparent`.
  - Bottom (`.hero-scrim-bot`): 58% de alto, `rgba(8,6,4,0.72*overlay) → 0.18 → transparent`.
- **Contenido** (`.hero-content`, `position:absolute; inset:0; padding:30px 40px 36px; flex column; justify-content:space-between`):
  - Arriba-izq: wordmark "Sale**Hoy**" Spectral 700 ~28px, color `#F4ECDC`, `text-shadow:0 1px 14px rgba(0,0,0,.45)`. "Hoy" en `#E2837C`.
  - Abajo-izq (`.hero-foot`, gap 18px):
    - **Eyebrow** (`.hero-eyebrow`): Inter 13px, `letter-spacing:0.22em`, uppercase, `#F4ECDC`. Texto: "ÚLTIMA EDICIÓN · #01 · LA QUINIELA AL DIVÁN" (el "#01" en `#E2837C`).
    - **Botón "Entrar a la edición"** (`.btn-enter`): Inter 500, 14px; fondo `--paper-warm`, texto `--ink`, `border-radius: var(--radius-2)` (~6px), padding 12px 22px. Flecha "→" que se desplaza 4px en hover; fondo a `#fff` en hover.
- Tamaño de wordmark/eyebrow/título escalan con `--hero-title-scale` (default 1).

**El sumario** (`.section#sumario`)
- Encabezado (`.section-head`): eyebrow Spectral small-caps `--cuero` ("El sumario · edición #01") + `<h2>` Spectral 700 34px ("Cinco maneras de mirar un número") + bajada italic a la derecha (Spectral italic 17px, `--ink-soft`).
- **Grilla** (`.grid-feat`): `display:grid; gap: var(--grid-gap)` (default 28px, ajustable). Escritorio: `grid-template-columns: 1.5fr 1fr 1fr` con 2 filas. La **primera tarjeta es destacada** (`.card-feature`, `grid-row: span 2`, título 34px). 980px↓: 2 columnas, feature a ancho completo. 620px↓: 1 columna.
- **Tarjeta de artículo** (`.card`): superficie `--paper-warmer`, borde **sólo superior** `1px solid var(--rule)`. Composición:
  - **Ilustración** (`.card-illo`): bloque con `aspect-ratio` (16/10; feature 4/3), borde hairline + `border-radius: var(--radius-2)`. Fondo papel/sepia con textura sutil de líneas diagonales (`.illo-ground`, ver tokens) + el **ornamento del narrador** centrado al 38% de ancho, opacidad 0.5. (Placeholders — se reemplazan por foto/ilustración real.)
  - **Eyebrow**: Spectral small-caps 13px, en el **color de acento del narrador**. (Ej: "Crónica", "Nota clínica", "La Data".)
  - **Título** (`.card-title`): Spectral 600, line-height 1.16. Tamaño 21px (feature 34px). Hover → color `--rojo`.
  - **Bajada** (`.card-deck`): Spectral 16px (feature 18px), `--ink-soft`, una línea/dos.
  - **Byline** (`.card-byline`): Inter 11px 600 uppercase, `letter-spacing:0.08em`, con un punto (•) del color de acento + "Nombre · Rol" (el rol en `--cuero`).
  - **Hover de tarjeta**: el borde superior pasa de `--rule` a `--ink` y de 1px → 2px (sin sombra, sin escala). 200ms.

**La sala** (`.section.sala#sala`)
- Borde superior más marcado (`1px solid var(--ink)`). Un poco más lúdica pero coherente.
- Encabezado: eyebrow "La sala · zona viva" + `<h2>` "Pasá a la sala" + bajada italic + botón **"Entrar a La sala"** (`.btn-ink`: fondo `--ink`, texto papel, hover → fondo `--rojo`).
- **Grilla** (`.sala-grid`): 4 columnas (`repeat(4,1fr)`, gap 16px). 900px↓: 2 col. 520px↓: 1 col.
- **Tarjeta** (`.sala-card`): superficie `--paper-warmer`, borde completo `1px solid var(--rule)`, `border-radius: var(--radius-3)`, padding 22px 20px, `min-height:180px`, flex column.
  - Lectura CRT (`.crt`) arriba-derecha: fuente arcade (`--font-arcade-crt`, VT323) 22px, color `--dorado`, opacidad 0.65. *Único lugar donde entra el toque arcade y el dorado.*
  - Número (`.num`): JetBrains Mono 12px `--cuero` ("Nº 01"…).
  - Nombre (`.sala-name`): Spectral 600 21px, `padding-right:34px` (no pisar el CRT).
  - Qué es (`.sala-what`): Spectral italic 15px, `--ink-soft`.
  - "Probar →" (`.sala-go`): Inter 12px 600, `--rojo`, al pie.
  - Hover: borde → `--ink`, `translateY(-3px)`.
  - Las 4: **La Data** ("22"), **El Anecdotario** ("···"), **Máquina de Frases** ("★"), **La Ruleta** ("07").

**Newsletter** (`.section.news#newsletter`)
- Centrado, máx 720px. Eyebrow "Suscripción quincenal" + `<h2>` + bajada + formulario (input email + botón `.btn-ink` "Suscribirme" → "Anotado ✓" al enviar). Placeholder del input: `lector@salehoy.ar`. Copy: "Nunca publicidad. Nunca el correo a terceros. Una sola lista, un solo editor."

**Footer** (`.foot#sobre`)
- Borde superior `1px solid var(--ink)`, padding 48px 0 64px.
- Grilla 4 columnas (`2fr 1fr 1fr 1fr`; 760px↓: 2 col):
  - **Marca**: wordmark + tagline "Revista cultural del juego y el azar. Editorial quincenal." + "CC BY-NC-SA 4.0 · Editor: Juan Boas".
  - **Editorial / La sala / Info**: títulos Spectral small-caps `--cuero`; items Spectral 16px con hover → `--rojo`.

---

### Pantalla 2 — Página de edición (`/ediciones/01`)

**Propósito:** entrada inmersiva a un número. Portada protagonista; al scrollear, carta del editor y las cinco notas.

#### Componentes

**Portada a sangre** (`.ed-cover`)
- `height: 100vh` (mín 560px), imagen de portada `object-fit:cover` (horizontal en desktop / vertical en mobile). Scrim inferior más alto (66%).
- Contenido (`.ed-content`, `inset:0`, flex column space-between, padding 30px 40px 44px):
  - Arriba: wordmark chico (~22px), papel.
  - Abajo:
    - Eyebrow "EDICIÓN #01 · MAYO 2026" (#01 en `#E2837C`).
    - **Título** (`.ed-title`): Spectral 700, `clamp(44px, 8vw, 92px)`, line-height 0.98, `letter-spacing:-0.025em`, color `#F8F1E0`, `text-shadow:0 2px 30px rgba(0,0,0,.5)`. Texto: **"La quiniela al diván"**.
    - **Bajada** (`.ed-deck`): Spectral italic `clamp(17px,2.4vw,23px)`, `#EADFC9`, máx 56ch.
    - Hint de scroll (`.ed-scroll-hint`): Inter 11px uppercase "SEGUÍ LEYENDO ↓".

**Carta del editor** (`.section > .letter`)
- Columna de lectura centrada **máx 640px**.
- Encabezado centrado: pill **"Texto provisional"** (`.provisional`, Inter 10px uppercase, borde hairline, `border-radius:999px`) + eyebrow "Carta del editor" + `<h2>` "Pasen, la cocina está abierta".
- Divisor ornamental (`.orn-rule`, `assets/ornament-rule.svg`, alto 16px, centrado).
- **Prosa** (`.sh-prose.sh-has-dropcap`): Spectral 18px, line-height ~1.65, con **drop cap en rojo** en el primer párrafo y sangría en los párrafos siguientes (convención editorial; viene del design system). Texto provisional de 4 párrafos (ver `data.jsx → EDITOR_LETTER`).
- **Firma** (`.letter-sign`): "Juan Boas" en Spectral italic 18px + rol "EDITOR · SALEHOY" en Inter 11px uppercase `--cuero`.

**Las cinco notas** (`.section`)
- Encabezado: eyebrow "Las cinco notas" + `<h2>` "En esta edición".
- **Misma grilla `.grid-feat`** que el sumario de la Home (feature grande + 4). Reutilizá el componente de tarjeta de artículo.

---

## Los cinco artículos (datos)

Orden (la primera es la destacada del número):

| # | Título | Eyebrow | Narrador (byline) | Acento |
|---|---|---|---|---|
| 1 ★ | La Babilonia de la esquina | Crónica | La Vichy · La Pitonisa | `--acento-vichy` #9B2226 |
| 2 | El número que vuelve | Nota clínica | María Lange · La Científica | `--acento-maria` #1F2B3D |
| 3 | Un pueblo soñando en clave de números | Crónica larga | Paulo Castillo · El Cronista | `--acento-paulo` #6B4423 |
| 4 | ¿Existen las rachas? | La Data | Tomás Vera · El Matemático | `--acento-tomas` #2D6043 |
| 5 | Hecha en Rosario | Ensayo histórico | Aníbal Belmonte · El Historiador | `--acento-anibal` #4A2818 |

Bajadas exactas y ornamento de cada narrador: ver `data.jsx`.

---

## Interacciones y comportamiento

- **Ruteo:** una sola app con dos vistas. Hash `#ediciones/01` → página de edición; vacío → Home. Al cambiar de vista, scroll al tope. (En producción usá rutas reales: `/` y `/ediciones/01`.)
- **Navegación interna:** "Entrar a la edición" (hero/botones) → edición. Links del masthead y footer hacen scroll suave a anclas (`#sala`, `#newsletter`, `#sobre`) o navegan.
- **Día/noche:** toggle conmuta `data-theme` en `<html>`, persiste en `localStorage("sh-theme")`. Tema oscuro = paleta cálida tostada (ver tokens dark abajo).
- **Reveal al scrollear:** elementos `.reveal` aparecen con fade + `translateY(16px)→0`, 600ms, easing `--ease-editorial`. Se dispara al entrar al viewport (umbral ~94% de la altura). Respetá `prefers-reduced-motion` → aparición instantánea.
  - *Nota de implementación:* en el codebase real usá un `IntersectionObserver` estándar (en el proto se usó un scan por scroll + poll por una limitación del entorno de previsualización; no hace falta replicar eso).
- **Hover tarjeta de artículo:** borde superior `--rule → --ink`, 1px→2px; título → `--rojo`. Sin sombra, sin escala.
- **Hover tarjeta de sala:** borde → `--ink`, `translateY(-3px)`.
- **Botones:** flecha "→" se desplaza 4px en hover. `.btn-ink` oscurece a `--rojo`.
- **Foco:** `2px solid var(--rojo)` con 2px offset, siempre visible.
- **Sin** bounces, springs, parallax ni scroll-jacking. La revista no "performa".

## Tweaks expuestos en el prototipo (opcional para producción)

Tres variables CSS en `:root`, controlables (panel de Tweaks en el proto):
- `--hero-overlay` (0.2–1.6, default 1): intensidad del velo sobre la portada.
- `--hero-title-scale` (0.8–1.35, default 1): tamaño del wordmark/eyebrow/título del hero.
- `--grid-gap` (14–48px, default 28): separación de la grilla de artículos.

Son útiles como "props" de afinado; no son obligatorios en producción.

## Manejo de estado

- `route`: `"home" | "edition"` (derivado del hash/URL).
- `theme`: `"light" | "dark"` (persistido en `localStorage`).
- `tweaks`: `{ heroOverlay, heroTitle, gridGap }` (sólo si se mantiene el panel de ajuste).
- Newsletter: estado local `sent: boolean`.
- Datos de artículos / sala / carta: estáticos (ver `data.jsx`). En producción vendrían del CMS.

---

## Design Tokens

> Fuente de verdad: `assets/colors_and_type.css` (copiado del SaleHoy Design System). **Usá los nombres de token, no hex sueltos.**

### Colores — modo día (claro)
| Token | Hex | Rol |
|---|---|---|
| `--paper-warm` | `#F4ECDC` | Fondo de página (siempre papel, nunca blanco/gris) |
| `--paper-warmer` | `#FAF3E2` | Superficie de tarjeta (más clara que la página) |
| `--paper-darker` | `#E8DCC0` | Hover/sunk, chips |
| `--ink` | `#1A1A1A` | Texto y titulares (nunca `#000`) |
| `--rojo` / `--accent` | `#9B2226` | Acento único por pantalla (drop cap, hairline, "Hoy") |
| `--cuero` / `--fg-meta` | `#6B4423` | Metadatos, captions, bylines, citas |
| `--dorado` / `--highlight` | `#C9A96E` | Sólo "jackpot"/La sala (CRT). Esporádico. |

Acentos de narrador: `--acento-vichy #9B2226`, `--acento-paulo #6B4423`, `--acento-anibal #4A2818`, `--acento-maria #1F2B3D`, `--acento-tomas #2D6043`.

### Colores — modo noche (oscuro)
Noche editorial cálida (definida en `assets/salehoy.css` bajo `:root[data-theme="dark"]`). El papel va a tono oscuro tostado, la tinta sube a crema cálida, los acentos se aclaran lo justo para leerse:
| Token | Hex (dark) |
|---|---|
| `--paper-warm` | `#15110C` |
| `--paper-warmer` | `#1E1812` |
| `--paper-darker` | `#271F17` |
| `--ink` | `#ECE3D0` |
| `--ink-soft` | `#D6CAB2` |
| `--ink-muted` | `#9C8E76` |
| `--rojo` | `#D2564E` |
| `--cuero` | `#C49A6B` |
| `--dorado` | `#DBBE82` |
| `--rule` | `#463A2A` |

### Tipografía
- **Spectral** (serif) — display, h1–h4, prosa, bajadas, drop caps. *La voz de la revista.*
- **Inter** (sans) — UI, botones, metadatos, labels, nav.
- **JetBrains Mono** — chips/lecturas técnicas (`--font-mono`).
- **VT323 / Press Start 2P** — sólo pantallas de dispositivos de La sala (`--font-arcade-crt`, `--font-arcade-pixel`). Nunca en prosa.
- Cuerpo editorial: 18px, line-height ~1.65, sangría desde el 2º párrafo, `text-wrap: pretty` (nunca `justify`).
- Escala de tamaños y pesos: tokens `--fs-12 … --fs-96`, `--fw-light … --fw-black` en `colors_and_type.css`.

### Espaciado, radios, sombras
- Escala de espaciado: `--s-0 … --s-14`. Padding estándar de tarjeta `--s-7` (24px). Quiebre de sección 80–120px (mínimo 64px).
- Radios: default `0`; inputs/botones `--radius-2` (~4–6px); tarjetas de dispositivo `--radius-3`. Nunca píldoras (excepto el toggle/pills de meta).
- Sombras: máximo `--shadow-soft`. Sin sombras de texto (salvo el hero sobre foto). El "levante" de las tarjetas viene del paso de color de fondo, no de elevación.
- Borde hairline: `1px solid var(--rule)`; estado activo `2px solid var(--ink)`.

### Animación
- Easing de entrada: `--ease-editorial` = `cubic-bezier(0.2,0,0,1)`. Toggles: `ease-in-out`.
- Duraciones: `--dur-fast` 120ms (hover), `--dur-base` 200ms (UI), `--dur-slow` 360ms (transición de página/modal).

---

## Assets

Todos incluidos en este bundle bajo `assets/` e `images/`:
- `images/portada-01-horizontal.png` — portada edición #01, hero de **escritorio** (1376×768). Bodegón fotográfico de objetos del juego argentino. *Imagen cargada → texto encima mínimo.*
- `images/portada-01-vertical.png` — misma portada, formato **mobile** (768×1376).
- `assets/trebol-tres.svg`, `trebol-tres-filled.svg` — trébol de tres hojas (ornamento de marca; **nunca cuatro**).
- `assets/ornament-rule.svg`, `ornament-asterism.svg` — divisores editoriales.
- `assets/ornamento-divan.svg` (María), `ornamento-surco.svg` (Paulo), `ornamento-barras.svg` (Tomás), `ornamento-pluma.svg` (Aníbal) — ornamentos por narrador (Vichy usa el trébol). Se usan como marca de agua en los placeholders de ilustración de cada nota.

**Pendiente de producción:**
- **No hay fotografía real** de las cinco notas todavía. Los bloques de ilustración son placeholders cálidos (papel/sepia + ornamento del narrador). Reemplazar por foto/ilustración real (vibra cálida, "bajo bombita amarilla", nunca B&N como decisión estilística).
- Fuentes: cargar Spectral, Inter, JetBrains Mono, VT323, Press Start 2P desde Google Fonts o self-host (ver `fonts/README.md` del design system).

---

## Archivos en este bundle

Referencias de diseño (recreá, no copies a producción):
- `SaleHoy.html` — punto de entrada del prototipo (carga React/Babel + los `.jsx` + CSS). `?m=1` fuerza el layout mobile; `#ediciones/01` abre la página de edición.
- `app.jsx` — shell: ruteo, día/noche, reveal, panel de Tweaks.
- `components.jsx` — todos los componentes (Masthead, Hero, ArticleCard, FeaturedGrid, Sala, Newsletter, Footer, EditionCover, EditorLetter, EditionArticles).
- `data.jsx` — datos: 5 artículos + narradores + dispositivos de La sala + carta del editor (texto provisional).
- `assets/salehoy.css` — estilos de la app + tema oscuro + helpers de layout/animación.
- `assets/colors_and_type.css` — **tokens del SaleHoy Design System** (fuente de verdad de colores/tipo/espaciado).
- `tweaks-panel.jsx` — panel de Tweaks (sólo herramienta de diseño; no necesario en producción).
- `assets/*.svg`, `images/*.png` — ornamentos y portadas.

### Layout responsive — nota técnica
El proto usa **container queries** (`@container app (max-width: …)`) en `.app` en vez de media queries, para poder previsualizar el layout mobile a cualquier ancho. En producción podés usar media queries normales (`@media`) si preferís; los breakpoints son los mismos: **980 / 900 / 760 / 720 / 620 / 520 px**.
