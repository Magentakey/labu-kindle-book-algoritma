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
import { busurContoh, simpulContoh } from '../viz/mstModel.js'
import {
  adjDariBusur, adjSP, bellmanFord, bobotLintasan, busurNeg, busurSP, dijkstra, floydWarshall, initializeSingleSource, jarakTerpendek, lengkungNeg, lengkungSP, pohonA, pohonB, posLabelSP, posisiNeg, posisiSP,
  relax, ringkasLintasan, simpulNeg, simpulSP, teksJarak,
} from '../viz/lintasanModel.js'
import { kuis22 } from './modul/22.kuis.js'
import { pseudo } from './modul/22.pseudo.js'

const md = readFileSync(new URL('./modul/22.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const gambarSrc = readFileSync(new URL('./modul/22.gambar.jsx', import.meta.url), 'utf8')
const bagian = parseModul(md)
const m = modulById('22')
const adjNeg = adjDariBusur(simpulNeg, busurNeg)

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const nilaiTex = (x) => { const t = x.replace(/\$/g, '').replace(/\s/g, ''); return t === '-\\infty' ? -Infinity : Number(t) }

/** Graf berarah acak tanpa cycle negatif (bobot nonnegatif digeser potensial: jumlah bobot tiap cycle tidak berubah) tetapi boleh punya busur negatif. */
const grafAcak = (n, { p = 0.35, negatif = true, bobotSatu = false } = {}) => {
  const simpul = 'abcdefghij'.slice(0, n).split('')
  const h = Object.fromEntries(simpul.map((v) => [v, negatif ? Math.floor(rand() * 7) : 0]))
  const busur = []
  for (const u of simpul) for (const v of simpul) if (u !== v && rand() < p) busur.push([u, v, bobotSatu ? 1 : Math.floor(rand() * 6) + h[u] - h[v]])
  return { simpul, busur, s: simpul[0] }
}
/** Graf berarah acak dengan bobot bebas (−3..5): bisa memuat cycle negatif. */
const grafBebas = (n, p = 0.3) => {
  const simpul = 'abcdefg'.slice(0, n).split('')
  const busur = []
  for (const u of simpul) for (const v of simpul) if (u !== v && rand() < p) busur.push([u, v, Math.floor(rand() * 9) - 3])
  return { simpul, busur, s: simpul[0] }
}
const tambah = (a, b) => a + b
/** Semua lintasan sederhana s → v sebagai daftar simpul. */
const jalurSederhana = (adj, s, v) => {
  const hasil = []
  const dfs = (u, jalur) => { if (u === v) { hasil.push(jalur); return } for (const x of Object.keys(adj[u])) if (!jalur.includes(x)) dfs(x, [...jalur, x]) }
  dfs(s, [s])
  return hasil
}
const jalurPohon = (pi, v) => { const j = [v]; while (pi[j[0]]) j.unshift(pi[j[0]]); return j }

test('struktur: tujuh bagian PDF + referensi (bagian 2–3 berbagi tab), enam gambar, dua pseudocode, tiga tabel, kode Python; judul polos', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'negatif', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['gambar:graf', 'gambar:pohon', 'gambar:negatif', 'pseudo:init', 'pseudo:relax', 'gambar:relax'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '4.1', '4.2', '4.3', '4.4']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Definisi'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.ok(!/^\$\$.+\$\$$/m.test(md), 'rumus blok memakai $$ di baris sendiri')
})

test('metadata sama dengan PDF dan katalog; Modul 22 membuka Bab VI-c dan tidak punya visualizer sendiri', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [22, 'BAB VI', 9, 7])
  assert.equal(m.soal, kuis22.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[7].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2–3 Jarak Terpendek', '4 Relaksasi', '5 Program', '6 Keterkaitan', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('22'), { prev: modulById('21'), next: modulById('23') })
  assert.equal(neighbors('21').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [16, 17])
  assert.deepEqual(m.posisi, { urutan: ['22', '23', '24'], aktif: 0, catatan: m.posisi.catatan })
  assert.equal(m.algoritmaId, null)
  assert.equal(kuisById('22').soal, 7)
  assert.equal(kuisById('22').judul, kuis22.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode INITIALIZE-SINGLE-SOURCE 4 baris dan RELAX 3 baris sama dengan PDF', () => {
  const a = pseudo.init.baris
  assert.equal(a.length, 4)
  assert.deepEqual([a[0], a[1].trim(), a[2].trim(), a[3]], ['for each vertex v ∈ G.V', 'v.d = ∞', 'v.π = NIL', 's.d = 0'])
  const b = pseudo.relax.baris
  assert.equal(b.length, 3)
  assert.deepEqual([b[0], b[1].trim(), b[2].trim()], ['if v.d > u.d + w(u, v)', 'v.d = u.d + w(u, v)', 'v.π = u'])
  assert.deepEqual([pseudo.init.header, pseudo.relax.header], ['INITIALIZE-SINGLE-SOURCE(G, s)', 'RELAX(u, v, w)'])
})

test('Gambar 1: graf contoh sama dengan program Python (10 busur); posisi dan lengkung konsisten; sumber s', () => {
  const kode = blokTeks('python')
  const dariKode = [...kode.matchAll(/"(\w)": \{([^}]*)\}/g)].map((x) => [x[1], Object.fromEntries([...x[2].matchAll(/"(\w)": (\d+)/g)].map((y) => [y[1], Number(y[2])]))])
  assert.deepEqual(Object.fromEntries(dariKode.slice(0, 5)), adjSP)
  assert.equal(busurSP.length, 10)
  assert.deepEqual(busurSP.map(([u, v, w]) => `${u}${v}${w}`).sort(), ['st3', 'sy5', 'tx6', 'ty2', 'yt1', 'yx4', 'yz6', 'xz2', 'zx7', 'zs3'].sort())
  const kunci = new Set(busurSP.map(([u, v]) => `${u}${v}`))
  for (const k of [...Object.keys(lengkungSP), ...Object.keys(posLabelSP)]) assert.ok(kunci.has(k), `busur ${k} ada`)
  // dua pasangan busur berlawanan arah (t–y dan x–z) harus melengkung supaya tidak bertumpuk
  for (const [u, v] of busurSP) if (kunci.has(`${v}${u}`)) assert.ok(lengkungSP[`${u}${v}`] > 0, `${u}${v} melengkung`)
  for (const pos of [posisiSP, posisiNeg]) for (const p of Object.values(pos)) assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)
  assert.deepEqual(Object.keys(posisiSP).sort(), [...simpulSP].sort())
  assert.ok(gambarSrc.includes('Gambar 1. Graf berarah berbobot dengan sumber s.'))
})

