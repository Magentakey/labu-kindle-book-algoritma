import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const css = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')

/** Membaca semua custom property (--nama: nilai) dari satu blok. */
const parseBlock = (selector) => {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `blok ${selector}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]))
}
const light = parseBlock(':root')
const dark = parseBlock(":root[data-theme='dark']")

// Salinan token dari Figma Style Guide v1.0: [nama, Light, Dark, terpetakan ke Tailwind]. border-strong dan brand-rust "tidak dipakai".
const FIGMA = [
  ['brand-orange', 'ff7f50', 'ff8f66', true],
  ['brand-burnt', 'f0643a', 'ff7f50', true],
  ['brand-yellow', 'ffd166', 'ffd166', true],
  ['brand-yellow-strong', 'd9a400', 'ffd166', true],
  ['brand-mint', '06d6a0', '2fe0b3', true],
  ['brand-blue', '118ab2', '4fb7d9', true],
  ['brand-blue-strong', '0b6e8f', '7ccdea', true],
  ['brand-stem', '571200', 'e8c07a', true],
  ['brand-dark-stem', '240a03', 'f5f4ef', true],
  ['brand-rust', 'b4461f', 'ffb38f', false],
  ['bg-page', 'ffffff', '1f1e1d', true],
  ['bg-surface', 'fff6db', '3a3220', true],
  ['bg-orange-soft', 'fff0ea', '3a2620', true],
  ['bg-panel', 'f5f7f8', '2a2927', true],
  ['bg-card', 'ffffff', '262524', true],
  ['bg-placeholder', 'dce2e5', '3a3835', true],
  ['bg-code', 'f8fafb', '191817', true],
  ['text-primary', '240a03', 'f5f4ef', true],
  ['text-secondary', '5c6670', 'b9c2c8', true],
  ['text-heading', '571200', 'ffffff', true],
  ['text-accent', '571200', 'e8c07a', true],
  ['text-link', 'b4461f', 'ffb38f', true],
  ['text-control', '0b6e8f', '7ccdea', true],
  ['text-on-control', 'ffffff', '0e1a1f', true],
  ['text-on-orange', '240a03', '1f1e1d', true],
  ['text-on-burnt', '240a03', '1f1e1d', true],
  ['text-on-blue', '240a03', '1f1e1d', true],
  ['text-on-error', 'ffffff', '1f1e1d', true],
  ['border-default', 'e3e8ea', '3a3835', true],
  ['border-strong', 'b4461f', 'ff8f66', false],
  ['nav-active', '571200', 'ff8f66', true],
  ['neutral-muted', '8a949b', '8e8a83', true],
  ['status-success', '04a57b', '2fe0b3', true],
  ['status-success-bg', 'e0faf2', '153a31', true],
  ['status-success-text', '04785a', '7ff0cf', true],
  ['status-error', 'd62839', 'ff6b7a', true],
  ['status-error-bg', 'fde7ea', '3d1a1f', true],
  ['status-error-text', 'b01f30', 'ff9aa5', true],
  ['status-info', '118ab2', '4fb7d9', true],
  ['status-info-bg', 'e3f3f9', '132e38', true],
  ['status-info-text', '0b6e8f', '9ed8ee', true],
  ['viz-unvisited', 'd5dce0', '4a4744', true],
  ['viz-active', 'ff7f50', 'ff8f66', true],
  ['viz-done', '06d6a0', '2fe0b3', true],
]

test('token warna: nilai Light dan Dark sama dengan Figma (44 token)', () => {
  assert.equal(FIGMA.length, 44)
  for (const [name, l, d] of FIGMA) {
    assert.equal(light[name], `#${l}`, `${name} (light)`)
    assert.equal(dark[name], `#${d}`, `${name} (dark)`)
  }
})

test('mode gelap mendefinisikan ulang setiap token warna yang dimiliki mode terang (kecuali cincin fokus yang punya nilai sendiri)', () => {
  for (const k of Object.keys(light)) assert.ok(k in dark, `token ${k} belum punya nilai gelap`)
})

