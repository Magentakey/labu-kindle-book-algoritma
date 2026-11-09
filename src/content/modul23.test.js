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
import { bellmanFord, busurNeg, dijkstra, floydWarshall, jarakTerpendek, posisiSP, simpulNeg } from '../viz/lintasanModel.js'
import {
  bellmanFordDini, bellmanFordJejak, dpBanyakBusur, lengkungBF, lintasanDariPi, posLabelBF, putaranTerakhirBerubah, simpulBF, simpulNegBF, teksSel, urutanBF, urutanNegBF,
} from '../viz/bellmanFordModel.js'
import { kuis23 } from './modul/23.kuis.js'
import { pseudo } from './modul/23.pseudo.js'

const md = readFileSync(new URL('./modul/23.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const gambarSrc = readFileSync(new URL('./modul/23.gambar.jsx', import.meta.url), 'utf8')
const bagian = parseModul(md)
const m = modulById('23')
const jejak = bellmanFordJejak(simpulBF, urutanBF, 's')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const pasangan = (teks) => [...teks.matchAll(/\((\w),\s*(\w)\)/g)].map((x) => `${x[1]}${x[2]}`)
const keBusur = (daftar) => daftar.map(([u, v, w]) => `${u}${v}${w}`)
/** Graf berarah acak tanpa cycle negatif (bobot nonnegatif digeser potensial) dengan busur yang boleh negatif; urutan busur diacak. */
const grafAcak = (n, { p = 0.35, negatif = true } = {}) => {
  const simpul = 'abcdefghij'.slice(0, n).split('')
  const h = Object.fromEntries(simpul.map((v) => [v, negatif ? Math.floor(rand() * 7) : 0]))
  const busur = []
  for (const u of simpul) for (const v of simpul) if (u !== v && rand() < p) busur.push([u, v, Math.floor(rand() * 6) + h[u] - h[v]])
  return { simpul, busur: busur.sort(() => rand() - 0.5), s: simpul[0] }
}
/** Graf berarah acak dengan bobot bebas (−3..5): bisa memuat cycle negatif. */
const grafBebas = (n, p = 0.3) => {
  const simpul = 'abcdefg'.slice(0, n).split('')
  const busur = []
  for (const u of simpul) for (const v of simpul) if (u !== v && rand() < p) busur.push([u, v, Math.floor(rand() * 9) - 3])
  return { simpul, busur: busur.sort(() => rand() - 0.5), s: simpul[0] }
}
const pyNilai = (x) => (x === Infinity ? 'inf' : String(x))
const pyDict = (d) => `{${Object.entries(d).map(([k, x]) => `'${k}': ${pyNilai(x)}`).join(', ')}}`
const pyPi = (pi) => `{${Object.entries(pi).map(([k, x]) => `'${k}': ${x === null ? 'None' : `'${x}'`}`).join(', ')}}`
const sel = (x) => { const t = x.replace(/\*/g, '').trim(); const a = t.match(/^(∞|[−-]?\d+)(?: \((\w)\))?$/); return { d: a[1] === '∞' ? Infinity : Number(a[1].replace('−', '-')), pi: a[2] ?? null, tebal: x.includes('**') } }

test('struktur: lima bagian PDF (bagian 4 dipecah dua tab) + referensi, satu gambar, BELLMAN-FORD, tiga tabel, kode Python; judul polos', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+(\.\d+)?/)?.[0] ?? null), ['1', '2', '3', '4', '4.3', '5', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:bf', 'gambar:putaran'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '4.1', '4.2', '4.4']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.ok(!md.includes('### 4.3 '), '4.3 adalah judul bagian (tab), bukan subbagian')
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  assert.deepEqual([...md.matchAll(/\{\{callout:(benar|coba)\|([^}]*)\}\}/g)].map((x) => x[2]), ['Coba sendiri di visualizer', 'Urutan busur'])
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.ok(!/^\$\$.+\$\$$/m.test(md), 'rumus blok memakai $$ di baris sendiri')
})

