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
import { vizIds } from '../viz/vizConfig.js'
import { rand } from '../lib/testRandom.js'
import { adalahSpanningTree, busurContoh, mstT1, mstT2, namaBusur, ringkasBruteForce, semuaSpanningTree, simpulContoh } from '../viz/mstModel.js'
import { adjContoh, bobotContoh, busurMst, potretPrim, prim, simpulPrim, tahapGambar, teksKey, teksKeyDiQ } from '../viz/primModel.js'
import { kuis21 } from './modul/21.kuis.js'
import { pseudo } from './modul/21.pseudo.js'

const md = readFileSync(new URL('./modul/21.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('21')
const hasil = prim(adjContoh, bobotContoh, 'a')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
/** Graf terhubung acak (pohon acak + busur tambahan) dengan bobot kecil sehingga banyak seri; mengembalikan juga Adj dan peta bobot. */
const grafAcak = (n, { maxW = 5, p = 0.4, bobotUnik = false } = {}) => {
  const simpul = 'abcdefghij'.slice(0, n).split('')
  const pasang = new Set()
  for (let i = 1; i < n; i++) pasang.add(namaBusur(simpul[i], simpul[Math.floor(rand() * i)]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < p) pasang.add(namaBusur(simpul[i], simpul[j]))
  const daftar = [...pasang]
  const bobot = bobotUnik ? daftar.map((_, i) => i + 1).sort(() => rand() - 0.5) : daftar.map(() => 1 + Math.floor(rand() * maxW))
  const busur = daftar.map((nm, i) => [nm[0], nm[1], bobot[i]])
  const Adj = Object.fromEntries(simpul.map((v) => [v, []]))
  const w = {}
  for (const [u, v, b] of busur) { Adj[u].push(v); Adj[v].push(u); w[`${u}${v}`] = b; w[`${v}${u}`] = b }
  for (const v of simpul) Adj[v] = Adj[v].sort(() => rand() - 0.5)
  return { simpul, busur, Adj, w }
}
const jumlahBobot = (busur, himpunan) => himpunan.reduce((s, nm) => s + busur.find(([u, v]) => namaBusur(u, v) === nm)[2], 0)

test('struktur: lima bagian PDF (bagian 4 dipecah dua tab) + referensi, satu gambar, MST-PRIM, enam tabel, kode Python; judul polos', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+(\.\d+)?/)?.[0] ?? null), ['1', '2', '3', '4', '4.3', '5', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:prim', 'gambar:langkah'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5, 6])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '3.3', '4.1', '4.2']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Coba sendiri di visualizer'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.ok(!/^\$\$.+\$\$$/m.test(md), 'rumus blok memakai $$ di baris sendiri')
})

test('metadata sama dengan PDF dan katalog; visualizer Prim terhubung dua arah; Modul 21 menutup Bab VI-b', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [21, 'BAB VI', 10, 7])
  assert.equal(m.soal, kuis21.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[6].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Pseudocode', '3 Penelusuran', '4.1–4.2 Analisis', '4.3 Perbandingan', '5 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('21'), { prev: modulById('20'), next: modulById('22') })
  assert.equal(neighbors('20').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [19, 16, 20])
  assert.deepEqual(m.posisi, { urutan: ['19', '20', '21'], aktif: 2, catatan: m.posisi.catatan })
  assert.equal(m.algoritmaId, 'prim')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [21, true, 'mst'])
  assert.equal(kuisById('21').soal, 7)
  assert.equal(kuisById('21').judul, kuis21.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode MST-PRIM 11 baris sama dengan PDF; Tabel 1 dan 2 menjelaskan notasi dan langkah 1–4, 5, 6, 7, 8, 9, 10–11', () => {
  const b = pseudo.prim.baris
  assert.equal(b.length, 11)
  assert.deepEqual([b[0], b[1].trim(), b[2].trim(), b[3], b[4], b[5]], ['for each u ∈ G.V', 'u.key = ∞', 'u.π = NIL', 'r.key = 0', 'Q = G.V', 'while Q ≠ ∅'])
  assert.deepEqual([b[6].trim(), b[7].trim(), b[8].trim(), b[9].trim(), b[10].trim()], ['u = EXTRACT-MIN(Q)', 'for each v ∈ G.Adj[u]', 'if v ∈ Q and w(u, v) < v.key', 'v.π = u', 'v.key = w(u, v)'])
  assert.equal(pseudo.prim.header, 'MST-PRIM(G, w, r)')
  assert.equal(barisTabel('*Tabel 1.').length, 4)
  assert.deepEqual(barisTabel('*Tabel 2.').map((r) => r[0]), ['1–4', '5', '6', '7', '8', '9', '10–11'])
})

