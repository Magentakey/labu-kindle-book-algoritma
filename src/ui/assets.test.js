import test from 'node:test'
import assert from 'node:assert/strict'
import { iconData, iconNames } from './iconData.js'
import { logoFullInner, logoMarkInner, mascotInner, mascotNames } from './brandArt.js'
import { readFileSync } from 'node:fs'
import { chipTypes } from './uiLogic.js'

const count = (s, tag) => (s.match(new RegExp(`<${tag}[ >/]`, 'g')) || []).length

test('ikon: 47 ikon dari Figma, semuanya mengikuti currentColor (tanpa warna tetap)', () => {
  assert.equal(iconNames.length, 47)
  for (const name of ['search', 'play', 'pause', 'back', 'fwd', 'reset', 'download', 'offline', 'wifioff', 'moon', 'sun', 'install', 'algo', 'quiz', 'compare', 'filter']) assert.ok(name in iconData, name)
  for (const [name, inner] of Object.entries(iconData)) {
    assert.ok(count(inner, 'path') >= 1, `${name}: tanpa path`)
    assert.doesNotMatch(inner, /#[0-9a-f]{3,6}/i, `${name}: warna tetap`)
    assert.doesNotMatch(inner, /<svg|<\/svg/, `${name}: berisi pembungkus svg`)
  }
})

test('ikon solid (play, pause, back, fwd) berisi bentuk padat, ikon lain hanya garis', () => {
  for (const [name, inner] of Object.entries(iconData)) {
    const solid = inner.includes('fill="currentColor"')
    assert.equal(solid, ['play', 'pause', 'back', 'fwd'].includes(name), name)
  }
})

test('logo: jumlah bentuk sama dengan Figma (mark 15 persegi + 38 garis; lengkap = mark + 2 path teks + garis bawah)', () => {
  assert.equal(count(logoMarkInner, 'rect'), 15)
  assert.equal(count(logoMarkInner, 'line'), 38)
  assert.equal(count(logoFullInner, 'rect'), 16)
  assert.equal(count(logoFullInner, 'path'), 2)
  assert.ok(logoFullInner.includes('scale(0.307692)'))
})

test('logo: warna coklat mengikuti tema (variabel CSS), bata oranye tetap', () => {
  for (const inner of [logoMarkInner, logoFullInner]) {
    assert.ok(inner.includes('var(--brand-dark-stem)') && inner.includes('var(--brand-stem)'))
    assert.ok(inner.includes('#F26404') && inner.includes('#C75000'))
    assert.doesNotMatch(inner, /#240A03|#571200/i)
  }
})

test('maskot: 5 ekspresi dengan jumlah bentuk sama dengan Figma (15, 15, 18, 16, 21)', () => {
  assert.deepEqual(mascotNames, ['netral', 'senang', 'berpikir', 'kaget', 'merayakan'])
  assert.deepEqual(mascotNames.map((n) => count(mascotInner(n), 'path')), [15, 15, 18, 16, 21])
})

test('chip: 8 tipe dari Figma, dan Chip.jsx punya gaya untuk tiap tipe', () => {
  assert.deepEqual(chipTypes, ['default', 'prasyarat', 'bab', 'sedang', 'sukses', 'gagal', 'info', 'kode'])
  const src = readFileSync(new URL('./Chip.jsx', import.meta.url), 'utf8')
  for (const t of chipTypes) assert.match(src, new RegExp(`^  ${t}: \\{`, 'm'), `gaya chip ${t}`)
})