test('metadata sama dengan PDF dan katalog; visualizer Bellman-Ford terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [23, 'BAB VI', 10, 7])
  assert.equal(m.soal, kuis23.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[7].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Pseudocode', '3 Penelusuran', '4.1–4.2 Kebenaran', '4.3–4.4 Running Time', '5 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('23'), { prev: modulById('22'), next: null })
  assert.equal(neighbors('22').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [22])
  assert.deepEqual(m.posisi, { urutan: ['22', '23', '24'], aktif: 1, catatan: m.posisi.catatan })
  assert.equal(m.algoritmaId, 'bellman-ford')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [23, true, 'shortest-path'])
  assert.equal(kuisById('23').soal, 7)
  assert.equal(kuisById('23').judul, kuis23.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode BELLMAN-FORD 8 baris sama dengan PDF; Tabel 1 menjelaskan langkah 1, 2, 3–4, 5–7, 8', () => {
  const b = pseudo.bf.baris
  assert.equal(b.length, 8)
  assert.deepEqual(b.map((x) => x.trim()), ['INITIALIZE-SINGLE-SOURCE(G, s)', 'for i = 1 to |G.V| - 1', 'for each edge (u, v) ∈ G.E', 'RELAX(u, v, w)', 'for each edge (u, v) ∈ G.E', 'if v.d > u.d + w(u, v)', 'return FALSE', 'return TRUE'])
  assert.equal(pseudo.bf.header, 'BELLMAN-FORD(G, w, s)')
  assert.deepEqual(barisTabel('*Tabel 1.').map((r) => r[0]), ['1', '2', '3–4', '5–7', '8'])
})

test('3 graf contoh: 10 busur, bobot, dan urutan langkah 3 di teks sama dengan model dan program Python; |V| = 5 sehingga 4 putaran', () => {
  const baris = md.split('\n').find((l) => l.startsWith('Busur dan bobotnya:'))
  const dariTeks = [...baris.matchAll(/\((\w),(\w)\) = (-?\d+)/g)].map((x) => `${x[1]}${x[2]}${x[3]}`)
  assert.deepEqual([...dariTeks].sort(), keBusur(urutanBF).sort())
  assert.equal(urutanBF.length, 10)
  const urutBaris = md.split('\n').find((l) => l.startsWith('Urutan busur pada langkah 3 (dari bahan kuliah)'))
  assert.deepEqual(pasangan(urutBaris), urutanBF.map(([u, v]) => `${u}${v}`))
  const kode = blokTeks('python')
  const dariKode = [...kode.matchAll(/\("(\w)","(\w)",(-?\d+)\)/g)].map((x) => [x[1], x[2], Number(x[3])])
  assert.deepEqual(dariKode.slice(0, 10), urutanBF)
  assert.deepEqual(dariKode.slice(10), urutanNegBF)
  assert.deepEqual([simpulBF.length, jejak.putaran.length], [5, 4])
  assert.ok(md.includes('$\\lvert V \\rvert = 5$, sehingga ada $5 - 1 = 4$ putaran'))
  // posisi dan lengkung konsisten
  const kunci = new Set(urutanBF.map(([u, v]) => `${u}${v}`))
  for (const k of [...Object.keys(lengkungBF), ...Object.keys(posLabelBF)]) assert.ok(kunci.has(k), `busur ${k} ada`)
  for (const [u, v] of urutanBF) if (kunci.has(`${v}${u}`)) assert.ok(lengkungBF[`${u}${v}`] > 0, `${u}${v} melengkung`)
  assert.deepEqual(Object.keys(posisiSP).sort(), [...simpulBF].sort())
})

test('Tabel 2: busur yang berhasil, nilai d dan π, serta sel yang berubah (tebal) sama dengan jejak Bellman-Ford; urutan RELAX berhasil', () => {
  const t = barisTabel('*Tabel 2.')
  assert.equal(t.length, 5)
  assert.deepEqual(t[0].slice(2).map((x) => sel(x).d), simpulBF.map((v) => jejak.awal.d[v]))
  jejak.putaran.forEach((p, i) => {
    const r = t[i + 1]
    assert.equal(r[0], `Loop ${p.i} ($i = ${p.i}$)`)
    assert.deepEqual(pasangan(r[1]), p.berhasil.map((b) => `${b.u}${b.v}`), `RELAX berhasil loop ${p.i}`)
    simpulBF.forEach((v, k) => {
      const c = sel(r[k + 2])
      assert.equal(c.d, p.d[v], `d ${v} loop ${p.i}`)
      assert.equal(c.pi, p.pi[v], `π ${v} loop ${p.i}`)
      assert.equal(c.tebal, p.berubah.includes(v), `sel ${v} loop ${p.i} tebal hanya bila berubah`)
    })
  })
  assert.deepEqual(jejak.putaran.map((p) => p.berhasil.map((b) => `${b.u}${b.v}`)), [['st', 'sy'], ['tx', 'tz', 'yx'], ['xt'], ['tz']])
  assert.equal(teksSel(-2, 't'), '−2 (t)')
  assert.ok(md.includes('sel yang dicetak tebal berubah pada putaran itu'))
})

