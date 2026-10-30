import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Menjaga kontras WCAG 1.4.3 (teks biasa 4,5 : 1) pada pasangan warna di tokens.css, mode terang dan gelap.
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')

function blok(selector) {
  const i = css.indexOf(selector)
  assert.ok(i >= 0, `blok ${selector} tidak ditemukan`)
  const start = css.indexOf('{', i)
  let depth = 0
  for (let k = start; k < css.length; k++) {
    if (css[k] === '{') depth++
    if (css[k] === '}' && --depth === 0) return css.slice(start, k)
  }
  throw new Error('blok tidak tertutup')
}
const parse = (b) => Object.fromEntries([...b.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]))
const terang = parse(blok(':root {'))
const gelap = { ...terang, ...parse(blok(":root[data-theme='dark']")) }

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const rasio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

test('rasio: hitam di atas putih 21:1', () => assert.ok(Math.abs(rasio('#000000', '#ffffff') - 21) < 0.01))

// [teks, latar] untuk tiap tema
const pasangan = [
  ...['syn-comment', 'syn-keyword', 'syn-number', 'syn-atom', 'syn-string', 'syn-builtin'].flatMap((s) => [
    [s, 'bg-code'],
    [s, 'bg-line-active'],
  ]),
  ['text-primary', 'bg-code'],
  ['text-primary', 'bg-selection'],
  ['text-secondary', 'bg-code'],
  ['text-primary', 'bg-line-active'],
  ['text-control', 'bg-card'],
  ['text-control', 'bg-code'],
  ['text-on-control', 'brand-blue-strong'],
  ['text-secondary', 'bg-panel'],
  ['text-secondary', 'bg-card'],
  ['text-primary', 'bg-placeholder'], // tab Segmented non-aktif
  ['text-primary', 'bg-surface'],
  ['status-success-text', 'status-success-bg'],
  ['text-primary', 'status-error-bg'],
]

for (const [nama, tema] of [['terang', terang], ['gelap', gelap]]) {
  test(`kontras ≥ 4,5 : 1 pada pasangan penting (${nama})`, () => {
    const gagal = []
    for (const [fg, bg] of pasangan) {
      assert.ok(tema[fg] && tema[bg], `token ${fg} atau ${bg} tidak ada`)
      const r = rasio(tema[fg], tema[bg])
      if (r < 4.5) gagal.push(`${fg} ${tema[fg]} di atas ${bg} ${tema[bg]} = ${r.toFixed(2)}`)
    }
    assert.deepEqual(gagal, [])
  })
}
