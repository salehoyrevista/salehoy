// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// El sitemap se genera en src/pages/sitemap.xml.js. No se usa @astrojs/sitemap
// para que /sitemap-0.xml y /sitemap-index.xml no existan como archivos y
// Netlify pueda redirigirlos (ver public/_redirects).
export default defineConfig({
  site: 'https://salehoy.com.ar',
  build: {
    format: 'directory',
  },
});
