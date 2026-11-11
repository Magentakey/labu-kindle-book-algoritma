import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, labelSoal, jenisSoal } from '../lib/kuis.js'
import { modulById, neighbors, sections, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { kuis01 } from './modul/01.kuis.js'
import { pseudo } from './modul/01.pseudo.js'
import { cariPython } from '../test/python.js'

// Akhir baris dinormalkan: git di Windows bisa mengubah berkas teks menjadi CRLF, dan Python di Windows mencetak CRLF.
const md = readFileSync(new URL('./modul/01.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('01')

// ---------------------------------------------------------------- pembanding independen
/** BILANGAN_MAX dengan pencatatan baris yang dijalankan (nomor baris pseudocode) dan nilai max setelahnya. */
function jejakMax(a, b, c) {
  let max = a
  const rows = [[1, max]]
  rows.push([2, max])
  if (max < b) { max = b; rows.push([3, max]) }
  rows.push([4, max])
  if (max < c) { max = c; rows.push([5, max]) }
  rows.push([6, max])
  return { max, rows, assign: 1 + (a < b ? 1 : 0) + (Math.max(a, b) < c ? 1 : 0) }
}
function jejakJumlah(A) {
  let jumlah = 0
  const rows = []
  for (const x of A) { jumlah += x; rows.push(jumlah) }
  return { jumlah, rows, cekFor: A.length + 1, isi: A.length }
}
const baris = (tabelCaption) => {
  const end = md.indexOf(tabelCaption)
  assert.ok(end > 0, tabelCaption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2) // buang header dan pemisah
}

// ---------------------------------------------------------------- struktur
test('struktur: bagian sesuai urutan PDF, enam tab terpenuhi, semua penanda punya isi', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'karakteristik', 'penelusuran', 'struktur', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', '8', null])
  const tabIds = sections.map((s) => s.id).filter((id) => id !== 'kuis')
  for (const id of tabIds) assert.ok(bagian.some((s) => s.id === id), `bagian untuk tab ${id}`)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot'))
  const pseudoIds = slots.filter((b) => b.name === 'pseudo').map((b) => b.arg)
  assert.deepEqual(pseudoIds.sort(), Object.keys(pseudo).sort(), 'tiap pseudocode dipakai tepat sekali')
  assert.deepEqual(slots.filter((b) => b.name === 'gambar').map((b) => b.arg), ['io', 'flowchart'])
  assert.deepEqual(slots.map((b) => b.name).filter((n) => !['pseudo', 'gambar'].includes(n)), [], 'tidak ada penanda milik Modul 04')
})

test('tabel dan gambar bernomor berurutan: Tabel 1–7 dan Gambar 1–2 sesuai PDF', () => {
  const tabel = [...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1]))
  assert.deepEqual(tabel, [1, 2, 3, 4, 5, 6, 7])
})

