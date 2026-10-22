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

// Salinan token dari Figma (variabel "LABU · Warna" dan tabel Light & Dark di style guide): [nama, Light, Dark].
const FIGMA = [
  ['brand-orange', 'ff7f50', 'ff8f66'], ['brand-burnt', 'f0643a', 'ff7f50'], ['brand-rust', 'b4461f', 'ffb38f'],
  ['brand-yellow', 'ffd166', 'ffd166'], ['brand-mint', '06d6a0', '2fe0b3'], ['brand-blue', '118ab2', '4fb7d9'],
  ['brand-blue-strong', '0b6e8f', '7ccdea'], ['brand-stem', '571200', 'e8c07a'], ['brand-dark-stem', '240a03', 'f5f4ef'],
  ['bg-page', 'ffffff', '1f1e1d'], ['bg-surface', 'fff6db', '3a3220'], ['bg-mint-soft', 'e0faf2', '153a31'],
  ['bg-panel', 'f5f7f8', '2a2927'], ['bg-card', 'ffffff', '262524'], ['bg-placeholder', 'dce2e5', '3a3835'], ['bg-code', 'f8fafb', '191817'],
  ['text-primary', '240a03', 'f5f4ef'], ['text-secondary', '5c6670', 'b9c2c8'], ['text-heading', '571200', 'ffffff'],
  ['text-accent', 'b4461f', 'ffb38f'], ['text-link', '0b6e8f', '7ccdea'], ['text-on-burnt', '240a03', '1f1e1d'],
  ['text-on-orange', '240a03', '1f1e1d'], ['text-on-blue', '240a03', '1f1e1d'], ['text-on-error', 'ffffff', '1f1e1d'],
  ['border-default', 'e3e8ea', '3a3835'], ['border-strong', 'b4461f', 'ff8f66'], ['nav-active', '571200', 'ff8f66'],
  ['neutral-muted', '8a949b', '8e8a83'],
  ['status-success', '04a57b', '2fe0b3'], ['status-success-bg', 'e0faf2', '153a31'], ['status-success-text', '04785a', '7ff0cf'],
  ['status-error', 'd62839', 'ff6b7a'], ['status-error-bg', 'fde7ea', '3d1a1f'], ['status-error-text', 'b01f30', 'ff9aa5'],
  ['status-info', '118ab2', '4fb7d9'], ['status-info-bg', 'e3f3f9', '132e38'], ['status-info-text', '0b6e8f', '9ed8ee'],
  ['viz-unvisited', 'd5dce0', '4a4744'], ['viz-active', 'ff7f50', 'ff8f66'], ['viz-done', '571200', 'e8c07a'],
]

test('token warna: nilai Light dan Dark sama dengan Figma (41 token)', () => {
  assert.equal(FIGMA.length, 41)
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
    ['text-secondary', 'bg-page', 4.5], ['text-secondary', 'bg-panel', 4.5], ['text-link', 'bg-card', 4.5], ['text-link', 'status-info-bg', 4.5],
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

test('tiap token terpetakan ke utilitas Tailwind lewat @theme inline', () => {
  const theme = css.slice(css.indexOf('@theme inline'))
  for (const [name] of FIGMA) assert.ok(theme.includes(`var(--${name})`), `--${name} belum dipetakan di @theme`)
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