test('2.1 jarak terpendek 3, 9, 5, 11 (brute force, Bellman-Ford, Floyd–Warshall, Dijkstra sepakat); 6 lintasan sederhana ke z; dua shortest-path tree valid', () => {
  const dari = { t: 3, x: 9, y: 5, z: 11 }
  const bf = bellmanFord(simpulSP, busurSP, 's')
  const fw = floydWarshall(simpulSP, busurSP).s
  const dj = dijkstra(simpulSP, busurSP, 's').d
  for (const [v, jarak] of Object.entries(dari)) {
    assert.equal(ringkasLintasan(adjSP, 's', v).terbaik, jarak, `brute force ${v}`)
    assert.deepEqual([bf.d[v], fw[v], dj[v], jarakTerpendek(simpulSP, busurSP, 's')[v]], [jarak, jarak, jarak, jarak])
  }
  assert.ok(md.includes('$\\delta(s, t) = 3$, $\\delta(s, x) = 9$, $\\delta(s, y) = 5$, dan $\\delta(s, z) = 11$'))
  assert.deepEqual(['t', 'x', 'y', 'z'].map((v) => ringkasLintasan(adjSP, 's', v).banyak), [2, 6, 2, 6], 'lintasan sederhana dari s')
  assert.ok(md.includes('ada 6 lintasan sederhana dari $s$ ke $z$'))
  // dua shortest-path tree: tiap v dicapai lewat lintasan berbobot δ(s, v); keduanya berbeda tetapi jaraknya sama
  for (const pi of [pohonA, pohonB]) {
    for (const v of ['t', 'x', 'y', 'z']) assert.equal(bobotLintasan(adjSP, jalurPohon(pi, v)), dari[v], `pohon: ${v}`)
    assert.equal(Object.keys(pi).length, 4)
  }
  assert.notDeepEqual(pohonA, pohonB)
  // caption Gambar 2 dan 3 dibuat dari pohon yang sama
  const ket = (pi) => ['t', 'y', 'x', 'z'].filter((v) => pi[v]).map((v) => `${v}: ${jalurPohon(pi, v).join('→')} (${dari[v]})`)
  const A = ket(pohonA)
  const B = ket(pohonB)
  assert.deepEqual(A.map((x) => x.replace(/^(\w): /, '$1: ')).sort(), ['t: s→t (3)', 'x: s→t→x (9)', 'y: s→y (5)', 'z: s→y→z (11)'].sort())
  assert.deepEqual(B.sort(), ['t: s→t (3)', 'x: s→t→y→x (9)', 'y: s→t→y (5)', 'z: s→t→y→x→z (11)'].sort())
  assert.ok(gambarSrc.includes('(a) t: s→t (3); x: s→t→x (9); y: s→y (5); z: s→y→z (11).'))
  assert.ok(gambarSrc.includes('(b) t: s→t (3); y: s→t→y (5); x: s→t→y→x (9); z: s→t→y→x→z (11).'))
  // lintasan terpendek tidak tunggal: z punya 5, x punya 3
  assert.equal(ringkasLintasan(adjSP, 's', 'z').jalur.length, 5)
  assert.equal(ringkasLintasan(adjSP, 's', 'x').jalur.length, 3)
})

