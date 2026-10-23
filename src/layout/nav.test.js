import test from 'node:test'
import assert from 'node:assert/strict'
import { activeNavId, navItems, pageTitle } from './nav.js'
import { iconNames } from '../ui/iconData.js'

test('menu utama: Algoritma, Materi, Quiz, Credit dengan ikon yang ada', () => {
  assert.deepEqual(navItems.map((n) => n.label), ['Algoritma', 'Materi', 'Quiz', 'Credit'])
  assert.deepEqual(navItems.map((n) => n.to), ['/', '/materi', '/quiz', '/credit'])
  for (const n of navItems) assert.ok(iconNames.includes(n.icon), `ikon ${n.icon}`)
})

test('activeNavId: halaman utama dan /algoritma aktif di Algoritma; sub-alamat ikut menu induknya', () => {
  assert.equal(activeNavId('/'), 'algoritma')
  assert.equal(activeNavId('/algoritma/dijkstra'), 'algoritma')
  assert.equal(activeNavId('/materi'), 'materi')
  assert.equal(activeNavId('/materi/04'), 'materi')
  assert.equal(activeNavId('/quiz/easy'), 'quiz')
  assert.equal(activeNavId('/credit'), 'credit')
  assert.equal(activeNavId('/materi-lama'), null, 'materi lama bukan bagian menu')
  assert.equal(activeNavId('/ui'), null)
})

test('pageTitle', () => {
  assert.equal(pageTitle('quiz'), 'Quiz')
  assert.equal(pageTitle(null), 'LABU')
})
