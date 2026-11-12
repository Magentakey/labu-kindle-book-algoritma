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
import { adalahSpanningTree, busurContoh, lintasanDiTree, mstT1, mstT2, namaBusur, ringkasBruteForce, semuaSpanningTree, simpulContoh } from '../viz/mstModel.js'
import { HimpunanSalingLepas, alfa, himpunanSimpul, kruskal, perkiraanBiaya, potretTahap, tahapGambar, teksHimpunan, urutanBahan } from '../viz/kruskalModel.js'
import { kuis20 } from './modul/20.kuis.js'
import { pseudo } from './modul/20.pseudo.js'

const md = readFileSync(new URL('./modul/20.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('20')
const hasil = kruskal(simpulContoh, urutanBahan, false)

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const komponen = (simpul, himpunan) => {
  const induk = Object.fromEntries(simpul.map((v) => [v, v]))
  const akar = (x) => { while (induk[x] !== x) x = induk[x]; return x }
  for (const n of himpunan) induk[akar(n[0])] = akar(n[1])
  return new Set(simpul.map(akar)).size
}
/** Graf acak (belum tentu terhubung bila `terhubung` false) dengan bobot kecil sehingga banyak seri. */
const grafAcak = (n, { terhubung = true, maxW = 5, p = 0.4 } = {}) => {
  const simpul = 'abcdefghij'.slice(0, n).split('')
  const pasang = new Set()
  if (terhubung) for (let i = 1; i < n; i++) pasang.add(namaBusur(simpul[i], simpul[Math.floor(rand() * i)]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < p) pasang.add(namaBusur(simpul[i], simpul[j]))
  return { simpul, busur: [...pasang].map((nm) => [nm[0], nm[1], 1 + Math.floor(rand() * maxW)]) }
}
const acak = (arr) => [...arr].sort(() => rand() - 0.5)
const urutBobot = (busur) => [...busur].sort((p, q) => p[2] - q[2])

test('struktur: lima bagian PDF (bagian 4 dipecah dua tab) + referensi, satu gambar, MST-KRUSKAL, tiga tabel, kode Python; judul polos', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+(\.\d+)?/)?.[0] ?? null), ['1', '2', '3', '4', '4.2', '5', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:kruskal', 'gambar:langkah'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '3.1', '4.1', '4.3']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Coba sendiri di visualizer', 'Catatan koreksi terhadap sumber', 'Pengaruh urutan busur berbobot sama'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  // rumus blok harus memakai $$ pada baris sendiri (satu baris $$...$$ dibaca sebagai rumus sebaris dan melebarkan halaman di HP)
  assert.ok(!/^\$\$.+\$\$$/m.test(md), 'rumus blok memakai $$ di baris sendiri')
})

test('metadata sama dengan PDF dan katalog; visualizer Kruskal terhubung dua arah; Modul 20 di tengah Bab VI-b', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [20, 'BAB VI', 10, 7])
  assert.equal(m.soal, kuis20.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[6].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Pseudocode', '3 Penelusuran', '4.1 Kebenaran', '4.2 Running Time', '5 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('20'), { prev: modulById('19'), next: modulById('21') })
  assert.equal(neighbors('19').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [19, 8])
  assert.deepEqual(m.posisi, { urutan: ['19', '20', '21'], aktif: 1, catatan: m.posisi.catatan })
  assert.equal(m.algoritmaId, 'kruskal')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [20, true, 'mst'])
  assert.equal(kuisById('20').soal, 7)
  assert.equal(kuisById('20').judul, kuis20.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode MST-KRUSKAL 9 baris sama dengan PDF; Tabel 1 menjelaskan langkah 1, 2–3, 4, 5, 6, 7, 8, 9', () => {
  const b = pseudo.kruskal.baris
  assert.equal(b.length, 9)
  assert.deepEqual([b[0], b[1], b[2].trim(), b[8]], ['A = ∅', 'for each vertex v ∈ G.V', 'MAKE-SET(v)', 'return A'])
  assert.ok(b[3].startsWith('sort the edges of G.E into nondecreasing order by weight w'))
  assert.ok(b[4].startsWith('for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight'))
  assert.ok(b[5].includes('if FIND-SET(u) ≠ FIND-SET(v)') && b[6].includes('A = A ∪ {(u, v)}') && b[7].includes('UNION(u, v)'))
  assert.equal(pseudo.kruskal.header, 'MST-KRUSKAL(G, w)')
  assert.deepEqual(barisTabel('*Tabel 1.').map((r) => r[0]), ['1', '2–3', '4', '5', '6', '7', '8', '9'])
  assert.ok(md.includes('lanjut ke langkah 9') && md.includes('kembali ke langkah 5'))
})