test('5 program Python dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  const baris = ['t', 'x', 'y', 'z'].map((v) => { const r = ringkasLintasan(adjSP, 's', v); return `${v} ${r.terbaik} [${r.jalur.map((j) => `'${j}'`).join(', ')}] dari ${r.banyak} lintasan` })
  const a = { u: 5, v: 9 }
  const pa = { v: null }
  relax(a, pa, 'u', 'v', 2)
  const b = { u: 5, v: 6 }
  const pb = { v: null }
  relax(b, pb, 'u', 'v', 2)
  const py = (d, pi) => `{${Object.entries(d).map(([k, x]) => `'${k}': ${x}`).join(', ')}} {${Object.entries(pi).map(([k, x]) => `'${k}': ${x === null ? 'None' : `'${x}'`}`).join(', ')}}`
  assert.deepEqual(cetak, [...baris, py(a, pa), py(b, pb)])
  assert.ok(md.includes('$z$ memiliki lima lintasan terpendek berbobot 11, dan $x$ memiliki tiga'))
  const exe = cariPython()
  if (!exe) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(exe, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('2.2 Substruktur optimal (acak): setiap prefiks dari lintasan terpendek juga lintasan terpendek; contoh s→t→y→x→z', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 4))
    const adj = adjDariBusur(simpul, busur)
    const delta = jarakTerpendek(simpul, busur, s)
    for (const v of simpul) {
      if (delta[v] === Infinity) continue
      for (const jalur of jalurSederhana(adj, s, v)) {
        if (bobotLintasan(adj, jalur) !== delta[v]) continue
        for (let i = 1; i < jalur.length; i++) assert.equal(bobotLintasan(adj, jalur.slice(0, i + 1)), delta[jalur[i]], `prefiks ${jalur.slice(0, i + 1)} dari lintasan terpendek ${jalur}`)
      }
    }
  }
  const delta = jarakTerpendek(simpulSP, busurSP, 's')
  assert.equal(bobotLintasan(adjSP, ['s', 't', 'y', 'x', 'z']), delta.z)
  assert.equal(bobotLintasan(adjSP, ['s', 't', 'y']), delta.y)
  assert.ok(md.includes('$s \\to t \\to y \\to x \\to z$ adalah lintasan terpendek ke $z$, sehingga $s \\to t \\to y$ pasti lintasan terpendek ke $y$'))
})

