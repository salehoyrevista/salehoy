# SaleHoy — Sitio web

Revista cultural del juego y el azar. Construido con [Astro](https://astro.build/).

---

## Stack

- **Astro 5** — generador de sitio estático, Content Collections para todo el contenido.
- **Markdown** para el contenido editorial (artículos, ediciones, cartas, narradores, voces, recomendaciones).
- **CSS plano con variables** (`src/styles/tokens.css`) — sin Tailwind, sin frameworks. Diseño tipográfico editorial.
- **React** para componentes puntuales con interacción (La Vichy).
- **Tipografías**: Spectral (display) + Inter (body) + JetBrains Mono (data) — más VT323 y Press Start 2P para el arcade de La Sala.
- **Sitemap + RSS** automáticos (`@astrojs/sitemap`).
- **Google Analytics 4** en producción (`src/components/Analytics.astro`).
- **Netlify** para deploy + Netlify Functions (`netlify/functions/likes.mjs`) + Netlify Forms (Anecdotario).
- **Beehiiv** para el newsletter (embed pendiente, ver Pendientes).

---

## Cómo arrancar

### 1. Instalar dependencias (solo la primera vez)

Desde la carpeta `sitio/` en una terminal:

```bash
npm install
```

### 2. Ver el sitio localmente

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321). El sitio se recarga solo cuando guardás cambios.

### 3. Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` (no se commitea, está en `.gitignore`).

### 4. Preview de producción local

```bash
npm run preview
```

---

## Estructura

```
sitio/
├── astro.config.mjs          Configuración Astro (site: salehoy.com.ar)
├── netlify.toml               Build, functions, redirects, headers
├── src/
│   ├── content.config.ts      Schemas de las 6 colecciones
│   ├── content/                CONTENIDO (Markdown, fuente de verdad)
│   │   ├── articulos/          Artículos, uno por narrador y edición
│   │   ├── cartas/              Carta del editor, una por edición
│   │   ├── ediciones/           Metadata de cada número (título, tapa, fecha)
│   │   ├── narradores/          Los 5 narradores (bio, tono, pictograma)
│   │   ├── recomendaciones/     El Trío — una entrada por obra (película/libro/disco)
│   │   └── voces/                Voces del número (mini-sección coral)
│   ├── layouts/
│   │   ├── BaseLayout.astro     Layout principal (head, OG/Twitter meta, Header, Footer)
│   │   └── LaDataLayout.astro   Layout de las páginas de La Data
│   ├── components/              Header, Footer, ArticleCard, ElTrio, VocasCarta,
│   │                             SalaHeader, ShareButtons, Analytics, LaData*, la-vichy/LaVichy.jsx
│   ├── lib/la-data.ts           Helpers de La Data
│   ├── data/                    JSON de La Data por mes + dataset de La Vichy + frases
│   └── pages/
│       ├── index.astro                    Home (hero = última edición por fecha)
│       ├── ediciones/                     Archivo + página de cada número + su carta
│       ├── articulos/[slug].astro         Página de artículo
│       ├── narradores/                    Lista + página de cada narrador
│       ├── voces/[slug].astro             Página de Voces del número
│       ├── el-trio/                       Índice + página de cada recomendación
│       ├── la-data/                        Informe estadístico (mensual, por zona, comparativa)
│       ├── la-sala.astro                   Portal a los 5 dispositivos vivos
│       ├── la-vichy.astro                  La Pitonisa (tabla de los sueños)
│       ├── maquina-de-frases.astro
│       ├── anecdotario.astro
│       ├── ruleta.astro                    El Generador
│       ├── quiniela/                       Hub que redirige a La Data / La Sala
│       ├── sobre.astro, contacto.astro, newsletter.astro,
│       │   aviso-legal.astro, privacidad.astro, 404.astro
│       └── rss.xml.js
├── netlify/functions/likes.mjs  Función serverless (likes)
└── dist/                          (se genera con npm run build, no se commitea)
```