test('Narasi loop 1–4: alasan loop 1 hanya (s,t) dan (s,y); x.d berubah dua kali pada loop 2 (11 lalu 4); loop 3 dan 4', () => {
  // loop 1: busur (t,x) diproses saat t.d = ∞, dan busur keluar dari s ada di akhir urutan
  assert.deepEqual(urutanBF.slice(-2).map(([u, v]) => `${u}${v}`), ['st', 'sy'])
  assert.ok(urutanBF.slice(0, -2).every(([u]) => u !== 's'))
  assert.equal(jejak.awal.d.t, Infinity)
  assert.equal(Infinity + 5, Infinity)
  // loop 2
  const [tx, tz, yx] = jejak.putaran[1].berhasil
  assert.deepEqual([tx.sesudah, tz.sesudah, yx.sebelum, yx.sesudah], [11, 2, 11, 4])
  assert.deepEqual([tx.u + tx.v, tz.u + tz.v, yx.u + yx.v], ['tx', 'tz', 'yx'])
  assert.equal(jejak.putaran[1].pi.x, 'y')
  assert.equal(jejak.putaran[1].berhasil.filter((b) => b.v === 'x').length, 2, 'x.d berubah dua kali dalam satu putaran')
  // loop 3 dan 4
  const xt = jejak.putaran[2].berhasil[0]
  assert.deepEqual([xt.sebelum, xt.sesudah, jejak.putaran[2].pi.t], [6, 2, 'x'])
  const tz2 = jejak.putaran[3].berhasil[0]
  assert.deepEqual([tz2.sebelum, tz2.sesudah], [2, -2])
  for (const k of ['$x.d = 6 + 5 = 11$', '$z.d = 6 - 4 = 2$', '$7 - 3 = 4$', '$t.d = 6 > 4 + (-2) = 2$', '$z.d = 2 > 2 + (-4) = -2$']) assert.ok(md.includes(k), k)
  assert.ok(md.includes('lebih kecil dari 11') && md.includes('berubah dua kali dalam satu putaran'))
})

test('Gambar 1–5: nilai d, busur predecessor, dan simpul yang berubah pada tiap tahap sama dengan PDF', () => {
  const k = [{ d: jejak.awal.d, pi: jejak.awal.pi, berubah: [] }, ...jejak.putaran]
  const label = (x) => simpulBF.map((v) => `${v}${x.d[v] === Infinity ? '∞' : x.d[v]}`).join(' ')
  assert.deepEqual(k.map(label), ['s0 t∞ x∞ y∞ z∞', 's0 t6 x∞ y7 z∞', 's0 t6 x4 y7 z2', 's0 t2 x4 y7 z2', 's0 t2 x4 y7 z-2'])
  assert.deepEqual(k.map((x) => x.berubah), [[], ['t', 'y'], ['x', 'z'], ['t'], ['z']])
  const tree = (x) => simpulBF.filter((v) => x.pi[v]).map((v) => `${x.pi[v]}${v}`).sort()
  assert.deepEqual(k.map(tree), [[], ['st', 'sy'], ['st', 'sy', 'tz', 'yx'], ['sy', 'tz', 'xt', 'yx'], ['sy', 'tz', 'xt', 'yx']])
  const g = gambarSrc
  for (const ket of ['(a) Setelah INITIALIZE-SINGLE-SOURCE.', '(b) Loop 1: RELAX berhasil untuk (s,t), (s,y).', '(c) Loop 2: RELAX berhasil untuk (t,x), (t,z), (y,x).', '(d) Loop 3: RELAX berhasil untuk (x,t).', '(e) Loop 4: RELAX berhasil untuk (t,z).']) assert.ok(g.includes(ket), ket)
  assert.ok(g.includes('Nilai yang berubah pada putaran ini:') && g.includes('Belum ada putaran: hanya s yang berhingga.'))
})

