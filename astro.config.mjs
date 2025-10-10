import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import node from '@astrojs/node'

export default defineConfig({
  site: 'https://www.fundaciontejiendoconocimiento.com/',
  integrations: [tailwind()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  style: { postcss: { plugins: [] } },
})