test('3 Tabel 1 dan Gambar 4: δ(s, v) dari model sama dengan tabel; cycle c–d–c = 3, e–f–e = −3; −∞ dicek dua cara independen (Floyd–Warshall dan 3|V| putaran Bellman-Ford)', () => {
  const t = barisTabel('*Tabel 1.')
  assert.equal(t.length, 6)
  const delta = jarakTerpendek(simpulNeg, busurNeg, 's')
  for (const r of t) for (const v of r[0].split(',').map((x) => x.trim())) assert.equal(nilaiTex(r[1]), delta[v], `δ(s, ${v})`)
  assert.deepEqual(Object.fromEntries(simpulNeg.map((v) => [v, teksJarak(delta[v])])), { s: '0', a: '3', b: '−1', c: '5', d: '11', e: '−∞', f: '−∞', g: '−∞' })
  assert.equal(adjNeg.c.d + adjNeg.d.c, 3)
  assert.equal(adjNeg.e.f + adjNeg.f.e, -3)
  assert.equal(bobotLintasan(adjNeg, ['s', 'a', 'b']), -1)
  assert.equal(bobotLintasan(adjNeg, ['s', 'c', 'd']), 11)
  assert.ok(gambarSrc.includes('cycle c–d–c berbobot 6 + (−3) = 3 (positif), cycle e–f–e berbobot 3 + (−6) = −3 (negatif)'))
  assert.equal(busurNeg.length, 11)
  const kunciNeg = new Set(busurNeg.map(([u, v]) => `${u}${v}`))
  for (const k of Object.keys(lengkungNeg)) assert.ok(kunciNeg.has(k))
  // dua busur berlawanan arah (c–d dan e–f) melengkung
  for (const [u, v] of busurNeg) if (kunciNeg.has(`${v}${u}`)) assert.ok(lengkungNeg[`${u}${v}`] > 0)
  // −∞ lewat cara lain: nilai d masih turun setelah banyak putaran tambahan hanya untuk simpul yang terjangkau dari cycle negatif
  let adaNegatif = 0
  for (let k = 0; k < 150; k++) {
    const { simpul, busur, s } = grafBebas(3 + Math.floor(rand() * 4))
    const V = simpul.length
    const awal = bellmanFord(simpul, busur, s, V - 1).d
    const akhir = bellmanFord(simpul, busur, s, 3 * V).d
    const delta2 = jarakTerpendek(simpul, busur, s)
    for (const v of simpul) {
      assert.equal(akhir[v] < awal[v], delta2[v] === -Infinity, `${v}: ${JSON.stringify(busur)}`)
      if (delta2[v] !== -Infinity) assert.equal(delta2[v], awal[v], 'tanpa cycle negatif terjangkau, |V| − 1 putaran sudah menghasilkan δ')
      else adaNegatif++
    }
    assert.equal(bellmanFord(simpul, busur, s).siklusNegatif, simpul.some((v) => delta2[v] === -Infinity), 'Bellman-Ford mengembalikan FALSE tepat bila ada cycle negatif yang terjangkau')
  }
  assert.ok(adaNegatif > 20, `cukup banyak kasus −∞ (${adaNegatif})`)
})

test('3 Akibat cycle (acak): cycle positif dibuang memperpendek, cycle nol dibuang tidak mengubah bobot; lintasan terpendek paling banyak |V| − 1 busur', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { p: 0.5 })
    const adj = adjDariBusur(simpul, busur)
    const delta = jarakTerpendek(simpul, busur, s)
    const bf = bellmanFord(simpul, busur, s)
    for (const v of simpul) {
      if (delta[v] === Infinity) continue
      // rantai predecessor Bellman-Ford adalah lintasan sederhana berbobot δ dengan paling banyak |V| − 1 busur
      const jalur = jalurPohon(bf.pi, v)
      assert.equal(new Set(jalur).size, jalur.length, 'tanpa cycle')
      assert.ok(jalur.length - 1 <= simpul.length - 1)
      assert.equal(bobotLintasan(adj, jalur), delta[v])
      // lintasan (walk) yang memuat cycle tidak lebih pendek: tambahkan satu cycle (bobot ≥ 0) pada simpul mana pun di lintasan
      for (const u of jalur) for (const x of Object.keys(adj[u])) if (adj[x][u] !== undefined) assert.ok(adj[u][x] + adj[x][u] >= 0, 'tanpa cycle negatif')
    }
    // tidak ada lintasan sederhana yang lebih pendek dari δ
    for (const v of simpul) if (delta[v] < Infinity) assert.ok(jalurSederhana(adj, s, v).every((j) => bobotLintasan(adj, j) >= delta[v]))
  }
  assert.ok(md.includes('paling banyak memuat $\\lvert V \\rvert - 1$ busur'))
})

