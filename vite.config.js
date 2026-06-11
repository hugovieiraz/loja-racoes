import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// base './' = caminhos relativos, funciona no GitHub Pages
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // Service worker: faz o app abrir mesmo sem internet
    VitePWA({
      registerType: 'prompt',
      manifest: false, // usamos o public/manifest.json
      includeAssets: ['logo.svg', 'apple-touch-icon.png', 'icone-192.png', 'icone-512.png', 'manifest.json'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
