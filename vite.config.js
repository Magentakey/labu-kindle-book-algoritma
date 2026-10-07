import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/labu-kindle-book-algoritma/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Labu I-Learning Algoritma',
        short_name: 'Labu Algo',
        description: 'Belajar algoritma secara interaktif',
        lang: 'id',
        id: '/labu-kindle-book-algoritma/',
        start_url: '/labu-kindle-book-algoritma/',
        scope: '/labu-kindle-book-algoritma/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f46505',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screenshot-wide.png', sizes: '2560x1440', type: 'image/png', form_factor: 'wide', label: 'Daftar materi di tampilan desktop' },
          { src: 'screenshot-mobile.png', sizes: '780x1688', type: 'image/png', form_factor: 'narrow', label: 'Daftar materi di tampilan HP' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        globIgnores: ['screenshot-*.png'],
      },
    }),
  ],
})