test('Langkah 5–7 dan Tabel 3: semua pemeriksaan FALSE (return TRUE); lintasan dari predecessor dan bobotnya sama dengan Tabel 3 dan dengan jarak terpendek independen', () => {
  assert.equal(jejak.ok, true)
  assert.equal(jejak.pemeriksaan.length, 10)
  assert.ok(jejak.pemeriksaan.every((p) => p.lebih === false))
  const d = jejak.d
  assert.deepEqual([d.x > d.z + 7, d.s > d.z + 2, d.z > d.y + 9], [false, false, false])
  for (const k of ['$(z,x)$: $4 > -2 + 7 = 5$? FALSE', '$(z,s)$: $0 > -2 + 2 = 0$? FALSE', '$(y,z)$: $-2 > 7 + 9$? FALSE', '**return TRUE**']) assert.ok(md.includes(k), k)
  assert.deepEqual(d, { s: 0, t: 2, x: 4, y: 7, z: -2 })
  const t3 = barisTabel('*Tabel 3.')
  assert.deepEqual(t3.map((r) => r[0]), ['t', 'x', 'y', 'z'])
  const delta = jarakTerpendek(simpulBF, urutanBF, 's')
  for (const r of t3) {
    const v = r[0]
    const jalur = lintasanDariPi(jejak.pi, 's', v)
    assert.equal(r[1], `$${jalur.join(' \\to ')}$`, `lintasan ${v}`)
    const bobot = jalur.slice(1).map((x, i) => urutanBF.find(([a, b]) => a === jalur[i] && b === x)[2])
    const jumlah = bobot.reduce((a, b) => a + b, 0)
    assert.equal(jumlah, d[v])
    assert.equal(jumlah, delta[v], 'sama dengan Floyd–Warshall')
    const ruas = r[2].replace(/\$/g, '')
    assert.deepEqual(ruas.split('=')[0].match(/\d+/g).map(Number).length, bobot.length, 'jumlah suku = jumlah busur')
    assert.equal(Number(ruas.split('=').at(-1)), jumlah, `total bobot ${v} di Tabel 3`)
  }
  assert.deepEqual(jejak.pi, { s: null, t: 'x', x: 'y', y: 's', z: 't' })
  // lintasan langsung ke t berbobot 6, tetapi lewat y dan x hanya 2; lintasan ke z memuat 4 busur = |V| − 1 busur
  assert.equal(urutanBF.find(([u, v]) => u === 's' && v === 't')[2], 6)
  assert.equal(lintasanDariPi(jejak.pi, 's', 'z').length - 1, simpulBF.length - 1)
})

test('3.1 Cycle negatif: graf Modul 22 → FALSE setelah 7 putaran; e.d dan f.d turun terus; pemeriksaan (e,f) TRUE', () => {
  const j = bellmanFordJejak(simpulNegBF, urutanNegBF, 's')
  assert.equal(j.putaran.length, 7)
  assert.equal(j.ok, false)
  const gagal = j.pemeriksaan.at(-1)
  assert.deepEqual([gagal.u, gagal.v, gagal.lebih], ['e', 'f', true])
  for (let i = 1; i < j.putaran.length; i++) {
    assert.ok(j.putaran[i].d.e < j.putaran[i - 1].d.e, `e.d turun di putaran ${i + 1}`)
    assert.ok(j.putaran[i].d.f < j.putaran[i - 1].d.f, `f.d turun di putaran ${i + 1}`)
  }
  assert.equal(j.putaran[1].d.e - j.putaran[0].d.e, -3, 'tiap putaran menurunkan 3 (bobot cycle)')
  // graf yang sama dengan Modul 22 (busur sama, hanya urutan berbeda)
  assert.deepEqual(keBusur(urutanNegBF).sort(), keBusur(busurNeg).sort())
  assert.equal(bellmanFord(simpulNeg, urutanNegBF, 's').siklusNegatif, true)
  assert.ok(md.includes('$\\lvert V \\rvert - 1 = 7$ putaran') && md.includes('untuk busur $(e, f)$ masih bernilai TRUE'))
})

