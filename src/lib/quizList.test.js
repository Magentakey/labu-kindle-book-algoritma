import test from 'node:test'
import assert from 'node:assert/strict'
import { daftarKuis, kuisById, tingkat, tipeSoal } from '../data/quiz.js'
import { kelompokkan, labelTerbaik, ringkasan, saring, statusKuis } from './quizList.js'

const k = (attempts, passed, best) => ({ kuis: { attempts, passed, best } })
const dua = [...daftarKuis, { id: '08', modul: '08', judul: 'Telusuri Merge Sort', tingkat: 'easy', soal: 7, menit: 5, tipe: ['pilihan'], thumb: 'tree' }]

test('data: tiap kuis punya tingkat dan jenis soal yang dikenal, dan id unik', () => {
  const tingkatIds = tingkat.map((t) => t.id)
  const tipeIds = tipeSoal.map((t) => t.id)
  for (const q of daftarKuis) {
    assert.ok(tingkatIds.includes(q.tingkat), q.id)
    assert.ok(q.tipe.length > 0 && q.tipe.every((t) => tipeIds.includes(t)), q.id)
  }
  assert.equal(new Set(daftarKuis.map((q) => q.id)).size, daftarKuis.length)
  assert.equal(kuisById('04')?.tingkat, 'medium')
  assert.equal(kuisById('99'), null)
})

test('statusKuis: belum dicoba, lulus, atau gagal', () => {
  assert.equal(statusKuis(undefined), 'belum')
  assert.equal(statusKuis(k(0, false, null)), 'belum')
  assert.equal(statusKuis(k(2, true, { persen: 80 })), 'lulus')
  assert.equal(statusKuis(k(1, false, { persen: 50 })), 'gagal')
})

test('statusKuis: pernah lulus tetap lulus walau percobaan terakhir gagal (passed bersifat tetap)', () => {
  assert.equal(statusKuis(k(3, true, { persen: 90 })), 'lulus')
})

test('labelTerbaik', () => {
  assert.equal(labelTerbaik(undefined), null)
  assert.equal(labelTerbaik(k(1, true, { skor: 8, total: 8, persen: 100 })), 'Terbaik 8/8 · Lulus')
  assert.equal(labelTerbaik(k(1, false, { skor: 5, total: 8, persen: 63 })), 'Terbaik 5/8 · Belum lulus')
})

test('saring: kata kunci tanpa memandang huruf besar dan aksen, modul, status, dan jenis soal', () => {
  const progres = { 4: k(1, true, { skor: 8, total: 8, persen: 100 }), '04': k(1, true, { skor: 8, total: 8, persen: 100 }) }
  assert.equal(saring(dua, progres, {}).length, 2)
  assert.deepEqual(saring(dua, progres, { q: 'INSERTION' }).map((x) => x.id), ['04'])
  assert.deepEqual(saring(dua, progres, { q: 'modul 08' }).map((x) => x.id), ['08'])
  assert.deepEqual(saring(dua, progres, { q: 'medium' }).map((x) => x.id), ['04'])
  assert.deepEqual(saring(dua, progres, { modul: '08' }).map((x) => x.id), ['08'])
  assert.deepEqual(saring(dua, progres, { modul: 'semua', status: 'lulus' }).map((x) => x.id), ['04'])
  assert.deepEqual(saring(dua, progres, { status: 'belum' }).map((x) => x.id), ['08'])
  assert.deepEqual(saring(dua, progres, { tipe: ['analisis'] }).map((x) => x.id), ['04'])
  assert.deepEqual(saring(dua, progres, { tipe: ['analisis', 'pilihan'] }).map((x) => x.id), ['04', '08'])
  assert.equal(saring(dua, progres, { q: 'tidak ada' }).length, 0)
})

test('kelompokkan: urutan Easy sampai Complex dan kelompok kosong dibuang', () => {
  const g = kelompokkan(dua)
  assert.deepEqual(g.map((x) => x.id), ['easy', 'medium'])
  assert.deepEqual(g[1].items.map((x) => x.id), ['04'])
  assert.deepEqual(kelompokkan([]), [])
})

test('ringkasan: jumlah, lulus, dan rata-rata hanya dari kuis yang pernah dicoba', () => {
  const kosong = ringkasan(dua, {})
  assert.deepEqual(kosong, { kuis: 2, soal: 15, modul: 2, lulus: 0, dicoba: 0, rataRata: null })
  const r = ringkasan(dua, { '04': k(2, true, { skor: 6, total: 8, persen: 75 }), '08': k(1, false, { skor: 3, total: 7, persen: 43 }) })
  assert.equal(r.lulus, 1)
  assert.equal(r.dicoba, 2)
  assert.equal(r.rataRata, 59) // (75 + 43) / 2 = 59
})

import { hitungHasil, rincianTipe } from './kuis.js'

test('rincianTipe: benar per jenis soal sesuai urutan kemunculan; soal belum dinilai tidak dihitung benar', () => {
  const soal = [
    { no: 1, tipe: 'penelusuran', mandiri: true, kunciTeks: 'x' },
    { no: 2, tipe: 'pilihan', opsi: [{ id: 'A', teks: 'a' }, { id: 'B', teks: 'b' }], kunci: 'B' },
    { no: 3, tipe: 'pilihan', opsi: [{ id: 'A', teks: 'a' }, { id: 'B', teks: 'b' }], kunci: 'A' },
  ]
  const hasil = hitungHasil(soal, { 1: { teks: 'jawab', sesuai: null }, 2: 'B', 3: 'B' })
  assert.deepEqual(rincianTipe(soal, hasil), [
    { tipe: 'penelusuran', label: 'Penelusuran', benar: 0, total: 1 },
    { tipe: 'pilihan', label: 'Pilihan Ganda', benar: 1, total: 2 },
  ])
})