test('Tabel 2: Bellman-Ford menerima busur negatif dan mendeteksi cycle negatif (FALSE); Dijkstra salah pada busur negatif', () => {
  const t = barisTabel('*Tabel 2.')
  assert.deepEqual(t.map((r) => r[0]), ['Bellman-Ford (Modul 23)', 'Dijkstra (Modul 24)'])
  assert.deepEqual(t.map((r) => r[1]), ['Diperbolehkan', 'Tidak diperbolehkan'])
  assert.equal(bellmanFord(simpulNeg, busurNeg, 's').siklusNegatif, true, 'graf Gambar 4: Bellman-Ford mengembalikan FALSE')
  assert.equal(bellmanFord(simpulSP, busurSP, 's').siklusNegatif, false)
  // busur negatif tanpa cycle negatif: Bellman-Ford benar, Dijkstra bisa salah
  const s3 = ['s', 'a', 'b', 'c']
  const e3 = [['s', 'a', 2], ['s', 'b', 3], ['b', 'a', -2], ['a', 'c', 1]]
  assert.deepEqual([bellmanFord(s3, e3, 's').d.a, bellmanFord(s3, e3, 's').d.c], [1, 2])
  assert.equal(dijkstra(s3, e3, 's').d.c, 3, 'Dijkstra tidak merelaksasi ulang busur keluar dari a setelah d(a) turun, sehingga c salah')
  // Dijkstra benar bila bobot tidak negatif (acak)
  for (let k = 0; k < 100; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { negatif: false })
    assert.deepEqual(dijkstra(simpul, busur, s).d, bellmanFord(simpul, busur, s).d)
  }
  // Dijkstra gagal pada banyak graf dengan busur negatif (bukti bahwa syarat bobot tidak negatif diperlukan)
  let salah = 0
  for (let k = 0; k < 3000; k++) { // Dijkstra salah hanya pada sekitar 1% graf acak, jadi butuh banyak percobaan
    const { simpul, busur, s } = grafAcak(4 + Math.floor(rand() * 3), { negatif: true })
    if (JSON.stringify(dijkstra(simpul, busur, s).d) !== JSON.stringify(bellmanFord(simpul, busur, s).d)) salah++
  }
  assert.ok(salah > 0, 'ada graf dengan busur negatif yang membuat Dijkstra salah')
})

test('4.2 INITIALIZE-SINGLE-SOURCE: semua ∞ dan NIL, s.d = 0; satu iterasi per simpul = Θ(V)', () => {
  const { d, pi } = initializeSingleSource(simpulSP, 's')
  assert.deepEqual(d, { s: 0, t: Infinity, x: Infinity, y: Infinity, z: Infinity })
  assert.ok(Object.values(pi).every((x) => x === null))
  for (const n of [1, 5, 50]) assert.equal(Object.keys(initializeSingleSource(Array.from({ length: n }, (_, i) => `v${i}`), 'v0').d).length, n)
  assert.ok(md.includes('Running time-nya $\\Theta(V)$'))
})

test('4.3 RELAX: Gambar 5 (9 > 5 + 2 → 7, π = u) dan Gambar 6 (6 ≤ 7 → tidak berubah); satu perbandingan = O(1)', () => {
  const d1 = { u: 5, v: 9 }
  const pi1 = { v: null }
  assert.equal(relax(d1, pi1, 'u', 'v', 2), true)
  assert.deepEqual([d1, pi1], [{ u: 5, v: 7 }, { v: 'u' }])
  const d2 = { u: 5, v: 6 }
  const pi2 = { v: 'q' }
  assert.equal(relax(d2, pi2, 'u', 'v', 2), false)
  assert.deepEqual([d2, pi2], [{ u: 5, v: 6 }, { v: 'q' }])
  // relaksasi dengan u.d = ∞ tidak pernah mengubah apa pun (∞ + w tidak lebih kecil)
  const d3 = { u: Infinity, v: Infinity }
  assert.equal(relax(d3, { v: null }, 'u', 'v', 2), false)
  assert.ok(gambarSrc.includes('Karena 9 &gt; 5 + 2, v.d menjadi 7 dan v.π = u.') && gambarSrc.includes('Karena 6 ≤ 5 + 2, tidak ada perubahan.'))
  assert.ok(gambarSrc.includes('<GambarRelax ud={5} vd={9} w={2}') && gambarSrc.includes('<GambarRelax ud={5} vd={6} w={2}'))
})