test('3.2 program Python dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 0).trimEnd().split('\n')
  const baris = jejak.putaran.map((p) => `loop ${p.i}: [${p.berhasil.map((b) => `'${b.u}${b.v}'`).join(', ')}] d=${pyDict(p.d)}`)
  assert.deepEqual(cetak, [...baris, `True ${pyPi(jejak.pi)}`, 'False'])
  const exe = cariPython()
  if (!exe) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(exe, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('4.1 |V| − 1 putaran cukup (acak): setelah putaran ke-i, simpul ke-i dari setiap lintasan terpendek sudah benar; hasil akhir = jarak terpendek; contoh z baru final di putaran 4', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { p: 0.4 })
    const delta = jarakTerpendek(simpul, busur, s)
    const j = bellmanFordJejak(simpul, busur, s)
    assert.deepEqual(j.d, delta, 'BELLMAN-FORD = Floyd–Warshall')
    assert.equal(j.ok, true)
    for (const v of simpul) {
      if (v === s || delta[v] === Infinity) continue
      const jalur = lintasanDariPi(j.pi, s, v)
      assert.ok(jalur.length - 1 <= simpul.length - 1, 'paling banyak |V| − 1 busur')
      // putaran ke-i menjamin busur ke-i dari lintasan terpendek sudah direlaksasi berurutan
      const sp = jalurTerpendekBF(simpul, busur, s, v, delta)
      for (let i = 1; i < sp.length; i++) assert.equal(bellmanFordJejak(simpul, busur, s, i).d[sp[i]], delta[sp[i]], `putaran ${i}`)
    }
  }
  const dFinal = Object.fromEntries(jejak.putaran.map((p) => [p.i, p.d.z]))
  assert.deepEqual(dFinal, { 1: Infinity, 2: 2, 3: 2, 4: -2 })
  assert.equal(putaranTerakhirBerubah(jejak), 4)
  assert.ok(md.includes('$z$ (lintasan 4 busur) baru final pada putaran ke-4'))
})
// lintasan terpendek dengan paling sedikit busur, dari rantai predecessor Bellman-Ford yang sudah selesai (|V| − 1 putaran) pada graf tanpa cycle negatif
function jalurTerpendekBF(simpul, busur, s, v, delta) {
  const hasil = []
  const adj = {}
  for (const [a, b, w] of busur) (adj[a] ??= {})[b] = w
  const dfs = (u, jalur, bobot) => { if (u === v) { if (bobot === delta[v]) hasil.push(jalur); return } for (const [x, w] of Object.entries(adj[u] ?? {})) if (!jalur.includes(x)) dfs(x, [...jalur, x], bobot + w) }
  dfs(s, [s], 0)
  return hasil.sort((p, q) => p.length - q.length)[0]
}

test('4.2 Cycle negatif terdeteksi (acak): FALSE tepat bila ada cycle negatif yang terjangkau dari s; tanpa cycle negatif semua pemeriksaan lolos', () => {
  let false_ = 0
  let true_ = 0
  let takTerjangkau = 0
  for (let k = 0; k < 250; k++) {
    const { simpul, busur, s } = grafBebas(3 + Math.floor(rand() * 4))
    const D = floydWarshall(simpul, busur)
    const adaCycleTerjangkau = simpul.some((x) => D[s][x] < Infinity && D[x][x] < 0)
    const adaCycle = simpul.some((x) => D[x][x] < 0)
    const j = bellmanFordJejak(simpul, busur, s)
    assert.equal(j.ok, !adaCycleTerjangkau, JSON.stringify(busur))
    if (adaCycleTerjangkau) { false_++; assert.ok(j.pemeriksaan.at(-1).lebih, 'paling sedikit satu busur gagal') } else { true_++; assert.ok(j.pemeriksaan.every((p) => !p.lebih)) }
    if (adaCycle && !adaCycleTerjangkau) takTerjangkau++
  }
  assert.ok(false_ > 30 && true_ > 30 && takTerjangkau > 0, `kasus cukup (${false_}, ${true_}, ${takTerjangkau})`)
  // tanpa cycle negatif: setelah |V| − 1 putaran v.d ≤ u.d + w untuk semua busur (ketaksamaan segitiga)
  for (let k = 0; k < 100; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5))
    const { d } = bellmanFordJejak(simpul, busur, s)
    for (const [u, v, w] of busur) assert.ok(d[v] <= d[u] + w)
  }
  // argumen penjumlahan: bila semua busur sebuah cycle lolos (v_i.d ≤ v_{i−1}.d + w), jumlah bobot cycle ≥ 0. Pada cycle negatif, ketaksamaan itu tidak mungkin berlaku untuk semua busurnya.
  const nilai = bellmanFordJejak(simpulNegBF, urutanNegBF, 's').d
  const cycleEF = [['e', 'f', 3], ['f', 'e', -6]]
  assert.ok(cycleEF.some(([u, v, w]) => nilai[v] > nilai[u] + w))
  assert.ok(md.includes('$0 \\le \\sum w$'))
})

