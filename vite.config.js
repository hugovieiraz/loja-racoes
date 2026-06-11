import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' = caminhos relativos, funciona no GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