test('3 Langkah 4: urutan 14 busur dari bahan kuliah terurut menurut bobot dan merupakan permutasi graf Modul 19; langkah 2–3: 9 tree (bukan 8)', () => {
  const baris = md.split('\n').find((l) => l.startsWith('**Langkah 4.**'))
  const dariTeks = [...baris.matchAll(/\((\w),\s*(\w)\)/g)].map((x) => namaBusur(x[1], x[2]))
  assert.deepEqual(dariTeks, urutanBahan.map(([u, v]) => namaBusur(u, v)))
  assert.equal(urutanBahan.length, 14)
  const w = urutanBahan.map((e) => e[2])
  assert.deepEqual(w, [...w].sort((p, q) => p - q), 'nondecreasing')
  assert.deepEqual(urutanBahan.map(([u, v, x]) => `${namaBusur(u, v)}:${x}`).sort(), busurContoh.map(([u, v, x]) => `${namaBusur(u, v)}:${x}`).sort())
  assert.ok(md.includes('$(b, c)$ dan $(a, h)$ yang sama-sama 8'))
  // langkah 2–3: tepat 9 himpunan satu simpul, sesuai koreksi
  const S = new HimpunanSalingLepas()
  for (const v of simpulContoh) S.makeSet(v)
  assert.equal(new Set(simpulContoh.map((v) => S.findSet(v))).size, 9)
  assert.equal(himpunanSimpul(simpulContoh, []).length, 9)
  assert.ok(md.includes('{a}, {b}, {c}, {d}, {e}, {f}, {g}, {h}, {i}'))
  assert.ok(md.includes('berupa 8 tree') && md.includes('**9 tree**'))
})

test('Tabel 2: setiap busur, hasil FIND-SET, dan himpunan simpul sama dengan hasil Kruskal; "tidak berubah" memang sama dengan himpunan sebelumnya', () => {
  const t = barisTabel('*Tabel 2.')
  assert.equal(t.length, 14)
  let sebelum = teksHimpunan(himpunanSimpul(simpulContoh, []))
  t.forEach((r, i) => {
    const l = hasil.langkah[i]
    assert.equal(r[0], `(${l.u},${l.v}) = ${l.w}`, `busur ${i + 1}`)
    assert.equal(r[1], l.diterima ? 'True' : 'False', `FIND-SET ${r[0]}`)
    if (l.diterima) assert.equal(r[2], teksHimpunan(l.himpunan), `himpunan ${r[0]}`)
    else { assert.equal(r[2], 'tidak berubah'); assert.equal(teksHimpunan(l.himpunan), sebelum, `${r[0]} tidak mengubah himpunan`) }
    sebelum = teksHimpunan(l.himpunan)
  })
  assert.deepEqual(hasil.langkah.map((l) => l.diterima), [true, true, true, true, true, false, true, false, true, false, true, false, false, false])
})

