import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseModul } from './modulContent.js'
import { insertionLoops, totalLoops } from './insertionLoops.js'
import { PASS_PERCENT, modul, sections } from '../data/modul.js'
import { hitungHasil, nilaiSoal, parseAngka, soalSalah, durasi, jam, TIPE_LABEL } from './kuis.js'
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
  const m = modul[0]
  assert.deepEqual([m.no, m.id, m.bab, m.halaman, m.soal, m.prasyarat], [4, '04', 'BAB II', 11, 8, [3]])
  assert.equal(m.tujuan.length, 5)
  assert.equal(m.soal, kuis04.soal.length)
  assert.equal(sections.length, 8)
  assert.deepEqual(m.posisi.urutan, ['03', '04', '05 · 06', '08'])
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: tabel soal 1, jumlah soal 3, soal 5, soal 8', () => {
  const s1 = sim([8, 3, 5, 1])
  assert.deepEqual(s1.rows.map((r) => [r.j, r.key, r.after.join(', '), r.t]), [[2, 3, '3, 8, 5, 1', 2], [3, 5, '3, 5, 8, 1', 2], [4, 1, '1, 3, 5, 8', 4]])
  for (const r of s1.rows) assert.ok(kuis04.soal[0].kunciTeks.includes(`$t_${r.j} = ${r.t}$`) || kuis04.soal[0].pembahasan.includes(`$t_${r.j} = ${r.t}$`), `t_${r.j}`)
  const n = 6
  const best = sim(Array.from({ length: n }, (_, i) => i))
  const worst = sim(Array.from({ length: n }, (_, i) => n - i))
  const q3 = kuis04.soal[2].isian.map((f) => f.kunci)
  assert.deepEqual(q3, [best.sumT, best.geser, worst.sumT, worst.geser])
  assert.deepEqual(q3, [5, 0, 20, 15])
  const q5 = sim([1, 2, 3, 4, 5, 6, 7, 0])
  assert.equal(kuis04.soal[4].isian[0].kunci, q5.geser)
  assert.ok(q5.geser > 0 && q5.geser < (8 * 8 - 8) / 2, 'di antara terbaik dan terburuk (28)')
  assert.equal(kuis04.soal[4].isian[1].kunci, 'di antaranya')
  assert.equal(kuis04.soal[7].isian[0].kunci, 0.01 * (20000 / 2000) ** 2)
})

test('struktur kuis: 8 soal berurutan, jenis sama dengan PDF, kunci ada di opsi, dan tiap soal punya pembahasan', () => {
  assert.deepEqual(kuis04.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis04.soal.map((q) => TIPE_LABEL[q.tipe]), ['Penelusuran', 'Pilihan Ganda', 'Perhitungan', 'Benar/Salah', 'Analisis', 'Pilihan Ganda', 'Analisis', 'Perhitungan'])
  for (const q of kuis04.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci), `kunci soal ${q.no}`)
    if (q.mandiri) assert.ok(q.kunciTeks)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual(kuis04.soal.filter((q) => q.tipe === 'pilihan').map((q) => q.kunci), ['B', 'B'])
})

test('parseAngka: koma desimal, titik ribuan, spasi, dan teks bukan angka', () => {
  assert.equal(parseAngka('20'), 20)
  assert.equal(parseAngka(' 1,5 '), 1.5)
  assert.equal(parseAngka('1.000'), 1000)
  assert.equal(parseAngka('2.000,5'), 2000.5)
  assert.equal(parseAngka('0,01'), 0.01)
  assert.equal(parseAngka('-3'), -3)
  assert.equal(parseAngka('dua'), null)
  assert.equal(parseAngka(''), null)
  assert.equal(parseAngka(undefined), null)
})

test('nilaiSoal: pilihan, isian (angka dan pilih), dan soal mandiri (dinilai sendiri)', () => {
  const [q1, q2, q3, q4, q5, , q7, q8] = kuis04.soal
  assert.equal(nilaiSoal(q2, 'B').benar, true)
  assert.equal(nilaiSoal(q2, 'A').benar, false)
  assert.equal(nilaiSoal(q2, undefined).benar, false)
  assert.match(nilaiSoal(q2, 'A').kunciTeks, /^B\. Karena posisi/)
  assert.equal(nilaiSoal(q4, 'Salah').benar, true)
  assert.equal(nilaiSoal(q3, ['5', '0', '20', '15']).benar, true)
  assert.equal(nilaiSoal(q3, ['5', '0', '15', '10']).benar, false)
  assert.equal(nilaiSoal(q3, ['5', '0', '20']).benar, false, 'kolom kosong salah')
  assert.equal(nilaiSoal(q3, ['5', '0', 'dua puluh', '15']).benar, false)
  assert.equal(nilaiSoal(q3, ['5', '0', '15', '10']).jawabanTeks, 'Terbaik: Σtj = 5 · Terbaik: Σ(tj − 1) = 0 · Terburuk: Σtj = 15 · Terburuk: Σ(tj − 1) = 10')
  assert.equal(nilaiSoal(q5, ['7', 'di antaranya']).benar, true)
  assert.equal(nilaiSoal(q5, ['7', 'terburuk']).benar, false)
  assert.equal(nilaiSoal(q8, ['1']).benar, true)
  assert.equal(nilaiSoal(q8, ['1,0']).benar, true)
  assert.equal(nilaiSoal(q8, ['100']).benar, false)
  assert.equal(nilaiSoal(q1, { teks: '  3, 8, 5, 1  ', sesuai: null }).benar, null, 'belum dinilai sendiri')
  assert.equal(nilaiSoal(q1, { teks: 'x', sesuai: true }).benar, true)
  assert.equal(nilaiSoal(q7, { teks: 'x', sesuai: false }).benar, false)
  assert.equal(nilaiSoal(q7, undefined).benar, null)
})