test('Tabel 3: adjacency-list sama dengan model, simetris, dan sesuai 14 busur graf Modul 19–20 (28 entri)', () => {
  const t = barisTabel('*Tabel 3.')
  assert.deepEqual(t.map((r) => r[0]), simpulPrim)
  t.forEach((r) => assert.deepEqual(r[1].split(',').map((x) => x.trim()), adjContoh[r[0]], `Adj[${r[0]}]`))
  assert.equal(Object.values(adjContoh).flat().length, 28)
  for (const [u, l] of Object.entries(adjContoh)) for (const v of l) assert.ok(adjContoh[v].includes(u), `simetris ${u}${v}`)
  const dariAdj = Object.entries(adjContoh).flatMap(([u, l]) => l.map((v) => namaBusur(u, v))).filter((x, i, arr) => arr.indexOf(x) === i).sort()
  assert.deepEqual(dariAdj, busurContoh.map(([u, v]) => namaBusur(u, v)).sort())
  assert.deepEqual(simpulPrim, simpulContoh)
  for (const [u, v, b] of busurContoh) assert.deepEqual([bobotContoh[`${u}${v}`], bobotContoh[`${v}${u}`]], [b, b])
})

test('Tabel 4: setiap iterasi (extract, key, pembaruan, key di Q) sama dengan hasil MST-PRIM; urutan extract a b c i f g h d e', () => {
  const t = barisTabel('*Tabel 4.')
  assert.equal(t.length, 9)
  assert.deepEqual(hasil.urutan, ['a', 'b', 'c', 'i', 'f', 'g', 'h', 'd', 'e'])
  t.forEach((r, i) => {
    const it = hasil.iterasi[i]
    assert.equal(r[0], String(i + 1))
    assert.equal(r[1], `${it.u} (${it.keyU})`, `extract iterasi ${i + 1}`)
    const dariTeks = [...r[2].replace(/\(.*?\)/g, (x) => (x.includes('π =') ? x : '')).matchAll(/(\w)\.key = (\d+)/g)].map((x) => [x[1], Number(x[2])])
    assert.deepEqual(dariTeks, it.pembaruan.map((p) => [p.v, p.key]), `pembaruan iterasi ${i + 1}`)
    assert.equal(r[3], teksKeyDiQ(it.keyDiQ), `key di Q iterasi ${i + 1}`)
  })
  // predecessor yang ditulis di tabel
  for (const [v, pi] of [['b', 'a'], ['h', 'a'], ['c', 'b'], ['g', 'i'], ['e', 'f'], ['g', 'f'], ['h', 'g'], ['e', 'd']]) assert.ok(md.includes(`${v}.π = ${pi}`), `${v}.π = ${pi}`)
  assert.ok(md.includes('i.key = 2; f.key = 4; d.key = 7 (π = c)'), 'iterasi 3: ketiganya berpredecessor c')
  assert.deepEqual(['i', 'f', 'd'].map((v) => hasil.iterasi[2].piSetelah[v]), ['c', 'c', 'c'])
  assert.deepEqual(hasil.iterasi[1].tidak, [{ v: 'h', w: 11, key: 8 }], 'iterasi 2: h: w(b, h) = 11 > 8')
  assert.deepEqual(hasil.iterasi[4].tidak, [{ v: 'd', w: 14, key: 7 }], 'iterasi 5: d: 14 > 7')
  assert.deepEqual(hasil.iterasi[6].pembaruan, [], 'iterasi 7: tidak ada, a, b, g, i sudah keluar dari Q')
  assert.deepEqual(hasil.iterasi[6].tidak, [])
  assert.deepEqual(hasil.iterasi[8].keyDiQ, {})
  assert.equal(teksKey(Infinity), '∞')
})

