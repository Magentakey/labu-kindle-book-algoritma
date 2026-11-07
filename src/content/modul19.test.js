import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { rand } from '../lib/testRandom.js'
import {
  adalahSpanningTree, banyakSpanningTreeKirchhoff, bobotBusur, bobotMstKruskal, bobotTotal, busurContoh, cayley, jarakTerpendek, kombinasi, lintasanDiTree, menghormati,
  mstT1, mstT2, namaBusur, posisiContoh, potongan, ringkasBruteForce, semuaSpanningTree, simpulContoh,
} from '../viz/mstModel.js'
import { kuis19 } from './modul/19.kuis.js'
import { pseudo } from './modul/19.pseudo.js'

const md = readFileSync(new URL('./modul/19.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('19')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]

/** Graf terhubung acak (pohon acak + busur tambahan) dengan simpul huruf. `bobotUnik` memberi bobot berbeda semua; selain itu bobot kecil (banyak seri). */
const grafAcak = (n, { bobotUnik = false, maxW = 4, p = 0.35 } = {}) => {
  const simpul = 'abcdefghijk'.slice(0, n).split('')
  const pasang = new Set()
  for (let i = 1; i < n; i++) pasang.add(namaBusur(simpul[i], simpul[Math.floor(rand() * i)]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < p) pasang.add(namaBusur(simpul[i], simpul[j]))
  const daftar = [...pasang]
  const w = bobotUnik ? daftar.map((_, i) => i + 1).sort(() => rand() - 0.5) : daftar.map(() => 1 + Math.floor(rand() * maxW))
  return { simpul, busur: daftar.map((nm, i) => [nm[0], nm[1], w[i]]) }
}
const komponen = (simpul, himpunan) => {
  const induk = Object.fromEntries(simpul.map((v) => [v, v]))
  const akar = (x) => { while (induk[x] !== x) x = induk[x]; return x }
  for (const n of himpunan) induk[akar(n[0])] = akar(n[1])
  return new Set(simpul.map(akar)).size
}

test('struktur: enam bagian PDF + referensi, dua gambar, GENERIC-MST, tiga tabel, kode Python; teks polos tanpa TeX di judul', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['gambar:contoh', 'pseudo:generic', 'gambar:cut'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '2.3', '3.1', '4.1']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Definisi', 'Teorema (Cormen dkk., 2009, Teorema 23.1)'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
})

test('metadata sama dengan PDF dan katalog; Modul 19 membuka Bab VI-b dan belum punya visualizer sendiri', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [19, 'BAB VI', 9, 7])
  assert.equal(m.soal, kuis19.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[6].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Spanning Tree', '3 Cut dan Safe Edge', '4 MST Tidak Tunggal', '5 Keterkaitan', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('19'), { prev: modulById('18'), next: null })
  assert.equal(neighbors('18').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [16, 13])
  assert.equal(m.algoritmaId, null)
  assert.deepEqual(m.posisi.urutan, ['19', '20', '21'])
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
  assert.equal(kuisById('19').soal, 7)
  assert.equal(kuisById('19').judul, kuis19.judul)
})

test('pseudocode GENERIC-MST 5 baris sama dengan PDF', () => {
  const b = pseudo.generic.baris
  assert.equal(b.length, 5)
  assert.deepEqual([b[0], b[1], b[4]], ['A = ∅', 'while A belum membentuk spanning tree', 'return A'])
  assert.ok(b[2].includes('cari busur (u, v) yang safe untuk A') && b[3].includes('A = A ∪ {(u, v)}'))
  assert.equal(pseudo.generic.header, 'GENERIC-MST(G, w)')
})

test('graf contoh: 9 simpul, 14 busur, bobot sama dengan program Python di modul; terhubung; posisi lengkap', () => {
  assert.deepEqual([simpulContoh.length, busurContoh.length], [9, 14])
  const kode = blokTeks('python')
  const dariKode = [...kode.matchAll(/\("(\w)","(\w)",(\d+)\)/g)].map((x) => [x[1], x[2], Number(x[3])])
  assert.deepEqual(dariKode, busurContoh)
  assert.ok(kode.includes('V = "abcdefghi"'))
  assert.equal(komponen(simpulContoh, busurContoh.map(([u, v]) => u + v)), 1)
  assert.deepEqual(Object.keys(posisiContoh).sort(), [...simpulContoh])
  for (const p of Object.values(posisiContoh)) assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)
  // dua busur berbobot 8: (a,h) dan (b,c); tidak ada bobot ganda lain di antara busur yang dibicarakan modul
  assert.deepEqual(busurContoh.filter(([, , w]) => w === 8).map(([u, v]) => u + v), ['ah', 'bc'])
})

