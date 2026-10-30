// Pembantu tes render: memuat modul .jsx lewat Vite (SSR) lalu merendernya ke HTML dengan react-dom/server.
// Tanpa jsdom dan tanpa paket tambahan. Efek (useEffect) tidak berjalan di SSR, jadi yang diuji adalah keluaran render awal.
import process from 'node:process'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

export async function startSsr() {
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    appType: 'custom',
    logLevel: 'silent',
    plugins: [react()],
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  /** Memuat komponen default (atau ekspor bernama) dari path relatif terhadap root proyek. */
  const load = async (path, name = 'default') => (await server.ssrLoadModule(path))[name]
  /** Merender elemen di dalam MemoryRouter pada `url`. @returns {string} HTML */
  const render = (element, url = '/') => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, element))
  return { load, render, createElement, close: () => server.close() }
}

/** Menghitung kemunculan pola (RegExp global atau string) di HTML. */
export const hitung = (html, pola) => (html.match(typeof pola === 'string' ? new RegExp(pola, 'g') : pola) ?? []).length
