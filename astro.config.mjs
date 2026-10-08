// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://salehoy.com.ar',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