test('2.1 Gambar 1: MST A berbobot 37 adalah spanning tree dan bobot terkecil; tidak ada yang lebih ringan (brute force)', () => {
  assert.equal(adalahSpanningTree(simpulContoh, mstT1), true)
  assert.equal(mstT1.length, simpulContoh.length - 1)
  assert.equal(bobotTotal(busurContoh, mstT1), 37)
  assert.ok(md.includes('$4 + 8 + 7 + 4 + 2 + 9 + 2 + 1 = 37$'))
  assert.deepEqual([4, 8, 7, 4, 2, 9, 2, 1], mstT1.map((n) => bobotBusur(busurContoh, n[0], n[1])))
  const r = ringkasBruteForce(simpulContoh, busurContoh)
  assert.equal(r.min, 37)
  assert.equal(bobotMstKruskal(simpulContoh, busurContoh), 37)
  const g = readFileSync(new URL('./modul/19.gambar.jsx', import.meta.url), 'utf8')
  for (const n of mstT1) assert.ok(g.includes(`(${n[0]},${n[1]})`), `caption Gambar 1 memuat ${n}`)
})

test('2.2 empat sifat tree pada spanning tree graf acak: |V|-1 busur, tanpa cycle, tambah satu busur = tepat satu cycle, hapus satu busur = dua komponen', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 4), { p: 0.5 })
    const semua = semuaSpanningTree(simpul, busur)
    assert.ok(semua.length >= 1)
    const T = semua[Math.floor(rand() * semua.length)]
    assert.equal(T.length, simpul.length - 1, 'sifat 1')
    assert.equal(komponen(simpul, T), 1, 'terhubung')
    // sifat 2: tanpa cycle = |E| = |V| - komponen
    assert.equal(T.length, simpul.length - komponen(simpul, T))
    // sifat 3: menambah satu busur di luar T membuat |E| = |V| dan tepat satu cycle (rank siklomatik 1)
    for (const [u, v] of busur) {
      const n = namaBusur(u, v)
      if (T.includes(n)) continue
      const tambah = [...T, n]
      assert.equal(tambah.length - simpul.length + komponen(simpul, tambah), 1, 'tepat satu cycle independen')
      // menghapus tiap busur di lintasan T antara u dan v memulihkan spanning tree: persis |lintasan| busur yang bisa dilepas
      const jalur = lintasanDiTree(T, u, v)
      const dapatDilepas = tambah.filter((x) => adalahSpanningTree(simpul, tambah.filter((y) => y !== x)))
      assert.equal(dapatDilepas.length, jalur.length, 'busur yang dapat dilepas = busur pada cycle')
    }
    // sifat 4
    for (const n of T) assert.equal(komponen(simpul, T.filter((x) => x !== n)), 2, 'sifat 4')
  }
  assert.ok(md.includes('$9 - 1 = 8$'))
})

test('2.3 Banyak spanning tree: 662 (brute force dan teorema pohon-matriks), Cayley n^(n-2), 20^18 > 2,6 × 10^23, C(14,8) = 3003', () => {
  const r = ringkasBruteForce(simpulContoh, busurContoh)
  assert.deepEqual([r.banyak, r.min, r.banyakMst, r.max], [662, 37, 2, 71])
  assert.equal(banyakSpanningTreeKirchhoff(simpulContoh, busurContoh), 662)
  assert.ok(md.includes('662 spanning tree'))
  for (let n = 3; n <= 6; n++) {
    const lengkap = []
    const s = 'abcdef'.slice(0, n).split('')
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) lengkap.push([s[i], s[j], 1])
    assert.equal(BigInt(semuaSpanningTree(s, lengkap).length), cayley(n), `K${n}`)
    assert.equal(BigInt(banyakSpanningTreeKirchhoff(s, lengkap)), cayley(n))
  }
  assert.ok(cayley(20) > 26n * 10n ** 22n && cayley(20) < 27n * 10n ** 22n, '20^18 antara 2,6 dan 2,7 × 10^23')
  assert.ok(md.includes('$2{,}6 \\times 10^{23}$'))
  assert.equal(kombinasi(14, 8), 3003n)
  assert.ok(md.includes('$\\binom{14}{8} = 3.003$'))
  // kombinasi yang diperiksa program = semua himpunan 8 busur; hanya 662 yang menjadi spanning tree
  assert.equal(kombinasi(busurContoh.length, simpulContoh.length - 1), 3003n)
})

