import test from 'node:test'
import assert from 'node:assert/strict'
import { rand } from '../lib/testRandom.js'
import { MAKS_BUSUR, bacaBusur, bangun, grafA, grafB, grafSoal1, maksBusurTakBerarah, memori, periksaBusur, posisiA, posisiB, posisiMelingkar, teksBusur } from './representasiGrafModel.js'

const acak = (n, berarah) => {
  const busur = []
  for (let u = 1; u <= n; u++) for (let v = 1; v <= n; v++) {
    if (!berarah && v <= u) continue
    if (rand() < 0.3) busur.push([u, v])
  }
  return busur.sort(() => rand() - 0.5)
}

test('graf contoh: graf (a) 5 simpul 7 busur tak berarah, graf (b) 6 simpul 8 busur berarah dengan self-loop; posisi lengkap', () => {
  assert.deepEqual([grafA.n, grafA.busur.length, grafA.berarah], [5, 7, false])
  assert.deepEqual([grafB.n, grafB.busur.length, grafB.berarah], [6, 8, true])
  assert.ok(grafB.busur.some(([u, v]) => u === v && u === 6), 'self-loop pada simpul 6')
  assert.ok(grafA.busur.every(([u, v]) => u !== v))
  for (let k = 1; k <= 5; k++) assert.ok(posisiA[k].x >= 0 && posisiA[k].x <= 1 && posisiA[k].y >= 0 && posisiA[k].y <= 1)
  for (let k = 1; k <= 6; k++) assert.ok(posisiB[k])
  assert.equal(grafSoal1.n, 4)
})

test('bangun: adjacency-list dan matriks persis seperti keluaran program di modul untuk graf (a) dan (b)', () => {
  const a = bangun(grafA.n, grafA.busur, false)
  assert.deepEqual(a.adj, { 1: [2, 5], 2: [1, 5, 3, 4], 3: [2, 4], 4: [2, 3, 5], 5: [1, 2, 4] })
  assert.deepEqual([a.panjangTotal, a.satu, a.simetris], [14, 14, true])
  const b = bangun(grafB.n, grafB.busur, true)
  assert.deepEqual(b.adj, { 1: [2, 4], 2: [5], 3: [6, 5], 4: [2], 5: [4], 6: [6] })
  assert.deepEqual(b.keluar, [2, 1, 2, 1, 1, 1])
  assert.deepEqual(b.masuk, [0, 2, 0, 2, 2, 2])
  assert.deepEqual([b.panjangTotal, b.satu, b.simetris], [8, 8, false])
  assert.deepEqual([b.A[1][4], b.A[4][1], b.A[6][6], b.A[1][2], b.A[2][1]], [1, 0, 1, 1, 0])
})

test('invarian acak: total panjang list = |E| (berarah) atau 2|E| (tak berarah); sel bernilai 1 sama; tak berarah simetris; derajat konsisten', () => {
  for (let u = 0; u < 120; u++) {
    const n = 1 + Math.floor(rand() * 9)
    for (const berarah of [false, true]) {
      const busur = acak(n, berarah).filter(([x, y]) => berarah || x !== y)
      const r = bangun(n, busur, berarah)
      const E = busur.length
      assert.equal(r.panjangTotal, berarah ? E : 2 * E)
      assert.equal(r.satu, r.panjangTotal, 'sel bernilai 1 = panjang total list')
      if (!berarah) assert.ok(r.simetris)
      assert.equal(r.keluar.reduce((x, y) => x + y, 0), r.masuk.reduce((x, y) => x + y, 0), 'jumlah derajat keluar = jumlah derajat masuk')
      if (!berarah) assert.deepEqual(r.keluar, r.masuk)
      for (let i = 1; i <= n; i++) assert.equal(r.adj[i].length, r.A[i].reduce((x, y) => x + y, 0), `baris ${i}`)
      assert.ok(E <= (berarah ? n * n : maksBusurTakBerarah(n)))
    }
  }
})