test('4.4 Tabel 3 (acak): ketaksamaan segitiga, batas atas, tidak ada lintasan, konvergensi, dan relaksasi lintasan', () => {
  assert.equal(barisTabel('*Tabel 3.').length, 5)
  assert.deepEqual(barisTabel('*Tabel 3.').map((r) => r[0]), ['Ketaksamaan segitiga', 'Batas atas', 'Tidak ada lintasan', 'Konvergensi', 'Relaksasi lintasan'])
  let konvergensi = 0
  let lintasanRelaksasi = 0
  for (let k = 0; k < 150; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { p: 0.3 })
    const adj = adjDariBusur(simpul, busur)
    const delta = jarakTerpendek(simpul, busur, s)
    // ketaksamaan segitiga
    for (const [u, v, w] of busur) assert.ok(delta[v] <= delta[u] + w, `segitiga ${u}${v}`)
    // batas atas dan tidak ada lintasan: urutan relaksasi acak
    const { d, pi } = initializeSingleSource(simpul, s)
    const tercapai = new Set()
    for (let step = 0; step < 40; step++) {
      const [u, v, w] = busur[Math.floor(rand() * busur.length)] ?? [s, s, 0]
      relax(d, pi, u, v, w)
      for (const x of simpul) {
        assert.ok(d[x] >= delta[x], `batas atas ${x}`)
        if (delta[x] === Infinity) assert.equal(d[x], Infinity, 'tidak ada lintasan')
        if (tercapai.has(x)) assert.equal(d[x], delta[x], 'sekali mencapai δ tidak berubah lagi')
        if (d[x] === delta[x]) tercapai.add(x)
      }
    }
    // konvergensi: bila u.d = δ(s, u) dan (u, v) ada di lintasan terpendek, relaksasi (u, v) memberi v.d = δ(s, v)
    for (const [u, v, w] of busur) {
      if (delta[u] === Infinity || delta[v] !== delta[u] + w) continue
      const st = initializeSingleSource(simpul, s)
      const jalurU = jalurSederhana(adj, s, u).find((j) => bobotLintasan(adj, j) === delta[u])
      for (let i = 0; i + 1 < jalurU.length; i++) relax(st.d, st.pi, jalurU[i], jalurU[i + 1], adj[jalurU[i]][jalurU[i + 1]])
      for (let step = 0; step < 5; step++) { const [a, b, c] = busur[Math.floor(rand() * busur.length)]; relax(st.d, st.pi, a, b, c) }
      assert.equal(st.d[u], delta[u])
      relax(st.d, st.pi, u, v, w)
      assert.equal(st.d[v], delta[v], `konvergensi (${u}, ${v})`)
      konvergensi++
    }
    // relaksasi lintasan: busur lintasan terpendek direlaksasi berurutan, diselingi relaksasi busur lain
    for (const v of simpul) {
      if (delta[v] === Infinity || v === s) continue
      const jalur = jalurSederhana(adj, s, v).find((j) => bobotLintasan(adj, j) === delta[v])
      const st = initializeSingleSource(simpul, s)
      for (let i = 0; i + 1 < jalur.length; i++) {
        for (let step = 0; step < 3; step++) { const [a, b, c] = busur[Math.floor(rand() * busur.length)]; relax(st.d, st.pi, a, b, c) }
        relax(st.d, st.pi, jalur[i], jalur[i + 1], adj[jalur[i]][jalur[i + 1]])
      }
      assert.equal(st.d[v], delta[v], `relaksasi lintasan ke ${v}`)
      lintasanRelaksasi++
    }
  }
  assert.ok(konvergensi > 100 && lintasanRelaksasi > 100, `kasus cukup (${konvergensi}, ${lintasanRelaksasi})`)
})

test('4.4 Bellman-Ford (|V| − 1 putaran, Θ(VE)) dan Dijkstra (setiap busur keluar sekali): benar dan jumlah relaksasi sesuai', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 6), { p: 0.35 })
    const bf = bellmanFord(simpul, busur, s)
    assert.deepEqual(bf.d, jarakTerpendek(simpul, busur, s), 'Bellman-Ford = Floyd–Warshall')
    assert.equal(bf.relaksasi, (simpul.length - 1) * busur.length, 'jumlah relaksasi = (|V| − 1)|E| = Θ(VE)')
    assert.equal(dijkstra(simpul, busur.map(([u, v, w]) => [u, v, Math.abs(w)]), s).relaksasi, busur.length, 'Dijkstra merelaksasi tiap busur tepat sekali')
  }
  // |V| − 1 putaran memang diperlukan: busur terdaftar dalam urutan terburuk (terbalik) pada lintasan lurus
  for (const V of [3, 5, 8]) {
    const simpul = Array.from({ length: V }, (_, i) => `v${i}`)
    const rantai = simpul.slice(1).map((v, i) => [simpul[i], v, 1]).reverse()
    assert.equal(bellmanFord(simpul, rantai, 'v0', V - 1).d[`v${V - 1}`], V - 1)
    assert.equal(bellmanFord(simpul, rantai, 'v0', V - 2).d[`v${V - 1}`], Infinity, `${V - 2} putaran belum cukup`)
  }
  assert.ok(md.includes('$\\Theta(V E)$') && md.includes('$O((V + E) \\lg V)$'))
})