test('4.3 Running time: (|V| − 1)|E| relaksasi = Θ(VE), pemeriksaan akhir ≤ |E|; penghentian dini tidak mengubah hasil; kasus terburuk tetap |V| − 1 putaran; graf padat Θ(V³)', () => {
  assert.equal(jejak.relaksasi, (5 - 1) * 10)
  for (let k = 0; k < 100; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 6), { p: 0.35 })
    const j = bellmanFordJejak(simpul, busur, s)
    assert.equal(j.relaksasi, (simpul.length - 1) * busur.length)
    assert.ok(j.pemeriksaan.length <= busur.length)
    const dini = bellmanFordDini(simpul, busur, s)
    assert.deepEqual(dini.d, j.d, 'penghentian dini menghasilkan nilai yang sama')
    assert.ok(dini.putaran <= simpul.length - 1)
  }
  // kasus terburuk: rantai dengan urutan busur terbalik membutuhkan semua |V| − 1 putaran (tetap Θ(VE))
  for (const V of [4, 6, 9]) {
    const simpul = Array.from({ length: V }, (_, i) => `v${i}`)
    const rantai = simpul.slice(1).map((v, i) => [simpul[i], v, 1]).reverse()
    assert.equal(bellmanFordDini(simpul, rantai, 'v0').putaran, V - 1)
    assert.equal(putaranTerakhirBerubah(bellmanFordJejak(simpul, rantai, 'v0')), V - 1)
  }
  // contoh bahan kuliah: perubahan terakhir di putaran 4 = |V| − 1, jadi tidak ada putaran yang bisa dihemat
  assert.equal(bellmanFordDini(simpulBF, urutanBF, 's').putaran, 4)
  // graf padat: |E| ≈ |V|², relaksasi ≈ |V|³
  const V = 30
  assert.ok(Math.abs((V - 1) * V * (V - 1) - V ** 3) / V ** 3 < 0.1)
  assert.ok(md.includes('\\Theta(V) + \\Theta(V E) + O(E) = \\Theta(V E)'))
  assert.ok(md.includes('$\\Theta(V^3)$'))
})

