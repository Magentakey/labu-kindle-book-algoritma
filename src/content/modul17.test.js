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
import { INF, adjContoh, bfs, busurGraf, busurPohon, keteranganGambar, lintasan, printPath, teksAntrean, teksQ, urutanLintasan, urutanTabel } from '../viz/bfsModel.js'
import { bangun } from '../viz/representasiGrafModel.js'
import { kuis17 } from './modul/17.kuis.js'
import { pseudo } from './modul/17.pseudo.js'

const md = readFileSync(new URL('./modul/17.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('17')
const hasil = bfs(adjContoh, 's')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const tex = (x) => x.replace(/\$/g, '').replace(/\\to/g, '→').replace(/\\pi/g, 'π').replace(/\s+/g, ' ').trim()

/** Jarak terpendek independen (Floyd–Warshall) pada graf tak berarah dari adjacency-list. */
const jarakFloyd = (Adj) => {
  const k = Object.keys(Adj)
  const D = Object.fromEntries(k.map((u) => [u, Object.fromEntries(k.map((v) => [v, u === v ? 0 : INF]))]))
  for (const u of k) for (const v of Adj[u]) D[u][v] = 1
  for (const w of k) for (const u of k) for (const v of k) if (D[u][w] + D[w][v] < D[u][v]) D[u][v] = D[u][w] + D[w][v]
  return D
}
const grafAcak = (n) => {
  const nama = Array.from({ length: n }, (_, i) => `v${i}`)
  const Adj = Object.fromEntries(nama.map((u) => [u, []]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < 0.25) { Adj[nama[i]].push(nama[j]); Adj[nama[j]].push(nama[i]) }
  for (const u of nama) Adj[u].sort(() => rand() - 0.5)
  return { Adj, nama }
}

test('struktur: lima bagian PDF menjadi tujuh id (bagian 4 dipecah 4.1 dan 4.2), satu gambar, dua pseudocode, lima tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+(\.\d+)?/)?.[0] ?? null), ['1', '2', '3', '4', '4.2', '5', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:bfs', 'gambar:tahap', 'pseudo:jalur'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '3.1', '3.2', '3.3', '3.4', '4.1']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
})

test('metadata sama dengan PDF dan katalog; visualizer BFS terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [17, 'BAB VI', 11, 8])
  assert.equal(m.soal, kuis17.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[5].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Prosedur', '3 Penelusuran', '4.1 Running Time', '4.2 Sifat BFS', '5 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('17'), { prev: modulById('16'), next: modulById('18') })
  assert.equal(neighbors('16').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'bfs')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [17, true, 'graf'])
  assert.equal(kuisById('17').soal, 8)
  assert.equal(kuisById('17').judul, kuis17.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode BFS 18 baris dan PRINT-PATH 6 baris sama dengan PDF; Tabel 2 merujuk baris yang tepat', () => {
  const b = pseudo.bfs.baris
  assert.equal(b.length, 18)
  assert.ok(b[0].startsWith('for each vertex u ∈ G.V - {s}') && b[2].includes('u.d = ∞') && b[3].includes('u.π = NIL'))
  assert.ok(b[4].startsWith('s.color = GRAY') && b[5].startsWith('s.d = 0') && b[7].startsWith('Q = ∅') && b[8].startsWith('ENQUEUE(Q, s)'))
  assert.ok(b[9].startsWith('while Q ≠ ∅') && b[10].includes('u = DEQUEUE(Q)') && b[11].includes('for each v ∈ G.Adj[u]') && b[12].includes('if v.color == WHITE'))
  assert.ok(b[13].includes('v.color = GRAY') && b[14].includes('v.d = u.d + 1') && b[15].includes('v.π = u') && b[16].includes('ENQUEUE(Q, v)') && b[17].includes('u.color = BLACK'))
  const j = pseudo.jalur.baris
  assert.equal(j.length, 6)
  assert.ok(j[0].includes('v == s') && j[2].includes('v.π == NIL') && j[4].includes('PRINT-PATH(G, s, v.π)') && j[5].includes('print v'))
  assert.deepEqual(barisTabel('*Tabel 2.').map((r) => r[0]), ['1–4', '5–7', '8–9', '10', '11', '12', '13', '14–17', '18'])
  assert.ok(md.includes('simpul berjarak $k$ selalu masuk antrean sebelum simpul berjarak $k + 1$'))
})

