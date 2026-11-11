import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { vizIds } from '../viz/vizConfig.js'
import { rand } from '../lib/testRandom.js'
import { lintasanDariPi } from '../viz/bellmanFordModel.js'
import { adjDijkstra, adjPenyangkal, busurDariAdj, busurDijkstra, dijkstraBuku, dijkstraJejak, potretDijkstra, simpulDijkstra, simpulPenyangkal, tahapGambar, teksRelax } from '../viz/dijkstraModel.js'
import { bellmanFord, dijkstra, jarakTerpendek, lengkungSP, posLabelSP, posisiSP } from '../viz/lintasanModel.js'
import { adjContoh as adjPrim, bobotContoh as bobotPrim, prim } from '../viz/primModel.js'
import { busurContoh } from '../viz/mstModel.js'
import { kuis24 } from './modul/24.kuis.js'
import { pseudo } from './modul/24.pseudo.js'

const md = readFileSync(new URL('./modul/24.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const gambarSrc = readFileSync(new URL('./modul/24.gambar.jsx', import.meta.url), 'utf8')
const bagian = parseModul(md)
const m = modulById('24')
const hasil = dijkstraJejak(adjDijkstra, 's')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const keBusur = (daftar) => daftar.map(([u, v, w]) => `${u}${v}${w}`)
const tanpaMath = (x) => x.replace(/ \(\$[^$]*\$\)/g, '')
/** Graf berarah acak dengan bobot nonnegatif (opsional busur negatif tanpa cycle negatif, lewat potensial), urutan adjacency diacak. */
const grafAcak = (n, { p = 0.35, negatif = false, bobotSatu = false } = {}) => {
  const simpul = 'abcdefghij'.slice(0, n).split('')
  const h = Object.fromEntries(simpul.map((v) => [v, negatif ? Math.floor(rand() * 7) : 0]))
  const adj = Object.fromEntries(simpul.map((v) => [v, []]))
  for (const u of simpul) for (const v of simpul) if (u !== v && rand() < p) adj[u].push([v, bobotSatu ? 1 : Math.floor(rand() * 6) + h[u] - h[v]])
  for (const u of simpul) adj[u].sort(() => rand() - 0.5)
  return { simpul, adj, busur: busurDariAdj(adj), s: simpul[0] }
}
const pyDict = (d) => `{${Object.entries(d).map(([k, x]) => `'${k}': ${x}`).join(', ')}}`
const jalurTerpendek = (adj, s, v, delta) => {
  const hasilJalur = []
  const dfs = (u, jalur, bobot) => { if (u === v) { if (bobot === delta[v]) hasilJalur.push(jalur); return } for (const [x, w] of adj[u]) if (!jalur.includes(x)) dfs(x, [...jalur, x], bobot + w) }
  dfs(s, [s], 0)
  return hasilJalur[0]
}
const semuaJalur = (adj, s, v) => { const out = []; const dfs = (u, jalur, bobot) => { if (u === v) { out.push({ jalur, bobot }); return } for (const [x, w] of adj[u]) if (!jalur.includes(x)) dfs(x, [...jalur, x], bobot + w) }; dfs(s, [s], 0); return out }

test('struktur: enam bagian PDF + referensi (satu tab per bagian), satu gambar, DIJKSTRA, enam tabel, dua kode Python; judul polos', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:dijkstra', 'gambar:langkah'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5, 6])
  assert.equal([...md.matchAll(/```python/g)].length, 2)
  for (const jdl of ['3.1', '3.2', '4.1', '4.2', '5.1', '5.2']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Coba sendiri di visualizer', 'Contoh penyangkal'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.ok(!/^\$\$.+\$\$$/m.test(md), 'rumus blok memakai $$ di baris sendiri')
})

test('metadata sama dengan PDF dan katalog; visualizer Dijkstra terhubung dua arah; Modul 24 menutup Bab VI', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [24, 'BAB VI', 11, 7])
  assert.equal(m.soal, kuis24.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[7].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Pseudocode', '3 Penelusuran', '4 Kebenaran', '5 Running Time', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('24'), { prev: modulById('23'), next: null })
  assert.equal(neighbors('23').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [22, 23, 13])
  assert.deepEqual(m.posisi, { urutan: ['22', '23', '24'], aktif: 2, catatan: m.posisi.catatan })
  assert.equal(m.algoritmaId, 'dijkstra')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [24, true, 'shortest-path'])
  assert.equal(kuisById('24').soal, 7)
  assert.equal(kuisById('24').judul, kuis24.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode DIJKSTRA 8 baris sama dengan PDF; Tabel 1 menjelaskan langkah 1, 2, 3, 4–8, 5, 6, 7–8', () => {
  const b = pseudo.dijkstra.baris
  assert.equal(b.length, 8)
  assert.deepEqual(b.map((x) => x.trim()), ['INITIALIZE-SINGLE-SOURCE(G, s)', 'S = ∅', 'Q = G.V', 'while Q ≠ ∅', 'u = EXTRACT-MIN(Q)', 'S = S ∪ {u}', 'for each vertex v ∈ G.Adj[u]', 'RELAX(u, v, w)'])
  assert.equal(pseudo.dijkstra.header, 'DIJKSTRA(G, w, s)')
  assert.deepEqual(barisTabel('*Tabel 1.').map((r) => r[0]), ['1', '2', '3', '4–8', '5', '6', '7–8'])
})

test('3 graf contoh: 10 busur dan Tabel 2 (adjacency-list) sama dengan model dan program Python; posisi, lengkung, dan label konsisten dengan Gambar 1', () => {
  const baris = md.split('\n').find((l) => l.startsWith('Contoh dari bahan kuliah:'))
  const dariTeks = [...baris.matchAll(/\((\w),(\w)\) = (\d+)/g)].map((x) => [x[1], x[2], Number(x[3])])
  assert.deepEqual(keBusur(dariTeks).sort(), keBusur(busurDijkstra).sort())
  assert.equal(busurDijkstra.length, 10)
  const t2 = barisTabel('*Tabel 2.')
  assert.deepEqual(t2.map((r) => r[0]), simpulDijkstra.slice().sort((a, b) => 'stxyz'.indexOf(a) - 'stxyz'.indexOf(b)))
  for (const r of t2) assert.deepEqual(r[1].split(' → '), adjDijkstra[r[0]].map(([v]) => v), `Adj[${r[0]}]`)
  const kode = blokTeks('python', 0)
  const adjPy = Object.fromEntries([...kode.matchAll(/"(\w)": \[((?:\("\w", \d+\)(?:, )?)*)\]/g)].map((x) => [x[1], [...x[2].matchAll(/\("(\w)", (\d+)\)/g)].map((y) => [y[1], Number(y[2])])]))
  assert.deepEqual(adjPy, adjDijkstra, 'G di program sama dengan Tabel 2')
  // topologi sama dengan graf Modul 22 sehingga posisi dan lengkung dapat dipakai bersama
  const kunci = new Set(busurDijkstra.map(([u, v]) => `${u}${v}`))
  for (const k of [...Object.keys(lengkungSP), ...Object.keys(posLabelSP)]) assert.ok(kunci.has(k), `busur ${k} ada`)
  for (const [u, v] of busurDijkstra) if (kunci.has(`${v}${u}`)) assert.ok(lengkungSP[`${u}${v}`] > 0, `${u}${v} melengkung`)
  assert.deepEqual(Object.keys(posisiSP).sort(), [...simpulDijkstra].sort())
  assert.ok(busurDijkstra.every(([, , w]) => w >= 0), 'semua bobot nonnegatif')
})

test('Tabel 3: setiap iterasi (extract, S dan Q, hasil RELAX, simpul berikutnya) sama dengan hasil DIJKSTRA; urutan extract s y z t x', () => {
  const t = barisTabel('*Tabel 3.')
  assert.equal(t.length, 6)
  assert.deepEqual(hasil.urutan, ['s', 'y', 'z', 't', 'x'])
  hasil.iterasi.forEach((it, i) => {
    const r = t[i]
    assert.equal(r[0], String(i + 1))
    assert.equal(r[1], `${it.u} (${it.du})`)
    assert.equal(r[2], `{${it.S.join(',')}} / {${it.Q.length === 0 ? ' ' : it.Q.join(',')}}`, `S / Q iterasi ${i + 1}`)
    assert.equal(tanpaMath(r[3]), it.relax.map((x) => teksRelax(x, it.u)).join('; '), `RELAX iterasi ${i + 1}`)
    assert.equal(r[4], it.berikutnya ? `${it.berikutnya.v} (${it.berikutnya.d})` : '-', `berikutnya iterasi ${i + 1}`)
  })
  assert.ok(t[5][3].startsWith('Langkah 4: $Q$ kosong, kondisi FALSE, end while.'))
  // keterangan: tetap 0 (0 < 7 + 7) dan tetap 7 (7 < 9 + 4)
  assert.deepEqual(hasil.iterasi[2].relax[0], { v: 's', w: 7, sebelum: 0, sesudah: 0, berubah: false })
  assert.ok(hasil.iterasi[2].relax[0].sebelum < hasil.iterasi[2].du + 7, 'iterasi 3: s.d = 0 < z.d + 7 = 14')
  assert.ok(hasil.d.z < hasil.iterasi[4].du + 4, 'iterasi 5: z.d = 7 < x.d + 4 = 13')
  assert.deepEqual([hasil.iterasi[2].du + 7, hasil.iterasi[4].du + 4], [14, 13])
  assert.ok(md.includes('$0 < 7 + 7$') && md.includes('$7 < 9 + 4$'))
  assert.ok(md.includes('**Langkah 1.** $s.d = 0$, simpul lain $\\infty$') && md.includes('$Q = \\{s, t, x, y, z\\}$'))
})

test('Gambar 1–6: nilai d, simpul di S, simpul berikutnya, dan busur predecessor pada tiap tahap sama dengan PDF', () => {
  assert.deepEqual(tahapGambar, [0, 1, 2, 3, 4, 5])
  const p = tahapGambar.map((k) => potretDijkstra(hasil, k))
  const label = (x) => simpulDijkstra.map((v) => `${v}${x.d[v] === Infinity ? '∞' : x.d[v]}`).join(' ')
  assert.deepEqual(p.map(label), ['s0 t∞ x∞ y∞ z∞', 's0 t10 x∞ y5 z∞', 's0 t8 x14 y5 z7', 's0 t8 x13 y5 z7', 's0 t8 x9 y5 z7', 's0 t8 x9 y5 z7'])
  assert.deepEqual(p.map((x) => x.S), [[], ['s'], ['s', 'y'], ['s', 'y', 'z'], ['s', 'y', 'z', 't'], ['s', 'y', 'z', 't', 'x']])
  assert.deepEqual(p.map((x) => x.berikutnya), ['s', 'y', 'z', 't', 'x', null])
  assert.deepEqual(p.map((x) => [...x.tree].sort()), [[], ['sy', 'st'].sort(), ['sy', 'yt', 'yx', 'yz'], ['sy', 'yt', 'yz', 'zx'], ['sy', 'tx', 'yt', 'yz'], ['sy', 'tx', 'yt', 'yz']])
  for (const ket of ['(a) Setelah langkah 1–3: s.d = 0, lainnya ∞; S kosong.', '(b) Loop 1: extract s; t.d=10, y.d=5.', '(c) Loop 2: extract y; x.d=14, z.d=7, t.d=8.', '(d) Loop 3: extract z; x.d=13.', '(e) Loop 4: extract t; x.d=9.', '(f) Loop 5: extract x; tidak ada nilai yang berubah.']) assert.ok(gambarSrc.includes(ket), ket)
  assert.ok(gambarSrc.includes('Berikutnya:') && gambarSrc.includes('Q kosong.'))
  // keterangan: perubahan nilai pada tiap loop sesuai caption
  const perubahan = (i) => hasil.iterasi[i].relax.filter((r) => r.berubah).map((r) => `${r.v}.d=${r.sesudah}`)
  assert.deepEqual([perubahan(0), perubahan(1), perubahan(2), perubahan(3), perubahan(4)], [['t.d=10', 'y.d=5'], ['x.d=14', 'z.d=7', 't.d=8'], ['x.d=13'], ['x.d=9'], []])
})

test('3.1 Hasil: Tabel 4 (lintasan dari predecessor dan bobotnya) dan narasi x turun tiga kali, t lewat y; cocok dengan Bellman-Ford dan Floyd–Warshall', () => {
  const t4 = barisTabel('*Tabel 4.')
  assert.deepEqual(t4.map((r) => r[0]), ['t', 'x', 'y', 'z'])
  const bobotBusur = (u, v) => adjDijkstra[u].find(([x]) => x === v)[1]
  const delta = jarakTerpendek(simpulDijkstra, busurDijkstra, 's')
  for (const r of t4) {
    const jalur = lintasanDariPi(hasil.pi, 's', r[0])
    assert.equal(r[1], `$${jalur.join(' \\to ')}$`, `lintasan ${r[0]}`)
    const bobot = jalur.slice(1).map((v, i) => bobotBusur(jalur[i], v))
    const jumlah = bobot.reduce((a, b) => a + b, 0)
    assert.equal(Number(r[2].replace(/\$/g, '').split('=').at(-1)), jumlah)
    assert.deepEqual(r[2].replace(/\$/g, '').split('=')[0].match(/\d+/g).map(Number), bobot, `suku bobot ${r[0]}`)
    assert.equal(jumlah, hasil.d[r[0]])
    assert.equal(jumlah, delta[r[0]], 'sama dengan Floyd–Warshall')
  }
  assert.deepEqual(hasil.d, bellmanFord(simpulDijkstra, busurDijkstra, 's').d, 'sama dengan Bellman-Ford')
  // x turun tiga kali sebelum di-extract (∞ → 14 → 13 → 9) dan tidak berubah lagi sesudahnya; t turun dari 10 ke 8 lewat y
  const turunX = hasil.iterasi.flatMap((it) => it.relax.filter((r) => r.v === 'x' && r.berubah).map((r) => [r.sebelum, r.sesudah]))
  assert.deepEqual(turunX, [[Infinity, 14], [14, 13], [13, 9]])
  const iterasiExtractX = hasil.iterasi.findIndex((it) => it.u === 'x')
  assert.equal(iterasiExtractX + 1, 5, 'x di-extract pada loop 5')
  assert.ok(hasil.iterasi.slice(iterasiExtractX).every((it) => it.d.x === 9))
  assert.deepEqual(hasil.iterasi[1].relax.find((r) => r.v === 't'), { v: 't', w: 3, sebelum: 10, sesudah: 8, berubah: true })
  assert.equal(adjDijkstra.s.find(([v]) => v === 't')[1], 10)
  assert.ok(md.includes('nilainya turun tiga kali (14 → 13 → 9)'))
})

test('3.2 program Python (binary heap) dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python', 0)
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  const lintasanTeks = (v) => lintasanDariPi(hasil.pi, 's', v).join(' -> ')
  assert.deepEqual(cetak, [`urutan extract: [${hasil.urutan.map((u) => `'${u}'`).join(', ')}]`, ...['t', 'x', 'y', 'z'].map((v) => `${v} ${hasil.d[v]} ${lintasanTeks(v)}`)])
  const exe = cariPython()
  if (!exe) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(exe, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('4.1 Kebenaran (acak, bobot nonnegatif): u.d = δ(s, u) saat u di-extract; busur pertama yang keluar dari S pada lintasan terpendek memenuhi y.d = δ(s, y) ≤ u.d; nilai di S tidak pernah berubah lagi', () => {
  let diperiksa = 0
  for (let k = 0; k < 150; k++) {
    const { simpul, adj, busur, s } = grafAcak(3 + Math.floor(rand() * 6), { p: 0.35 })
    const delta = jarakTerpendek(simpul, busur, s)
    const j = dijkstraJejak(adj, s)
    assert.deepEqual(j.d, delta, 'DIJKSTRA = Floyd–Warshall')
    j.iterasi.forEach((it, i) => {
      assert.equal(it.du, delta[it.u], `${it.u}.d final saat di-extract`)
      const sebelum = i === 0 ? j.awal.d : j.iterasi[i - 1].d
      const S = j.urutan.slice(0, i)
      if (delta[it.u] < Infinity && it.u !== s) {
        // lintasan terpendek ke u: simpul pertama yang belum di S (termasuk u) memenuhi y.d = δ(s, y) ≤ u.d (bobot nonnegatif)
        const jalur = jalurTerpendek(adj, s, it.u, delta)
        const y = jalur.find((v) => !S.includes(v))
        assert.equal(sebelum[y], delta[y], `y.d = δ(s, y) untuk y = ${y}`)
        assert.ok(delta[y] <= delta[it.u])
        diperiksa++
      }
      // simpul yang sudah di S tidak pernah diperbarui oleh RELAX berikutnya (bobot nonnegatif)
      for (const r of it.relax) if ([...S, it.u].includes(r.v)) assert.equal(r.berubah, false, `${r.v} sudah di S`)
    })
    // dari graf tak berarah (busur dua arah) dan graf dengan cycle, hasil tetap benar
    const lihat = new Set()
    const dua = busur.flatMap(([u, v, w]) => { const kunci = [u, v].sort().join(''); if (lihat.has(kunci)) return []; lihat.add(kunci); return [[u, v, w], [v, u, w]] })
    assert.deepEqual(dijkstra(simpul, dua, s).d, bellmanFord(simpul, dua, s).d)
  }
  assert.ok(diperiksa > 200, `cukup kasus (${diperiksa})`)
  assert.ok(md.includes('Teorema 24.6') && md.includes('Kontradiksi'))
})

test('4.2 Contoh penyangkal: bobot negatif (b, a) = −2 membuat Dijkstra salah (c.d = 3, seharusnya 2), padahal tanpa cycle; Bellman-Ford benar; program Python dijalankan', (t) => {
  const buku = dijkstraBuku(adjPenyangkal, 's')
  const bf = bellmanFord(simpulPenyangkal, busurDariAdj(adjPenyangkal), 's')
  assert.deepEqual(buku.d, { s: 0, a: 1, b: 3, c: 3 })
  assert.deepEqual(bf.d, { s: 0, a: 1, b: 3, c: 2 })
  assert.equal(bf.siklusNegatif, false, 'tanpa cycle negatif (bahkan tanpa cycle sama sekali)')
  assert.equal(jarakTerpendek(simpulPenyangkal, busurDariAdj(adjPenyangkal), 's').c, 2)
  assert.deepEqual(buku.urutan.slice(0, 3), ['s', 'a', 'b'], 'extract s, lalu a (nilai terkecil 2), lalu b; a sudah di S ketika diturunkan')
  // jejak: a di-extract dengan a.d = 2 dan c.d = 3; setelah b di-extract a turun ke 1 tetapi busur keluar a tidak direlaksasi lagi
  const j = dijkstraJejak(adjPenyangkal, 's')
  assert.deepEqual(j.urutan, ['s', 'a', 'b', 'c'])
  assert.equal(j.iterasi[1].du, 2)
  assert.equal(j.iterasi[1].relax[0].sesudah, 3, 'RELAX (a, c) memberi c = 3')
  assert.deepEqual(j.iterasi[2].relax[0], { v: 'a', w: -2, sebelum: 2, sesudah: 1, berubah: true }, 'RELAX (b, a) menurunkan a menjadi 1')
  assert.equal(j.d.c, 3)
  assert.equal(j.hitung.relaksasi, 4, 'busur keluar a hanya direlaksasi sekali')
  for (const k of ['$(s, a) = 2$, $(s, b) = 3$, $(b, a) = -2$, $(a, c) = 1$', '$\\delta(s, a) = 3 + (-2) = 1$', '$\\delta(s, c) = 1 + 1 = 2$', '**Salah.**']) assert.ok(md.includes(k), k)
  const kode = blokTeks('python', 1)
  const cetak = blokTeks('text', 1).trimEnd().split('\n')
  assert.deepEqual(cetak, [`Dijkstra    : ${pyDict(buku.d)}`, `Bellman-Ford: ${pyDict(bf.d)}`])
  const exe = cariPython()
  if (!exe) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(exe, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('5.1 Running time (acak): |V| EXTRACT-MIN, tiap busur direlaksasi tepat sekali, penurunan ≤ |E|, pemindaian array V(V+1)/2 = O(V²); Tabel 5 dan perkiraan 10^8 lawan 532.000', () => {
  assert.deepEqual(hasil.hitung, { extractMin: 5, relaksasi: 10, penurunan: 7, pemindaianArray: 15 })
  for (let k = 0; k < 100; k++) {
    const { simpul, adj, busur, s } = grafAcak(3 + Math.floor(rand() * 8), { p: 0.3 })
    const j = dijkstraJejak(adj, s)
    assert.equal(j.hitung.extractMin, simpul.length)
    assert.equal(j.hitung.relaksasi, busur.length, 'setiap busur direlaksasi tepat sekali')
    assert.ok(j.hitung.penurunan <= busur.length, 'DECREASE-KEY paling banyak |E| kali')
    assert.equal(j.hitung.pemindaianArray, (simpul.length * (simpul.length + 1)) / 2, 'array memindai |Q| pada tiap EXTRACT-MIN')
  }
  const t5 = barisTabel('*Tabel 5.')
  assert.deepEqual(t5.map((r) => r[0]), ['Array biasa (indeks simpul)', 'Binary min-heap', 'Fibonacci heap'])
  assert.deepEqual(t5.map((r) => r[3]), ['$O(V^2 + E) = O(V^2)$', '$O((V + E) \\lg V)$', '$O(V \\lg V + E)$'])
  const V = 10000
  const E = 30000
  const array = V * V
  const heap = (V + E) * Math.log2(V)
  assert.equal(array, 1e8)
  assert.ok(Math.abs(heap - 532000) / 532000 < 0.002, `(V + E) lg V ≈ 532.000 (${Math.round(heap)})`)
  assert.ok(array / heap > 185 && array / heap < 195, `sekitar 190 kali (${(array / heap).toFixed(1)})`)
  assert.ok(Math.abs(Math.log2(10000) - 13.3) < 0.05)
  // graf sangat padat: array lebih baik; graf jarang: heap lebih baik
  assert.ok(1000 * 1000 < (1000 + 500000) * Math.log2(1000))
  assert.ok((1000 + 3000) * Math.log2(1000) < 1000 * 1000)
})

test('5.2 Perbandingan: bobot 1 = BFS; Dijkstra vs Prim (Prim menyimpan satu busur, Dijkstra total bobot); Tabel 6', () => {
  const t6 = barisTabel('*Tabel 6.')
  assert.equal(t6.length, 5)
  assert.deepEqual(t6.map((r) => r[0]), ['Masalah', 'Bobot negatif', 'Struktur bantu', 'Nilai yang diperbarui', 'Running time'])
  assert.deepEqual(t6[4].slice(1), ['$O((V + E) \\lg V)$', '$\\Theta(V E)$', '$O(V + E)$', '$O(E \\lg V)$'])
  // semua bobot 1: urutan extract menurut jarak (jumlah busur) dan d = jarak BFS
  for (let k = 0; k < 100; k++) {
    const { simpul, adj, s } = grafAcak(3 + Math.floor(rand() * 6), { p: 0.3, bobotSatu: true })
    const jarak = { [s]: 0 }
    const antre = [s]
    while (antre.length) { const u = antre.shift(); for (const [v] of adj[u]) if (jarak[v] === undefined) { jarak[v] = jarak[u] + 1; antre.push(v) } }
    const j = dijkstraJejak(adj, s)
    for (const v of simpul) assert.equal(j.d[v], jarak[v] ?? Infinity, `BFS ${v}`)
    const urutJarak = j.urutan.filter((v) => jarak[v] !== undefined).map((v) => jarak[v])
    assert.deepEqual(urutJarak, [...urutJarak].sort((a, b) => a - b), 'simpul di-extract menurut jumlah busur')
  }
  // Dijkstra vs Prim pada graf Modul 19 (tak berarah, bobot sama)
  const adjD = Object.fromEntries(Object.keys(adjPrim).map((u) => [u, adjPrim[u].map((v) => [v, bobotPrim[`${u}${v}`]])]))
  const dj = dijkstraJejak(adjD, 'a')
  const pr = prim(adjPrim, bobotPrim, 'a')
  for (const v of Object.keys(adjD).filter((x) => x !== 'a')) {
    assert.equal(pr.key[v], bobotPrim[`${v}${pr.pi[v]}`], 'Prim: key = bobot satu busur')
    assert.equal(dj.d[v], dj.d[dj.pi[v]] + bobotPrim[`${v}${dj.pi[v]}`], 'Dijkstra: d = total bobot lintasan')
  }
  const bobotPohon = (pi) => Object.entries(pi).filter(([, p]) => p).reduce((sum, [v, p]) => sum + bobotPrim[`${v}${p}`], 0)
  assert.equal(pr.total, 37)
  assert.equal(bobotPohon(dj.pi), 42)
  assert.notEqual(dj.pi.h, pr.pi.h, 'pohon lintasan terpendek berbeda dari MST')
  assert.equal(busurContoh.length, 14)
  for (const k of ['Dijkstra mengeluarkan simpul berdasarkan jumlah busur', 'Prim menyimpan bobot satu busur, Dijkstra menyimpan total bobot lintasan dari $s$']) assert.ok(md.includes(k), k)
})

test('kunci kuis dihitung ulang: soal 1–7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis24.soal
  // soal 1: graf dengan cycle dan graf tak berarah tetap benar selama bobot nonnegatif (diuji di 4.1)
  assert.equal(q1.kunci, 'B')
  // soal 2
  const adj2 = { A: [['B', 4], ['C', 1]], B: [['D', 1]], C: [['B', 2], ['D', 5]], D: [['E', 3]], E: [] }
  const j2 = dijkstraJejak(adj2, 'A')
  assert.deepEqual(j2.urutan, q2.isian.slice(0, 5).map((f) => f.kunci))
  assert.deepEqual(j2.urutan, ['A', 'C', 'B', 'D', 'E'])
  assert.deepEqual([j2.d.B, j2.d.D, j2.d.E], q2.isian.slice(5, 8).map((f) => f.kunci))
  assert.deepEqual(j2.d, { A: 0, B: 3, C: 1, D: 4, E: 7 })
  assert.equal(lintasanDariPi(j2.pi, 'A', 'E').join(' → '), q2.isian[8].kunci)
  assert.equal(j2.iterasi[1].relax.find((r) => r.v === 'B').sesudah, Math.min(4, 1 + 2))
  assert.equal(j2.iterasi[2].relax.find((r) => r.v === 'D').sesudah, Math.min(6, 3 + 1))
  assert.deepEqual(j2.d, jarakTerpendek(Object.keys(adj2), busurDariAdj(adj2), 'A'))
  // soal 3: t.d turun 10 → 8 lewat y pada loop 2 dan tidak berubah setelah di-extract pada loop 4
  const r = hasil.iterasi[1].relax.find((x) => x.v === 't')
  assert.deepEqual([r.sebelum, r.sesudah, hasil.iterasi[1].u], [10, 8, q3.isian[0].kunci])
  assert.equal(hasil.iterasi[3].u, 't')
  assert.ok(hasil.iterasi.slice(3).every((it) => it.d.t === 8))
  assert.equal(hasil.iterasi[3].du, hasil.d.t)
  assert.ok(Math.min(...hasil.iterasi[3].Q.map((v) => hasil.iterasi[2].d[v])) >= hasil.iterasi[2].d.t, 't.d adalah nilai terkecil di Q saat di-extract')
  assert.deepEqual(q3.isian.slice(1).map((f) => f.kunci), ['Estimasi (batas atas) yang masih dapat diperbaiki', 'Terkecil di Q', 'Tidak (semua bobot nonnegatif)'])
  // soal 4: contoh penyangkal tanpa cycle
  assert.equal(q4.kunci, 'Salah')
  assert.equal(dijkstraBuku(adjPenyangkal, 's').d.c, 3)
  assert.equal(jarakTerpendek(simpulPenyangkal, busurDariAdj(adjPenyangkal), 's').c, 2)
  // soal 5
  const heap = (10000 + 30000) * Math.log2(10000)
  assert.equal(q5.isian[0].kunci, 'sekitar 100.000.000 langkah')
  assert.equal(q5.isian[1].kunci, 'sekitar 532.000 langkah')
  assert.ok(Math.abs(heap - 532000) < 1000)
  assert.equal(q5.isian[2].kunci, 1e8 > heap ? 'Binary heap' : 'Array')
  assert.equal(q5.isian[3].kunci, 'sekitar 190 kali')
  // soal 6: bobot (y, t) menjadi 6
  const adj6 = { ...adjDijkstra, y: adjDijkstra.y.map(([v, w]) => (v === 't' ? [v, 6] : [v, w])) }
  const j6 = dijkstraJejak(adj6, 's')
  assert.deepEqual([j6.d.t, j6.d.x], [q6.isian[0].kunci, q6.isian[2].kunci])
  assert.equal(lintasanDariPi(j6.pi, 's', 't').join(' → '), q6.isian[1].kunci)
  assert.equal(lintasanDariPi(j6.pi, 's', 'x').join(' → '), q6.isian[3].kunci)
  assert.deepEqual(semuaJalur(adj6, 's', 't').map((x) => x.bobot).sort((a, b) => a - b), [10, 11], 's→t = 10, s→y→t = 5 + 6 = 11')
  // PDF menyebut tiga lintasan (11, 14, 13); semua lintasan sederhana ke x: tambahan s→y→t→x = 12, s→t→y→z→x = 20, s→t→y→x = 21, semuanya > 11 sehingga jawaban tidak berubah
  assert.deepEqual(semuaJalur(adj6, 's', 'x').map((x) => x.bobot).sort((a, b) => a - b), [11, 12, 13, 14, 20, 21])
  assert.deepEqual([11, 14, 13].every((b) => semuaJalur(adj6, 's', 'x').some((x) => x.bobot === b)), true)
  assert.deepEqual(j6.d, jarakTerpendek(simpulDijkstra, busurDariAdj(adj6), 's'))
  // soal 7: lihat 5.2 — Prim menyimpan satu busur, Dijkstra total bobot
  assert.equal(q7.kunci, 'B')
})

test('struktur kuis: 7 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis24.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis24.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Penelusuran', 'Analisis', 'Benar/Salah', 'Perhitungan', 'Analisis', 'Pilihan Ganda'])
  assert.deepEqual(kuis24.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  for (const q of kuis24.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis24.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '24').tipe].sort())
})

test('penilaian soal Modul 24', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis24.soal
  const kunci = (q) => q.isian.map((f) => String(f.kunci))
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'C').benar, false)
  assert.equal(nilaiSoal(q2, kunci(q2)).benar, true)
  assert.equal(nilaiSoal(q2, ['A', 'B', 'C', 'D', 'E', '3', '4', '7', 'A → C → B → D → E']).benar, false)
  assert.equal(nilaiSoal(q3, kunci(q3)).benar, true)
  assert.equal(nilaiSoal(q3, ['x', ...kunci(q3).slice(1)]).benar, false)
  assert.equal(nilaiSoal(q4, 'Salah').benar, true)
  assert.equal(nilaiSoal(q4, 'Benar').benar, false)
  assert.equal(nilaiSoal(q5, kunci(q5)).benar, true)
  assert.equal(nilaiSoal(q5, [...kunci(q5).slice(0, 3), 'sekitar 19 kali']).benar, false)
  assert.equal(nilaiSoal(q6, kunci(q6)).benar, true)
  assert.equal(nilaiSoal(q6, ['11', 's → y → t', '11', 's → t → x']).benar, false)
  assert.equal(nilaiSoal(q7, 'B').benar, true)
  const semua = { 1: 'B', 2: kunci(q2), 3: kunci(q3), 4: 'Salah', 5: kunci(q5), 6: kunci(q6), 7: 'B' }
  const h = hitungHasil(kuis24.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [7, true, []])
})