test('4.4 Hubungan: setelah putaran ke-i, v.d ≤ bobot lintasan terpendek dengan paling banyak i busur (DP); Dijkstra salah pada bobot negatif; arbitrase kurs = cycle negatif', () => {
  for (let k = 0; k < 120; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { p: 0.4 })
    const D = dpBanyakBusur(simpul, busur, s, simpul.length - 1)
    for (let i = 1; i < simpul.length; i++) {
      const d = bellmanFordJejak(simpul, busur, s, i).d
      for (const v of simpul) assert.ok(d[v] <= D[i][v], `d ≤ D_${i}[${v}]`)
    }
    assert.deepEqual(D.at(-1), jarakTerpendek(simpul, busur, s), 'dengan |V| − 1 busur, DP = jarak terpendek')
  }
  const D = dpBanyakBusur(simpulBF, urutanBF, 's', 4)
  assert.deepEqual(D.map((x) => x.z), [Infinity, Infinity, 2, 2, -2], 'z memerlukan lintasan 4 busur untuk mencapai −2')
  assert.deepEqual(D.map((x) => x.t), [Infinity, 6, 6, 2, 2])
  // Dijkstra benar hanya untuk bobot nonnegatif: pada graf contoh modul (ada bobot negatif) hasilnya berbeda dari Bellman-Ford
  assert.notDeepEqual(dijkstra(simpulBF, urutanBF, 's').d, jejak.d, 'Dijkstra tidak memberi hasil benar pada graf contoh')
  for (let k = 0; k < 80; k++) {
    const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { negatif: false })
    assert.deepEqual(dijkstra(simpul, busur, s).d, bellmanFordJejak(simpul, busur, s).d)
  }
  // arbitrase: bobot = −ln(kurs); siklus kurs dengan hasil kali > 1 adalah cycle negatif
  const mata = ['USD', 'EUR', 'GBP']
  const kurs = (usdEur, eurGbp, gbpUsd) => [['USD', 'EUR', -Math.log(usdEur)], ['EUR', 'GBP', -Math.log(eurGbp)], ['GBP', 'USD', -Math.log(gbpUsd)]]
  assert.equal(bellmanFordJejak(mata, kurs(0.9, 0.9, 1.3), 'USD').ok, false, '0,9 × 0,9 × 1,3 = 1,053 > 1: peluang arbitrase')
  assert.equal(bellmanFordJejak(mata, kurs(0.9, 0.9, 1.2), 'USD').ok, true, '0,9 × 0,9 × 1,2 = 0,972 < 1: tidak ada arbitrase')
  assert.ok(md.includes('negatif logaritma kurs'))
})

test('kunci kuis dihitung ulang: soal 1–7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis23.soal
  // soal 2
  const g2 = [['a', 'b', -1], ['s', 'a', 4], ['s', 'b', 2], ['b', 'c', 3], ['a', 'c', 5]]
  const j2 = bellmanFordJejak(['s', 'a', 'b', 'c'], g2, 's')
  assert.equal(j2.putaran.length, q2.isian[0].kunci)
  assert.deepEqual([j2.putaran[0].d.a, j2.putaran[0].d.b, j2.putaran[0].d.c].map(String), q2.isian.slice(1, 4).map((f) => f.kunci))
  assert.deepEqual(j2.putaran[0].berhasil.map((b) => `${b.u}${b.v}`), ['sa', 'sb', 'bc'], 'loop 1: (a,b) tidak berubah, (a,c) 4 + 5 = 9 > 5 tidak berubah')
  assert.deepEqual([j2.putaran[1].berhasil.length, j2.putaran[2].berhasil.length], [0, 0])
  assert.deepEqual(q2.isian.slice(4, 6).map((f) => f.kunci), ['Tidak', 'Tidak'])
  assert.equal(j2.ok, q2.isian[6].kunci === 'TRUE')
  assert.deepEqual(j2.d, { s: 0, a: 4, b: 2, c: 5 })
  assert.equal(q2.isian[7].kunci, 'a = 4, b = 2, c = 5')
  assert.equal(j2.putaran[1].d.a - 1, 3, '(a, b): 4 − 1 = 3 > 2')
  // soal 3: (s,t) dan (s,y) di depan
  const baru = [['s', 't', 6], ['s', 'y', 7], ...urutanBF.filter(([u]) => u !== 's')]
  const j3 = bellmanFordJejak(simpulBF, baru, 's')
  assert.deepEqual(j3.d, jejak.d, 'hasil akhir tidak berubah')
  assert.equal(q3.isian[0].kunci, 'Tidak')
  assert.equal(q3.isian[1].kunci, 't = 2, x = 4, y = 7, z = −2')
  assert.deepEqual([j3.putaran[0].d.t, j3.putaran[0].d.x, j3.putaran[0].d.z, j3.putaran[0].d.y], [q3.isian[2].kunci, q3.isian[3].kunci, q3.isian[4].kunci, 7])
  assert.equal(putaranTerakhirBerubah(j3), q3.isian[5].kunci)
  assert.equal(putaranTerakhirBerubah(jejak), q3.isian[6].kunci)
  assert.ok(q3.isian[5].kunci < q3.isian[6].kunci, 'final lebih cepat')
  // soal 4
  assert.equal((100 - 1) * 2000, q4.isian[0].kunci)
  assert.equal(q4.isian[1].kunci, 2000)
  // soal 5: tanpa busur negatif → selalu TRUE (acak)
  for (let k = 0; k < 100; k++) { const { simpul, busur, s } = grafAcak(3 + Math.floor(rand() * 5), { negatif: false }); assert.ok(busur.every((e) => e[2] >= 0)); assert.equal(bellmanFordJejak(simpul, busur, s).ok, true) }
  assert.equal(q5.kunci, 'Benar')
  // soal 6
  const g6 = [['s', 'a', 1], ['a', 'b', 2], ['b', 'a', -4]]
  const j6 = bellmanFordJejak(['s', 'a', 'b'], g6, 's')
  assert.equal(j6.putaran.length, 2)
  assert.deepEqual([j6.putaran[0].d.a, j6.putaran[0].d.b, j6.putaran[1].d.a, j6.putaran[1].d.b], q6.isian.slice(0, 4).map((f) => f.kunci))
  assert.deepEqual(j6.pemeriksaan, [{ u: 's', v: 'a', w: 1, lebih: false }, { u: 'a', v: 'b', w: 2, lebih: true }], '(s, a) lolos, lalu (a, b) gagal → return FALSE')
  assert.equal(j6.ok, q6.isian[5].kunci === 'TRUE')
  assert.equal(q6.isian[4].kunci, 'TRUE')
  assert.equal(2 + -4, q6.isian[6].kunci)
  // soal 7: busur lintasan ke z efektif satu per putaran
  const jalurZ = lintasanDariPi(jejak.pi, 's', 'z')
  assert.deepEqual(jalurZ, ['s', 'y', 'x', 't', 'z'])
  assert.deepEqual(jalurZ.slice(1).map((v, i) => `${jalurZ[i]}${v}`).map((e, i) => jejak.putaran[i].berhasil.some((b) => `${b.u}${b.v}` === e)), [true, true, true, true])
  assert.equal(q7.kunci, 'B')
  assert.equal(q1.kunci, 'B')
  assert.equal(bellmanFordJejak(simpulBF, urutanBF, 's').ok, true, 'contoh modul: busur negatif tetapi TRUE')
})