---

## Cómo agregar contenido

### Un artículo nuevo

Crear archivo en `src/content/articulos/[slug].md` (sin prefijo de número — el slug solo):

```markdown
---
title: "Título del artículo"
subtitle: "Subtítulo opcional"
narrador: la-cientifica       # el-matematico | la-cientifica | la-pitonisa | el-cronista | el-historiador
edicion: "03"
categoria: ciencia             # ciencia | historia | cultura | mistica
tema: "tema opcional"
fecha: 2026-08-01
palabras: 400
tiempoLectura: 3
destacado: false               # true si va a la grilla de Destacados de la home
imagen: /img/articulos/03/slug.webp
---

Cuerpo del artículo en Markdown...
```

### Una nueva edición

Crear `src/content/ediciones/[numero].md`:

```markdown
---
numero: "03"
titulo: "Título temático"
bajada: "Tagline del número."
fecha: 2026-08-01
sumario: "Sumario corto."
tapa: "/img/portadas/03-h.webp"
---

Texto de introducción del número.
```

`numero`, `fecha` y `edicion` (en artículos/cartas/voces/recomendaciones) son los campos que enlazan todo entre sí — tienen que matchear exactamente como string.

### Voces del número

`src/content/voces/[numero-nombre].md`, con los 5 narradores como headers `## `:

```markdown
---
numero: "17"
nombre: "La desgracia"
edicion: "03"
fecha: 2026-08-01
intro: "Intro opcional."
---

## El Matemático

Texto del Matemático...

## La Científica

Texto de la Científica...
```

### El Trío (recomendaciones)

Un archivo por obra en `src/content/recomendaciones/[slug].md` (ver `casino.md` como referencia): `tipo` (pelicula/libro/disco), `titulo`, `autor`, `edicion`, `fecha`, `imagen`, `narrador`. La página `/el-trio` agrupa automáticamente por `edicion`; no hace falta archivar nada a mano.

### Imágenes

Van en `public/img/`, organizadas por tipo y número (`articulos/03/`, `portadas/`, `trio/03/`). Artículos en WebP, recorte 3:2, idealmente bajo 300 KB. Portadas horizontal (`NN-h`) y vertical (`NN-v`) — el hero de la home las detecta automáticamente (soporta `.webp` o `.png`).

---

## Deploy a Netlify

### Primera vez

1. Subir el proyecto a GitHub (`salehoyrevista/salehoy`).
2. En Netlify, crear un sitio desde el repo.
3. Netlify detecta Astro y usa `netlify.toml` para build, functions, redirects y headers.
4. Deploy.

### Cada vez que actualizás

`git push` a `master`. Netlify rebuildea automático.

---

## Pendientes para sumar

- [ ] **Newsletter (Beehiiv)**: crear cuenta, obtener form ID, reemplazar en `newsletter.astro` el form simulado por el embed real.
- [ ] **Pictogramas de narradores**: cada narrador tiene un campo `pictograma` (ej. "espiral", "pluma") pero es texto sin uso — faltan los 5 SVG y conectarlos donde corresponda.
- [ ] **Tratamiento fotográfico**: cuando haya fotos propias, subirlas a `public/img/` y referenciarlas en el frontmatter.
- [ ] **Modo claro/oscuro**: implementado en el Header, falta probarlo a fondo en todas las páginas.
- [ ] **Motor de La Data**: portar/ampliar el histórico de meses anteriores a junio 2026 si aparece data vieja para cargar.

---

## Notas

- Los archivos Markdown de `src/content/` son la **fuente de verdad**. Editar ahí, no en HTML.
- Cualquier cambio en `content.config.ts` requiere reiniciar `npm run dev`.
- Licencia de contenido: CC BY-NC-SA 4.0.
- Vichy y credenciales sensibles: solo en variables de entorno de Netlify, nunca en el repo.

---

Mantenido con cariño. ✨