test('Tabel 1 dan 2: istilah cut dan perbandingan Kruskal-Prim', () => {
  assert.equal(barisTabel('*Tabel 1.').length, 4)
  assert.deepEqual(barisTabel('*Tabel 1.').map((r) => r[0].replace(/\$.*?\$/g, '').replace(/\*/g, '').trim()), ['Cut', 'Crossing edge', 'Cut respects', 'Light edge'])
  const t2 = barisTabel('*Tabel 2.')
  assert.equal(t2.length, 5)
  assert.deepEqual(t2.map((r) => r[0]), ['Bentuk $A$ selama berjalan', 'Pilihan greedy', 'Cut yang dipakai', 'Struktur data utama', 'Running time dengan binary heap'])
  assert.deepEqual(t2[4].slice(1), ['$O(E \\lg V)$', '$O(E \\lg V)$'])
})

test('Gambar 2: cut S = {a, b, d, e}: enam crossing edge, light edge (c,d) berbobot 7, A = {ab, ci, fg, gh} respects cut dan bagian dari MST', () => {
  const S = ['a', 'b', 'd', 'e']
  const A = ['ab', 'ci', 'fg', 'gh']
  const c = potongan(simpulContoh, busurContoh, S)
  assert.deepEqual(c.silang.map((e) => e.nama).sort(), ['ah', 'bc', 'bh', 'cd', 'df', 'ef'])
  assert.deepEqual(c.light, [{ nama: 'cd', w: 7 }])
  assert.equal(c.bobotLight, 7)
  assert.equal(menghormati(S, A), true)
  assert.ok(A.every((n) => mstT1.includes(n)) && A.every((n) => mstT2.includes(n)))
  assert.ok(mstT1.includes('cd'), 'light edge (c,d) memang ada di MST')
  // tidak ada busur A yang menyeberang, tetapi (a,b) milik MST berada dalam S dan (c,d) menyeberang
  assert.equal(menghormati(S, ['cd']), false)
  const g = readFileSync(new URL('./modul/19.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(g.includes("const simpulS = ['a', 'b', 'd', 'e']") && g.includes("const himpunanA = ['ab', 'ci', 'fg', 'gh']"), 'gambar memakai S dan A yang sama dengan tes')
  assert.ok(md.includes('$S = \\{a\\}$') === false, 'cut soal 3 hanya di kuis')
})

test('Teorema 23.1 (acak, brute force): light edge yang menyeberangi cut yang respects A selalu safe', () => {
  let diperiksa = 0
  for (let k = 0; k < 400 && diperiksa < 150; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 4), { maxW: 3, p: 0.5 })
    const semua = semuaSpanningTree(simpul, busur)
    const bobot = semua.map((t) => bobotTotal(busur, t))
    const min = Math.min(...bobot)
    const mst = semua.filter((_, i) => bobot[i] === min)
    const T = mst[Math.floor(rand() * mst.length)]
    const A = T.filter(() => rand() < 0.5)
    const S = simpul.filter(() => rand() < 0.5)
    if (S.length === 0 || S.length === simpul.length || !menghormati(S, A)) continue
    const { light } = potongan(simpul, busur, S)
    for (const e of light) {
      assert.ok(mst.some((t) => A.every((x) => t.includes(x)) && t.includes(e.nama)), `light edge ${e.nama} harus safe untuk A=${A}`)
    }
    diperiksa++
  }
  assert.ok(diperiksa >= 100, `cukup banyak kasus yang diperiksa (${diperiksa})`)
})