test('catatan seri di iterasi 3: c dan h sama-sama key 8, dipilih c (abjad); memilih h lebih dulu juga sah dan tetap 37', () => {
  const sebelum = hasil.iterasi[1].keyDiQ
  assert.deepEqual([sebelum.c, sebelum.h], [8, 8])
  assert.equal(hasil.urutan[2], 'c')
  const balik = prim(adjContoh, bobotContoh, 'a', { seri: 'balik' })
  assert.equal(balik.urutan[2], 'h')
  assert.equal(balik.total, 37)
  assert.ok(adalahSpanningTree(simpulPrim, busurMst(balik, 'a').map(([u, v]) => namaBusur(u, v))))
  assert.ok(md.includes('Pilihan lain (mengambil $h$ lebih dulu) juga sah dan tetap menghasilkan MST berbobot 37.'))
})

test('3.2 Hasil: busur (v, π) dan bobot 37 = jumlah key saat extract, sama dengan himpunan A bahan kuliah (T1)', () => {
  const mst = busurMst(hasil, 'a')
  assert.deepEqual(mst.map(([v, p]) => `${v}${p}`).sort(), ['ba', 'cb', 'dc', 'ed', 'fc', 'gf', 'hg', 'ic'])
  assert.equal(hasil.total, 37)
  assert.equal(Object.values(hasil.key).reduce((s, x) => s + x, 0), 37)
  assert.equal(mst.reduce((s, [v, p]) => s + bobotContoh[`${v}${p}`], 0), 37)
  assert.ok(md.includes('$4 + 8 + 2 + 4 + 2 + 1 + 7 + 9 = 37$'))
  assert.deepEqual(mst.map(([v, p]) => namaBusur(v, p)).sort(), [...mstT1].sort())
  assert.equal(hasil.key.a, 0)
  assert.equal(hasil.pi.a, null)
  // himpunan di teks (urutan seperti PDF)
  const teksMst = [...md.matchAll(/\{\(b, a\), \(c, b\)[^}]*\}/g)][0][0]
  assert.deepEqual([...teksMst.matchAll(/\((\w), (\w)\)/g)].map((x) => `${x[1]}${x[2]}`), ['ba', 'cb', 'ic', 'fc', 'gf', 'hg', 'dc', 'ed'])
})