test('Tabel 1 dan antrean FIFO: DEQUEUE keluar menurut urutan ENQUEUE, jarak tidak turun sepanjang urutan DEQUEUE (acak)', () => {
  assert.equal(barisTabel('*Tabel 1.').length, 3)
  for (let u = 0; u < 80; u++) {
    const { Adj, nama } = grafAcak(2 + Math.floor(rand() * 9))
    const r = bfs(Adj, nama[0])
    const jarak = r.urutanDequeue.map((x) => r.d[x])
    assert.ok(jarak.every((x, i) => i === 0 || jarak[i - 1] <= x), 'jarak tidak turun menurut urutan keluar')
    assert.equal(new Set(r.urutanDequeue).size, r.urutanDequeue.length, 'tiap simpul keluar paling banyak sekali')
    assert.ok(r.urutanDequeue.length <= nama.length, 'ENQUEUE paling banyak |V| kali')
  }
})

test('Tabel 3: adjacency-list contoh persis seperti di PDF (urutan menentukan urutan masuk antrean); graf tak berarah 8 simpul, 10 busur', () => {
  const t = barisTabel('*Tabel 3.')
  assert.deepEqual(t.map((r) => tex(r[0])), urutanTabel)
  t.forEach((r) => assert.deepEqual(tex(r[1]).split(' → '), adjContoh[tex(r[0])], `Adj[${tex(r[0])}]`))
  for (const [u, l] of Object.entries(adjContoh)) for (const v of l) assert.ok(adjContoh[v].includes(u), `simetris ${u}-${v}`)
  assert.deepEqual([Object.keys(adjContoh).length, busurGraf(adjContoh).length], [8, 10])
})

test('Tabel 4: setiap putaran (u, pemeriksaan beserta warna, ditemukan, isi Q) sama dengan BFS; 8 putaran; antrean kosong di akhir', () => {
  const t = barisTabel('*Tabel 4.')
  assert.equal(t.length, 9, 'awal + 8 putaran')
  assert.deepEqual([tex(t[0][1]), tex(t[0][4])], ['-', 's'])
  hasil.putaran.forEach((p, i) => {
    const r = t[i + 1]
    assert.equal(Number(r[0]), p.no)
    assert.equal(tex(r[1]), p.u)
    assert.equal(tex(r[2]), p.pemeriksaan.map((x) => `${x.v} (${x.warna})`).join(', '), `pemeriksaan putaran ${p.no}`)
    assert.equal(tex(r[3]), p.ditemukan.length ? p.ditemukan.map((v) => `${v}.d = ${hasil.d[v]}, ${v}.π = ${hasil.pi[v]}`).join('; ') : '-', `ditemukan putaran ${p.no}`)
    assert.equal(tex(r[4]), teksQ(p.Q), `Q putaran ${p.no}`)
  })
  assert.equal(hasil.putaran.length, 8)
  assert.deepEqual(hasil.putaran.at(-1).Q, [])
  assert.deepEqual(hasil.urutanDequeue, ['s', 'w', 'r', 't', 'x', 'v', 'u', 'y'])
})

test('putaran 4: x sudah GRAY (ditemukan oleh w pada putaran 2) sehingga tidak dimasukkan dua kali; tiap simpul masuk antrean sekali', () => {
  const p2 = hasil.putaran[1]
  const p4 = hasil.putaran[3]
  assert.ok(p2.ditemukan.includes('x') && hasil.pi.x === 'w')
  assert.deepEqual(p4.pemeriksaan.find((x) => x.v === 'x'), { v: 'x', warna: 'GRAY' })
  assert.ok(!p4.ditemukan.includes('x'))
  const masuk = [hasil.awal.Q[0], ...hasil.putaran.flatMap((p) => p.ditemukan)]
  assert.equal(new Set(masuk).size, masuk.length)
  assert.equal(masuk.length, 8)
  assert.ok(md.includes('ditemukan oleh $w$ pada putaran 2'))
})