test('Gambar 1–6: busur lama, baru, dan ditolak pada setiap tahap, himpunan simpul, dan bobot sama dengan PDF', () => {
  assert.deepEqual(tahapGambar, [3, 5, 6, 8, 10, 14])
  const p = tahapGambar.map((sampai, i) => potretTahap(hasil, i === 0 ? 0 : tahapGambar[i - 1], sampai, simpulContoh))
  assert.deepEqual(p.map((x) => x.baru), [['gh', 'ci', 'fg'], ['ab', 'cf'], [], ['cd'], ['bc'], ['de']])
  assert.deepEqual(p.map((x) => x.tolak), [[], [], ['gi'], ['hi'], ['ah'], ['ef', 'bh', 'df']])
  assert.deepEqual(p.map((x) => x.lama.length), [0, 3, 5, 5, 6, 7])
  assert.deepEqual(p.map((x) => teksHimpunan(x.himpunan)), [
    '{a}, {b}, {c,i}, {d}, {e}, {f,g,h}',
    '{a,b}, {c,f,g,h,i}, {d}, {e}',
    '{a,b}, {c,f,g,h,i}, {d}, {e}',
    '{a,b}, {c,d,f,g,h,i}, {e}',
    '{a,b,c,d,f,g,h,i}, {e}',
    '{a,b,c,d,e,f,g,h,i}',
  ])
  assert.deepEqual(p.map((x) => x.bobotSementara), [5, 13, 13, 20, 28, 37])
  // (c,f) menyatukan {c,i} dengan {f,g,h}
  assert.deepEqual(hasil.langkah[3].himpunan.map((s) => s.join('')), ['ab', 'ci', 'd', 'e', 'fgh'])
  const g = readFileSync(new URL('./modul/20.gambar.jsx', import.meta.url), 'utf8')
  for (const k of ['(a) Setelah memproses (h,g), (c,i), (g,f): ketiganya diterima.', '(c,f) menyatukan {c,i} dengan {f,g,h}.', '(g,i) ditolak: g dan i sudah satu tree', '(c,d) diterima; (h,i) ditolak.', '(a,h) ditolak karena a dan h sudah terhubung', '(e,f), (b,h), (d,f) ditolak. MST selesai, bobot 37.']) assert.ok(g.includes(k), k)
  assert.ok(g.includes('Himpunan simpul: {teksHimpunan(p.himpunan)}'), 'himpunan simpul ditulis sebagai teks')
})

test('Langkah 9: A = {hg, ci, gf, ab, cf, cd, bc, de} berbobot 37 sama dengan T1 Modul 19; (a,h) diurutkan sebelum (b,c) menghasilkan T2', () => {
  assert.deepEqual(hasil.A.map(([u, v]) => `${u}${v}`), ['hg', 'ci', 'gf', 'ab', 'cf', 'cd', 'bc', 'de'])
  assert.equal(hasil.total, 37)
  assert.ok(md.includes('1 + 2 + 2 + 4 + 4 + 7 + 8 + 9 = 37'))
  assert.deepEqual([4, 8, 7, 9].length, 4)
  assert.deepEqual(hasil.A.map(([u, v]) => namaBusur(u, v)).sort(), [...mstT1].sort())
  assert.ok(adalahSpanningTree(simpulContoh, hasil.A.map(([u, v]) => namaBusur(u, v))))
  const ahDulu = urutanBahan.filter((e) => namaBusur(e[0], e[1]) !== 'bc')
  ahDulu.splice(ahDulu.findIndex((e) => namaBusur(e[0], e[1]) === 'ah') + 1, 0, ['b', 'c', 8])
  const r2 = kruskal(simpulContoh, ahDulu, false)
  assert.deepEqual(r2.A.map(([u, v]) => namaBusur(u, v)).sort(), [...mstT2].sort())
  assert.equal(r2.total, 37)
  assert.deepEqual(r2.langkah.map((l) => [namaBusur(l.u, l.v), l.diterima]).filter(([n]) => n === 'ah' || n === 'bc'), [['ah', true], ['bc', false]])
  // dua MST hasil brute force memang T1 dan T2
  const r = ringkasBruteForce(simpulContoh, busurContoh)
  assert.equal(r.banyakMst, 2)
})

