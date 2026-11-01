import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { algoritma } from '../data/algoritma.js'
import { modulById, neighbors, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById, tipeSoal } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { barisN, contoh, contohById, periksa, saksiBukanBig, teksF } from '../viz/boundModel.js'
import { kuis06 } from './modul/06.kuis.js'
import { GAMBAR_1 } from './modul/06.hitung.js'

// Akhir baris dinormalkan: git di Windows bisa mengubah berkas teks menjadi CRLF.
const md = readFileSync(new URL('./modul/06.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('06')

/** Pecahan eksak dengan BigInt, supaya bukti diperiksa tanpa galat pembulatan. */
const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b))
const pec = (a, b = 1n) => {
  const g = gcd(a, b) || 1n
  const t = b < 0n ? -1n : 1n
  return { a: (t * a) / g, b: (t * b) / g }
}
const kurang = (x, y) => pec(x.a * y.b - y.a * x.b, x.b * y.b)
const nonNeg = (x) => x.a >= 0n
const tambah = (x, y) => pec(x.a * y.b + y.a * x.b, x.b * y.b)
const bil = (n) => pec(BigInt(n))
/** Memeriksa deret ketaksamaan secara eksak untuk setiap n dari n0 sampai N. */
const semuaN = (n0, N, ok) => {
  for (let n = n0; n <= N; n++) if (!ok(BigInt(n))) return false
  return true
}

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
/** Sel tabel berisi bilangan, \dfrac{a}{b}, atau \to x → nilai desimal (atau string 'tak hingga' untuk panah). */
const nilaiSel = (sel) => {
  const t = sel.replace(/\$/g, '').trim()
  const f = /^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(t)
  if (f) return (f[1] ? -1 : 1) * (Number(f[2]) / Number(f[3]))
  if (/^-?\d+$/.test(t)) return Number(t)
  return t
}

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: sembilan bagian sesuai PDF, semua tab terpenuhi, satu gambar, empat tabel, kode Python', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'hubungan', 'penerapan', 'berguna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', '8', '9', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot'))
  assert.deepEqual(slots.map((b) => `${b.name}:${b.arg}`), ['gambar:batas'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '4.1', '4.2', '5.1', '6.1', '7.1', '7.2', '7.3']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
})

test('metadata sama dengan PDF dan katalog; penjelajah terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [6, 'BAB II', 11, 8, [4, 5]])
  assert.equal(m.soal, kuis06.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[1].modul[3].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Fungsi Acuan', '3 Theta (Θ)', '4 Big-Oh (O)', '5 Omega (Ω)', '9 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('06'), { prev: modulById('05'), next: null })
  assert.equal(neighbors('05').next, m)
  assert.equal(m.pdf, 'modul-06-notasi-asimtotik.pdf')
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'batas-asimtotik')
  assert.ok(penjelajahIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.thumb], [6, true, 'bound'], 'kartu galeri menunjuk Modul 06 dan penjelajah')
  assert.equal(kuisById('06').soal, 8)
  assert.equal(kuisById('06').judul, kuis06.judul)
  assert.equal(kuisById('06').tingkat, 'medium')
})

