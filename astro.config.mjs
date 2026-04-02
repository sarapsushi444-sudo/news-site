import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://sarapsushi444-sudo.github.io',
  base: '/news-site',
  output: 'static',
});