test('Gambar 1–9: keadaan awal dan sesudah tiap putaran, isi antrean dengan jarak sama dengan PDF; keterangan (a)–(i)', () => {
  const tahap = [hasil.awal, ...hasil.putaran]
  assert.equal(tahap.length, 9)
  assert.deepEqual(tahap.map((t) => teksAntrean(t.Q, t.d)), ['s(0)', 'w(1), r(1)', 'r(1), t(2), x(2)', 't(2), x(2), v(2)', 'x(2), v(2), u(3)', 'v(2), u(3), y(3)', 'u(3), y(3)', 'y(3)', 'kosong'])
  assert.deepEqual(keteranganGambar(hasil), [
    '(a) Setelah langkah 1–9 (inisialisasi).',
    ...['s', 'w', 'r', 't', 'x', 'v', 'u', 'y'].map((u, i) => `(${'bcdefghi'[i]}) Setelah ${u} dikeluarkan dari Q dan menjadi BLACK.`),
  ])
  // awal: hanya s GRAY dengan jarak 0, selebihnya WHITE dengan ∞
  assert.deepEqual(Object.entries(hasil.awal.color).filter(([, c]) => c !== 'WHITE'), [['s', 'GRAY']])
  assert.ok(Object.entries(hasil.awal.d).every(([v, d]) => (v === 's' ? d === 0 : d === INF)))
  // akhir: semua BLACK
  assert.ok(Object.values(hasil.color).every((c) => c === 'BLACK'))
  const g = readFileSync(new URL('./modul/17.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(g.includes('Gambar {i + 1}. {ket[i]}') && g.includes('WHITE bergaris putus'))
})

test('Tabel 5 dan 3.3: lintasan dan jumlah busur dari predecessor sama dengan PDF; PRINT-PATH; BFS-tree punya 8 simpul dan 7 busur', () => {
  const t = barisTabel('*Tabel 5.')
  assert.deepEqual(t.map((r) => tex(r[0])), urutanLintasan)
  t.forEach((r) => {
    const v = tex(r[0])
    assert.equal(tex(r[1]), lintasan(hasil.pi, 's', v).join(' → '), `lintasan ke ${v}`)
    assert.equal(Number(r[2]), hasil.d[v])
    assert.equal(lintasan(hasil.pi, 's', v).length - 1, hasil.d[v])
    assert.deepEqual(printPath(hasil.pi, hasil.d, 's', v), lintasan(hasil.pi, 's', v))
  })
  assert.deepEqual(lintasan(hasil.pi, 's', 's'), ['s'])
  assert.equal(busurPohon(hasil.pi).length, 7)
  assert.equal(Object.keys(hasil.pi).length, 8)
  // tree: terhubung dan tanpa cycle
  const adj = Object.fromEntries(Object.keys(hasil.pi).map((v) => [v, []]))
  for (const [p, v] of busurPohon(hasil.pi)) { adj[p].push(v); adj[v].push(p) }
  const lihat = new Set(['s'])
  const antre = ['s']
  while (antre.length) for (const w of adj[antre.shift()]) if (!lihat.has(w)) { lihat.add(w); antre.push(w) }
  assert.equal(lihat.size, 8)
  assert.ok(md.includes('8 simpul dan 7 busur'))
  // simpul tak terjangkau: PRINT-PATH mencetak pesan
  const tak = bfs({ s: ['a'], a: ['s'], z: [] }, 's')
  assert.deepEqual(printPath(tak.pi, tak.d, 's', 'z'), ['tidak ada lintasan dari s ke z'])
  assert.equal(tak.d.z, INF)
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const model = [...'rwtxvuy'].map((v) => `${v} ${hasil.d[v]} ${lintasan(hasil.pi, 's', v).join(' -> ')}`)
  assert.deepEqual(model, cetak)
  assert.ok(kode.includes('"x": ["t", "u", "y", "w"]') && kode.includes('"s": ["w", "r"]'), 'adjacency di program sama dengan Tabel 3')
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('4.1 Running time: tiap simpul masuk antrean paling banyak sekali, tiap list ditelusuri sekali (total panjang list = 2|E| tak berarah), total kerja O(V + E) (acak)', () => {
  for (let u = 0; u < 100; u++) {
    const { Adj, nama } = grafAcak(1 + Math.floor(rand() * 12))
    const r = bfs(Adj, nama[0])
    const diperiksa = r.putaran.reduce((a, p) => a + p.pemeriksaan.length, 0)
    const dari = new Set(r.urutanDequeue)
    const panjangTerjangkau = [...dari].reduce((a, v) => a + Adj[v].length, 0)
    assert.equal(diperiksa, panjangTerjangkau, 'tiap list ditelusuri tepat sekali, ketika simpulnya di-DEQUEUE')
    const E = Object.values(Adj).reduce((a, l) => a + l.length, 0) / 2
    assert.ok(diperiksa <= 2 * E)
    assert.ok(r.urutanDequeue.length + diperiksa <= nama.length + 2 * E, 'langkah ≤ V + 2E = O(V + E)')
  }
  // graf berarah 1.000 simpul dan 5.000 busur: ENQUEUE ≤ 1.000, pemeriksaan ≤ 5.000 (kuis soal 5), jadi V + E = 6.000
  assert.equal(1000 + 5000, 6000)
  assert.ok(md.includes('$O(V + E)$') && md.includes('$O(V^2)$'))
})

test('4.2 Sifat: d sama dengan jarak terpendek independen (Floyd–Warshall) dan tak terjangkau tetap ∞; lintasan dari π sepanjang d; urutan list tidak mengubah d (acak)', () => {
  for (let u = 0; u < 120; u++) {
    const { Adj, nama } = grafAcak(2 + Math.floor(rand() * 9))
    const s = nama[Math.floor(rand() * nama.length)]
    const r = bfs(Adj, s)
    const D = jarakFloyd(Adj)
    for (const v of nama) {
      assert.equal(r.d[v], D[s][v], `${s}→${v}`)
      if (r.d[v] !== INF) {
        assert.equal(lintasan(r.pi, s, v).length - 1, r.d[v])
        assert.equal(r.color[v], 'BLACK')
      } else {
        assert.equal(r.color[v], 'WHITE', 'yang tak terjangkau tetap WHITE')
        assert.equal(lintasan(r.pi, s, v), null)
      }
    }
    const acakUrut = Object.fromEntries(Object.entries(Adj).map(([k, l]) => [k, [...l].sort(() => rand() - 0.5)]))
    assert.deepEqual(bfs(acakUrut, s).d, r.d, 'urutan list tidak mengubah jarak')
  }
})

test('4.2: BFS-tree bergantung pada urutan list: jika Adj[w] = s, x, t maka u ditemukan oleh x (s → w → x → u), tetap 3 busur; BFS mengabaikan bobot', () => {
  const diubah = { ...adjContoh, w: ['s', 'x', 't'] }
  const r = bfs(diubah, 's')
  assert.equal(r.pi.u, 'x')
  assert.deepEqual(lintasan(r.pi, 's', 'u'), ['s', 'w', 'x', 'u'])
  assert.equal(r.d.u, hasil.d.u)
  assert.equal(hasil.pi.u, 't')
  assert.deepEqual(r.d, hasil.d)
  assert.ok(md.includes('$s \\to w \\to x \\to u$, tetap 3 busur'))
  // kuis soal 6: s→a (10), s→b (1), b→a (1): BFS memilih s→a berbobot 10, padahal s→b→a berbobot 2
  const g = bfs({ s: ['a', 'b'], a: [], b: ['a'] }, 's')
  assert.deepEqual([g.d.a, g.pi.a, lintasan(g.pi, 's', 'a').join(' → ')], [1, 's', 's → a'])
  const bobot = { 's-a': 10, 's-b': 1, 'b-a': 1 }
  assert.deepEqual([bobot['s-a'], bobot['s-b'] + bobot['b-a']], [10, 2])
})

test('kunci kuis dihitung ulang: soal 2 (graf Modul 16 dari simpul 1), soal 3 (u GRAY pada putaran 5), soal 5, soal 8', () => {
  const [, q2, q3, q4, q5, q6, q7, q8] = kuis17.soal
  assert.deepEqual([q2.kunci, q3.kunci, q5.kunci, q6.kunci, q7.kunci, q8.kunci], [['A', 'B', 'C'], 'C', ['A', 'C', 'E'], ['A', 'D'], 'C', 'D'])
  const adj = { 1: ['2', '5'], 2: ['1', '5', '3', '4'], 3: ['2', '4'], 4: ['2', '5', '3'], 5: ['4', '1', '2'] }
  const r = bfs(adj, '1')
  assert.equal(r.pi['3'], '2')
  assert.deepEqual([r.d['2'], r.pi['2'], r.d['4'], r.pi['4'], r.d['5'], r.pi['5']], [1, '1', 2, '2', 1, '1'])
  // graf (a) Modul 16 (daftar bangun) memberi jarak yang sama dengan adjacency di soal
  const a = bangun(5, [[1, 2], [1, 5], [2, 5], [2, 3], [2, 4], [3, 4], [4, 5]], false)
  const adjStr = Object.fromEntries(Object.entries(a.adj).map(([k, l]) => [k, l.map(String)]))
  assert.deepEqual(bfs(adjStr, '1').d, r.d)
  // soal 3
  const p5 = hasil.putaran[4]
  assert.equal(p5.u, 'x')
  assert.deepEqual(p5.pemeriksaan.find((x) => x.v === 'u'), { v: 'u', warna: 'GRAY' })
  assert.equal(q4.kunci, 'A')
  // soal 5
  // soal 8
  assert.deepEqual([hasil.pi.y, hasil.pi.x, hasil.pi.w], ['x', 'w', 's'])
})

