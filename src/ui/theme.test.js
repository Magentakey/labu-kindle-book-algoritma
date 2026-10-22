import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { THEME_KEY, oppositeTheme, readPreference, resolveTheme, writePreference } from './theme.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const memory = (init = {}) => {
  const m = { ...init }
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, removeItem: (k) => { delete m[k] }, dump: () => m }
}

test('readPreference: hanya light dan dark yang dianggap pilihan; selain itu ikut perangkat', () => {
  assert.equal(readPreference(memory({ [THEME_KEY]: 'dark' })), 'dark')
  assert.equal(readPreference(memory({ [THEME_KEY]: 'light' })), 'light')
  assert.equal(readPreference(memory({ [THEME_KEY]: 'biru' })), 'system')
  assert.equal(readPreference(memory()), 'system')
  assert.equal(readPreference(undefined), 'system')
  assert.equal(readPreference({ getItem: () => { throw new Error('diblokir') } }), 'system')
})

test('resolveTheme: pilihan tetap menang; sistem mengikuti perangkat', () => {
  assert.equal(resolveTheme('dark', false), 'dark')
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('system', false), 'light')
})

test('oppositeTheme dan writePreference: tombol menyimpan kebalikan, sistem menghapus pilihan', () => {
  assert.equal(oppositeTheme('light'), 'dark')
  assert.equal(oppositeTheme('dark'), 'light')
  const s = memory()
  writePreference(s, 'dark')
  assert.deepEqual(s.dump(), { [THEME_KEY]: 'dark' })
  writePreference(s, 'system')
  assert.deepEqual(s.dump(), {})
  assert.doesNotThrow(() => writePreference({ setItem: () => { throw new Error('penuh') }, removeItem: () => {} }, 'dark'))
})

test('skrip tema di index.html memakai kunci yang sama dan memasang data-theme sebelum render', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  assert.ok(html.includes(`'${THEME_KEY}'`))
  assert.match(html, /prefers-color-scheme: dark/)
  assert.match(html, /dataset\.theme = dark \? 'dark' : 'light'/)
  assert.ok(html.indexOf('labu-theme') < html.indexOf('src/main.jsx'), 'skrip tema harus sebelum aplikasi dimuat')
})