test('3.1 program Python (union by rank + path compression) dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  const ah = kruskal(simpulContoh, (() => { const a = urutanBahan.filter((e) => namaBusur(e[0], e[1]) !== 'bc'); a.splice(a.findIndex((e) => namaBusur(e[0], e[1]) === 'ah') + 1, 0, ['b', 'c', 8]); return a })(), false)
  const baris = (r) => `[${r.A.map(([u, v]) => `'${u}${v}'`).join(', ')}] ${r.total}`
  assert.deepEqual(cetak, [baris(hasil), baris(ah)])
  const dariKode = [...kode.matchAll(/\("(\w)","(\w)",(\d+)\)/g)].map((x) => [x[1], x[2], Number(x[3])]).slice(0, 14)
  assert.deepEqual(dariKode, urutanBahan)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('himpunan saling lepas (acak): FIND-SET sama jika dan hanya jika terhubung oleh UNION; rank akar ≤ lg n; MAKE-SET sekali per simpul', () => {
  for (let k = 0; k < 120; k++) {
    const n = 2 + Math.floor(rand() * 14)
    const S = new HimpunanSalingLepas()
    const label = {}
    for (let i = 0; i < n; i++) { S.makeSet(i); label[i] = i }
    for (let step = 0; step < 2 * n; step++) {
      const [x, y] = [Math.floor(rand() * n), Math.floor(rand() * n)]
      // UNION hanya dipanggil untuk dua himpunan berbeda (Kruskal selalu mengecek FIND-SET lebih dulu), sesuai prasyarat Cormen dkk. (2009, Bab 21)
      if (rand() < 0.5 && label[x] !== label[y]) {
        S.union(x, y)
        const [lx, ly] = [label[x], label[y]]
        for (const v of Object.keys(label)) if (label[v] === ly) label[v] = lx
      } else assert.equal(S.findSet(x) === S.findSet(y), label[x] === label[y])
    }
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) assert.equal(S.findSet(x) === S.findSet(y), label[x] === label[y])
    for (const v of Object.keys(S.rank)) assert.ok(S.rank[v] <= Math.floor(Math.log2(n)), `rank ${S.rank[v]} > lg ${n}`)
    assert.equal(S.jumlahOperasi.makeSet, n)
  }
})

test('4.1 Kebenaran (acak): setiap busur yang diterima adalah light edge untuk cut (C, V − C); cut respects A; crossing edge yang lebih ringan sudah diproses dan ditolak', () => {
  let diperiksa = 0
  for (let k = 0; k < 150; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 6), { terhubung: rand() < 0.7, p: 0.35 })
    const r = kruskal(simpul, acak(busur))
    r.langkah.forEach((l, i) => {
      if (!l.diterima) return
      const sebelum = r.langkah.slice(0, i).filter((x) => x.diterima).map((x) => namaBusur(x.u, x.v))
      const C = himpunanSimpul(simpul, sebelum).find((s) => s.includes(l.u))
      assert.ok(!C.includes(l.v), 'v di tree lain')
      assert.ok(sebelum.every((n) => C.includes(n[0]) === C.includes(n[1])), 'cut respects A')
      const silang = r.urutan.map((e, idx) => ({ e, idx })).filter(({ e }) => C.includes(e[0]) !== C.includes(e[1]))
      assert.ok(silang.some(({ idx }) => idx === i), '(u, v) menyeberangi cut')
      assert.equal(l.w, Math.min(...silang.map(({ e }) => e[2])), '(u, v) adalah light edge')
      for (const { e, idx } of silang) if (e[2] < l.w) { assert.ok(idx < i, 'diproses lebih dulu'); assert.equal(r.langkah[idx].diterima, false, 'dan ditolak') }
      diperiksa++
    })
  }
  assert.ok(diperiksa >= 400, `cukup banyak busur diperiksa (${diperiksa})`)
  // contoh dari bahan kuliah: (c,d) diterima ketika C = {a,b} ∪ ... cut-nya dilewati light edge 7
  const i = hasil.langkah.findIndex((l) => l.u === 'c' && l.v === 'd')
  assert.equal(hasil.langkah[i].w, 7)
})

