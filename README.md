# SaleHoy — Sitio web

Revista cultural del juego y el azar. Sitio nuevo construido con [Astro](https://astro.build/).

---

## Stack

- **Astro 5** — generador de sitio estático, ultra rápido.
- **Markdown** para todo el contenido (artículos, ediciones, narradores, voces).
- **CSS plano con variables** — sin Tailwind, sin frameworks. Diseño tipográfico editorial.
- **Google Fonts**: Spectral (display) + Inter (body) + JetBrains Mono (data).
- **Sitemap + RSS** automáticos.
- **Netlify** para deploy.

---

## Cómo arrancar

### 1. Instalar dependencias (solo la primera vez)

Desde la carpeta `sitio/` en una terminal:

```bash
npm install
```

Esto va a tardar entre 2 y 5 minutos. Descarga Astro y todas sus dependencias (unas 300 MB).

### 2. Ver el sitio localmente

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) en el navegador. El sitio se recarga solo cuando guardás cambios.

### 3. Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` con todo el sitio listo para subir a cualquier hosting.

### 4. Preview de producción local

```bash
npm run preview
```

Muestra cómo se va a ver el sitio compilado, antes de deployar.

---

## Estructura

```
sitio/
├── astro.config.mjs          Configuración Astro
├── package.json              Dependencias
├── tsconfig.json             TypeScript config
├── netlify.toml              Deploy config
├── public/                   Archivos estáticos
│   ├── favicon.svg
│   ├── robots.txt
│   ├── images/               Imágenes (vacío por ahora)
│   └── fonts/                Fuentes locales (vacío; ahora se usan Google Fonts)
├── src/
│   ├── content.config.ts     Definición de colecciones
│   ├── content/              CONTENIDO (Markdown)
│   │   ├── articulos/        5 artículos del #01
│   │   ├── narradores/       5 narradores con bio
│   │   ├── ediciones/        Tapas de cada edición
│   │   ├── voces/            Voces del número
│   │   └── cartas/           Carta del editor
│   ├── layouts/
│   │   └── BaseLayout.astro  Layout principal (head, header, footer)
│   ├── components/
│   │   ├── Header.astro      Header con navegación
│   │   ├── Footer.astro      Footer
│   │   └── ArticleCard.astro Card de artículo (3 tamaños)
│   ├── pages/
│   │   ├── index.astro                   Home
│   │   ├── sobre.astro                   Sobre SaleHoy
│   │   ├── newsletter.astro              Suscripción
│   │   ├── contacto.astro                Contacto
│   │   ├── aviso-legal.astro             Aviso legal + juego responsable
│   │   ├── privacidad.astro              Política privacidad
│   │   ├── ruleta.astro                  Generador aleatorio
│   │   ├── 404.astro                     Error 404
│   │   ├── rss.xml.js                    Feed RSS
│   │   ├── ediciones/
│   │   │   ├── index.astro               Archivo de ediciones
│   │   │   └── [slug].astro              Tapa de cada edición
│   │   ├── articulos/
│   │   │   └── [slug].astro              Página de cada artículo
│   │   ├── narradores/
│   │   │   ├── index.astro               Lista de narradores
│   │   │   └── [slug].astro              Página de cada narrador
│   │   ├── voces/
│   │   │   └── [slug].astro              Página de cada Voces del número
│   │   └── quiniela/
│   │       ├── index.astro               Motor estadístico (placeholder)
│   │       └── voces-del-numero.astro    Índice de Voces del número
│   └── styles/
│       ├── tokens.css                    Variables (colores, tipos, espacios)
│       ├── globals.css                   Reset + base + utilities
│       └── typography.css                Spectral, Inter, drop caps, blockquotes
└── dist/                                  (se genera con npm run build)
```

---

## Cómo agregar contenido

### Un artículo nuevo

Crear archivo en `src/content/articulos/[slug].md`:

```markdown
---
title: "Título del artículo"
subtitle: "Subtítulo opcional"
narrador: la-cientifica       # uno de: el-matematico, la-cientifica, la-pitonisa, el-cronista, el-historiador
edicion: "02"
categoria: ciencia             # uno de: ciencia, historia, cultura, mistica
tema: "tema opcional"
fecha: 2026-06-15
palabras: 400
tiempoLectura: 3
destacado: false
---

Cuerpo del artículo en Markdown...
```

Listo. Astro lo levanta automáticamente, lo asocia al narrador, le hace su URL (`/articulos/[slug]`), aparece en la home y en la página del narrador.

### Una nueva edición

Crear archivo en `src/content/ediciones/[numero].md`:

```markdown
---
numero: "02"
titulo: "Título temático"
bajada: "Bajada del número."
fecha: 2026-06-15
sumario: "Sumario corto."
---

Texto de introducción del número.
```

### Voces del número

Crear archivo en `src/content/voces/[numero-nombre].md`:

```markdown
---
numero: "17"
nombre: "La desgracia"
edicion: "02"
fecha: 2026-06-08
intro: "Intro opcional."
---

## El Matemático

Texto del Matemático...

## La Científica

Texto de la Científica...
```

---

## Deploy a Netlify

### Primera vez

1. Subir el proyecto a un repositorio Git (GitHub o GitLab).
2. En Netlify, crear un nuevo sitio desde el repo.
3. Netlify detecta automáticamente Astro y usa el `netlify.toml` para configurar build.
4. Hacer deploy.

### Cada vez que actualizás

Solo `git push`. Netlify rebuild automáticamente.

---

## Pendientes para sumar

- [ ] **Newsletter (Beehiiv)**: crear cuenta, obtener form ID, reemplazar en `newsletter.astro` el form simulado por el embed real.
- [ ] **Motor estadístico**: portar el JS de la versión anterior (`salehoy.netlify.app`) al nuevo entorno. Por ahora `/quiniela` es placeholder.
- [ ] **Pictogramas de narradores**: 5 SVG coherentes.
- [ ] **Imágenes Open Graph**: generar las tapas de cada artículo y edición para que aparezca lindo al compartir en redes.
- [ ] **Tratamiento fotográfico**: cuando Pedro tenga las fotos, subirlas a `public/images/` y referenciarlas en el frontmatter de cada artículo.
- [ ] **Analytics**: agregar Google Analytics o Plausible al BaseLayout.
- [ ] **Modo claro/oscuro**: ya está implementado, falta probarlo a fondo.

---

## Notas

- Los archivos Markdown del `src/content/` son la **fuente de verdad**. Editar ahí, no en HTML.
- Cualquier cambio en `content.config.ts` requiere reiniciar `npm run dev`.
- El sitio compilado pesa ~200 KB (con fuentes en CDN). Lighthouse score esperado: 95+ en performance.
- Sin JS bloqueante: las únicas interacciones son toggle de modo y menú móvil, ambas ligeras.

---

Mantenido con cariño. ✨