// ---------------------------------------------------------------- Tabel 1 sampai 4 dicocokkan dengan hitungan mandiri
test('Tabel 1: h(n) = 2 − 3/n + 1/n² untuk n = 1..4 dan limit 2, sama dengan hitungan eksak', () => {
  const rows = barisTabel('*Tabel 1.')
  assert.equal(rows.length, 5)
  const h = (n) => tambah(kurang(bil(2), pec(3n, BigInt(n))), pec(1n, BigInt(n * n)))
  rows.slice(0, 4).forEach((r, i) => {
    const n = i + 1
    assert.equal(Number(r[0]), n)
    const nilai = nilaiSel(r[2])
    assert.ok(Math.abs(nilai - Number(h(n).a) / Number(h(n).b)) < 1e-12, `h(${n}) = ${nilai}`)
  })
  assert.deepEqual([h(1), h(2), h(3), h(4)], [pec(0n), pec(3n, 4n), pec(10n, 9n), pec(21n, 16n)])
  assert.ok(rows[4][0].includes('\\to \\infty') && rows[4][2].includes('\\to 2'))
  // langkah 2 memuat pecahan antara: 8−6+1 = 3 dan 18−9+1 = 10
  assert.ok(md.includes('\\dfrac{8 - 6 + 1}{4}') && md.includes('\\dfrac{18 - 9 + 1}{9}'))
  // turunan h'(n) = 3/n² − 2/n³ = (3n − 2)/n³
  for (const n of [1, 2, 5, 10]) assert.ok(Math.abs(3 / n ** 2 - 2 / n ** 3 - (3 * n - 2) / n ** 3) < 1e-12)
  // h naik untuk n ≥ 1 sehingga h(n) ≥ h(2) = 3/4 untuk n ≥ 2, dan h(n) < 2 selalu
  assert.ok(semuaN(1, 5000, (n) => nonNeg(kurang(h(Number(n) + 1), h(Number(n)))) && kurang(bil(2), h(Number(n))).a > 0n))
})

test('Tabel 2: ½ − 3/n untuk n = 1..7 sama dengan hitungan eksak; nilai tak negatif pertama pada n = 6', () => {
  const rows = barisTabel('*Tabel 2.')
  assert.equal(rows.length, 1)
  const isi = rows[0].slice(1)
  assert.equal(isi.length, 8)
  const nilai = (n) => kurang(pec(1n, 2n), pec(3n, BigInt(n)))
  for (let n = 1; n <= 7; n++) assert.ok(Math.abs(nilaiSel(isi[n - 1]) - Number(nilai(n).a) / Number(nilai(n).b)) < 1e-12, `n = ${n}: ${isi[n - 1]}`)
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(nilai), [pec(-5n, 2n), pec(-1n), pec(-1n, 2n), pec(-1n, 4n), pec(-1n, 10n), pec(0n), pec(1n, 14n)])
  assert.ok(isi[7].includes('\\to') && isi[7].includes('\\dfrac{1}{2}'))
  const pertama = [1, 2, 3, 4, 5, 6, 7].find((n) => nonNeg(nilai(n)))
  assert.equal(pertama, 6)
  assert.ok(md.includes('Nilai pertama yang tidak negatif adalah pada $n = 6$, maka ambil $n_0 = 6$'))
})

