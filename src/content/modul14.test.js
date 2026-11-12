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
import { activitySelection } from '../algorithms/activitySelection.js'
import { aktivitasContoh, durasiTerpendek, greedyActivitySelector, kompatibel, menurutDurasi, menurutMulai, menurutSelesai, optimalBrute, saling } from '../viz/aktivitasModel.js'
import { kuis14 } from './modul/14.kuis.js'
import { pseudo } from './modul/14.pseudo.js'

const md = readFileSync(new URL('./modul/14.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('14')
const { s, f } = aktivitasContoh

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
/** "$\{a_1, a_4\}$" → [1, 4] */
const himpunan = (tex) => [...tex.matchAll(/a_\{?(\d+)\}?/g)].map((x) => Number(x[1]))
const acak = (n) => {
  const akhir = Array.from({ length: n }, () => 1 + Math.floor(rand() * 12)).sort((a, b) => a - b)
  return { s: akhir.map((fi) => Math.max(0, fi - 1 - Math.floor(rand() * 6))), f: akhir }
}

test('struktur: tujuh bagian sesuai PDF (bagian 2 tanpa tab), satu gambar, satu pseudocode, lima tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'rumusan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['gambar:waktu', 'pseudo:gas'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '5.1', '5.2', '5.3', '5.4']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.equal([...md.matchAll(/Catatan koreksi terhadap sumber/g)].length, 2)
})

test('metadata sama dengan PDF dan katalog; visualizer Activity-Selection terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [14, 'BAB V', 10, 7])
  assert.equal(m.soal, kuis14.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[4].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Pilihan Greedy', '4 Prosedur', '5 Penelusuran', '6 Analisis', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('14'), { prev: modulById('13'), next: modulById('15') })
  assert.equal(neighbors('13').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'activity-selection')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [14, true, 'greedy'])
  assert.equal(kuisById('14').soal, 7)
  assert.equal(kuisById('14').judul, kuis14.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('Tabel 1 dan Gambar 1: 11 aktivitas terurut menurut waktu selesai, selang valid; solusi Greedy {a1, a4, a8, a11}', () => {
  const t = barisTabel('*Tabel 1.')
  assert.deepEqual(t[0].slice(1).map(Number), s)
  assert.deepEqual(t[1].slice(1).map(Number), f)
  assert.ok(f.every((x, i) => i === 0 || f[i - 1] <= x), 'terurut menurut f')
  assert.ok(s.every((x, i) => x >= 0 && x < f[i]), '0 ≤ s < f')
  assert.deepEqual(greedyActivitySelector(s, f).A, [1, 4, 8, 11])
  const gambar = readFileSync(new URL('./modul/14.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Gambar 1. Aktivitas pada garis waktu.') && gambar.includes('a1, a4, a8, a11'))
})

test('2.2: tiga penelusuran manual (a3, a1, a2 lebih dulu), ukuran maksimum 4 (tidak ada 5), dan koreksi syarat ≥ (s4 = f2 = 5)', () => {
  const akt = s.map((si, i) => ({ s: si, f: f[i] }))
  const manual = (awal) => {
    const A = [awal]
    let k = awal
    for (let i = awal + 1; i <= 11; i++) if (akt[i - 1].s >= akt[k - 1].f) { A.push(i); k = i }
    return A
  }
  assert.deepEqual(manual(3), [3, 7, 11])
  assert.deepEqual(manual(1), [1, 4, 8, 11])
  assert.deepEqual(manual(2), [2, 4, 8, 11])
  const { ukuran, semua } = optimalBrute(s, f)
  assert.equal(ukuran, 4, 'tidak ada 5 aktivitas yang saling kompatibel')
  for (const h of [[1, 4, 8, 11], [2, 4, 8, 11]]) assert.ok(semua.some((x) => x.map((i) => i + 1).join() === h.join()), `${h} termasuk himpunan optimal`)
  assert.ok(saling(s, f, [1, 3, 7, 10]), '{a2, a4, a8, a11} sah')
  assert.equal(s[3], f[1], 's4 = f2 = 5')
  assert.equal(s[3] > f[1], false, 'syarat ketat "lebih besar" menolak himpunan itu')
  for (const x of ['$\\{a_3, a_7, a_{11}\\}$, 3 aktivitas', '$\\{a_1, a_4, a_8, a_{11}\\}$, 4 aktivitas', '$\\{a_2, a_4, a_8, a_{11}\\}$, 4 aktivitas', '($s_4 = f_2 = 5$)']) assert.ok(md.includes(x), x)
})

test('definisi kompatibel (selang setengah terbuka): [2,6) dan [6,9) kompatibel; [1,5) dan [4,7) tidak (kuis soal 1)', () => {
  assert.ok(kompatibel({ s: 2, f: 6 }, { s: 6, f: 9 }))
  assert.ok(kompatibel({ s: 6, f: 9 }, { s: 2, f: 6 }), 'simetris')
  assert.ok(!kompatibel({ s: 1, f: 5 }, { s: 4, f: 7 }))
  assert.ok(!kompatibel({ s: 0, f: 6 }, { s: 3, f: 5 }))
  assert.equal(kuis14.soal[0].kunci, 'C')
})

test('Teorema 16.1 dan argumen pertukaran (Soal 7): untuk setiap solusi optimal A, A\' = (A − {aj}) ∪ {a1} sah, ukuran sama, memuat a1 (acak)', () => {
  for (let u = 0; u < 120; u++) {
    const n = 1 + Math.floor(rand() * 9)
    const { s: ss, f: ff } = acak(n)
    const { ukuran, semua } = optimalBrute(ss, ff)
    for (const A of semua) {
      const urut = [...A].sort((x, y) => ff[x] - ff[y] || x - y)
      const aj = urut[0]
      const Aprime = A.includes(0) ? A : [...A.filter((x) => x !== aj), 0]
      assert.ok(saling(ss, ff, Aprime), `A' sah untuk s=${ss} f=${ff}`)
      assert.equal(Aprime.length, ukuran)
      assert.ok(Aprime.includes(0))
      // alasan di kunci: semua aktivitas lain di A mulai setelah aj selesai, f1 ≤ fj ≤ s
      for (const x of A) if (x !== aj) assert.ok(ss[x] >= ff[aj] && ff[0] <= ff[aj] && ff[aj] <= ss[x])
    }
    // GREEDY-ACTIVITY-SELECTOR menghasilkan himpunan sah dengan ukuran maksimum, sama dengan solusi di visualizer
    const g = greedyActivitySelector(ss, ff).A
    assert.ok(saling(ss, ff, g.map((i) => i - 1)))
    assert.equal(g.length, ukuran, `s=${ss} f=${ff}`)
    assert.equal(activitySelection(ss, ff).length, g.length, 'ukuran sama dengan implementasi di visualizer')
  }
})

test('Tabel 2 dan pseudocode: nomor baris 1–8 sama dengan PDF dan dirujuk penjelasan langkah', () => {
  const b = pseudo.gas.baris
  assert.equal(b.length, 8)
  assert.ok(b[0].startsWith('n = s.length') && b[1].includes('A = {a1}') && b[2].includes('k = 1'))
  assert.ok(b[3].startsWith('for m = 2 to n') && b[4].includes('if s[m] ≥ f[k]') && b[5].includes('A = A ∪ {am}') && b[6].includes('k = m') && b[7].startsWith('return A'))
  const t = barisTabel('*Tabel 2.')
  assert.deepEqual(t.map((r) => r[0]), ['1', '2', '3', '4–7', '8'])
  assert.ok(t[3][1].includes('langkah 5') && t[3][1].includes('langkah 6') && t[3][1].includes('langkah 7'))
})

test('Tabel 3: penelusuran 10 putaran sama dengan hasil GREEDY-ACTIVITY-SELECTOR (dengan dua koreksi salah ketik)', () => {
  const t = barisTabel('*Tabel 3.')
  const { A, putaran } = greedyActivitySelector(s, f)
  assert.equal(t.length, 11, 'awal + 10 putaran')
  assert.deepEqual([t[0][5], t[0][6]], ['$\\{a_1\\}$', '1'])
  putaran.forEach((p, i) => {
    const r = t[i + 1]
    assert.deepEqual([Number(r[0]), Number(r[1]), Number(r[2]), Number(r[3]), r[4] === 'True', Number(r[6])], [p.loop, p.m, p.sm, p.fk, p.ya, p.k], `putaran ${p.loop}`)
    assert.deepEqual(himpunan(r[5]), p.A, `A pada putaran ${p.loop}`)
    assert.equal(p.ya, p.sm >= p.fk, 'True bila s[m] ≥ f[k]')
  })
  assert.deepEqual(A, [1, 4, 8, 11])
  // koreksi 1: pada Loop 7, s[8] = 8 dan f[4] = 7 (bukan 4), 8 ≥ 7
  assert.deepEqual([putaran[6].m, putaran[6].sm, putaran[6].fk, putaran[6].ya], [8, 8, 7, true])
  assert.equal(f[3], 7)
  // koreksi 2: loop terakhir m = 11; m = 12 > n = 11 menghentikan perulangan
  assert.deepEqual([putaran.length, putaran.at(-1).m, s.length], [10, 11, 11])
  assert.ok(md.includes('seharusnya $f[4] = 7$'))
})

test('5.2: perulangan berjalan n − 1 kali dalam Θ(n); jumlah perbandingan tepat n − 1 (acak)', () => {
  for (let n = 1; n <= 40; n++) {
    const { s: ss, f: ff } = acak(n)
    assert.equal(greedyActivitySelector(ss, ff).putaran.length, n - 1)
  }
  assert.equal(greedyActivitySelector(s, f).putaran.length, 11 - 1)
})

test('Tabel 4 dan 5: urutan stabil menurut waktu mulai dan durasi sama dengan PDF; hasil {a1, a8, a11} dan {a1, a2, a4, a8}', () => {
  const mulai = menurutMulai(s, f)
  const t4 = barisTabel('*Tabel 4.')
  assert.deepEqual([t4[0].slice(1).map(Number), t4[1].slice(1).map(Number)], [mulai.s, mulai.f])
  const gm = greedyActivitySelector(mulai.s, mulai.f).A
  assert.deepEqual(gm, [1, 8, 11])
  assert.deepEqual(gm.map((i) => [mulai.s[i - 1], mulai.f[i - 1]]), [[0, 6], [6, 10], [12, 16]])
  assert.ok(gm.length < optimalBrute(s, f).ukuran, 'tidak optimal: 3 < 4')
  const dur = menurutDurasi(s, f)
  const t5 = barisTabel('*Tabel 5.')
  assert.deepEqual([t5[0].slice(1).map(Number), t5[1].slice(1).map(Number), t5[2].slice(1).map(Number)], [dur.s, dur.f, dur.f.map((x, i) => x - dur.s[i])])
  const gd = greedyActivitySelector(dur.s, dur.f).A
  assert.deepEqual(gd, [1, 2, 4, 8])
  assert.deepEqual(gd.map((i) => [dur.s[i - 1], dur.f[i - 1]]), [[3, 5], [5, 7], [8, 11], [12, 16]])
  assert.equal(gd.length, 4, 'kebetulan optimal')
  // catatan teknis: pada kedua latihan hasilnya kebetulan tetap kompatibel
  assert.ok(saling(mulai.s, mulai.f, gm.map((i) => i - 1)) && saling(dur.s, dur.f, gd.map((i) => i - 1)))
  assert.deepEqual(menurutSelesai(s, f).s, s, 'data contoh sudah terurut menurut waktu selesai')
})

test('durasi terpendek tidak selalu optimal: [1,5), [4,7), [6,10) hanya 1 aktivitas padahal optimal 2; satu-satunya kriteria benar adalah selesai paling awal', () => {
  const akt = [[1, 5], [4, 7], [6, 10]]
  assert.deepEqual(durasiTerpendek(akt), [[4, 7]])
  const ss = akt.map((a) => a[0])
  const ff = akt.map((a) => a[1])
  assert.equal(optimalBrute(ss, ff).ukuran, 2)
  assert.deepEqual(optimalBrute(ss, ff).semua, [[0, 2]], '[1,5) dan [6,10)')
  // contoh bahwa kriteria selesai paling awal tidak pernah kalah (acak), sementara mulai paling awal dan durasi terpendek bisa kalah
  let mulaiKalah = 0
  let durasiKalah = 0
  for (let u = 0; u < 300; u++) {
    const n = 2 + Math.floor(rand() * 7)
    const mulaiAcak = Array.from({ length: n }, () => Math.floor(rand() * 12))
    const fAcak = mulaiAcak.map((x) => x + 1 + Math.floor(rand() * 8))
    const opt = optimalBrute(mulaiAcak, fAcak).ukuran
    const sel = menurutSelesai(mulaiAcak, fAcak)
    assert.equal(greedyActivitySelector(sel.s, sel.f).A.length, opt, 'selesai paling awal selalu optimal')
    const ml = menurutMulai(mulaiAcak, fAcak)
    if (greedyActivitySelector(ml.s, ml.f).A.length < opt) mulaiKalah++
    if (durasiTerpendek(mulaiAcak.map((x, i) => [x, fAcak[i]])).length < opt) durasiKalah++
  }
  assert.ok(mulaiKalah > 0, 'mulai paling awal bisa gagal')
  assert.ok(durasiKalah > 0, 'durasi terpendek bisa gagal')
  for (const x of ['tiga aktivitas $[1, 5)$, $[4, 7)$, $[6, 10)$', 'Aktivitas terpendek adalah $[4, 7)$ (durasi 3)', '$[1, 5)$ dan $[6, 10)$']) assert.ok(md.includes(x), x)
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const tulis = (u) => `[${u.map(([a, b]) => `(${a}, ${b})`).join(', ')}]`
  const akt = s.map((x, i) => [x, f[i]])
  const model = [
    ['selesai', menurutSelesai],
    ['mulai', menurutMulai],
    ['durasi', menurutDurasi],
  ].map(([nama, urut]) => {
    const o = urut(s, f)
    return `${nama} ${tulis(greedyActivitySelector(o.s, o.f).A.map((i) => [o.s[i - 1], o.f[i - 1]]))}`
  })
  model.push(tulis(durasiTerpendek([[1, 5], [4, 7], [6, 10]])))
  assert.deepEqual(model, cetak)
  assert.equal(akt.length, 11)
  assert.deepEqual(cetak, ['selesai [(1, 4), (5, 7), (8, 11), (12, 16)]', 'mulai [(0, 6), (6, 10), (12, 16)]', 'durasi [(3, 5), (5, 7), (8, 11), (12, 16)]', '[(4, 7)]'])
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('kunci kuis dihitung ulang: soal 2 (penelusuran), soal 4 (mulai paling awal), soal 5 (n lg n), soal 6 (contoh penyangkal)', () => {
  const [, q2, , q4] = kuis14.soal
  const aktivitas = [[1, 3], [2, 5], [4, 7], [1, 8], [5, 9], [8, 10], [9, 11], [11, 14], [13, 16]]
  const ss = aktivitas.map((a) => a[0])
  const ff = aktivitas.map((a) => a[1])
  assert.ok(ff.every((x, i) => i === 0 || ff[i - 1] <= x), 'sudah terurut menurut f')
  const { A, putaran } = greedyActivitySelector(ss, ff)
  assert.equal(A.length, 4)
  assert.deepEqual(q2.kunci, ['A', 'B', 'C'])
  assert.deepEqual(putaran.map((p) => p.ya), [false, true, false, false, true, false, true, false], 'tidak, ya, tidak, tidak, ya, tidak, ya, tidak')
  assert.equal(optimalBrute(ss, ff).ukuran, 4)
  // soal 4
  assert.equal(q4.kunci, 'D')
  assert.equal(greedyActivitySelector(menurutMulai(s, f).s, menurutMulai(s, f).f).A.length, 3)
  // soal 5
  assert.ok(Math.abs(10000 * Math.log2(10000) - 133000) < 200)
  // soal 6: [0,10), [1,2), [3,4)
  const s6 = [0, 1, 3]
  const f6 = [10, 2, 4]
  const m6 = menurutMulai(s6, f6)
  assert.equal(greedyActivitySelector(m6.s, m6.f).A.length, 1)
  assert.equal(optimalBrute(s6, f6).ukuran, 2)
})