test('Kruskal benar (acak): bobot sama dengan MST brute force, apa pun urutan busur berbobot sama; A selalu forest; berhenti dini setelah |V|-1 busur; graf tak terhubung → minimum spanning forest', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 4), { p: 0.5 })
    const semua = semuaSpanningTree(simpul, busur)
    const bobot = semua.map((tt) => tt.reduce((s, nm) => s + busur.find(([u, v]) => namaBusur(u, v) === nm)[2], 0))
    const minimum = Math.min(...bobot)
    for (let u = 0; u < 4; u++) {
      const r = kruskal(simpul, urutBobot(acak(busur)), false)
      assert.equal(r.total, minimum, JSON.stringify(busur))
      assert.ok(adalahSpanningTree(simpul, r.A.map(([a, b]) => namaBusur(a, b))))
      let diterima = 0
      r.langkah.forEach((l) => {
        if (l.diterima) diterima++
        // forest: |A| = |V| − banyak himpunan (tidak ada cycle)
        assert.equal(diterima, simpul.length - l.himpunan.length)
        if (diterima >= simpul.length - 1) assert.equal(l.himpunan.length, 1)
      })
      const awal = r.langkah.findIndex((l) => l.himpunan.length === 1)
      assert.ok(r.langkah.slice(awal + 1).every((l) => !l.diterima), 'sesudah |V|-1 busur, semua busur berikutnya ditolak')
    }
  }
  for (let k = 0; k < 60; k++) {
    const { simpul, busur } = grafAcak(4 + Math.floor(rand() * 5), { terhubung: false, p: 0.15 })
    const r = kruskal(simpul, busur)
    const jumlahKomponen = komponen(simpul, busur.map(([u, v]) => u + v))
    assert.equal(r.A.length, simpul.length - jumlahKomponen, 'minimum spanning forest: |V| − komponen busur')
    assert.equal(komponen(simpul, r.A.map(([u, v]) => u + v)), jumlahKomponen, 'komponennya sama dengan graf')
  }
})

test('4.2 Running time: operasi MAKE-SET/UNION, α(1000), biaya pengurutan 780.000 dan pemrosesan ≤ 200.000, lg E = O(lg V)', () => {
  const t = barisTabel('*Tabel 3.')
  assert.equal(t.length, 3)
  assert.deepEqual(t.map((r) => r[1]), ['$O(V)$', '$O(E \\lg E)$', '$O(E \\, \\alpha(V))$, dengan $\\alpha$ fungsi yang tumbuh sangat lambat (praktis $\\alpha \\le 4$)'])
  assert.equal(hasil.operasi.makeSet, 9)
  assert.equal(hasil.operasi.union, 8, '|V| − 1 UNION pada contoh')
  for (let k = 0; k < 100; k++) {
    const { simpul, busur } = grafAcak(3 + Math.floor(rand() * 7), { p: 0.4 })
    const r = kruskal(simpul, busur)
    assert.equal(r.operasi.makeSet, simpul.length)
    assert.equal(r.operasi.union, simpul.length - 1)
    assert.equal(r.langkah.length, busur.length, 'setiap busur diproses sekali')
    assert.ok(Math.log2(busur.length) < 2 * Math.log2(simpul.length), 'lg E < 2 lg V karena E < V²')
    assert.ok(busur.length >= simpul.length - 1)
  }
  const b = perkiraanBiaya(1000, 50000)
  assert.equal(alfa(1000), 3)
  assert.ok(Math.abs(b.pengurutan - 780000) / 780000 < 0.01, `E lg E ≈ 780.000 (${Math.round(b.pengurutan)})`)
  assert.ok(Math.abs(50000 * 15.6 - 780000) < 1)
  assert.ok(b.proses <= 50000 * 4)
  assert.ok(b.pengurutan > b.proses, 'pengurutan dominan')
  assert.deepEqual([alfa(2), alfa(3), alfa(7), alfa(8), alfa(2047), alfa(2048)], [0, 1, 2, 3, 3, 4])
  assert.ok(md.includes('$O(E \\lg V)$') && md.includes('$\\lg E = O(\\lg V)$'))
})

