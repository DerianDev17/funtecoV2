import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import netlify from '@astrojs/netlify'   // adapter moderno para Astro 5

export default defineConfig({
  site: 'https://www.fundaciontejiendoconocimiento.com/',
  integrations: [tailwind()],
  output: 'server',                      // necesario para rutas POST
  adapter: netlify({ edgeMiddleware: false }), // usa Functions (más simple)
  style: { postcss: { plugins: [] } },   // tu fix de Tailwind
})