test('hitungHasil: skor, persen, lulus pada batas 70%, soal salah, dan soal yang belum dinilai', () => {
  assert.equal(PASS_PERCENT, 70)
  const benar = { 1: { teks: 'a', sesuai: true }, 2: 'B', 3: ['5', '0', '20', '15'], 4: 'Salah', 5: ['7', 'di antaranya'], 6: 'B', 7: { teks: 'b', sesuai: true }, 8: ['1'] }
  const semua = hitungHasil(kuis04.soal, benar)
  assert.deepEqual([semua.skor, semua.total, semua.persen, semua.lulus, semua.salah], [8, 8, 100, true, []])
  const enam = hitungHasil(kuis04.soal, { ...benar, 3: ['5', '0', '15', '10'], 8: ['100'] })
  assert.deepEqual([enam.skor, enam.persen, enam.lulus, enam.salah], [6, 75, true, [3, 8]])
  assert.equal(enam.perSoal[2].kunciTeks, 'Terbaik: Σtj = 5 · Terbaik: Σ(tj − 1) = 0 · Terburuk: Σtj = 20 · Terburuk: Σ(tj − 1) = 15')
  const lima = hitungHasil(kuis04.soal, { ...benar, 3: [], 8: [], 2: 'A' })
  assert.deepEqual([lima.skor, lima.persen, lima.lulus], [5, 63, false])
  const belum = hitungHasil(kuis04.soal, {})
  assert.deepEqual(belum.belumDinilai, [1, 7])
  assert.equal(belum.skor, 0)
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
  const benar = { 1: { teks: 'a', sesuai: true }, 2: 'B', 3: ['5', '0', '20', '15'], 4: 'Salah', 5: ['7', 'di antaranya'], 6: 'B', 7: { teks: 'b', sesuai: true }, 8: ['1'] }
  const lama = hitungHasil(kuis04.soal, { ...benar, 3: ['5', '0', '15', '10'], 8: ['100'] })
  assert.deepEqual(lama.salah, [3, 8])
  const ulang = salah(kuis04.soal, lama)
  assert.deepEqual(ulang.map((q) => q.no), [3, 8])
  const baru = hitungHasil(ulang, { 3: ['5', '0', '20', '15'], 8: ['100'] })
  const gabung = gabungHasil(lama, baru)
  assert.deepEqual([gabung.skor, gabung.total, gabung.persen, gabung.salah], [7, 8, 88, [8]])
  assert.equal(gabung.perSoal.length, 8)
  assert.equal(gabung.perSoal[2].benar, true)
  assert.equal(gabung.lulus, true)
})

test('draf jawaban: simpan, baca ulang, buang nomor asing, dan tahan data rusak', async () => {
  const { loadDraft, saveDraft, clearDraft, draftKey, sudahDijawab } = await import('./kuis.js')
  const m = {}
  const st = { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, removeItem: (k) => { delete m[k] } }
  const sah = [1, 2, 3, 4, 5, 6, 7, 8]
  assert.equal(loadDraft(st, '04', sah), null)
  saveDraft(st, '04', { nos: [3, 8, 99], index: 5, jawaban: { 3: ['5'], 99: 'x' }, ragu: [8, 99], detik: 42 })
  const d = loadDraft(st, '04', sah)
  assert.deepEqual(d, { nos: [3, 8], index: 1, jawaban: { 3: ['5'] }, ragu: [8], detik: 42 })
  clearDraft(st, '04')
  assert.equal(m[draftKey('04')], undefined)
  assert.equal(loadDraft({ getItem: () => '{rusak' }, '04', sah), null)
  assert.equal(loadDraft({ getItem: () => '{"nos":[99]}' }, '04', sah), null)
  assert.equal(loadDraft(undefined, '04', sah), null)
  const [q1, q2, q3] = kuis04.soal
  assert.equal(sudahDijawab(q1, { teks: '  ' }), false)
  assert.equal(sudahDijawab(q1, { teks: 'x' }), true)
  assert.equal(sudahDijawab(q2, undefined), false)
  assert.equal(sudahDijawab(q2, 'A'), true)
  assert.equal(sudahDijawab(q3, ['', '', '', '']), false)
  assert.equal(sudahDijawab(q3, ['', '', '1', '']), true)
})