test('kontras teks pada pasangan token utama memenuhi WCAG AA (≥ 4,5:1), dan teks utama/tombol oranye ≥ 7:1', () => {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  // Catatan temuan: di mode terang, teks di atas brand-burnt (hover tombol) 5,88:1 dan di atas brand-blue 4,74:1.
  // Keduanya lolos AA tetapi di bawah 7:1 yang disebut style guide ("teks di atas warna palet ≥ 7:1").
  const pairs = [
    ['text-on-orange', 'brand-orange', 7], ['text-primary', 'bg-page', 7], ['text-primary', 'bg-card', 7], ['text-heading', 'bg-page', 7],
    ['text-on-burnt', 'brand-burnt', 4.5], ['text-on-blue', 'brand-blue', 4.5],
    ['text-on-control', 'brand-blue-strong', 4.5], ['text-secondary', 'bg-page', 4.5], ['text-secondary', 'bg-panel', 4.5],
    ['text-link', 'bg-card', 4.5], ['text-link', 'bg-orange-soft', 4.5], ['text-control', 'bg-card', 4.5], ['text-control', 'status-info-bg', 4.5],
    ['text-accent', 'bg-page', 4.5], ['text-accent', 'bg-surface', 4.5],
    ['status-success-text', 'status-success-bg', 4.5], ['status-error-text', 'status-error-bg', 4.5], ['status-info-text', 'status-info-bg', 4.5],
  ]
  for (const [theme, t] of [['light', light], ['dark', dark]]) {
    for (const [fg, bg, min] of pairs) {
      const r = ratio(t[fg], t[bg])
      assert.ok(r >= min, `${theme}: ${fg} di atas ${bg} hanya ${r.toFixed(2)}:1 (minimal ${min})`)
    }
  }
})

test('putih di atas Coral gagal kontras (2,5:1), itu sebabnya teks di atas Coral selalu gelap', () => {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const r = (1 + 0.05) / (lum(light['brand-orange']) + 0.05)
  assert.ok(r < 3 && r > 2.4, `putih di Coral ${r.toFixed(2)}:1`)
  assert.equal(light['text-on-orange'], '#240a03')
})

test('arti warna: text-link = Coral Tua (pindah), text-control = Biru Tua (kontrol), text-accent = Stem Brown (label)', () => {
  assert.equal(light['text-link'], '#b4461f')
  assert.equal(light['text-control'], '#0b6e8f')
  assert.equal(light['text-accent'], '#571200')
  assert.equal(light['viz-done'], light['brand-mint'], 'elemen selesai di kanvas = Mint')
})

test('tiap token terpetakan ke utilitas Tailwind lewat @theme inline', () => {
  const theme = css.slice(css.indexOf('@theme inline'))
  for (const [name, , , dipakai] of FIGMA) assert.equal(theme.includes(`var(--${name})`), dipakai, `--${name}: pemetaan @theme`)
  for (const font of ['--font-ui', '--font-code', '--font-pixel']) assert.ok(theme.includes(font))
  for (const sh of ['--shadow-block', '--shadow-hover', '--shadow-popover', '--shadow-glow']) assert.ok(theme.includes(sh))
})

test('gaya teks Figma tersedia sebagai utilitas (16 gaya)', () => {
  const names = [...css.matchAll(/@utility (text-[\w-]+)/g)].map((m) => m[1])
  assert.equal(names.length, 16)
  assert.ok(css.includes('font-size: 32px; line-height: 40px; font-weight: 700'))
})

test('font Poppins, JetBrains Mono, dan Silkscreen dimuat lokal (@fontsource), bukan dari CDN', () => {
  assert.equal([...css.matchAll(/@import '@fontsource\/([\w-]+)\/latin-(\d+)\.css'/g)].length, 7)
  assert.doesNotMatch(css, /fonts\.googleapis|https?:\/\//)
})
