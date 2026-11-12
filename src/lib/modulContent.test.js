import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseModul } from './modulContent.js'
import { insertionLoops, totalLoops } from './insertionLoops.js'
import { PASS_PERCENT, modulById, sections } from '../data/modul.js'
import { hitungHasil, nilaiSoal, soalSalah, durasi, jam } from './kuis.js'
import { kuis04 } from '../content/modul/04.kuis.js'

const text = readFileSync(new URL('../content/modul/04.md', import.meta.url), 'utf8')
const parsed = parseModul(text)

// ---------------------------------------------------------------- pembanding independen
const sim = (arr) => {
  const A = [...arr]
  let sumT = 0
  let geser = 0
  const rows = []
  for (let j = 1; j < A.length; j++) {
    const key = A[j]
    let i = j - 1
    let t = 1
    let g = 0
    while (i >= 0 && A[i] > key) { A[i + 1] = A[i]; i -= 1; g += 1; t += 1 }
    A[i + 1] = key
    sumT += t
    geser += g
    rows.push({ j: j + 1, key, g, t, after: [...A] })
  }
  return { sumT, geser, rows }
}

test('struktur teks modul: bagian sama dengan tab (kecuali Kuis) dan semua penanda komponen ada', () => {
  assert.deepEqual(parsed.map((s) => s.id), sections.filter((s) => s.id !== 'kuis').map((s) => s.id))
  assert.equal(parsed[0].eyebrow, 'PENDAHULUAN')
  assert.equal(parsed[0].judul, '1. Mengurutkan Seperti Menyusun Kartu')
  assert.equal(parsed.at(-1).eyebrow, '')
  const slots = parsed.flatMap((s) => s.blok.filter((b) => b.type === 'slot').map((b) => b.name))
  assert.deepEqual(slots.sort(), ['kasus', 'kode', 'loops', 'tantangan'])
  const callouts = parsed.flatMap((s) => s.blok.filter((b) => b.type === 'callout').map((b) => `${b.jenis}:${b.judul}`))
  assert.deepEqual(callouts, ['benar:Mengapa algoritma ini benar?', 'coba:Coba sendiri dulu'])
  assert.ok(parsed.every((s) => s.blok.length > 0))
  assert.doesNotMatch(text, /\{\{(?!callout|\/callout|kode|loops|kasus|tantangan)/, 'tidak ada penanda tak dikenal')
})

test('parseModul: kotak catatan dan penanda hanya dikenali di awal baris, dan teks sebelum bagian pertama diabaikan', () => {
  const p = parseModul('abaikan\n@@ a | E | Judul A\nteks {{kode}} di tengah\n{{kode}}\n{{callout:benar|T}}\nisi\n{{/callout}}\n@@ b |  | Judul B\nlagi')
  assert.deepEqual(p.map((s) => [s.id, s.eyebrow, s.judul]), [['a', 'E', 'Judul A'], ['b', '', 'Judul B']])
  assert.deepEqual(p[0].blok.map((b) => b.type), ['md', 'slot', 'callout'])
  assert.equal(p[0].blok[0].text, 'teks {{kode}} di tengah')
  assert.equal(p[0].blok[2].text, 'isi')
})

test('Tabel 4 di teks sama dengan simulasi untuk 12, 10, 15, 7 (pergeseran, t_j, array) dan Σ t_j = 7, pergeseran = 4', () => {
  const s = sim([12, 10, 15, 7])
  assert.deepEqual(s.rows.map((r) => [r.j, r.key, r.g, r.t, r.after.join(', ')]), [[2, 10, 1, 2, '10, 12, 15, 7'], [3, 15, 0, 1, '10, 12, 15, 7'], [4, 7, 3, 4, '7, 10, 12, 15']])
  for (const r of s.rows) assert.ok(text.includes(`| ${r.j} | ${r.key} | ${r.g} | ${r.t} | ${r.after.join(', ')} |`), `baris tabel j = ${r.j}`)
  assert.equal(s.sumT, 7)
  assert.equal(s.geser, 4)
  assert.ok(text.includes('$\\sum t_j = 2 + 1 + 4 = 7$ dan pergeseran $= 1 + 0 + 3 = 4$'))
})

test('Tabel 6 (kasus terburuk 30, 15, 12, 4, 2) dan kasus terbaik 2, 4, 12, 15, 30 sama dengan simulasi', () => {
  const worst = sim([30, 15, 12, 4, 2])
  for (const r of worst.rows) {
    assert.equal(r.t, r.j, 't_j = j pada kasus terburuk')
    assert.ok(text.includes(`| ${r.j} | ${r.key} | ${r.g} | ${r.after.join(', ')} |`), `baris tabel 6 j = ${r.j}`)
  }
  const best = sim([2, 4, 12, 15, 30])
  assert.ok(best.rows.every((r) => r.t === 1 && r.g === 0))
  assert.equal(best.sumT, 4)
})

test('program Python di teks: keluaran dan rumus (n = 1000) cocok dengan simulasi', () => {
  assert.deepEqual([sim([12, 10, 15, 7]).sumT, sim([12, 10, 15, 7]).geser], [7, 4])
  assert.deepEqual([sim([2, 4, 12, 15, 30]).sumT, sim([2, 4, 12, 15, 30]).geser], [4, 0])
  assert.deepEqual([sim([30, 15, 12, 4, 2]).sumT, sim([30, 15, 12, 4, 2]).geser], [14, 10])
  const n = 1000
  const best = sim(Array.from({ length: n }, (_, i) => i))
  const worst = sim(Array.from({ length: n }, (_, i) => n - i))
  assert.deepEqual([best.sumT, best.geser, n - 1], [999, 0, 999])
  assert.deepEqual([worst.sumT, worst.geser, (n * n + n - 2) / 2, (n * n - n) / 2], [500499, 499500, 500499, 499500])
  assert.ok(text.includes('999 0 999\n500499 499500 500499 499500'))
  assert.ok(text.includes('[30, 15, 12, 4, 2] -> ([2, 4, 12, 15, 30], 14, 10)'))
  assert.ok(text.includes('0 sampai 499.500'))
})

test('insertionLoops: 4 keadaan, baris penelusuran seperti di PDF, dan total sama dengan simulasi', () => {
  const r = insertionLoops([12, 10, 15, 7])
  assert.deepEqual(r.awal, [12, 10, 15, 7])
  assert.deepEqual(r.putaran.map((p) => [p.j, p.key, p.pergeseran, p.tj, p.sesudah.join(', '), p.posisiKey]), [
    [2, 10, 1, 2, '10, 12, 15, 7', 1],
    [3, 15, 0, 1, '10, 12, 15, 7', 3],
    [4, 7, 3, 4, '7, 10, 12, 15', 1],
  ])
  assert.deepEqual(r.putaran[2].pemeriksaan, [
    'while 3 > 0 and A[3] > key   (15 > 7) TRUE → A[4] = 15, i = 2',
    'while 2 > 0 and A[2] > key   (12 > 7) TRUE → A[3] = 12, i = 1',
    'while 1 > 0 and A[1] > key   (10 > 7) TRUE → A[2] = 10, i = 0',
    'while 0 > 0 ...   FALSE → keluar dari while',
    'A[1] = key = 7   A = [7, 10, 12, 15]',
  ])
  assert.equal(r.putaran[1].pemeriksaan[0], 'while 2 > 0 and A[2] > key   (12 > 15) FALSE → keluar dari while')
  assert.deepEqual(totalLoops([12, 10, 15, 7]), { sumT: 7, sumGeser: 4 })
  for (const arr of [[5, 2, 9, 1, 7, 3], [1, 2, 3], [9, 8, 7, 6]]) assert.deepEqual(totalLoops(arr), { sumT: sim(arr).sumT, sumGeser: sim(arr).geser })
})

test('metadata modul 04 sama dengan PDF: 11 halaman, 8 soal, prasyarat Modul 03, 5 tujuan', () => {
  const m = modulById('04')
  assert.deepEqual([m.no, m.id, m.bab, m.halaman, m.soal, m.prasyarat], [4, '04', 'BAB II', 11, 8, [3]])
  assert.equal(m.tujuan.length, 5)
  assert.equal(m.soal, kuis04.soal.length)
  assert.equal(sections.length, 8)
  assert.deepEqual(m.posisi.urutan, ['03', '04', '05 · 06', '08'])
})

// ---------------------------------------------------------------- kuis
const BENAR = { 1: ['A', 'C'], 2: 'C', 3: ['A', 'C', 'D'], 4: 'D', 5: ['B', 'D'], 6: 'A', 7: 'B', 8: 'D' }

test('kunci kuis dihitung ulang: tabel soal 1, jumlah soal 3, soal 5, soal 8', () => {
  const s1 = sim([8, 3, 5, 1])
  assert.deepEqual(s1.rows.map((r) => [r.j, r.key, r.after.join(', '), r.t]), [[2, 3, '3, 8, 5, 1', 2], [3, 5, '3, 5, 8, 1', 2], [4, 1, '1, 3, 5, 8', 4]])
  for (const r of s1.rows) assert.ok(kuis04.soal[0].pembahasan.includes(`$t_${r.j} = ${r.t}$`), `t_${r.j}`)
  const n = 6
  const best = sim(Array.from({ length: n }, (_, i) => i))
  const worst = sim(Array.from({ length: n }, (_, i) => n - i))
  assert.deepEqual([best.sumT, best.geser, worst.sumT, worst.geser], [5, 0, 20, 15])
  const teks3 = (id) => kuis04.soal[2].opsi.find((o) => o.id === id).teks
  assert.ok(teks3('A').includes(`= ${best.sumT}$`) && teks3('C').includes(`= ${worst.sumT}$`) && teks3('D').includes(`= ${worst.geser}$`))
  const q5 = sim([1, 2, 3, 4, 5, 6, 7, 0])
  assert.ok(kuis04.soal[4].opsi.find((o) => o.id === 'B').teks.includes(`= ${q5.geser}$`))
  assert.ok(q5.geser > 0 && q5.geser < (8 * 8 - 8) / 2, 'di antara terbaik dan terburuk (28)')
  assert.equal(0.01 * (20000 / 2000) ** 2, 1)
  assert.equal(kuis04.soal[7].opsi.find((o) => o.id === 'D').teks, '1 detik')
})

test('nilaiSoal: satu jawaban, banyak jawaban (utuh), dan jawaban kosong', () => {
  const [q1, q2, q3, q4, q5, , , q8] = kuis04.soal
  assert.equal(nilaiSoal(q2, 'C').benar, true)
  assert.equal(nilaiSoal(q2, 'A').benar, false)
  assert.equal(nilaiSoal(q2, undefined).benar, false)
  assert.match(nilaiSoal(q2, 'A').kunciTeks, /^C\. Karena posisi/)
  assert.equal(nilaiSoal(q4, 'D').benar, true)
  assert.equal(nilaiSoal(q1, ['C', 'A']).benar, true)
  assert.equal(nilaiSoal(q3, ['A', 'C', 'D']).benar, true)
  assert.equal(nilaiSoal(q3, ['A', 'C']).benar, false, 'kurang satu pilihan')
  assert.equal(nilaiSoal(q3, ['A', 'C', 'B']).benar, false)
  assert.equal(nilaiSoal(q3, []).benar, false)
  assert.equal(nilaiSoal(q5, ['B', 'D']).benar, true)
  assert.equal(nilaiSoal(q5, ['B', 'E']).benar, false)
  assert.equal(nilaiSoal(q8, 'D').benar, true)
  assert.equal(nilaiSoal(q8, 'A').benar, false)
  assert.match(nilaiSoal(q3, ['C', 'A']).jawabanTeks, /^A\. .* · C\. /, 'jawaban ditampilkan menurut urutan opsi')
})

test('hitungHasil: skor, persen, lulus pada batas 70%, soal salah, dan soal belum dijawab', () => {
  assert.equal(PASS_PERCENT, 70)
  const semua = hitungHasil(kuis04.soal, BENAR)
  assert.deepEqual([semua.skor, semua.total, semua.persen, semua.lulus, semua.salah], [8, 8, 100, true, []])
  const enam = hitungHasil(kuis04.soal, { ...BENAR, 3: ['A', 'C'], 8: 'A' })
  assert.deepEqual([enam.skor, enam.persen, enam.lulus, enam.salah], [6, 75, true, [3, 8]])
  assert.match(enam.perSoal[2].kunciTeks, /^A\. .* · C\. .* · D\. /)
  const lima = hitungHasil(kuis04.soal, { ...BENAR, 3: [], 8: undefined, 2: 'A' })
  assert.deepEqual([lima.skor, lima.persen, lima.lulus], [5, 63, false])
  const kosong = hitungHasil(kuis04.soal, {})
  assert.deepEqual([kosong.skor, kosong.belumDinilai, kosong.salah.length], [0, [], 8])
  assert.deepEqual(soalSalah(kuis04.soal, enam).map((q) => q.no), [3, 8])
  assert.deepEqual(hitungHasil([], {}), { skor: 0, total: 0, persen: 0, lulus: false, perSoal: [], salah: [], belumDinilai: [] })
})

test('durasi dan jam', () => {
  assert.equal(durasi(400), '6 menit 40 detik')
  assert.equal(durasi(40), '40 detik')
  assert.equal(durasi(0), '0 detik')
  assert.equal(jam(462), '07:42')
  assert.equal(jam(5), '00:05')
  assert.equal(jam(-3), '00:00')
})

test('pseudocode di modul = pseudocode peraga = pseudocode di PDF (7 baris, isi sama, indentasi 2 spasi per tingkat)', async () => {
  const { traces } = await import('../algorithms/traces.js')
  const lines = traces['insertion-sort'].code.split('\n')
  assert.deepEqual(lines.map((l) => l.trim()), ['for j = 2 to length[A]', 'key = A[j]', 'i = j - 1', 'while i > 0 and A[i] > key', 'A[i + 1] = A[i]', 'i = i - 1', 'A[i + 1] = key'])
  assert.deepEqual(lines.map((l) => l.length - l.trimStart().length), [0, 2, 2, 2, 4, 4, 2])
})

test('gabungHasil: soal yang diulang mengganti hasil lama, soal lain tetap, dan skor dihitung ulang', async () => {
  const { gabungHasil, soalSalah: salah } = await import('./kuis.js')
  const lama = hitungHasil(kuis04.soal, { ...BENAR, 3: ['A', 'C'], 8: 'A' })
  assert.deepEqual(lama.salah, [3, 8])
  const ulang = salah(kuis04.soal, lama)
  assert.deepEqual(ulang.map((q) => q.no), [3, 8])
  const baru = hitungHasil(ulang, { 3: ['A', 'C', 'D'], 8: 'A' })
  const gabung = gabungHasil(lama, baru)
  assert.deepEqual([gabung.skor, gabung.total, gabung.persen, gabung.salah], [7, 8, 88, [8]])
  assert.equal(gabung.perSoal.length, 8)
  assert.equal(gabung.perSoal[2].benar, true)
  assert.equal(gabung.lulus, true)
})

test('draf jawaban: simpan, baca ulang, buang nomor asing, dan tahan data rusak', async () => {
  const { loadDraft, saveDraft, clearDraft, draftKey } = await import('./kuis.js')
  const m = {}
  const st = { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, removeItem: (k) => { delete m[k] } }
  const sah = [1, 2, 3, 4, 5, 6, 7, 8]
  assert.equal(loadDraft(st, '04', sah), null)
  saveDraft(st, '04', { nos: [3, 8, 99], index: 5, jawaban: { 3: ['A', 'C', 'D'], 99: 'x' }, ragu: [], detik: 42 })
  const d = loadDraft(st, '04', sah)
  assert.deepEqual(d, { nos: [3, 8], index: 1, jawaban: { 3: ['A', 'C', 'D'] }, ragu: [], detik: 42 })
  clearDraft(st, '04')
  assert.equal(m[draftKey('04')], undefined)
  assert.equal(loadDraft({ getItem: () => '{rusak' }, '04', sah), null)
  assert.equal(loadDraft({ getItem: () => '{"nos":[99]}' }, '04', sah), null)
  assert.equal(loadDraft(undefined, '04', sah), null)
})

test('parseModul: akhir baris CRLF (git di Windows) menghasilkan struktur yang sama dengan LF untuk semua modul', () => {
  for (const id of ['01', '02', '03', '04', '05']) {
    const lf = readFileSync(new URL(`../content/modul/${id}.md`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
    const crlf = lf.replace(/\n/g, '\r\n')
    assert.deepEqual(parseModul(crlf), parseModul(lf), `modul ${id}`)
  }
})

test('teks modul: rumus blok ditulis dengan $$ di baris sendiri (rumus satu baris jadi rumus sebaris yang tidak bisa digulir dan melebarkan halaman di HP)', () => {
  for (const id of ['01', '02', '03', '04', '05']) {
    const teks = readFileSync(new URL(`../content/modul/${id}.md`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
    const salah = teks.split('\n').filter((l) => /^\$\$.+\$\$\s*$/.test(l))
    assert.deepEqual(salah, [], `modul ${id}: tulis $$ dan rumusnya di baris terpisah`)
    const pagar = teks.split('\n').filter((l) => l.trim() === '$$').length
    assert.equal(pagar % 2, 0, `modul ${id}: jumlah pagar $$ ganjil`)
  }
})