test('periksaBusur: list menelusuri sampai ketemu (Adj[2] = 1,5,3,4 → busur (2,4) butuh 4 perbandingan), matriks 1 langkah; busur tidak ada → semua elemen', () => {
  const a = bangun(5, grafA.busur, false)
  assert.deepEqual(periksaBusur(a.adj, a.A, 2, 4), { ada: true, perbandinganList: 4, panjangList: 4, sel: 1, langkahMatriks: 1 })
  assert.deepEqual(periksaBusur(a.adj, a.A, 1, 3), { ada: false, perbandinganList: 2, panjangList: 2, sel: 0, langkahMatriks: 1 })
  for (let u = 0; u < 60; u++) {
    const n = 2 + Math.floor(rand() * 7)
    const r = bangun(n, acak(n, true), true)
    for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) {
      const c = periksaBusur(r.adj, r.A, i, j)
      assert.equal(c.ada, r.A[i][j] === 1)
      assert.ok(c.perbandinganList <= c.panjangList && c.langkahMatriks === 1)
    }
  }
})

test('memori: contoh jaringan jalan 40.000 vs 10^8 (2.500 kali; 3.333 bila kepala list tidak dihitung), media sosial ≈ 4.975 kali, kuis soal 2', () => {
  const jalan = memori(10000, 15000, false)
  assert.deepEqual([jalan.panjang, jalan.list, jalan.matriks, jalan.rasio], [30000, 40000, 1e8, 2500])
  assert.ok(Math.abs(1e8 / 30000 - 3333.33) < 0.01)
  const sosial = memori(1e6, 1e8, false)
  assert.deepEqual([sosial.panjang, sosial.list, sosial.matriks], [2e8, 2.01e8, 1e12])
  assert.ok(sosial.rasio > 4900 && sosial.rasio < 5000, `${sosial.rasio}`)
  assert.deepEqual([memori(8, 12, false).panjang, memori(8, 12, false).matriks], [24, 64])
  assert.equal(memori(6, 8, true).panjang, 8)
  assert.equal(maksBusurTakBerarah(10000), 49995000)
})

test('bacaBusur: sah dan galat dengan pesan (di luar rentang, self-loop tak berarah, busur ganda, format salah, terlalu banyak)', () => {
  assert.deepEqual(bacaBusur('1-2, 2-3', 3, false), { ok: true, busur: [[1, 2], [2, 3]] })
  assert.deepEqual(bacaBusur('1→2; 2 > 3\n3–1', 3, true).busur, [[1, 2], [2, 3], [3, 1]])
  assert.deepEqual(bacaBusur('', 3, false), { ok: true, busur: [] })
  assert.deepEqual(bacaBusur('3-3', 3, true).busur, [[3, 3]], 'self-loop sah pada graf berarah')
  for (const [teks, n, ber, kata] of [['1-9', 3, false, 'antara 1 dan 3'], ['2-2', 3, false, 'self-loop'], ['1-2, 2-1', 3, false, 'dua kali'], ['1-2, 1-2', 3, true, 'dua kali'], ['a-b', 3, false, 'bukan busur'], ['0-1', 3, false, 'antara 1 dan 3']]) {
    const h = bacaBusur(teks, n, ber)
    assert.equal(h.ok, false, teks)
    assert.ok(h.pesan.includes(kata), `${teks}: ${h.pesan}`)
  }
  assert.equal(bacaBusur('1-2, 2-1', 3, true).ok, true, 'berarah: (1,2) dan (2,1) berbeda')
  const banyak = Array.from({ length: MAKS_BUSUR + 1 }, (_, i) => `${(i % 12) + 1}-${Math.floor(i / 12) + 1}`).join(', ')
  const h = bacaBusur(banyak, 12, true)
  assert.equal(h.ok, false)
  assert.ok(h.pesan.includes(`${MAKS_BUSUR} busur`))
  assert.equal(bacaBusur(banyak.split(', ').slice(0, MAKS_BUSUR).join(', '), 12, true).ok, true, 'tepat batas masih sah')
  assert.equal(teksBusur(grafA.busur), '1-2, 1-5, 2-5, 2-3, 2-4, 3-4, 4-5')
  assert.deepEqual(bacaBusur(teksBusur(grafB.busur), 6, true).busur, grafB.busur, 'teks ↔ busur bolak-balik')
})

test('posisiMelingkar: n simpul di dalam kotak 0..1; satu simpul di tengah', () => {
  const p = posisiMelingkar(8)
  assert.equal(Object.keys(p).length, 8)
  for (const { x, y } of Object.values(p)) assert.ok(x >= 0 && x <= 1 && y >= 0 && y <= 1)
  assert.deepEqual(posisiMelingkar(1)[1], { x: 0.5, y: 0.5 })
})
