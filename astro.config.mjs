import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://funteco.org',
  integrations: [tailwind()],
  output: 'static',

  // SOLUCIÓN: crea el objeto style.postcss para que Tailwind tenga dónde
  // inyectar sus plugins. La propiedad plugins puede permanecer vacía.
  style: {
    postcss: {
      plugins: [],
    },
  },
});
