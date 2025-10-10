// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://www.fundaciontejiendoconocimiento.com/',
  integrations: [tailwind()],
  output: 'server',           // <- importante
  style: { postcss: { plugins: [] } },
})