test('Tabel 3 dan 4: isi tabel sesuai PDF', () => {
  const t3 = barisTabel('*Tabel 3.')
  assert.deepEqual(t3.map((r) => r[3]), ['$a = b$', '$a \\le b$', '$a \\ge b$'])
  assert.deepEqual(t3.map((r) => r[2]), ['Tumbuh dengan laju yang sama', 'Tumbuh tidak lebih cepat', 'Tumbuh tidak lebih lambat'])
  const t4 = barisTabel('*Tabel 4.')
  assert.deepEqual(t4.map((r) => r[2]), ['$\\Theta(n)$', '$\\Theta(n)$', '$\\Theta(1)$', '$\\Theta(\\lg n)$', '$\\Theta(n^2)$'])
  assert.deepEqual(t4.map((r) => r[0].replace(/`/g, '').split(' (')[0]), ['JUMLAH_n_BIL', 'CARI_BIL_K kasus terburuk', 'CARI_BIL_K kasus terbaik', 'Binary Search kasus terburuk', 'Insertion Sort kasus terburuk'])
  // Binary Search: ⌊lg n⌋ + 1 adalah Θ(lg n) — dengan c₁ = 1, c₂ = 2, n₀ = 2
  for (let n = 2; n <= 100000; n++) {
    const f = Math.floor(Math.log2(n)) + 1
    assert.ok(Math.log2(n) <= f && f <= 2 * Math.log2(n), `n=${n}`)
  }
})

// ---------------------------------------------------------------- pembuktian dicek eksak (pecahan BigInt), termasuk bahwa n₀ lebih kecil gagal
const N_CEK = 3000
test('Θ: ¾n² ≤ 2n² − 3n + 1 ≤ 2n² benar untuk n ≥ 2 dan gagal pada n = 1; pasangan alternatif c₁ = 1, c₂ = 2, n₀ = 3', () => {
  const F = (n) => pec(2n * n * n - 3n * n + 1n, n * n) // f(n)/n²
  const ok = (c1, c2, n0) => semuaN(n0, N_CEK, (n) => nonNeg(kurang(F(n), c1)) && nonNeg(kurang(c2, F(n))) && c1.a > 0n)
  assert.equal(ok(pec(3n, 4n), bil(2), 2), true)
  assert.equal(ok(pec(3n, 4n), bil(2), 1), false, 'n = 1: h(1) = 0 < 3/4')
  assert.equal(ok(bil(1), bil(2), 3), true)
  assert.equal(ok(bil(1), bil(2), 2), false, 'h(2) = 3/4 < 1')
  assert.ok(md.includes('c_1 = \\frac{3}{4}') && md.includes('c_2 = 2') && md.includes('n_0 = 2'))
  const r = periksa('theta', { a: 2, b: -3, c0: 1 }, 2, { c1: 0.75, c2: 2, c: 1 }, 2)
  assert.deepEqual([r.berlaku, r.n0Terkecil], [true, 2])
})

test('O: 0 ≤ ½n² − 3n ≤ ½n² benar untuk n ≥ 6, gagal pada n = 5 (f negatif)', () => {
  const F = (n) => pec(n * n - 6n * n, 2n) // ½n² − 3n  (n² − 6n)/2
  const ok = (n0) => semuaN(n0, N_CEK, (n) => nonNeg(F(n)) && nonNeg(kurang(pec(n * n, 2n), F(n))))
  assert.equal(ok(6), true)
  assert.equal(ok(5), false)
  assert.deepEqual([1n, 2n, 3n, 4n, 5n, 6n].map((n) => F(n).a < 0n), [true, true, true, true, true, false])
  const r = periksa('big', { a: 0.5, b: -3, c0: 0 }, 2, { c1: 1, c2: 2, c: 0.5 }, 6)
  assert.deepEqual([r.berlaku, r.n0Terkecil], [true, 6])
})

test('Ω: 0 ≤ (10/3)n ≤ 10n − 20 benar untuk n ≥ 3, gagal pada n = 2', () => {
  const ok = (n0) => semuaN(n0, N_CEK, (n) => nonNeg(kurang(pec(10n * n - 20n), pec(10n * n, 3n))))
  assert.equal(ok(3), true)
  assert.equal(ok(2), false)
  assert.ok(md.includes('Ambil $n_0 = 3$ dan $c = \\frac{10}{3}$'))
  // 10 − 20/n untuk n = 1..4: −10, 0, 10/3, 5
  assert.deepEqual([1n, 2n, 3n, 4n].map((n) => kurang(bil(10), pec(20n, n))), [pec(-10n), pec(0n), pec(10n, 3n), pec(5n)])
  const r = periksa('omega', { a: 0, b: 10, c0: -20 }, 1, { c1: 1, c2: 2, c: 10 / 3 }, 3)
  assert.deepEqual([r.berlaku, r.n0Terkecil], [true, 3])
})

test('n² ≠ O(n): untuk setiap c dan n₀ ada n = max(n₀, ⌈c⌉ + 1) yang melanggar; n³ ≠ O(n²) sama', () => {
  for (const c of [0.5, 1, 2, 10, 100.5, 12345]) {
    for (const n0 of [1, 7, 5000]) {
      const s = saksiBukanBig(c, n0)
      assert.ok(s.n >= n0 && s.melanggar && s.kiri > s.kanan, `c=${c}, n0=${n0}`)
      assert.ok(s.n ** 3 > c * s.n ** 2, `n³ > c·n² pada n = ${s.n}`)
    }
  }
  // periksa() sepakat: tidak ada n₀ yang berhasil, dan pelanggaran pertama muncul tepat di ⌈c⌉ + 1 (bila n₀ kecil)
  for (const c of [1, 2, 10, 50]) {
    const r = periksa('big', { a: 1, b: 0, c0: 0 }, 1, { c1: 1, c2: 2, c }, 1)
    assert.deepEqual([r.berlaku, r.alasan, r.nGagal], [false, 'akhir', c + 1], `c = ${c}`)
  }
})

test('Soal 6: n₀ = 1 melanggar syarat 0 ≤ f(n) pada n = 1, n₀ yang tepat adalah 6', () => {
  const r = periksa('big', { a: 0.5, b: -3, c0: 0 }, 2, { c1: 1, c2: 2, c: 0.5 }, 1)
  assert.deepEqual([r.berlaku, r.nGagal, r.sisiGagal, r.n0Terkecil, r.alasan], [false, 1, '0 ≤ f(n)', 6, 'awal'])
  assert.equal(barisN('big', { a: 0.5, b: -3, c0: 0 }, 2, { c: 0.5 }, 1).f, -2.5)
})

test('program Python di modul dijalankan sungguhan: keluarannya sama dengan teks dan dengan hasil model', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1].trimEnd()
  assert.equal(cetak, 'True\nTrue\nTrue\nFalse')
  const model = [
    periksa('theta', { a: 2, b: -3, c0: 1 }, 2, { c1: 0.75, c2: 2, c: 1 }, 2).berlaku,
    periksa('big', { a: 0.5, b: -3, c0: 0 }, 2, { c1: 1, c2: 2, c: 0.5 }, 6).berlaku,
    periksa('omega', { a: 0, b: 10, c0: -20 }, 1, { c1: 1, c2: 2, c: 10 / 3 }, 3).berlaku,
    periksa('big', { a: 0.5, b: -3, c0: 0 }, 2, { c1: 1, c2: 2, c: 0.5 }, 5).berlaku,
  ].map((b) => (b ? 'True' : 'False'))
  assert.equal(model.join('\n'), cetak, 'model penjelajah memberi hasil yang sama dengan program di teks')
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trimEnd(), cetak)
})

// ---------------------------------------------------------------- Gambar 1
test('Gambar 1: di sebelah kanan n₀ kurva f terjepit; batas bawah di bawah f dan batas atas di atas f', () => {
  const { n0, titik, f, bawah, atas } = GAMBAR_1
  let sebelumKiriMelanggar = false
  for (let i = 0; i <= titik; i++) {
    const t = i / titik
    if (t >= n0) assert.ok(bawah(t) <= f(t) && f(t) <= atas(t), `t=${t}`)
    else if (!(bawah(t) <= f(t) && f(t) <= atas(t))) sebelumKiriMelanggar = true
  }
  assert.ok(sebelumKiriMelanggar, 'sebelum n₀ f boleh keluar dari batas (itulah gunanya n₀)')
  const gambar = readFileSync(new URL('./modul/06.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Gambar 1. Gambaran grafis ketiga notasi (diadaptasi dari gambaran di bahan kuliah)'), 'keterangan gambar sesuai PDF')
  for (const l of ['(a) f(n) = Θ(g(n))', '(b) f(n) = O(g(n))', '(c) f(n) = Ω(g(n))']) assert.ok(gambar.includes(l), l)
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 1, 2, 3, 4, 6, 7', () => {
  const ok = (n0, N, f) => semuaN(n0, N, f)
  // soal 1: 3n² + 5n, c₁ = 3, c₂ = 4, n₀ = 5 (kali n²: 3 ≤ 3 + 5/n ≤ 4 ⇔ n ≥ 5); alternatif c₂ = 8, n₀ = 1
  const g1 = (n) => pec(3n * n * n + 5n * n, n * n) // (3n² + 5n)/n² = 3 + 5/n
  assert.equal(ok(5, N_CEK, (n) => nonNeg(kurang(g1(n), bil(3))) && nonNeg(kurang(bil(4), g1(n)))), true)
  assert.equal(ok(4, N_CEK, (n) => nonNeg(kurang(bil(4), g1(n)))), false, 'n₀ = 4 gagal: 3 + 5/4 > 4')
  assert.equal(ok(1, N_CEK, (n) => nonNeg(kurang(g1(n), bil(3))) && nonNeg(kurang(bil(8), g1(n)))), true)
  assert.equal(g1(1n).a, 8n)
  // soal 2: 4n + 7 ≤ 5n untuk n ≥ 7; alternatif c = 11, n₀ = 1
  assert.equal(ok(7, N_CEK, (n) => 4n * n + 7n <= 5n * n), true)
  assert.equal(ok(6, N_CEK, (n) => 4n * n + 7n <= 5n * n), false)
  assert.equal(ok(1, N_CEK, (n) => 4n * n + 7n <= 11n * n), true)
  // soal 3: ¼n² ≤ ½n² − 2n, n₀ terkecil = 8
  const r3 = periksa('omega', { a: 0.5, b: -2, c0: 0 }, 2, { c1: 1, c2: 2, c: 0.25 }, 8)
  assert.deepEqual([r3.berlaku, r3.n0Terkecil], [true, 8])
  assert.equal(kuis06.soal[2].isian[0].kunci, 8)
  // tepat di n = 8: ¼·64 = 16 ≤ 32 − 16 = 16; di n = 7: 12,25 ≤ 24,5 − 14 = 10,5 salah
  assert.deepEqual([7, 8].map((n) => [0.25 * n * n, 0.5 * n * n - 2 * n]), [[12.25, 10.5], [16, 16]])
  assert.ok(Math.abs(0.25 * 49 - 12.25) < 1e-12 && 0.5 * 49 - 14 === 10.5, 'n = 7: 12,25 ≤ 10,5 salah')
  // soal 4: (a) n lg n ≤ n²; (b) n² ≤ c·n lg n gagal untuk setiap c; (c) 5 = Θ(1)
  for (let n = 1; n <= 100000; n++) assert.ok(n * Math.log2(n) <= n * n)
  for (const c of [1, 10, 100, 1000]) {
    const n = 2 ** Math.ceil(Math.log2(c) + 1) * 64 // cukup besar supaya n/lg n > c
    assert.ok(n * n > c * n * Math.log2(n), `c = ${c}`)
  }
  for (const [c1, c2] of [[1, 5]]) assert.ok(c1 * 1 <= 5 && 5 <= c2 * 1)
  assert.deepEqual(kuis06.soal[3].isian.map((f) => f.kunci), ['Benar', 'Salah', 'Benar'])
  // soal 6: lihat Soal 6 di atas
  // soal 7: n³ ≤ c n² melanggar di n = max(n₀, ⌈c⌉ + 1)
  for (const c of [1, 7.5, 1000]) assert.ok(saksiBukanBig(c, 1).n > c)
  // soal 8: 2n = Θ(n) padahal 2n ≠ n
  for (const n of [1, 5, 100]) assert.ok(n <= 2 * n && 2 * n <= 2 * n && 2 * n !== n)
})

test('struktur kuis: 8 soal, jenis sesuai PDF, soal 1, 2, 6, 7 dinilai sendiri, satu jenis jawaban per soal', () => {
  assert.deepEqual(kuis06.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis06.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pembuktian', 'Pembuktian', 'Pembuktian', 'Benar/Salah', 'Pilihan Ganda', 'Analisis', 'Pembuktian', 'Pilihan Ganda'])
  assert.deepEqual(kuis06.soal.filter((q) => q.opsi).map((q) => q.kunci), ['B', 'B'])
  assert.deepEqual(kuis06.soal.filter((q) => q.mandiri).map((q) => q.no), [1, 2, 6, 7])
  for (const q of kuis06.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci), `kunci soal ${q.no}`)
    if (q.mandiri) assert.ok(q.kunciTeks, `kunciTeks soal ${q.no}`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis06.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '06').tipe].sort())
  assert.ok(tipeSoal.some((t) => t.id === 'pembuktian' && t.label === TIPE_LABEL.pembuktian))
})

test('penilaian soal Modul 06: isian, pilihan, dan hasil lulus pada 70%', () => {
  const [, , q3, q4, q5, , , q8] = kuis06.soal
  assert.equal(nilaiSoal(q3, ['8']).benar, true)
  assert.equal(nilaiSoal(q3, ['7']).benar, false)
  assert.equal(nilaiSoal(q4, ['Benar', 'Salah', 'Benar']).benar, true)
  assert.equal(nilaiSoal(q4, ['Benar', 'Benar', 'Benar']).benar, false)
  assert.equal(nilaiSoal(q5, 'B').benar, true)
  assert.equal(nilaiSoal(q5, 'A').benar, false)
  assert.equal(nilaiSoal(q8, 'B').benar, true)
  assert.equal(nilaiSoal(q8, 'D').benar, false)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: ok, 2: ok, 3: ['8'], 4: ['Benar', 'Salah', 'Benar'], 5: 'B', 6: ok, 7: ok, 8: 'B' }
  const h = hitungHasil(kuis06.soal, semua)
  assert.deepEqual([h.skor, h.persen, h.lulus], [8, 100, true])
  assert.deepEqual(hitungHasil(kuis06.soal, { ...semua, 1: undefined }).belumDinilai, [1])
  const enam = hitungHasil(kuis06.soal, { ...semua, 3: ['1'], 5: 'A' })
  assert.deepEqual([enam.skor, enam.persen, enam.lulus], [6, 75, true])
  const lima = hitungHasil(kuis06.soal, { ...semua, 3: ['1'], 5: 'A', 8: 'A' })
  assert.deepEqual([lima.skor, lima.persen, lima.lulus], [5, 63, false])
})

// ---------------------------------------------------------------- model penjelajah
test('boundModel: teksF, contoh siap pakai, dan periksa() sama dengan pemindaian langsung pada polinomial acak', async () => {
  const { rand } = await import('../lib/testRandom.js')
  assert.deepEqual([{ a: 2, b: -3, c0: 1 }, { a: 0.5, b: -3, c0: 0 }, { a: 0, b: 10, c0: -20 }, { a: 1, b: 0, c0: 0 }, { a: 0, b: 0, c0: 0 }].map(teksF), ['2n² − 3n + 1', '0,5n² − 3n', '10n − 20', 'n²', '0'])
  const hasilContoh = Object.fromEntries(contoh.map((c) => [c.id, periksa(c.notasi, c.p, c.k, { c1: c.c1, c2: c.c2, c: c.c }, c.n0)]))
  assert.deepEqual(Object.entries(hasilContoh).map(([id, r]) => [id, r.berlaku]), [['theta', true], ['big', true], ['omega', true], ['salah-n0', false], ['bukan-big', false]])
  assert.equal(contohById('tidak-ada'), null)
  const pilih = (arr) => arr[Math.floor(rand() * arr.length)]
  for (let i = 0; i < 400; i++) {
    const p = { a: pilih([-2, -1, 0, 0.5, 1, 2, 3]), b: pilih([-10, -3, 0, 2, 7]), c0: pilih([-20, -5, 0, 1, 9]) }
    const k = pilih([0, 1, 2, 3])
    const notasi = pilih(['theta', 'big', 'omega'])
    const konst = { c1: pilih([0.25, 0.75, 1, 2]), c2: pilih([1, 2, 4, 10]), c: pilih([0.25, 0.5, 1, 3, 10]) }
    const n0 = pilih([1, 2, 5, 12])
    const r = periksa(notasi, p, k, konst, n0)
    // pemindaian langsung sampai 3000 (cukup besar untuk koefisien kecil ini)
    let nGagal = null
    for (let n = n0; n <= 3000 && nGagal === null; n++) {
      const b = barisN(notasi, p, k, konst, n)
      const nonNegF = notasi === 'big' || notasi === 'theta' ? b.f >= -1e-9 || notasi === 'theta' : true
      if (!b.ok || (notasi === 'big' && !nonNegF)) nGagal = n
    }
    assert.equal(r.nGagal === null ? null : Math.min(r.nGagal, 3001) <= 3000 ? r.nGagal : null, nGagal, `${notasi} ${teksF(p)} k=${k} ${JSON.stringify(konst)} n0=${n0}`)
    if (r.berlaku) assert.equal(nGagal, null)
  }
})