test('4 MST tidak selalu tunggal: dua MST pada contoh (Tabel 3); bobot semua berbeda berarti MST tunggal (acak)', () => {
  const t3 = barisTabel('*Tabel 3.')
  assert.equal(t3.length, 2)
  const daftar = (s) => [...s.matchAll(/\((\w),(\w)\)/g)].map((x) => namaBusur(x[1], x[2])).sort()
  assert.deepEqual(daftar(t3[0][1]), [...mstT1].sort())
  assert.deepEqual(daftar(t3[1][1]), [...mstT2].sort())
  assert.deepEqual(t3.map((r) => r[2]), ['37', '37'])
  assert.equal(bobotTotal(busurContoh, mstT2), 37)
  assert.equal(adalahSpanningTree(simpulContoh, mstT2), true)
  // hanya berbeda satu busur: (b,c) pada T1 dan (a,h) pada T2
  assert.deepEqual(mstT1.filter((n) => !mstT2.includes(n)), ['bc'])
  assert.deepEqual(mstT2.filter((n) => !mstT1.includes(n)), ['ah'])
  // tepat dua MST pada graf contoh dan keduanya memang T1 dan T2
  const r = ringkasBruteForce(simpulContoh, busurContoh)
  const mst = r.semua.filter((_, i) => r.bobot[i] === 37).map((t) => [...t].sort().join(','))
  assert.deepEqual(mst.sort(), [mstT1, mstT2].map((t) => [...t].sort().join(',')).sort())
  // jalur a: pada T1 lewat a→b→c, pada T2 lewat h
  assert.deepEqual(lintasanDiTree(mstT1, 'a', 'c'), ['a', 'b', 'c'])
  assert.deepEqual(lintasanDiTree(mstT2, 'a', 'c'), ['a', 'h', 'g', 'f', 'c'])
  assert.ok(lintasanDiTree(mstT2, 'a', 'c').includes('h'))
  // bobot semua berbeda → MST tunggal
  for (let k = 0; k < 120; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 4), { bobotUnik: true, p: 0.5 })
    const semua = semuaSpanningTree(simpul, busur)
    const bobot = semua.map((t) => bobotTotal(busur, t))
    assert.equal(bobot.filter((b) => b === Math.min(...bobot)).length, 1, JSON.stringify(busur))
  }
})

test('4.1 program Python dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  const r = ringkasBruteForce(simpulContoh, busurContoh)
  assert.deepEqual(cetak, [`banyak spanning tree: ${r.banyak}`, `bobot minimum: ${r.min}  banyak MST: ${r.banyakMst}`, `bobot maksimum: ${r.max}`])
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('5 Keterkaitan: lintasan a ke h di T1 = a-b-c-f-g-h berbobot 19, padahal jarak terpendek 8 (busur langsung); MST bukan lintasan terpendek', () => {
  const jalur = lintasanDiTree(mstT1, 'a', 'h')
  assert.deepEqual(jalur, ['a', 'b', 'c', 'f', 'g', 'h'])
  const bobotJalur = jalur.slice(1).reduce((s, v, i) => s + bobotBusur(busurContoh, jalur[i], v), 0)
  assert.equal(bobotJalur, 19)
  assert.ok(md.includes('$4 + 8 + 4 + 2 + 1 = 19$'))
  assert.equal(jarakTerpendek(simpulContoh, busurContoh, 'a', 'h'), 8)
  assert.equal(bobotBusur(busurContoh, 'a', 'h'), 8)
  // di T2 busur (a,h) ada, jadi lintasan a ke h di T2 = 8
  assert.equal(lintasanDiTree(mstT2, 'a', 'h').length, 2)
  // graf tak terhubung: spanning tree tidak ada, minimum spanning forest berbobot Kruskal per komponen
  const s = ['a', 'b', 'c', 'd']
  const e = [['a', 'b', 1], ['c', 'd', 2]]
  assert.equal(semuaSpanningTree(s, e).length, 0)
  assert.equal(komponen(s, ['ab', 'cd']), 2)
  assert.equal(bobotMstKruskal(s, e), 3)
})

test('kunci kuis dihitung ulang: soal 1, 3, 4, 5, 6, 7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis19.soal
  // soal 1
  assert.equal(q1.opsi.find((o) => o.id === q1.kunci).teks, String(12 - 1))
  // berapa pun banyaknya busur graf, setiap spanning tree punya |V| - 1 busur (graf acak dengan kepadatan berbeda)
  for (const p of [0.2, 0.5, 0.9]) {
    const { simpul, busur } = grafAcak(6, { p })
    assert.ok(semuaSpanningTree(simpul, busur).every((t) => t.length === simpul.length - 1), `p=${p}, ${busur.length} busur`)
  }
  // soal 2: melepas kabel dari cycle menjaga keterhubungan dan mengurangi biaya (cycle acak)
  const cyc = ['a', 'b', 'c', 'd']
  const kabel = [['a', 'b', 3], ['b', 'c', 5], ['c', 'd', 2], ['d', 'a', 4]]
  const semua = kabel.map((k, i) => kabel.filter((_, j) => j !== i))
  assert.ok(semua.every((sisa) => komponen(cyc, sisa.map(([u, v]) => u + v)) === 1), 'melepas satu kabel dari cycle tetap terhubung')
  assert.ok(semua.every((sisa) => sisa.reduce((s, e) => s + e[2], 0) < 14), 'biaya berkurang')
  assert.deepEqual(q2.isian.map((f) => f.kunci), ['Ya', 'Berkurang', 'Tree'])
  // soal 3: cut S = {a}, A kosong
  const c3 = potongan(simpulContoh, busurContoh, ['a'])
  assert.deepEqual(c3.silang.map((e) => `${e.nama}:${e.w}`).sort(), ['ab:4', 'ah:8'])
  assert.deepEqual(c3.light.map((e) => e.nama), ['ab'])
  assert.equal(menghormati(['a'], []), true)
  assert.deepEqual(q3.isian.map((f) => f.kunci), [c3.silang.length, c3.bobotLight, '(a, b)'])
  assert.ok(mstT1.includes('ab') && mstT2.includes('ab'))
  // soal 4: benar (bobot berbeda → MST tunggal) — diuji acak di tes sebelumnya
  assert.equal(q4.kunci, 'Benar')
  // soal 5: bobot (b,c) menjadi 9
  const ubah = busurContoh.map(([u, v, w]) => (namaBusur(u, v) === 'bc' ? [u, v, 9] : [u, v, w]))
  const r5 = ringkasBruteForce(simpulContoh, ubah)
  assert.deepEqual([bobotTotal(ubah, mstT1), bobotTotal(ubah, mstT2), r5.min, r5.banyakMst], [38, 37, 37, 1])
  const mst5 = r5.semua.filter((_, i) => r5.bobot[i] === 37)[0].sort().join(',')
  assert.equal(mst5, [...mstT2].sort().join(','))
  assert.deepEqual(q5.isian.map((f) => f.kunci), [38, 37, 1, 'T2'])
  // soal 6
  assert.equal(q6.kunci, 'B')
  assert.ok(q6.opsi.find((o) => o.id === 'B').teks.startsWith('Kruskal memelihara forest'))
  // soal 7
  assert.deepEqual(q7.isian.map((f) => f.kunci), ['a → b → c → f → g → h', 19, 8, 'Tidak'])
  assert.ok(jarakTerpendek(simpulContoh, busurContoh, 'a', 'h') < 19)
})