test('7/Soal 7: setelah putaran ke-i, simpul ke-i dari setiap lintasan terpendek sudah benar (acak), jadi |V| − 1 putaran cukup', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { p: 0.4 })
    const adj = adjDariBusur(simpul, busur)
    const delta = jarakTerpendek(simpul, busur, s)
    for (const v of simpul) {
      if (delta[v] === Infinity || v === s) continue
      const jalur = jalurSederhana(adj, s, v).find((j) => bobotLintasan(adj, j) === delta[v])
      for (let i = 1; i < jalur.length; i++) assert.equal(bellmanFord(simpul, busur, s, i).d[jalur[i]], delta[jalur[i]], `putaran ${i}`)
    }
  }
})

test('6 Keterkaitan: bobot semua 1 = jarak BFS; shortest-path tree bukan MST (contoh graf Modul 19: 42 lawan 37)', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 6), { negatif: false, bobotSatu: true, p: 0.3 })
    const adj = adjDariBusur(simpul, busur)
    const jarak = { [s]: 0 }
    const antre = [s]
    while (antre.length) { const u = antre.shift(); for (const v of Object.keys(adj[u])) if (jarak[v] === undefined) { jarak[v] = jarak[u] + 1; antre.push(v) } }
    const delta = jarakTerpendek(simpul, busur, s)
    for (const v of simpul) assert.equal(delta[v], jarak[v] ?? Infinity, `BFS ${v}`)
  }
  const dua = busurContoh.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]])
  const dj = dijkstra(simpulContoh, dua, 'a')
  const bobotPohon = Object.entries(dj.pi).filter(([, p]) => p).reduce((sum, [v, p]) => tambah(sum, dua.find(([x, y]) => x === p && y === v)[2]), 0)
  assert.equal(bobotPohon, 42)
  assert.ok(bobotPohon > 37, 'MST berbobot 37 (Modul 19)')
  assert.ok(md.includes('Shortest-path tree meminimalkan jarak dari $s$ ke setiap simpul'))
})

