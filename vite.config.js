import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/labu-kindle-book-algoritma/', // harus sama persis dengan nama repo
  plugins: [react(), tailwindcss()],
})