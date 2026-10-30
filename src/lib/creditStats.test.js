import test from 'node:test'
import assert from 'node:assert/strict'
import { glosarium, petaBab, tentang, tim } from '../data/credit.js'
import { modul } from '../data/modul.js'
import { blokBerikutnya, ringkasProgres, sorotan, statusSemuaModul } from './creditStats.js'
import { markRead, READ_SECTIONS, recordKuis } from './progress.js'

const T = Date.UTC(2026, 9, 30, 8)
const lulus = { skor: 6, total: 8, persen: 75, lulus: true, salah: [] }

test('peta belajar: tepat 24 modul berurutan 01–24 dalam 8 bab, dan judul modul yang tersedia cocok dengan data modul', () => {
  const semua = petaBab.flatMap((b) => b.modul)
  assert.deepEqual(semua.map((m) => m.no), Array.from({ length: 24 }, (_, i) => i + 1))
  assert.equal(petaBab.length, 8)
  for (const m of modul) assert.equal(semua.find((x) => x.id === m.id).judul, m.judul, `judul modul ${m.id}`)
})

test('peta belajar: tiap bab diawali modul konsep (pintu masuk bab)', () => {
  for (const b of petaBab) assert.equal(b.modul[0].konsep, true, b.bab)
})

test('glosarium menunjuk modul yang ada di peta, dan tim lengkap dengan foto dan peran', () => {
  const ids = new Set(petaBab.flatMap((b) => b.modul.map((m) => m.id)))
  for (const g of glosarium) assert.ok(ids.has(g.modul), g.istilah)
  assert.equal(tim.length, 4)
  for (const t of tim) assert.ok(t.nama && t.peran && /^tim\/[a-z]+\.jpg$/.test(t.foto), t.nama)
  assert.deepEqual(tim.map((t) => t.peran), ['Programmer', 'Analyst', 'Project Manager & Designer', 'Documenter'])
  assert.ok(tentang.changelog.length > 0 && tentang.changelog[0].versi === tentang.versi)
})

test('status semua modul: awal semuanya belum; modul 04 sedang lalu selesai', () => {
  assert.ok([...statusSemuaModul({}).values()].every((s) => s === 'belum'))
  assert.equal(statusSemuaModul({}).size, 24)
  let all = markRead({}, '04', 'pendahuluan', T)
  assert.equal(statusSemuaModul(all).get('04'), 'sedang')
  for (const s of READ_SECTIONS) all = markRead(all, '04', s, T)
  all = recordKuis(all, '04', lulus, T)
  assert.equal(statusSemuaModul(all).get('04'), 'selesai')
  assert.equal(statusSemuaModul(all).get('05'), 'belum')
})

test('ringkasProgres: kosong, sedang dibaca, dan selesai dengan kuis lulus', () => {
  const kuis = [{ modul: '04' }]
  assert.deepEqual(ringkasProgres({}, kuis), { selesai: 0, sedang: 0, total: 24, kuisDicoba: 0, rataRata: null, kuisLulus: 0, kuisTotal: 1 })
  let all = markRead({}, '04', 'pendahuluan', T)
  assert.equal(ringkasProgres(all, kuis).sedang, 1)
  for (const s of READ_SECTIONS) all = markRead(all, '04', s, T)
  all = recordKuis(all, '04', lulus, T)
  assert.deepEqual(ringkasProgres(all, kuis), { selesai: 1, sedang: 0, total: 24, kuisDicoba: 1, rataRata: 75, kuisLulus: 1, kuisTotal: 1 })
})

test('ringkasProgres: kuis yang dicoba tetapi belum lulus dihitung di rata-rata, bukan di lulus', () => {
  const r = ringkasProgres(recordKuis({}, '04', { skor: 3, total: 8, persen: 38, lulus: false, salah: [] }, T), [{ modul: '04' }])
  assert.equal(r.rataRata, 38)
  assert.equal(r.kuisLulus, 0)
})

test('blokBerikutnya: modul tersedia pertama yang belum selesai, modul yang terakhir dibuka, dan null bila semua selesai', () => {
  assert.deepEqual(blokBerikutnya({}), { id: '01', judul: 'Konsep Dasar Algoritma', persen: 0 })
  const sedang = markRead({}, '04', 'algoritma', T)
  assert.deepEqual(blokBerikutnya(sedang), { id: '04', judul: 'Insertion Sort', persen: 13 })
  let all = {}
  for (const id of ['01', '04']) {
    for (const s of READ_SECTIONS) all = markRead(all, id, s, T)
    all = recordKuis(all, id, lulus, T)
  }
  assert.equal(blokBerikutnya(all), null)
  // 01 selesai, 04 belum disentuh: modul selesai dilewati, sarannya 04
  let satu = {}
  for (const s of READ_SECTIONS) satu = markRead(satu, '01', s, T)
  satu = recordKuis(satu, '01', lulus, T)
  assert.deepEqual(blokBerikutnya(satu), { id: '04', judul: 'Insertion Sort', persen: 0 })
})

test('sorotan: tiga keadaan dan streak hanya disebut bila 2 hari atau lebih', () => {
  assert.equal(sorotan(0, 24, 0).judul, 'Mulai menyusun blok labu pertamamu!')
  assert.equal(sorotan(3, 24, 5).judul, 'Kamu sudah menyusun 3 dari 24 blok labu!')
  assert.match(sorotan(3, 24, 5).isi, /Streak 5 hari/)
  assert.doesNotMatch(sorotan(3, 24, 1).isi, /Streak/)
  assert.match(sorotan(24, 24, 0).judul, /semua 24 blok/)
})
