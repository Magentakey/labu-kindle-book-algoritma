import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { MAX_TOASTS, TOAST_DEFAULT_MS, makeToast, toastKinds, toastReducer } from './toastLogic.js'
import { INSTALL_DISMISS_DAYS, INSTALL_DISMISS_KEY, dismissInstall, isInstallDismissed } from './installLogic.js'
import { GALERI_TUTUP_KEY, readCollapsed, writeCollapsed } from '../lib/galeriState.js'
import { base, buttonVariants, iconButtonVariants, off, sizes } from './buttonStyles.js'
import { iconNames } from './iconData.js'

const memory = (init = {}) => {
  const m = { ...init }
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, removeItem: (k) => { delete m[k] }, dump: () => m }
}

test('toast: jenis dari Figma (update, sukses, error, offline) memakai ikon yang ada; hanya error yang mendesak', () => {
  assert.deepEqual(Object.keys(toastKinds), ['update', 'success', 'error', 'offline', 'info'])
  for (const k of Object.values(toastKinds)) assert.ok(iconNames.includes(k.icon), k.icon)
  assert.deepEqual(Object.entries(toastKinds).filter(([, v]) => v.urgent).map(([k]) => k), ['error'])
  assert.equal(TOAST_DEFAULT_MS, 5000)
})

test('toastReducer: menambah, menutup, membatasi 3 toast, dan tidak menggandakan pesan yang sama', () => {
  const a = makeToast({ kind: 'update', message: 'Versi baru tersedia' })
  const b = makeToast({ kind: 'success', message: 'Tersimpan' })
  assert.notEqual(a.id, b.id)
  assert.equal(a.duration, 5000)
  let s = toastReducer([], { type: 'add', toast: a })
  s = toastReducer(s, { type: 'add', toast: b })
  assert.deepEqual(s.map((t) => t.kind), ['update', 'success'])
  assert.equal(toastReducer(s, { type: 'add', toast: makeToast({ kind: 'update', message: 'Versi baru tersedia' }) }).length, 2, 'tidak digandakan')
  s = toastReducer(s, { type: 'dismiss', id: a.id })
  assert.deepEqual(s.map((t) => t.id), [b.id])
  let many = []
  for (let i = 0; i < 6; i++) many = toastReducer(many, { type: 'add', toast: makeToast({ message: `pesan ${i}` }) })
  assert.equal(many.length, MAX_TOASTS)
  assert.deepEqual(many.map((t) => t.message), ['pesan 3', 'pesan 4', 'pesan 5'])
  assert.deepEqual(toastReducer(many, { type: 'clear' }), [])
  assert.deepEqual(toastReducer(s, { type: 'add', toast: makeToast({ message: '' }) }), s, 'pesan kosong diabaikan')
  assert.equal(makeToast({ kind: 'aneh', message: 'x' }).kind, 'info')
})

test('banner Pasang: tertunda 14 hari setelah "Nanti", lalu muncul lagi', () => {
  const s = memory()
  const t0 = Date.UTC(2026, 9, 23)
  assert.equal(isInstallDismissed(s, t0), false)
  dismissInstall(s, t0)
  assert.equal(s.dump()[INSTALL_DISMISS_KEY], String(t0))
  assert.equal(isInstallDismissed(s, t0 + 13 * 86400000), true)
  assert.equal(isInstallDismissed(s, t0 + INSTALL_DISMISS_DAYS * 86400000), false)
  assert.equal(isInstallDismissed(memory({ [INSTALL_DISMISS_KEY]: 'rusak' }), t0), false)
  assert.equal(isInstallDismissed(memory({ [INSTALL_DISMISS_KEY]: String(t0 + 999999) }), t0), false, 'waktu di masa depan diabaikan')
  assert.equal(isInstallDismissed({ getItem: () => { throw new Error('x') } }, t0), false)
  assert.doesNotThrow(() => dismissInstall({ setItem: () => { throw new Error('penuh') } }, t0))
})

test('status lipat grup galeri: disimpan, dibaca ulang, dan nilai rusak atau id asing diabaikan', () => {
  const s = memory()
  assert.deepEqual([...readCollapsed(s)], [])
  writeCollapsed(s, new Set(['sorting', 'dp']))
  assert.deepEqual(JSON.parse(s.dump()[GALERI_TUTUP_KEY]), ['sorting', 'dp'])
  assert.deepEqual([...readCollapsed(s)], ['sorting', 'dp'])
  assert.deepEqual([...readCollapsed(memory({ [GALERI_TUTUP_KEY]: '["hantu","mst"]' }))], ['mst'])
  assert.deepEqual([...readCollapsed(memory({ [GALERI_TUTUP_KEY]: '{rusak' }))], [])
  assert.deepEqual([...readCollapsed(memory({ [GALERI_TUTUP_KEY]: '"teks"' }))], [])
  assert.deepEqual([...readCollapsed(undefined)], [])
})

test('tombol: 7 peran warna dari style guide, 4 tombol ikon, dan gaya nonaktif yang seragam', () => {
  assert.deepEqual(Object.keys(buttonVariants), ['navigasi', 'navigasiGaris', 'tautan', 'kontrol', 'konfirmasi', 'netral', 'bahaya'])
  assert.deepEqual(Object.keys(iconButtonVariants), ['kontrol', 'kontrolUtama', 'navigasi', 'netral'])
  assert.deepEqual(Object.keys(sizes), ['m', 's'])
  assert.match(base, /text-button/)
  assert.match(off, /disabled:bg-placeholder/)
  assert.match(buttonVariants.navigasi, /bg-brand-orange/)
  assert.match(buttonVariants.kontrol, /border-brand-blue/)
  assert.match(buttonVariants.konfirmasi, /bg-brand-mint/)
  assert.match(buttonVariants.bahaya, /border-bad/)
  assert.match(iconButtonVariants.kontrolUtama, /bg-brand-blue-strong/)
})

test('aturan kontras: tidak ada teks putih di atas warna terang (Coral/Mint/Kuning) di komponen dan halaman', () => {
  const dir = new URL('../', import.meta.url)
  const files = []
  for (const d of ['ui', 'layout', 'pages']) for (const f of readdirSync(new URL(`${d}/`, dir))) if (f.endsWith('.jsx') && f !== 'UiKit.jsx') files.push(`${d}/${f}`)
  const allowed = new Set(['ui/Toast.jsx']) // toast selalu gelap, jadi teks putih aman
  for (const f of files) {
    if (allowed.has(f)) continue
    assert.doesNotMatch(readFileSync(new URL(f, dir), 'utf8'), /text-white/, `${f}: teks putih`)
  }
})