test('tabs: Modul 01 mengganti tulisan empat tab tanpa mengubah id bagian', () => {
  const t = tabsOf(m)
  assert.deepEqual(t.map((x) => x.id), sections.map((x) => x.id))
  assert.deepEqual(t.map((x) => x.tab), ['1 Pendahuluan', '2 Konsep', '3 Penulisan', '4 Penelusuran', '5 Hubungan', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(tabsOf(modulById('04')).map((x) => x.tab), sections.map((x) => x.tab), 'Modul 04 tidak berubah')
})

test('metadata sama dengan katalog Modul 00: 14 halaman, 8 soal, tanpa prasyarat, Bab I', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [1, 'BAB I', 14, 8, []])
  assert.equal(m.soal, kuis01.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(m.algoritmaId, null)
  assert.equal(petaBab[0].modul[0].judul, m.judul)
  assert.deepEqual(m.posisi.urutan, ['01', '02', '03'])
  assert.equal(kuisById('01').soal, kuis01.soal.length)
  assert.equal(kuisById('01').tingkat, 'easy')
})

test('neighbors: hanya modul bernomor berurutan yang tersedia (01 → 02 → 03 → 04 → 05)', () => {
  assert.deepEqual(neighbors('01'), { prev: null, next: modulById('02') })
  assert.deepEqual(neighbors('02'), { prev: modulById('01'), next: modulById('03') })
  assert.deepEqual(neighbors('04'), { prev: modulById('03'), next: modulById('05') })
})

// ---------------------------------------------------------------- penelusuran
test('pseudocode: jumlah baris dan isi baris yang dirujuk tabel penelusuran', () => {
  const b = pseudo.bilmax.baris
  assert.equal(b.length, 6)
  assert.match(b[0], /^max = bil1/)
  assert.match(b[1], /max < bil2/)
  assert.match(b[2], /then max = bil2/)
  assert.match(b[3], /max < bil3/)
  assert.match(b[4], /then max = bil3/)
  assert.match(b[5], /^return max/)
  const j = pseudo.jumlah.baris
  assert.equal(j.length, 4)
  assert.match(j[1], /for i = 1 to n/)
  assert.match(j[2], /jumlah = jumlah \+ A\[i\]/)
})

test('Tabel 5 (BILANGAN_MAX(7, 4, 10)) cocok dengan simulasi: baris yang dijalankan dan nilai max', () => {
  const sim = jejakMax(7, 4, 10)
  assert.equal(sim.max, 10)
  const rows = baris('*Tabel 5.')
  const dariTabel = rows.map((r) => [Number(r[0]), Number(r[r.length - 1])])
  // baris 3 dilewati (7 < 4 FALSE), jadi tidak muncul di tabel
  assert.deepEqual(dariTabel, sim.rows.filter(([no]) => no !== 3))
  assert.ok(rows[1][2].includes('baris 3 dilewati'))
  assert.ok(rows[2][2].includes('TRUE'))
  for (const [a, b, c, hasil] of [[9, 3, 5, 9], [2, 8, 1, 8], [4, 4, 4, 4]]) assert.equal(jejakMax(a, b, c).max, hasil, `kasus ${a},${b},${c}`)
  assert.ok(md.includes('(9, 3, 5)') && md.includes('(2, 8, 1)') && md.includes('(4, 4, 4)'))
})

test('Tabel 7 (JUMLAH_n_BIL untuk [20, 35, 15]) cocok dengan simulasi; for diperiksa 4 kali, isi 3 kali', () => {
  const sim = jejakJumlah([20, 35, 15])
  assert.deepEqual([sim.jumlah, sim.cekFor, sim.isi], [70, 4, 3])
  const rows = baris('*Tabel 7.')
  assert.deepEqual(rows.slice(1).map((r) => Number(r[r.length - 1])), [...sim.rows, 70])
  assert.equal(Number(rows[0][2]), 0)
  assert.match(md, /empat kali \(untuk \$i = 1, 2, 3, 4\$\)/)
  assert.match(md, /tiga kali/)
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks yang tercetak', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1]
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trim(), cetak.trim())
  assert.equal(cetak.trim(), '10\n9 8 4\n70')
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 2, 5, 6, dan 8', () => {
  assert.equal(jejakMax(5, 12, 8).max, 12)
  assert.equal(jejakMax(5, 12, 8).assign, 2)
  assert.deepEqual(kuis01.soal[4].kunci, ['A', 'C'])
  assert.ok(kuis01.soal[4].pembahasan.includes('**2 kali**') && kuis01.soal[4].pembahasan.includes('**12**'))
  const s6 = jejakJumlah([4, -2, 9, 1])
  assert.deepEqual(s6.rows, [4, 2, 11, 12])
  assert.deepEqual([s6.jumlah, s6.cekFor, s6.isi], [12, 5, 4])
  assert.equal(kuis01.soal[5].kunci, 'C')
  assert.equal(kuis01.soal[5].opsi.find((o) => o.id === 'C').teks, `${s6.jumlah}, ${s6.cekFor} kali, ${s6.isi} kali`)
  // n! untuk n = 20
  let f = 1n
  for (let i = 2n; i <= 20n; i++) f *= i
  assert.equal(f, 2432902008176640000n)
  assert.ok(kuis01.soal[7].pembahasan.includes('2{,}4 \\times 10^{18}'))
  assert.equal(Number(f) / 1e18 > 2.4 && Number(f) / 1e18 < 2.5, true)
  // soal 2: x = 10, 7, 4, 1, -2, ... tidak pernah 0; dari 11 pun tidak pernah 0
  const jalan = (x0) => { let x = x0; const xs = []; for (let i = 0; i < 6; i++) { xs.push(x); x -= 3 } return xs }
  assert.deepEqual(jalan(10), [10, 7, 4, 1, -2, -5])
  assert.ok(jalan(10).every((v) => v !== 0) && jalan(11).every((v) => v !== 0))
  assert.ok(kuis01.soal[1].opsi[0].teks.includes('10, 7, 4, 1, −2, −5'))
  // soal 7: rancangan BILANGAN_MIN dengan dua if, dan hasil (4, 9, 2) = 2
  const min3 = (a, b, c) => { let min = a; if (min > b) min = b; if (min > c) min = c; return min }
  assert.equal(min3(4, 9, 2), 2)
  for (const [a, b, c] of [[1, 2, 3], [3, 2, 1], [2, 3, 1], [5, 5, 5], [-1, 0, 9]]) assert.equal(min3(a, b, c), Math.min(a, b, c))
})