test('Gambar 1–6: key, simpul yang sudah di-extract, busur tree dan sementara pada tiap tahap sama dengan PDF', () => {
  assert.deepEqual(tahapGambar, [0, 1, 3, 4, 5, 9])
  const p = tahapGambar.map((k) => potretPrim(hasil, k, simpulPrim, 'a'))
  const label = (x) => simpulPrim.map((v) => `${v}${teksKey(x.key[v])}`).join(' ')
  assert.deepEqual(p.map(label), [
    'a0 b∞ c∞ d∞ e∞ f∞ g∞ h∞ i∞',
    'a0 b4 c∞ d∞ e∞ f∞ g∞ h8 i∞',
    'a0 b4 c8 d7 e∞ f4 g∞ h8 i2',
    'a0 b4 c8 d7 e∞ f4 g6 h7 i2',
    'a0 b4 c8 d7 e10 f4 g2 h7 i2',
    'a0 b4 c8 d7 e9 f4 g2 h1 i2',
  ])
  assert.deepEqual(p.map((x) => x.sudah), [[], ['a'], ['a', 'b', 'c'], ['a', 'b', 'c', 'i'], ['a', 'b', 'c', 'i', 'f'], hasil.urutan])
  assert.deepEqual(p.map((x) => [...x.tree].sort()), [[], [], ['ab', 'bc'], ['ab', 'bc', 'ci'], ['ab', 'bc', 'cf', 'ci'], [...mstT1].sort()])
  assert.deepEqual(p.map((x) => [...x.sementara].sort()), [[], ['ab', 'ah'], ['ah', 'cd', 'cf', 'ci'], ['cd', 'cf', 'gi', 'hi'], ['cd', 'ef', 'fg', 'hi'], []])
  // keterangan: nilai key pada keterangan sama dengan pembaruan iterasi yang bersangkutan
  assert.deepEqual(hasil.iterasi[0].pembaruan.map((q) => `${q.v}.key=${q.key}`), ['b.key=4', 'h.key=8'])
  assert.deepEqual(hasil.iterasi[2].pembaruan.map((q) => `${q.v}.key=${q.key}`), ['i.key=2', 'f.key=4', 'd.key=7'])
  assert.deepEqual(hasil.iterasi[3].pembaruan.map((q) => `${q.v}.key=${q.key}`), ['g.key=6', 'h.key=7'])
  assert.deepEqual(hasil.iterasi[4].pembaruan.map((q) => `${q.v}.key=${q.key}`), ['e.key=10', 'g.key=2'])
  assert.deepEqual(hasil.iterasi[8].pembaruan, [])
  const g = readFileSync(new URL('./modul/21.gambar.jsx', import.meta.url), 'utf8')
  for (const k of ['(a) Langkah 1–5: semua key = ∞ kecuali akar a (key 0).', '(b) Setelah extract a: b.key=4, h.key=8.', '(c) Setelah extract c: i.key=2, f.key=4, d.key=7.', '(d) Setelah extract i: g.key=6, h.key=7.', '(e) Setelah extract f: e.key=10, g.key=2.', '(f) Setelah extract e: tidak ada key yang berubah.']) assert.ok(g.includes(k), k)
  assert.ok(g.includes('Sudah di tree: {p.sudah.length === 0'), 'simpul yang sudah di tree ditulis sebagai teks')
})