test('kunci kuis dihitung ulang: soal 2, 3, 4, 5, 6, 7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis20.soal
  assert.deepEqual([q2.kunci, q3.kunci, q5.kunci, q6.kunci], [['A', 'B', 'C'], 'D', ['A', 'C'], ['B', 'C', 'D']])
  // soal 2
  const g2 = [['p', 'q', 3], ['p', 'r', 1], ['q', 'r', 2], ['q', 's', 5], ['r', 's', 4], ['s', 't', 6], ['r', 't', 7]]
  const r2 = kruskal('pqrst'.split(''), g2)
  assert.deepEqual(r2.langkah.map((l) => `${l.u}${l.v}${l.w}:${l.diterima ? 'Diterima' : 'Ditolak'}`), ['pr1:Diterima', 'qr2:Diterima', 'pq3:Ditolak', 'rs4:Diterima', 'qs5:Ditolak', 'st6:Diterima', 'rt7:Ditolak'])
  assert.equal(r2.total, 13)
  // soal 3: sebelum (h,i) diproses, lintasan di A antara h dan i
  const iHI = hasil.langkah.findIndex((l) => l.u === 'h' && l.v === 'i')
  const A3 = hasil.langkah.slice(0, iHI).filter((l) => l.diterima).map((l) => namaBusur(l.u, l.v))
  assert.deepEqual(lintasanDiTree(A3, 'h', 'i'), ['h', 'g', 'f', 'c', 'i'])
  assert.equal(hasil.langkah[iHI].diterima, false)
  const jalur = lintasanDiTree(A3, 'h', 'i')
  assert.equal([...jalur, 'h'].join(' → '), 'h → g → f → c → i → h')
  // pengecoh bukan lintasan di A pada saat itu
  assert.equal(A3.includes('ah') || A3.includes('gi'), false)
  // soal 4: setelah (d,e) diterima, sisa busur ditolak
  const iDE = hasil.langkah.findIndex((l) => l.u === 'd' && l.v === 'e')
  assert.deepEqual(hasil.langkah.slice(iDE + 1).map((l) => `${l.u}${l.v}`), ['ef', 'bh', 'df'])
  assert.ok(hasil.langkah.slice(iDE + 1).every((l) => !l.diterima))
  assert.equal(hasil.A.length, simpulContoh.length - 1)
  assert.equal(q4.kunci, 'A')
  // soal 5
  const b = perkiraanBiaya(1000, 50000)
  assert.equal(Math.round(b.pengurutan / 10000) * 10000, 780000)
  // soal 6: bobot (e,f) menjadi 5
  const ubah = busurContoh.map(([u, v, w]) => (namaBusur(u, v) === 'ef' ? [u, v, 5] : [u, v, w]))
  const urutBaru = urutanBahan.map(([u, v, w]) => (namaBusur(u, v) === 'ef' ? [u, v, 5] : [u, v, w]))
  const r6 = kruskal(simpulContoh, urutBaru)
  const status = (r) => Object.fromEntries(r.langkah.map((l) => [namaBusur(l.u, l.v), l.diterima]))
  const sebelum = status(hasil)
  const sesudah = status(r6)
  const berubah = Object.keys(sebelum).filter((n) => sebelum[n] !== sesudah[n]).sort()
  assert.deepEqual(berubah, ['de', 'ef'])
  assert.deepEqual([sebelum.ef, sesudah.ef, sesudah.de], [false, true, false])
  assert.equal(r6.total, 33)
  assert.equal(37 - 9 + 5, 33)
  // 33 memang bobot MST graf yang diubah (brute force)
  assert.equal(ringkasBruteForce(simpulContoh, ubah).min, 33)
  // saat (d,e) diproses d dan e sudah terhubung lewat d − c − f − e
  const iDE6 = r6.langkah.findIndex((l) => l.u === 'd' && l.v === 'e')
  const A6 = r6.langkah.slice(0, iDE6).filter((l) => l.diterima).map((l) => namaBusur(l.u, l.v))
  assert.deepEqual(lintasanDiTree(A6, 'd', 'e'), ['d', 'c', 'f', 'e'])
  // soal 7: A selalu forest, mulai dari |V| tree dan akhirnya satu tree
  assert.equal(q7.kunci, 'C')
  assert.equal(hasil.langkah[0].himpunan.length, 8)
  assert.equal(hasil.langkah.at(-1).himpunan.length, 1)
  assert.equal(q1.kunci, 'B')
})

