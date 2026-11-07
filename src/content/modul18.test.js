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
import { adaBackEdge, adjContoh, dfs, hubunganSelang, hutan, keteranganGambar, keturunan, potret, strukturKurung, teksDF, urutanTabel, waktuGambar } from '../viz/dfsModel.js'
import { kuis18 } from './modul/18.kuis.js'
import { pseudo } from './modul/18.pseudo.js'

const md = readFileSync(new URL('./modul/18.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('18')
const hasil = dfs(adjContoh, urutanTabel)

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

/** Graf berarah acak dengan urutan list acak; self-loop dan busur dua arah diperbolehkan. */
const grafAcak = (n, p = 0.25) => {
  const nama = Array.from({ length: n }, (_, i) => `v${i}`)
  const Adj = Object.fromEntries(nama.map((u) => [u, []]))
  for (const u of nama) for (const v of nama) if (rand() < p) Adj[u].push(v)
  for (const u of nama) Adj[u].sort(() => rand() - 0.5)
  return { Adj, nama }
}
/** Ada cycle (termasuk self-loop)? Dicek mandiri lewat penghapusan simpul tanpa busur masuk (algoritma Kahn). */
const adaCycleKahn = (Adj) => {
  const masuk = Object.fromEntries(Object.keys(Adj).map((u) => [u, 0]))
  for (const l of Object.values(Adj)) for (const v of l) masuk[v]++
  const antre = Object.keys(masuk).filter((u) => masuk[u] === 0)
  let dihapus = 0
  while (antre.length) { const u = antre.shift(); dihapus++; for (const v of Adj[u]) if (--masuk[v] === 0) antre.push(v) }
  return dihapus < Object.keys(Adj).length
}
/** Bisa dicapai dari a lewat satu busur atau lebih? (untuk memeriksa arti forward, cross). */
const dapatDicapai = (Adj, a, b) => {
  const lihat = new Set()
  const tumpuk = [...Adj[a]]
  while (tumpuk.length) { const x = tumpuk.pop(); if (x === b) return true; if (!lihat.has(x)) { lihat.add(x); tumpuk.push(...Adj[x]) } }
  return false
}

test('struktur: enam bagian PDF + referensi, dua gambar, dua pseudocode, lima tabel, kode Python; teks polos tanpa TeX di judul', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['pseudo:dfs', 'pseudo:visit', 'gambar:tahap', 'gambar:hutan'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '4.1', '4.2', '4.3', '4.4', '5.1', '5.2']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
})

test('metadata sama dengan PDF dan katalog; visualizer DFS terhubung dua arah; Modul 18 menutup Bab VI-a', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [18, 'BAB VI', 11, 8])
  assert.equal(m.soal, kuis18.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[5].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Cara Kerja', '3 Klasifikasi Busur', '4 Penelusuran', '5 Running Time', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('18'), { prev: modulById('17'), next: modulById('19') })
  assert.equal(neighbors('17').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.deepEqual(m.prasyarat, [16, 17, 2])
  assert.equal(m.algoritmaId, 'dfs')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [18, true, 'graf'])
  assert.equal(kuisById('18').soal, 8)
  assert.equal(kuisById('18').judul, kuis18.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('pseudocode DFS 7 baris dan DFS-VISIT 10 baris sama dengan PDF; keterangan merujuk langkah yang tepat', () => {
  const a = pseudo.dfs.baris
  assert.equal(a.length, 7)
  assert.ok(a[0].startsWith('for each vertex u ∈ G.V') && a[1].includes('u.color = WHITE') && a[2].includes('u.π = NIL') && a[3] === 'time = 0')
  assert.ok(a[4].startsWith('for each vertex u ∈ G.V') && a[5].includes('if u.color == WHITE') && a[6].includes('DFS-VISIT(G, u)'))
  const b = pseudo.visit.baris
  assert.equal(b.length, 10)
  assert.ok(b[0] === 'time = time + 1' && b[1] === 'u.d = time' && b[2] === 'u.color = GRAY' && b[3].includes('for each v ∈ G.Adj[u]'))
  assert.ok(b[4].includes('if v.color == WHITE') && b[5].includes('v.π = u') && b[6].includes('DFS-VISIT(G, v)'))
  assert.ok(b[7] === 'u.color = BLACK' && b[8] === 'time = time + 1' && b[9] === 'u.f = time')
  assert.ok(md.includes('Langkah 1–3: inisialisasi') && md.includes('Langkah 5–7: periksa') && md.includes('Langkah 4–7: telusuri') && md.includes('Langkah 8–10'))
})

test('Tabel 1 dan 2: warna, timestamp, dan empat jenis busur; kelas busur menurut warna saat diperiksa (acak)', () => {
  assert.equal(barisTabel('*Tabel 1.').length, 6)
  assert.deepEqual(barisTabel('*Tabel 2.').map((r) => r[0]), ['Tree edge', 'Back edge (B)', 'Forward edge (F)', 'Cross edge (C)'])
  assert.deepEqual(barisTabel('*Tabel 2.').map((r) => tex(r[1])), ['WHITE', 'GRAY', 'BLACK dan u.d < v.d', 'BLACK dan u.d > v.d'])
  for (let k = 0; k < 120; k++) {
    const { Adj, nama } = grafAcak(1 + Math.floor(rand() * 9))
    const r = dfs(Adj, nama)
    for (const b of r.busur) {
      if (b.warna === 'WHITE') assert.equal(b.kelas, 'tree')
      else if (b.warna === 'GRAY') assert.equal(b.kelas, 'back')
      else assert.equal(b.kelas, r.d[b.u] < r.d[b.v] ? 'forward' : 'cross')
    }
    assert.equal(r.busur.length, Object.values(Adj).reduce((a, l) => a + l.length, 0), 'setiap busur diperiksa tepat sekali')
  }
})

test('Tabel 3: adjacency-list contoh persis seperti di PDF; graf berarah 6 simpul, 8 busur, ada self-loop', () => {
  const t = barisTabel('*Tabel 3.')
  assert.deepEqual(t.map((r) => tex(r[0])), urutanTabel)
  t.forEach((r) => assert.deepEqual(tex(r[1]).split(' → '), adjContoh[tex(r[0])], `Adj[${tex(r[0])}]`))
  assert.deepEqual([Object.keys(adjContoh).length, Object.values(adjContoh).flat().length], [6, 8])
  assert.ok(adjContoh.z.includes('z'))
})

test('Tabel 4 dan 4.1: timestamp akhir, predecessor, klasifikasi, dan akar sama dengan PDF', () => {
  const t = barisTabel('*Tabel 4.')
  assert.deepEqual(t[0].slice(1), urutanTabel.map((u) => `${hasil.d[u]}/${hasil.f[u]}`))
  assert.deepEqual(t[1].slice(1).map(tex), urutanTabel.map((u) => hasil.pi[u] ?? 'NIL'))
  assert.deepEqual(urutanTabel.map((u) => `${hasil.d[u]}/${hasil.f[u]}`), ['1/8', '2/7', '9/12', '4/5', '3/6', '10/11'])
  assert.deepEqual(hasil.jenis, { uv: 'tree', vy: 'tree', yx: 'tree', xv: 'back', ux: 'forward', wy: 'cross', wz: 'tree', zz: 'back' })
  assert.deepEqual(hasil.akar, ['u', 'w'])
  assert.equal(hasil.waktu, 12)
  // penelusuran lengkap (blok teks) menyebut semua kejadian dengan nilai yang sama dengan model
  const jejak = blokTeks('text', 0)
  for (const u of urutanTabel) {
    assert.ok(jejak.includes(`time = ${hasil.d[u]}, ${u}.d = ${hasil.d[u]}, ${u} GRAY`), `${u}.d`)
    assert.ok(jejak.includes(`${u} BLACK, time = ${hasil.f[u]}, ${u}.f = ${hasil.f[u]}`), `${u}.f`)
  }
  for (const [uv, kelas] of Object.entries(hasil.jenis)) {
    const [a, b] = uv.split('')
    const baris = jejak.split('\n').find((l) => l.includes(`(${a},${b})`))
    assert.ok(baris, `busur ${uv}`)
    assert.ok(baris.toLowerCase().includes(kelas), `${uv} ${kelas}`)
  }
  assert.ok(jejak.includes('u.d = 1 < x.d = 4') && jejak.includes('w.d = 9 > y.d = 3'))
})

test('Gambar 1–6: keadaan graf pada time 1, 4, 5, 8, 10, 12 sama dengan PDF; Gambar 7: DFS-forest dua tree', () => {
  assert.deepEqual(waktuGambar, [1, 4, 5, 8, 10, 12])
  const gambar = waktuGambar.map((T) => potret(hasil, T))
  const label = (p) => Object.keys(adjContoh).map((u) => `${u}${teksDF(p.d[u], p.f[u])}`).join(' ')
  assert.deepEqual(gambar.map(label), [
    'u1/ v w x y z',
    'u1/ v2/ w x4/ y3/ z',
    'u1/ v2/ w x4/5 y3/ z',
    'u1/8 v2/7 w x4/5 y3/6 z',
    'u1/8 v2/7 w9/ x4/5 y3/6 z10/',
    'u1/8 v2/7 w9/12 x4/5 y3/6 z10/11',
  ])
  const non = (p) => p.busur.filter((b) => b.kelas !== 'tree').map((b) => `${b.u}${b.v}:${b.kelas}`)
  assert.deepEqual(gambar.map(non), [[], [], ['xv:back'], ['xv:back', 'ux:forward'], ['xv:back', 'ux:forward', 'wy:cross'], ['xv:back', 'ux:forward', 'wy:cross', 'zz:back']])
  assert.deepEqual(gambar.map((p) => p.busur.filter((b) => b.kelas === 'tree').length), [0, 3, 3, 3, 4, 4])
  assert.equal(keteranganGambar.length, 6)
  keteranganGambar.forEach((k, i) => assert.ok(k.startsWith(`(${'abcdef'[i]}) time = ${waktuGambar[i]}`)))
  // warna: akhir semua BLACK; sebelum itu GRAY hanya untuk simpul yang masih di call stack
  assert.ok(Object.values(gambar[5].color).every((c) => c === 'BLACK'))
  assert.deepEqual(Object.entries(gambar[4].color).filter(([, c]) => c === 'GRAY').map(([u]) => u), ['w', 'z'])
  // Gambar 7
  const pohon = hutan(hasil)
  assert.equal(pohon.length, 2)
  assert.deepEqual(pohon.map((t) => t.u), ['u', 'w'])
  assert.deepEqual(pohon[0], { u: 'u', anak: [{ u: 'v', anak: [{ u: 'y', anak: [{ u: 'x', anak: [] }] }] }] })
  assert.deepEqual(pohon[1], { u: 'w', anak: [{ u: 'z', anak: [] }] })
  const g = readFileSync(new URL('./modul/18.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(g.includes('Gambar {i + 1}. {keteranganGambar[i]}') && g.includes('Gambar 7. DFS-forest') && g.includes('WHITE bergaris putus'))
})

test('4.3 Struktur tanda kurung: ekspresi sama dengan model; selang bersarang atau lepas, tidak pernah tumpang tindih (acak); bersarang = keturunan', () => {
  assert.equal(strukturKurung(hasil).join(' '), blokTeks('text', 1).trim())
  assert.equal(hubunganSelang(hasil, 'x', 'v'), 'bersarang')
  assert.equal(keturunan(hasil.pi, 'v', 'x'), true)
  assert.equal(hubunganSelang(hasil, 'u', 'w'), 'lepas')
  assert.ok(md.includes('$[4, 5] \\subset [2, 7]$') && md.includes('$[1, 8]$ dan $[9, 12]$'))
  for (let k = 0; k < 120; k++) {
    const { Adj, nama } = grafAcak(1 + Math.floor(rand() * 9))
    const r = dfs(Adj, nama)
    for (const a of nama) for (const b of nama) if (a !== b) {
      const h = hubunganSelang(r, a, b)
      assert.notEqual(h, 'tumpang', `${a},${b}`)
      if (h === 'bersarang') assert.ok(keturunan(r.pi, a, b) || keturunan(r.pi, b, a), 'selang bersarang berarti leluhur-keturunan')
      else assert.ok(!keturunan(r.pi, a, b) && !keturunan(r.pi, b, a), 'selang lepas berarti bukan leluhur-keturunan')
    }
    // timestamp: 1 sampai 2|V|, semuanya berbeda, d < f
    const semua = [...Object.values(r.d), ...Object.values(r.f)].sort((p, q) => p - q)
    assert.deepEqual(semua, Array.from({ length: 2 * nama.length }, (_, i) => i + 1))
    for (const u of nama) assert.ok(r.d[u] < r.f[u])
  }
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 2).trimEnd().split('\n')
  const model1 = `{${urutanTabel.map((u) => `'${u}': '${hasil.d[u]}/${hasil.f[u]}'`).join(', ')}}`
  const model2 = `{${hasil.busur.map((b) => `'${b.u}${b.v}': '${b.kelas}'`).join(', ')}}`
  assert.deepEqual([model1, model2], cetak)
  assert.ok(kode.includes('"u": ["v", "x"]') && kode.includes('"w": ["y", "z"]') && kode.includes('"z": ["z"]'), 'adjacency di program sama dengan Tabel 3')
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('5.1 Running time: DFS-VISIT tepat sekali per simpul, tiap list ditelusuri sekali, langkah = Θ(V + E) (acak)', () => {
  for (let k = 0; k < 120; k++) {
    const { Adj, nama } = grafAcak(1 + Math.floor(rand() * 10))
    const r = dfs(Adj, nama)
    const temu = r.peristiwa.filter((e) => e.jenis === 'temu').map((e) => e.u)
    assert.equal(temu.length, nama.length)
    assert.equal(new Set(temu).size, nama.length, 'tiap simpul ditemukan tepat sekali')
    const E = Object.values(Adj).reduce((a, l) => a + l.length, 0)
    assert.equal(r.busur.length, E, 'total panjang list = |E| dan tiap busur diperiksa sekali')
    assert.equal(r.waktu, 2 * nama.length)
    assert.equal(r.akar.length + r.busur.filter((b) => b.kelas === 'tree').length, nama.length, 'akar + busur tree = |V| (hutan)')
  }
  assert.ok(md.includes('$\\Theta(V + E)$'))
})

test('5.2 Tabel 5 dan deteksi cycle: ada back edge jika dan hanya jika graf punya cycle (acak, dicek dengan algoritma Kahn); contoh punya cycle', () => {
  assert.equal(barisTabel('*Tabel 5.').length, 7)
  assert.equal(adaBackEdge(hasil), true)
  for (let k = 0; k < 200; k++) {
    const { Adj, nama } = grafAcak(1 + Math.floor(rand() * 8), 0.2)
    assert.equal(adaBackEdge(dfs(Adj, nama)), adaCycleKahn(Adj), JSON.stringify(Adj))
  }
  // cycle contoh: v → y → x → v dan self-loop z
  assert.ok(dapatDicapai(adjContoh, 'v', 'v') && dapatDicapai(adjContoh, 'z', 'z'))
  assert.ok(md.includes('$v \\to y \\to x \\to v$'))
  // forward: v dapat dicapai lewat tree dari u; cross tidak memenuhi hubungan leluhur
  for (const b of hasil.busur) {
    if (b.kelas === 'forward') assert.ok(keturunan(hasil.pi, b.u, b.v))
    if (b.kelas === 'back') assert.ok(b.u === b.v || keturunan(hasil.pi, b.v, b.u))
    if (b.kelas === 'cross') assert.ok(!keturunan(hasil.pi, b.u, b.v) && !keturunan(hasil.pi, b.v, b.u))
  }
})

test('kunci kuis dihitung ulang: soal 2 dan 3 (graf Modul 16), soal 4, soal 5, soal 6 (urutan w, u, v, x, y, z), soal 7, soal 8', () => {
  const [, q2, q3, q4, q5, q6, q7, q8] = kuis18.soal
  const adj = { 1: ['2', '4'], 2: ['5'], 3: ['6', '5'], 4: ['2'], 5: ['4'], 6: ['6'] }
  const r = dfs(adj, ['1', '2', '3', '4', '5', '6'])
  assert.deepEqual(q2.isian.map((f) => f.kunci), ['1', '2', '3', '4', '5', '6'].map((u) => `${r.d[u]}/${r.f[u]}`))
  assert.deepEqual(q2.isian.map((f) => f.kunci), ['1/8', '2/7', '9/12', '4/5', '3/6', '10/11'])
  assert.deepEqual([r.jenis['42'], r.jenis['14'], r.jenis['35']], ['back', 'forward', 'cross'])
  assert.deepEqual(q3.isian.map((f) => f.kunci), ['Back', 'Forward', 'Cross'])
  assert.equal(r.d['1'] < r.d['4'] && r.d['3'] > r.d['5'], true)
  // soal 4: selang [2, 7] dan [5, 9] tumpang tindih sebagian, jadi tidak mungkin
  assert.equal(q4.kunci, 'Salah')
  const a = [2, 7]
  const b = [5, 9]
  assert.ok(a[0] < b[0] && b[0] < a[1] && a[1] < b[1], 'tumpang tindih sebagian')
  // soal 5: 7 simpul memberi timestamp terbesar 14 (juga pada graf acak 7 simpul)
  assert.equal(q5.isian[0].kunci, 14)
  for (let k = 0; k < 40; k++) { const { Adj, nama } = grafAcak(7); assert.equal(dfs(Adj, nama).waktu, 14) }
  // soal 6
  const r6 = dfs(adjContoh, ['w', 'u', 'v', 'x', 'y', 'z'])
  assert.equal(r6.jenis.wy, 'tree')
  assert.equal(r6.jenis.uv, 'cross')
  assert.equal(r6.jenis.ux, 'cross')
  assert.equal(r6.jenis.xv, 'tree')
  assert.equal(r6.jenis.vy, 'back')
  assert.deepEqual(r6.akar, ['w', 'u'])
  assert.deepEqual(q6.isian.map((f) => f.kunci), ['Tree', 'Cross', r6.akar.length])
  assert.ok(r6.jenis.wz === 'tree' && r6.jenis.zz === 'back')
  // soal 7: ada cycle jika dan hanya jika ada back edge; opsi B
  assert.equal(q7.kunci, 'B')
  assert.equal(q7.opsi.find((o) => o.id === 'B').teks, 'Tidak menghasilkan back edge.')
  // soal 8: pada DFS tiap timestamp unik; pada BFS d bisa sama (contoh Modul 17: r dan w sama-sama berjarak 1)
  assert.deepEqual(q8.isian.map((f) => f.kunci), ['Jarak (jumlah busur) dari s', 'Waktu ditemukan', 'Ya', 'Ya'])
  const semua = [...Object.values(hasil.d), ...Object.values(hasil.f)]
  assert.equal(new Set(semua).size, semua.length)
})

test('struktur kuis: 8 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis18.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis18.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Penelusuran', 'Analisis', 'Benar/Salah', 'Perhitungan', 'Analisis', 'Pilihan Ganda', 'Analisis'])
  assert.deepEqual(kuis18.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  assert.deepEqual([kuis18.soal[0].kunci, kuis18.soal[6].kunci], ['B', 'B'])
  for (const q of kuis18.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis18.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '18').tipe].sort())
})

test('penilaian soal Modul 18', () => {
  const [q1, q2, q3, q4, q5, q6, q7, q8] = kuis18.soal
  const benar2 = ['1/8', '2/7', '9/12', '4/5', '3/6', '10/11']
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'C').benar, false)
  assert.equal(nilaiSoal(q2, benar2).benar, true)
  assert.equal(nilaiSoal(q2, ['1/8', '2/7', '3/6', '4/5', '9/12', '10/11']).benar, false)
  assert.equal(nilaiSoal(q3, ['Back', 'Forward', 'Cross']).benar, true)
  assert.equal(nilaiSoal(q3, ['Back', 'Cross', 'Forward']).benar, false)
  assert.equal(nilaiSoal(q4, 'Salah').benar, true)
  assert.equal(nilaiSoal(q4, 'Benar').benar, false)
  const alasan = q5.isian[1].kunci
  assert.equal(nilaiSoal(q5, ['14', alasan]).benar, true)
  assert.equal(nilaiSoal(q5, ['7', alasan]).benar, false)
  assert.equal(nilaiSoal(q6, ['Tree', 'Cross', '2']).benar, true)
  assert.equal(nilaiSoal(q6, ['Cross', 'Cross', '2']).benar, false)
  assert.equal(nilaiSoal(q7, 'B').benar, true)
  assert.equal(nilaiSoal(q8, ['Jarak (jumlah busur) dari s', 'Waktu ditemukan', 'Ya', 'Ya']).benar, true)
  assert.equal(nilaiSoal(q8, ['Waktu ditemukan', 'Waktu ditemukan', 'Ya', 'Ya']).benar, false)
  const semua = { 1: 'B', 2: benar2, 3: ['Back', 'Forward', 'Cross'], 4: 'Salah', 5: ['14', alasan], 6: ['Tree', 'Cross', '2'], 7: 'B', 8: ['Jarak (jumlah busur) dari s', 'Waktu ditemukan', 'Ya', 'Ya'] }
  const h = hitungHasil(kuis18.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [8, true, []])
})