test('struktur kuis: 8 soal pilihan ganda saja; kunci tunggal atau larik, semua id kunci ada di opsi', () => {
  assert.deepEqual(kuis01.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis01.soal.map((q) => jenisSoal(q)), ['satu', 'banyak', 'satu', 'satu', 'banyak', 'satu', 'banyak', 'satu'])
  assert.deepEqual(kuis01.soal.map((q) => q.kunci), ['C', ['A', 'C'], 'D', 'B', ['A', 'C'], 'C', ['A', 'C'], 'D'])
  for (const q of kuis01.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    assert.ok(q.opsi && q.opsi.length >= 4 && q.opsi.length <= 5, `soal ${q.no}: 4–5 opsi`)
    assert.equal(new Set(q.opsi.map((o) => o.id)).size, q.opsi.length, `id opsi unik (soal ${q.no})`)
    for (const k of [].concat(q.kunci)) assert.ok(q.opsi.some((o) => o.id === k), `kunci ${k} soal ${q.no}`)
    assert.ok(!q.tipe && !q.mandiri && !q.isian && !q.kunciTeks, `soal ${q.no} tidak memakai format lama`)
    if (Array.isArray(q.kunci)) {
      assert.ok(q.kunci.length >= 2 && q.kunci.length < q.opsi.length, `soal ${q.no}: banyak jawaban 2..${q.opsi.length - 1}`)
      assert.deepEqual([...q.kunci], [...q.kunci].sort(), `kunci terurut (soal ${q.no})`)
      assert.match(q.teks, new RegExp(`\\*\\*${q.kunci.length === 2 ? 'dua' : 'tiga'}\\*\\*`), `teks soal ${q.no} menyebut jumlah jawaban`)
    }
  }
  assert.deepEqual([...new Set(kuis01.soal.map((q) => jenisSoal(q)))].sort(), ['banyak', 'satu'], 'campuran satu jawaban dan banyak jawaban')
  assert.deepEqual(daftarKuis.find((k) => k.id === '01').tipe, ['pilihan'])
})

test('penilaian soal Modul 01: satu jawaban, banyak jawaban (utuh), dan hasil lulus pada 70%', () => {
  const [q1, q2, , q4, q5, , q7, q8] = kuis01.soal
  assert.equal(nilaiSoal(q1, 'C').benar, true)
  assert.equal(nilaiSoal(q1, 'B').benar, false)
  assert.equal(nilaiSoal(q4, 'B').benar, true)
  assert.equal(nilaiSoal(q8, 'D').benar, true)
  assert.equal(nilaiSoal(q2, ['A', 'C']).benar, true)
  assert.equal(nilaiSoal(q2, ['C', 'A']).benar, true, 'urutan pilihan tidak berpengaruh')
  assert.equal(nilaiSoal(q2, ['A']).benar, false, 'sebagian benar tetap salah')
  assert.equal(nilaiSoal(q2, ['A', 'C', 'E']).benar, false, 'kelebihan pilihan salah')
  assert.equal(nilaiSoal(q5, ['A', 'B']).benar, false)
  assert.equal(nilaiSoal(q7, ['A', 'C']).benar, true)
  assert.equal(labelSoal(q2), 'Pilih 2 jawaban')
  assert.equal(labelSoal(q1), 'Pilih 1 jawaban')
  const benar = { 1: 'C', 2: ['A', 'C'], 3: 'D', 4: 'B', 5: ['A', 'C'], 6: 'C', 7: ['A', 'C'], 8: 'D' }
  assert.deepEqual([hitungHasil(kuis01.soal, benar).skor, hitungHasil(kuis01.soal, benar).lulus], [8, true])
  const lima = hitungHasil(kuis01.soal, { ...benar, 1: 'A', 4: 'A', 8: 'A' })
  assert.deepEqual([lima.skor, lima.persen, lima.lulus], [5, 63, false])
  assert.deepEqual(hitungHasil(kuis01.soal, {}).belumDinilai, [])
  assert.equal(hitungHasil(kuis01.soal, {}).skor, 0)
})