test('struktur kuis: 7 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis19.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis19.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Analisis', 'Analisis', 'Benar/Salah', 'Analisis', 'Pilihan Ganda', 'Analisis'])
  assert.deepEqual(kuis19.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  for (const q of kuis19.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis19.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '19').tipe].sort())
})

test('penilaian soal Modul 19', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis19.soal
  assert.equal(nilaiSoal(q1, 'A').benar, true)
  assert.equal(nilaiSoal(q1, 'C').benar, false)
  assert.equal(nilaiSoal(q2, ['Ya', 'Berkurang', 'Tree']).benar, true)
  assert.equal(nilaiSoal(q2, ['Ya', 'Tetap', 'Tree']).benar, false)
  assert.equal(nilaiSoal(q3, ['2', '4', '(a, b)']).benar, true)
  assert.equal(nilaiSoal(q3, ['2', '8', '(a, b)']).benar, false)
  assert.equal(nilaiSoal(q4, 'Benar').benar, true)
  assert.equal(nilaiSoal(q4, 'Salah').benar, false)
  assert.equal(nilaiSoal(q5, ['38', '37', '1', 'T2']).benar, true)
  assert.equal(nilaiSoal(q5, ['38', '37', '2', 'T2']).benar, false)
  assert.equal(nilaiSoal(q6, 'B').benar, true)
  assert.equal(nilaiSoal(q7, ['a → b → c → f → g → h', '19', '8', 'Tidak']).benar, true)
  assert.equal(nilaiSoal(q7, ['a → h', '19', '8', 'Tidak']).benar, false)
  const semua = { 1: 'A', 2: ['Ya', 'Berkurang', 'Tree'], 3: ['2', '4', '(a, b)'], 4: 'Benar', 5: ['38', '37', '1', 'T2'], 6: 'B', 7: ['a → b → c → f → g → h', '19', '8', 'Tidak'] }
  const h = hitungHasil(kuis19.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [7, true, []])
})
