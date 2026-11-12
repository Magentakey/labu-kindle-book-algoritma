import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { rand } from '../lib/testRandom.js'
import { DATA_GAMBAR_1, jejakTeks, merge, mergeSort, N_GAMBAR_2, pohonMergeSort, satuBasis, tingkatPohon, totalPohon, urutanMerge } from './modul/08.hitung.js'
import { pseudo } from './modul/08.pseudo.js'
import { kuis08 } from './modul/08.kuis.js'

const md = readFileSync(new URL('./modul/08.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('08')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: tujuh bagian sesuai PDF, semua tab terpenuhi, dua gambar, dua pseudocode, tiga tabel', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'paradigma', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`)
  assert.deepEqual(slots, ['pseudo:mergesort', 'pseudo:merge', 'gambar:mergesort', 'gambar:pohon'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '5.1']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.ok(!/\\text\{[^}]*\\textbf/.test(md))
})

test('metadata sama dengan PDF dan katalog; visualizer Merge Sort terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [8, 'BAB III', 12, 8, [2, 4, 6]])
  assert.equal(m.soal, kuis08.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[2].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Algoritma', '4 Penelusuran', '5 Recurrence', '6 vs Insertion Sort', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('08'), { prev: modulById('07'), next: modulById('09') })
  assert.equal(neighbors('07').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.ok(penjelajahIds.includes(m.algoritmaId) || algoritma.some((a) => a.id === m.algoritmaId), 'algoritmaId menunjuk visualizer yang ada')
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz], [8, true])
  assert.equal(kuisById('08').soal, 8)
  assert.equal(kuisById('08').judul, kuis08.judul)
  for (const x of modul) assert.ok(!/[$\\]/.test(x.prasyaratTeks ?? ''), `${x.id}: prasyarat ditampilkan apa adanya`)
})

// ---------------------------------------------------------------- implementasi dan jejak
test('MERGE_SORT benar: hasil terurut dan sama dengan pengurutan bawaan pada array acak, termasuk array kosong dan satu elemen', () => {
  for (let uji = 0; uji < 300; uji++) {
    const n = Math.floor(rand() * 40)
    const arr = Array.from({ length: n }, () => Math.floor(rand() * 8)) // banyak nilai kembar
    const A = satuBasis(arr)
    mergeSort(A, 1, n)
    assert.deepEqual(A.slice(1), [...arr].sort((a, b) => a - b))
  }
})

test('MERGE stabil: dengan ≤ elemen sama dari bagian kiri lebih dulu (Soal 8: dengan < tidak lagi stabil)', () => {
  const stabil = (A, p, q, r, tegas) => {
    const L = A.slice(p, q + 1)
    const R = A.slice(q + 1, r + 1)
    const out = []
    let i = 0
    let j = 0
    while (i < L.length || j < R.length) {
      const ambilKiri = j >= R.length || (i < L.length && (tegas ? L[i].v < R[j].v : L[i].v <= R[j].v))
      out.push(ambilKiri ? L[i++] : R[j++])
    }
    return out.map((x) => x.id)
  }
  const A = [null, { v: 1, id: 'kiri' }, { v: 1, id: 'kanan' }]
  assert.deepEqual(stabil(A, 1, 1, 2, false), ['kiri', 'kanan'], 'dengan ≤: urutan relatif terjaga')
  assert.deepEqual(stabil(A, 1, 1, 2, true), ['kanan', 'kiri'], 'dengan <: urutan relatif berubah')
  // implementasi merge() sungguhan memakai ≤: elemen kiri dipilih lebih dulu saat sama
  const B = satuBasis([5, 5])
  const hasil = merge(B, 1, 1, 2)
  assert.deepEqual(hasil.langkah.map((s) => s.pilih), ['L', 'R'])
})

test('Tabel 2: penelusuran MERGE(A,1,3,5) dari implementasi sama dengan tabel di teks', () => {
  const A = satuBasis([3, 8, 10, 5, 20])
  const { L, R, langkah } = merge(A, 1, 3, 5)
  assert.deepEqual(L, [3, 8, 10, Infinity])
  assert.deepEqual(R, [5, 20, Infinity])
  const rows = barisTabel('*Tabel 2.')
  assert.equal(rows.length, 5)
  langkah.forEach((s, i) => {
    const [k, Li, Rj, pilih, hasil] = rows[i]
    assert.equal(Number(k), s.k)
    assert.equal(Li === '$\\infty$' ? Infinity : Number(Li), s.Li)
    assert.equal(Rj === '$\\infty$' ? Infinity : Number(Rj), s.Rj)
    assert.equal(pilih, `$${s.pilih}$: ${s.pilih === 'L' ? s.Li : s.Rj}`)
    assert.equal(hasil, s.hasil.join(', '))
  })
  assert.deepEqual(A.slice(1), [3, 5, 8, 10, 20])
})

test('penelusuran lengkap di teks (4.2) sama dengan jejak implementasi, baris demi baris', () => {
  const dariTeks = blokTeks('text', 0).trimEnd().split('\n').filter((l) => !l.startsWith('-----'))
  assert.deepEqual(dariTeks, jejakTeks([3, 10, 8, 20, 5]))
  assert.equal(blokTeks('text', 0).split('\n').filter((l) => l.startsWith('-----')).length, 1, 'tepat satu garis pembatas latihan')
  assert.ok(blokTeks('text', 0).includes('MERGE_SORT(A,1,1): 1 < 1 FALSE → kembali'))
  // kiri dulu sampai selesai sebelum kanan dimulai (pola penting di 4.2)
  const jejak = jejakTeks([3, 10, 8, 20, 5])
  assert.ok(jejak.findIndex((l) => l.includes('MERGE(A,1,2,3)')) < jejak.findIndex((l) => l.includes('MERGE_SORT(A,4,5)')))
})

test('Gambar 1: tingkat divide dan combine untuk (38, 27, 43, 3, 9, 82, 10) sesuai gambar di PDF', () => {
  const { bagi, gabung } = pohonMergeSort(DATA_GAMBAR_1)
  assert.deepEqual(bagi, [
    [[38, 27, 43, 3, 9, 82, 10]],
    [[38, 27, 43, 3], [9, 82, 10]],
    [[38, 27], [43, 3], [9, 82], [10]],
    [[38], [27], [43], [3], [9], [82], [10]],
  ])
  assert.deepEqual(gabung, [[[3, 9, 10, 27, 38, 43, 82]], [[3, 27, 38, 43], [9, 10, 82]], [[27, 38], [3, 43], [9, 82], [10]]])
  // MERGE terakhir: L = (3, 27, 38, 43, ∞), R = (9, 10, 82, ∞)
  const A = satuBasis([3, 27, 38, 43, 9, 10, 82])
  const { L, R } = merge(A, 1, 4, 7)
  assert.deepEqual([L, R], [[3, 27, 38, 43, Infinity], [9, 10, 82, Infinity]])
  assert.ok(md.includes('$q = \\lfloor 8/2 \\rfloor = 4$'))
  // elemen 10 (ganjil) menjadi kasus dasar MERGE_SORT(A, 7, 7) di kedalaman 2
  assert.ok(jejakTeks(DATA_GAMBAR_1).includes('    MERGE_SORT(A,7,7): 7 < 7 FALSE → kembali'))
  // setiap baris memuat semua elemen
  for (const t of [...bagi, ...gabung]) assert.deepEqual(t.flat().sort((a, b) => a - b), [...DATA_GAMBAR_1].sort((a, b) => a - b))
})

test('Gambar 2 dan analisis: n = 8 punya lg n + 1 = 4 tingkat, tiap tingkat berbiaya total cn, total cn(lg n + 1)', () => {
  const t = tingkatPohon(N_GAMBAR_2)
  assert.deepEqual(t.map((x) => [x.simpul, x.biaya]), [[1, 'cn'], [2, 'cn/2'], [4, 'cn/4'], [8, 'cn/8']])
  assert.equal(t.length, Math.log2(8) + 1)
  for (const x of t) assert.equal(x.simpul * x.ukuran, 8, 'jumlah ukuran tiap tingkat = n (tiap tingkat berbiaya cn)')
  assert.equal(totalPohon(8), 32)
  assert.throws(() => tingkatPohon(6))
  // biaya sebenarnya: banyaknya salinan elemen pada MERGE di tiap tingkat = n, sehingga menjumlahkan r − p + 1 per tingkat memberi n
  for (const n of [2, 4, 8, 16, 64]) {
    const tiapTingkat = {}
    mergeSort(satuBasis(Array.from({ length: n }, (_, i) => n - i)), 1, n, (e) => {
      if (e.jenis === 'merge') tiapTingkat[e.kedalaman] = (tiapTingkat[e.kedalaman] ?? 0) + (e.r - e.p + 1)
    })
    assert.deepEqual(Object.values(tiapTingkat), Array(Math.log2(n)).fill(n), `n = ${n}`)
  }
  assert.ok(md.includes('T(n) = cn(\\lg n + 1) = cn \\lg n + cn = \\Theta(n \\lg n)'))
})

test('recurrence T(n) = 2T(n/2) + cn: banyaknya perbandingan Merge Sort memenuhi batas n lg n dan tidak bergantung isi data', () => {
  const hitungBanding = (arr) => {
    let c = 0
    const A = satuBasis(arr)
    mergeSort(A, 1, arr.length, (e) => {
      if (e.jenis === 'merge') c += e.r - e.p + 1 // satu perbandingan per posisi k
    })
    return c
  }
  for (const n of [8, 16, 64, 256, 1024]) {
    const terurut = Array.from({ length: n }, (_, i) => i)
    const terbalik = [...terurut].reverse()
    const acak = [...terurut].sort(() => rand() - 0.5)
    const [a, b, c] = [terurut, terbalik, acak].map(hitungBanding)
    assert.equal(a, n * Math.log2(n), `n=${n}: kasus terbaik`)
    assert.equal(a, b)
    assert.equal(b, c, 'jumlah langkah MERGE sama untuk semua isi data')
  }
  // titik potong ilustratif Modul 05: 2n² vs 50 n lg n pertama kali Merge Sort lebih kecil pada n = 190
  const pertama = Array.from({ length: 1000 }, (_, i) => i + 2).find((n) => 50 * n * Math.log2(n) < 2 * n * n)
  assert.equal(pertama, 190)
  assert.ok(md.includes('$n = 190$') && md.includes('$2n^2$ vs $50\\, n \\lg n$'))
  // 10¹² langkah untuk satu juta data pada Insertion Sort kasus terburuk
  assert.equal(1e6 ** 2, 1e12)
})

test('program Python di modul dijalankan sungguhan dan sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 1).trimEnd()
  const model = urutanMerge([3, 10, 8, 20, 5]).map((e) => `MERGE(${e.p},${e.q},${e.r}) -> [${e.hasil.join(', ')}]`)
  assert.deepEqual(cetak.split('\n'), [...model, '[3, 5, 8, 10, 20]'])
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trimEnd(), cetak)
})

test('pseudocode: nomor baris sesuai penjelasan di teks, dan MERGE memakai ≤ dan sentinel', () => {
  assert.equal(pseudo.mergesort.baris.length, 5)
  assert.equal(pseudo.merge.baris.length, 17)
  const s = pseudo.merge.baris
  assert.ok(s[7].startsWith('L[n1 + 1] = ∞') && s[8].startsWith('R[n2 + 1] = ∞'), 'baris 8–9 sentinel')
  assert.ok(s[12].includes('L[i] ≤ R[j]'), 'baris 13 memakai ≤')
  assert.ok(s[11].startsWith('for k = p to r'), 'baris 12')
  assert.ok(pseudo.mergesort.baris[0].startsWith('if p < r'))
  assert.ok(pseudo.mergesort.baris[4].includes('MERGE(A, p, q, r)'))
  // MERGE: n1 = q − p + 1, n2 = r − q, dan n1 + n2 = r − p + 1 = n
  for (const [p, q, r] of [[1, 3, 5], [4, 4, 5], [1, 4, 7]]) assert.equal(q - p + 1 + (r - q), r - p + 1)
})

// ---------------------------------------------------------------- tabel di teks
test('Tabel 1 dan 3: isi sesuai PDF', () => {
  const t1 = barisTabel('*Tabel 1.')
  assert.deepEqual(t1.map((r) => r[0]), ['Divide', 'Conquer', 'Combine'])
  assert.deepEqual(t1.map((r) => r[2].includes('Konstan') || r[2].includes('2T(n/2)') || r[2].includes('Sebanding')), [true, true, true])
  const t3 = barisTabel('*Tabel 3.')
  assert.deepEqual(t3.map((r) => r[0]), ['Paradigma', 'Kasus terbaik (data terurut)', 'Kasus terburuk', 'Memori tambahan', 'Stabil?', 'Cocok untuk'])
  assert.deepEqual([t3[1][1], t3[1][2], t3[2][1], t3[2][2]], ['$\\Theta(n)$', '$\\Theta(n \\lg n)$', '$\\Theta(n^2)$', '$\\Theta(n \\lg n)$'])
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 2, 3, 6, 7, dan 8', () => {
  // soal 2: urutan MERGE untuk (5, 2, 4, 6, 1, 3)
  const u = urutanMerge([5, 2, 4, 6, 1, 3])
  assert.deepEqual(u.map((e) => [e.p, e.q, e.r]), [[1, 1, 2], [1, 2, 3], [4, 4, 5], [4, 5, 6], [1, 3, 6]])
  assert.deepEqual(u.map((e) => e.hasil), [[2, 5], [2, 4, 5], [1, 6], [1, 3, 6], [1, 2, 3, 4, 5, 6]])
  for (const [i, e] of u.entries()) assert.ok(kuis08.soal[1].pembahasan.includes(`\`MERGE(${e.p},${e.q},${e.r})\``), `langkah ${i + 1} ada di pembahasan`)
  // soal 3: MERGE(A, 1, 2, 4) untuk (4, 9, 1, 7)
  const A = satuBasis([4, 9, 1, 7])
  const { L, R, langkah } = merge(A, 1, 2, 4)
  assert.deepEqual([L, R], [[4, 9, Infinity], [1, 7, Infinity]])
  assert.deepEqual(langkah.map((s) => [s.Li, s.Rj, s.pilih, s.pilih === 'L' ? s.Li : s.Rj]), [[4, 1, 'R', 1], [4, 7, 'L', 4], [9, 7, 'R', 7], [9, Infinity, 'L', 9]])
  assert.deepEqual(A.slice(1), [1, 4, 7, 9])
  // soal 6: n = 16 → 5 tingkat, 80c, 256c; dan n = 1024
  assert.equal(Math.log2(16) + 1, 5)
  assert.deepEqual([totalPohon(16), 16 ** 2], [80, 256])
  assert.deepEqual([totalPohon(1024), 1024 ** 2], [11264, 1048576])
  // soal 7: tiga submasalah n/3 → T(n) = 3T(n/3) + Θ(n); jumlah ukuran tiap tingkat = n sehingga juga n lg n (basis 3)
  for (const n of [3, 9, 27, 81]) assert.equal(3 * (n / 3), n)
  // soal 4: Merge Sort pada data terurut tetap n lg n langkah MERGE (lihat uji recurrence)
})