test('3.3 program Python (binary heap, entri usang dilewati) dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  assert.deepEqual(cetak, [hasil.urutan.map((u) => `${u}(${hasil.key[u]})`).join(' '), `[${busurMst(hasil, 'a').map(([v, p]) => `'${v}${p}'`).sort().join(', ')}] ${hasil.total}`])
  const dariKode = [...kode.matchAll(/\("(\w)","(\w)",(\d+)\)/g)].map((x) => [x[1], x[2], Number(x[3])])
  assert.deepEqual(dariKode, busurContoh)
  const adjPy = Object.fromEntries([...kode.matchAll(/"(\w)": "(\w+)"/g)].map((x) => [x[1], x[2].split('')]))
  assert.deepEqual(adjPy, adjContoh, 'Adj di program sama dengan Tabel 3')
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('4.1 Kebenaran (acak): simpul yang di-extract disambung lewat light edge cut (S, V − S); cut respects A; key v ∈ Q = crossing edge termurah yang menyentuh v', () => {
  let diperiksa = 0
  for (let k = 0; k < 150; k++) {
    const { simpul, busur, Adj, w } = grafAcak(3 + Math.floor(rand() * 6), { p: 0.35 })
    const r = simpul[Math.floor(rand() * simpul.length)]
    const h = prim(Adj, w, r)
    assert.equal(h.urutan.length, simpul.length, 'graf terhubung: semua simpul di-extract')
    h.iterasi.forEach((it, i) => {
      const S = h.urutan.slice(0, i)
      const A = S.filter((v) => v !== r).map((v) => namaBusur(v, h.pi[v]))
      // invariant: key v di Q sebelum iterasi ini = bobot terkecil busur dari S ke v (∞ bila tidak ada)
      const keySebelum = i === 0 ? Object.fromEntries(simpul.map((v) => [v, v === r ? 0 : Infinity])) : h.iterasi[i - 1].keySetelah
      for (const v of simpul.filter((x) => !S.includes(x))) {
        const terkecil = Math.min(...S.filter((u) => w[`${u}${v}`] !== undefined).map((u) => w[`${u}${v}`]), v === r && i === 0 ? 0 : Infinity)
        assert.equal(keySebelum[v], terkecil, `key ${v} sebelum iterasi ${i + 1}`)
      }
      if (i === 0) return
      const u = it.u
      assert.ok(A.every((nm) => S.includes(nm[0]) === S.includes(nm[1]) && S.includes(nm[0])), 'cut respects A (semua busur A di dalam S)')
      const silang = busur.filter(([a, b]) => S.includes(a) !== S.includes(b))
      const terkecil = Math.min(...silang.map((e) => e[2]))
      assert.equal(it.keyU, terkecil, 'busur yang menambah u adalah light edge')
      assert.ok(S.includes(h.pi[u]) && w[`${u}${h.pi[u]}`] === terkecil)
      diperiksa++
    })
  }
  assert.ok(diperiksa >= 400, `cukup banyak iterasi diperiksa (${diperiksa})`)
})

test('Prim benar (acak): bobot sama dengan MST brute force, hasil spanning tree, dan tiap akar menghasilkan bobot yang sama (contoh: selalu 37, T1 atau T2)', () => {
  for (let k = 0; k < 100; k++) {
    const { simpul, busur, Adj, w } = grafAcak(3 + Math.floor(rand() * 4), { p: 0.5 })
    const semua = semuaSpanningTree(simpul, busur)
    const minimum = Math.min(...semua.map((tt) => jumlahBobot(busur, tt)))
    for (const r of simpul) {
      const h = prim(Adj, w, r)
      assert.equal(h.total, minimum, `akar ${r}: ${JSON.stringify(busur)}`)
      assert.ok(adalahSpanningTree(simpul, busurMst(h, r).map(([u, v]) => namaBusur(u, v))))
      assert.equal(h.total, busurMst(h, r).reduce((s, [u, v]) => s + w[`${u}${v}`], 0))
    }
  }
  const t1 = [...mstT1].sort().join(',')
  const t2 = [...mstT2].sort().join(',')
  const hasilAkar = simpulPrim.map((r) => { const h = prim(adjContoh, bobotContoh, r); return { r, total: h.total, mst: busurMst(h, r).map(([u, v]) => namaBusur(u, v)).sort().join(',') } })
  assert.ok(hasilAkar.every((x) => x.total === 37), 'bobot selalu 37')
  assert.ok(hasilAkar.every((x) => x.mst === t1 || x.mst === t2), 'MST selalu T1 atau T2')
  assert.equal(hasilAkar.find((x) => x.r === 'a').mst, t1)
  assert.equal(hasilAkar.find((x) => x.r === 'e').mst, t2, 'akar e menghasilkan T2 (memuat (a, h))')
  assert.equal(ringkasBruteForce(simpulContoh, busurContoh).banyakMst, 2)
})

test('4.2 Running time (acak): |V| EXTRACT-MIN, pembaruan key ≤ |E|, Θ(E) pemeriksaan adjacency (2|E|), v ∈ Q benar tepat |E| kali; Tabel 5', () => {
  assert.deepEqual(hasil.hitung, { extractMin: 9, periksaAdj: 28, vDiQ: 14, pembaruan: 12 })
  for (let k = 0; k < 100; k++) {
    const { simpul, busur, Adj, w } = grafAcak(3 + Math.floor(rand() * 8), { p: 0.35 })
    const h = prim(Adj, w, simpul[0])
    assert.equal(h.hitung.extractMin, simpul.length)
    assert.equal(h.hitung.periksaAdj, 2 * busur.length, 'setiap adjacency-list diperiksa sekali: Θ(E)')
    assert.equal(h.hitung.vDiQ, busur.length, 'tiap busur memenuhi v ∈ Q tepat sekali (dari ujung yang lebih dulu di-extract)')
    assert.ok(h.hitung.pembaruan <= busur.length, 'pembaruan key paling banyak |E| kali')
  }
  const t = barisTabel('*Tabel 5.')
  assert.deepEqual(t.map((r) => r[0]), ['Array biasa', 'Binary min-heap', 'Fibonacci heap'])
  assert.deepEqual(t.map((r) => r[3]), ['$O(V^2)$', '$O(E \\lg V)$', '$O(E + V \\lg V)$'])
  // array: |V| × O(V) = V², pembaruan |E| × O(1); heap: |V| × lg V + |E| × lg V
  assert.ok(md.includes('$\\Theta(E)$') && md.includes('implementasi array justru sudah optimal'))
  // graf padat: array (V²) lebih baik dari binary heap (E lg V); graf jarang: sebaliknya
  const V = 1000
  const padat = { array: V * V, heap: 500000 * Math.log2(V) }
  assert.ok(padat.array < padat.heap)
  assert.ok(padat.heap / padat.array > 4.5 && padat.heap / padat.array < 5.5, `sekitar 5 kali (${(padat.heap / padat.array).toFixed(2)})`)
  const jarang = { array: V * V, heap: 2000 * Math.log2(V) }
  assert.ok(jarang.heap < jarang.array)
})

test('4.3 Perbandingan dengan Kruskal dan Dijkstra: Tabel 6; urutan busur Prim (a,b), (b,c), (c,i), (c,f); Dijkstra menghasilkan pohon lintasan terpendek, bukan MST', () => {
  const t6 = barisTabel('*Tabel 6.')
  assert.equal(t6.length, 6)
  assert.deepEqual(t6.map((r) => r[0]), ['Yang ditumbuhkan', 'Yang dipilih per langkah', 'Representasi graf', 'Struktur data', 'Running time', 'Urutan busur ditemukan pada contoh'])
  // urutan busur Prim menurut urutan di-extract
  const urutBusur = busurMst(hasil, 'a').map(([v, p]) => `(${p},${v})`)
  assert.deepEqual(urutBusur.slice(0, 4), ['(a,b)', '(b,c)', '(c,i)', '(c,f)'])
  assert.ok(t6[5][2].startsWith('(a,b), (b,c), (c,i), (c,f)'))
  assert.ok(t6[5][1].startsWith('(h,g), (c,i), (g,f), (a,b)'))
  // Dijkstra dari a (implementasi mandiri di tes ini)
  const d = Object.fromEntries(simpulPrim.map((v) => [v, Infinity]))
  const pi = {}
  d.a = 0
  const Q = new Set(simpulPrim)
  while (Q.size) {
    const u = [...Q].sort((x, y) => d[x] - d[y] || (x < y ? -1 : 1))[0]
    Q.delete(u)
    for (const v of adjContoh[u]) if (Q.has(v) && d[u] + bobotContoh[`${u}${v}`] < d[v]) { d[v] = d[u] + bobotContoh[`${u}${v}`]; pi[v] = u }
  }
  assert.equal(d.h, 8, 'jarak terpendek a ke h adalah busur langsung')
  assert.equal(pi.h, 'a')
  assert.equal(hasil.pi.h, 'g', 'Prim menyambung h lewat g (key 1)')
  const bobotDijkstra = Object.keys(pi).reduce((s, v) => s + bobotContoh[`${v}${pi[v]}`], 0)
  assert.equal(bobotDijkstra, 42)
  assert.deepEqual([d.f, pi.f], [11, 'g'], 'Dijkstra menyambung f lewat g (jarak 11), Prim lewat c (key 4)')
  assert.equal(hasil.pi.f, 'c')
  assert.ok(bobotDijkstra > hasil.total, 'pohon lintasan terpendek bukan MST')
  // Prim: v.key = w(u, v); Dijkstra: v.d = u.d + w(u, v)
  for (const v of Object.keys(pi)) assert.equal(d[v], d[pi[v]] + bobotContoh[`${v}${pi[v]}`])
  for (const v of simpulPrim.filter((x) => x !== 'a')) assert.equal(hasil.key[v], bobotContoh[`${v}${hasil.pi[v]}`])
  assert.ok(md.includes('$v.\\mathit{key} = w(u, v)$') && md.includes('$v.d = u.d + w(u, v)$'))
})

test('kunci kuis dihitung ulang: soal 2, 3, 4, 5, 6, 7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis21.soal
  assert.deepEqual([q2.kunci, q3.kunci, q5.kunci, q6.kunci], [['A', 'B', 'C'], ['A', 'B', 'C'], ['A', 'B', 'C'], ['A', 'D']])
  // soal 2
  const g2 = [['p', 'q', 3], ['p', 'r', 1], ['q', 'r', 2], ['q', 's', 5], ['r', 's', 4], ['s', 't', 6], ['r', 't', 7]]
  const Adj2 = Object.fromEntries('pqrst'.split('').map((v) => [v, []]))
  const w2 = {}
  for (const [u, v, b] of g2) { Adj2[u].push(v); Adj2[v].push(u); w2[`${u}${v}`] = b; w2[`${v}${u}`] = b }
  const h2 = prim(Adj2, w2, 'p')
  assert.deepEqual(h2.urutan.map((u) => `${u} (${h2.key[u]})`), ['p (0)', 'r (1)', 'q (2)', 's (4)', 't (6)'])
  assert.equal(h2.total, 13)
  assert.deepEqual(busurMst(h2, 'p').map(([v, p]) => `${v}${p}`).sort(), ['qr', 'rp', 'sr', 'ts'])
  assert.deepEqual(h2.iterasi[2].tidak, [{ v: 's', w: 5, key: 4 }], 'extract q: w(q, s) = 5 > 4, tidak berubah')
  assert.equal(ringkasBruteForce('pqrst'.split(''), g2).min, 13)
  // soal 3: perubahan key h
  assert.deepEqual([hasil.iterasi[0].keySetelah.h, hasil.iterasi[0].piSetelah.h], [8, 'a'])
  assert.deepEqual([hasil.iterasi[3].keySetelah.h, hasil.iterasi[3].piSetelah.h], [7, 'i'])
  assert.deepEqual([hasil.iterasi[5].keySetelah.h, hasil.iterasi[5].piSetelah.h], [1, 'g'])
  assert.deepEqual([bobotContoh.ah, bobotContoh.ih, bobotContoh.gh], [8, 7, 1])
  assert.equal(hasil.iterasi[3].u, 'i')
  assert.equal(hasil.iterasi[5].u, 'g')
  // soal 4: bobot sama untuk setiap akar
  assert.equal(q4.kunci, 'D')
  assert.ok(simpulPrim.every((r) => prim(adjContoh, bobotContoh, r).total === 37))
  // soal 5
  // soal 6: akar e
  const h6 = prim(adjContoh, bobotContoh, 'e')
  assert.deepEqual(h6.urutan, ['e', 'd', 'c', 'i', 'f', 'g', 'h', 'a', 'b'])
  assert.deepEqual(h6.urutan.map((u) => h6.key[u]), [0, 9, 7, 2, 4, 2, 1, 8, 4])
  assert.equal(h6.pi.a, 'h')
  assert.deepEqual(busurMst(h6, 'e').map(([v, p]) => namaBusur(v, p)).sort(), [...mstT2].sort())
  // soal 7: tanpa syarat v ∈ Q, simpul yang sudah di-extract bisa diperbarui dan membentuk cycle
  const ekstrak = new Map(hasil.urutan.map((u, i) => [u, i]))
  const pelanggar = []
  hasil.urutan.forEach((u) => adjContoh[u].forEach((v) => { if (ekstrak.get(v) < ekstrak.get(u) && bobotContoh[`${u}${v}`] < hasil.key[v]) pelanggar.push([u, v]) }))
  assert.ok(pelanggar.some(([u, v]) => u === 'i' && v === 'c'), 'i memperbarui c (2 < 8) bila tidak ada syarat v ∈ Q')
  assert.equal(hasil.pi.i, 'c', 'padahal c adalah parent i: c.π = i akan membentuk cycle c ↔ i')
  assert.equal(q7.kunci, 'A')
  assert.equal(q1.kunci, 'C')
})