test('kunci kuis dihitung ulang: soal 1–7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis22.soal
  const delta = jarakTerpendek(simpulSP, busurSP, 's')
  // soal 1
  assert.equal(bobotLintasan(adjSP, ['s', 'y', 't', 'x', 'z']), 14)
  assert.deepEqual(q1.isian.map((f) => f.kunci), [14, delta.z, 'Bukan'])
  assert.ok(14 > delta.z)
  // soal 2
  assert.equal(q2.kunci, 'B')
  const jz = ringkasLintasan(adjSP, 's', 'z')
  assert.equal(jz.jalur.length, 5)
  assert.deepEqual([bobotLintasan(adjSP, ['s', 'y', 'z']), bobotLintasan(adjSP, ['s', 't', 'y', 'x', 'z'])], [11, 11])
  assert.ok(jz.jalur.includes('syz') && jz.jalur.includes('styxz'))
  assert.notEqual('syz'.length, 'styxz'.length, 'jumlah busur berbeda tetapi bobot sama')
  // soal 3
  const d3 = { u: 4, v: 10 }
  const p3 = { v: 'lama' }
  relax(d3, p3, 'u', 'v', 3)
  assert.deepEqual([d3.v, p3.v], [q3.isian[0].kunci, 'u'])
  const d3b = { u: 4, v: 7 }
  const p3b = { v: 'lama' }
  assert.equal(relax(d3b, p3b, 'u', 'v', 3), false)
  assert.deepEqual([d3b.v, p3b.v], [q3.isian[2].kunci, 'lama'])
  assert.deepEqual([q3.isian[1].kunci, q3.isian[3].kunci], ['u', 'Tidak ada perubahan'])
  // soal 4
  const dn = jarakTerpendek(simpulNeg, busurNeg, 's')
  assert.equal(dn.b, -1)
  assert.equal(dn.e, -Infinity)
  assert.deepEqual([q4.isian[1].kunci, q4.isian[3].kunci, q4.isian[4].kunci], [bobotLintasan(adjNeg, ['s', 'a', 'b']), adjNeg.e.f + adjNeg.f.e, teksJarak(-Infinity)])
  for (let putaran = 0; putaran < 5; putaran++) { const jalur = ['s', 'e', ...Array.from({ length: putaran }, () => ['f', 'e']).flat()]; assert.equal(bobotLintasan(adjNeg, jalur), 2 - 3 * putaran, 'tiap putaran cycle mengurangi 3') }
  // soal 5: 10 simpul tanpa cycle negatif → paling banyak 9 busur
  for (let k = 0; k < 60; k++) {
    const { simpul, busur, s } = grafAcak(10, { p: 0.2 })
    const bf = bellmanFord(simpul, busur, s)
    for (const v of simpul) if (bf.d[v] < Infinity) assert.ok(jalurPohon(bf.pi, v).length - 1 <= 9)
  }
  assert.equal(q5.kunci, 'Benar')
  // soal 6
  assert.equal(bobotLintasan(adjSP, ['s', 't', 'y', 'x']), 9)
  assert.equal(delta.x, 9)
  assert.equal(delta.y, 5)
  assert.equal(bobotLintasan(adjSP, ['s', 't', 'y']), q6.isian[1].kunci)
  assert.equal(q6.isian[0].kunci, 'y')
  assert.ok(q6.isian[2].kunci.startsWith('Substruktur optimal'))
  // soal 7
  assert.equal(q7.kunci, 'B')
  assert.ok(q7.opsi.find((o) => o.id === 'B').teks.includes('paling banyak $\\lvert V \\rvert - 1$ busur'))
})

test('struktur kuis: 7 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis22.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis22.soal.map((q) => TIPE_LABEL[q.tipe]), ['Perhitungan', 'Pilihan Ganda', 'Penelusuran', 'Analisis', 'Benar/Salah', 'Analisis', 'Pilihan Ganda'])
  assert.deepEqual(kuis22.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  for (const q of kuis22.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis22.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '22').tipe].sort())
})

test('penilaian soal Modul 22', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis22.soal
  const kunci = (q) => q.isian.map((f) => String(f.kunci))
  assert.equal(nilaiSoal(q1, kunci(q1)).benar, true)
  assert.equal(nilaiSoal(q1, ['14', '11', 'Ya']).benar, false)
  assert.equal(nilaiSoal(q2, 'B').benar, true)
  assert.equal(nilaiSoal(q2, 'A').benar, false)
  assert.equal(nilaiSoal(q3, kunci(q3)).benar, true)
  assert.equal(nilaiSoal(q3, ['7', 'u', '7', 'Ada perubahan']).benar, false)
  assert.equal(nilaiSoal(q4, kunci(q4)).benar, true)
  assert.equal(nilaiSoal(q4, [...kunci(q4).slice(0, 4), '−3']).benar, false)
  assert.equal(nilaiSoal(q4, ['Satu kali saja', '1', q4.isian[2].kunci, '-3', '−∞']).benar, false, 'bobot lintasan s → a → b adalah −1, bukan 1')
  // jawaban negatif boleh diketik dengan minus ASCII maupun minus Unicode (seperti tertulis di soal)
  assert.equal(nilaiSoal(q4, ['Satu kali saja', '\u22121', q4.isian[2].kunci, '\u22123', '−∞']).benar, true)
  assert.equal(nilaiSoal(q5, 'Benar').benar, true)
  assert.equal(nilaiSoal(q5, 'Salah').benar, false)
  assert.equal(nilaiSoal(q6, kunci(q6)).benar, true)
  assert.equal(nilaiSoal(q6, ['t', '5', q6.isian[2].kunci]).benar, false)
  assert.equal(nilaiSoal(q7, 'B').benar, true)
  const semua = { 1: kunci(q1), 2: 'B', 3: kunci(q3), 4: kunci(q4), 5: 'Benar', 6: kunci(q6), 7: 'B' }
  const h = hitungHasil(kuis22.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [7, true, []])
})
