import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://www.fundaciontejiendoconocimiento.com/',
  integrations: [tailwind()],
  output: 'static',
  style: { postcss: { plugins: [] } },
})