test('struktur kuis: 7 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis23.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis23.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Penelusuran', 'Analisis', 'Perhitungan', 'Benar/Salah', 'Analisis', 'Pilihan Ganda'])
  assert.deepEqual(kuis23.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  for (const q of kuis23.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis23.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '23').tipe].sort())
})

test('penilaian soal Modul 23', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis23.soal
  const kunci = (q) => q.isian.map((f) => String(f.kunci))
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'A').benar, false)
  assert.equal(nilaiSoal(q2, kunci(q2)).benar, true)
  assert.equal(nilaiSoal(q2, [...kunci(q2).slice(0, 6), 'FALSE', q2.isian[7].kunci]).benar, false)
  assert.equal(nilaiSoal(q3, kunci(q3)).benar, true)
  assert.equal(nilaiSoal(q3, [...kunci(q3).slice(0, 5), '4', '4']).benar, false)
  assert.equal(nilaiSoal(q4, ['198.000', '2.000']).benar, true, 'titik ribuan diterima')
  assert.equal(nilaiSoal(q4, ['198000', '2000']).benar, true)
  assert.equal(nilaiSoal(q4, ['200000', '2000']).benar, false)
  assert.equal(nilaiSoal(q5, 'Benar').benar, true)
  assert.equal(nilaiSoal(q5, 'Salah').benar, false)
  assert.equal(nilaiSoal(q6, kunci(q6)).benar, true)
  assert.equal(nilaiSoal(q6, ['\u22121', '3', '\u22123', '1', 'TRUE', 'FALSE', '\u22122']).benar, true, 'minus Unicode diterima')
  assert.equal(nilaiSoal(q6, ['-1', '3', '-3', '1', 'TRUE', 'TRUE', '-2']).benar, false)
  assert.equal(nilaiSoal(q7, 'B').benar, true)
  const semua = { 1: 'B', 2: kunci(q2), 3: kunci(q3), 4: kunci(q4), 5: 'Benar', 6: kunci(q6), 7: 'B' }
  const h = hitungHasil(kuis23.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [7, true, []])
})
