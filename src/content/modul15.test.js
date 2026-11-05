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
import { adalahPrefiks, biayaMinimumBrute, bitTetap, cacahBacaan, decode, encode, frekuensiContoh, huffman, kodeBerubahContoh, kodeDariPohon, kodeTetapContoh, pohonDariKode, simpulSatuAnak, totalBit } from '../viz/kodeHuffmanModel.js'
import { kuis15 } from './modul/15.kuis.js'
import { pseudo } from './modul/15.pseudo.js'

const md = readFileSync(new URL('./modul/15.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('15')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const angka = (t) => Number(String(t).replace(/\./g, ''))
const { akar, awal, langkah } = huffman(frekuensiContoh)
const kode = kodeDariPohon(akar)

test('struktur: tujuh bagian sesuai PDF (bagian 2 tanpa tab), dua gambar, satu pseudocode, lima tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'ukuran', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['gambar:tetap', 'pseudo:huff', 'gambar:huffman'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '5.1', '5.2', '5.3', '5.4', '6.1', '6.2', '6.3', '6.4']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
})

test('metadata sama dengan PDF dan katalog; visualizer Kode Huffman terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [15, 'BAB V', 10, 8])
  assert.equal(m.soal, kuis15.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[4].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Kode Prefiks', '4 Algoritma', '5 Contoh', '6 Kebenaran', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('15'), { prev: modulById('14'), next: null })
  assert.equal(neighbors('14').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'kode-huffman')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [15, true, 'greedy'])
  assert.equal(kuisById('15').soal, 8)
  assert.equal(kuisById('15').judul, kuis15.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('Tabel 1 dan 2: ukuran berkas 800.000, 300.000, 224.000 bit; penghematan 25,3% dan 72%; kode ambigu a=0, b=01, c=1', () => {
  const t1 = barisTabel('*Tabel 1.')
  assert.deepEqual(t1[0].slice(1), frekuensiContoh.map(([c]) => c).length === 6 ? ['45', '13', '12', '16', '9', '5'] : [])
  assert.deepEqual(t1[1].slice(1), Object.values(kodeTetapContoh))
  assert.deepEqual(t1[2].slice(1), Object.values(kodeBerubahContoh))
  assert.equal(frekuensiContoh.reduce((a, [, f]) => a + f, 0), 100, 'frekuensi berjumlah 100 (ribuan)')
  const t2 = barisTabel('*Tabel 2.')
  assert.deepEqual(t2.map((r) => angka(r[2])), [800000, 300000, 224000])
  assert.equal(100000 * 8, 800000)
  assert.equal(100000 * bitTetap(6), 300000)
  assert.deepEqual([2 ** (bitTetap(6) - 1) < 6, 6 <= 2 ** bitTetap(6)], [true, true], '2^2 = 4 < 6 ≤ 8 = 2^3')
  assert.equal(totalBit(frekuensiContoh, kodeBerubahContoh) * 1000, 224000)
  assert.equal(45 * 1 + 13 * 3 + 12 * 3 + 16 * 3 + 9 * 4 + 5 * 4, 224)
  assert.equal(Math.round(((300000 - 224000) / 300000) * 1000) / 10, 25.3)
  assert.equal(((800000 - 224000) / 800000) * 100, 72)
  assert.ok(md.includes('\\approx 25{,}3\\%') && md.includes('membulatkannya menjadi 25%') && md.includes('penghematannya 72%'))
  // kode buruk: "01" dapat dibaca sebagai "ac" atau "b"
  assert.equal(cacahBacaan('01', { a: '0', b: '01', c: '1' }), 2)
  assert.equal(adalahPrefiks(['0', '01', '1']), false)
  assert.equal(cacahBacaan('10111011000', kodeBerubahContoh), 1, 'kode prefiks: tepat satu bacaan')
})

test('3: kode panjang berubah dan kode tetap adalah kode prefiks; contoh awalan di teks benar', () => {
  assert.ok(adalahPrefiks(Object.values(kodeBerubahContoh)) && adalahPrefiks(Object.values(kodeTetapContoh)))
  const lain = Object.entries(kodeBerubahContoh).filter(([c]) => c !== 'a').map(([, k]) => k)
  assert.ok(lain.every((k) => !k.startsWith('0')), 'tidak ada kode lain yang diawali 0')
  const empat = Object.values(kodeBerubahContoh).filter((k) => k.length === 4)
  assert.ok(empat.every((k) => !k.startsWith('101') && !k.startsWith('100') && !k.startsWith('111')), 'kode 4 bit (e dan f) tidak berawalan 101, 100, 111')
  assert.equal(Object.entries(kodeBerubahContoh).find(([, k]) => k === '101')[0], 'b')
})

test('Gambar 1: pohon kode panjang tetap punya tepat satu simpul dalam dengan satu anak (simpul 14), frekuensi 100, 86, 14; berbeda dari pohon Huffman', () => {
  const t = pohonDariKode(kodeTetapContoh, frekuensiContoh)
  assert.equal(t.freq, 100)
  assert.deepEqual([t.kiri.freq, t.kanan.freq], [86, 14])
  assert.deepEqual([t.kiri.kiri.freq, t.kiri.kanan.freq], [58, 28])
  assert.equal(simpulSatuAnak(t), 1)
  assert.deepEqual([!!t.kanan.kiri, !!t.kanan.kanan, t.kanan.kiri?.freq], [true, false, 14], 'simpul 14 hanya punya anak kiri (yang juga 14: e dan f)')
  assert.equal(simpulSatuAnak(akar), 0, 'pohon Huffman penuh')
  const gambar = readFileSync(new URL('./modul/15.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Gambar 1. Pohon kode panjang tetap (3 bit).') && gambar.includes('Gambar 2. Pohon Huffman hasil akhir.'))
})

test('Tabel 3: isi antrean Q setelah tiap putaran sama dengan HUFFMAN (awal, 5 putaran, penggabungan dan isi)', () => {
  const t = barisTabel('*Tabel 3.')
  assert.equal(t.length, 6)
  assert.equal(t[0][2], awal.join(', '))
  langkah.forEach((l, i) => {
    assert.equal(t[i + 1][1], `${l.x} + ${l.y} = ${l.z}`, `penggabungan loop ${l.loop}`)
    assert.equal(t[i + 1][2], l.Q.join(', ') + (l.loop === 5 ? ' (akar)' : ''), `isi Q loop ${l.loop}`)
  })
  assert.equal(langkah.length, 5, '|C| − 1 = 5 penggabungan')
  // simpul 55 diletakkan setelah a:45 karena 45 < 55
  assert.deepEqual(langkah[3].Q, ['a:45', '[55]'])
})

test('Tabel 4, Gambar 2: kode Huffman dari pohon, panjang, frekuensi × panjang, total 224 ribu bit; sama dengan kode panjang berubah', () => {
  assert.deepEqual(kode, kodeBerubahContoh)
  const t = barisTabel('*Tabel 4.').slice(0, 6)
  const jalur = (k) => [...k].map((b) => (b === '0' ? 'kiri' : 'kanan')).join(', ')
  for (const r of t) {
    const k = kode[r[0]]
    assert.deepEqual([r[2], r[3], Number(r[4]), Number(r[5])], [jalur(k), k, k.length, Number(r[1]) * k.length], r[0])
  }
  assert.ok(md.includes('| Total (ribuan bit) | | | | | 224 |'))
  assert.equal(totalBit(frekuensiContoh, kode), 224)
  assert.deepEqual([kode.a.length, Math.max(...Object.values(kode).map((k) => k.length))], [1, 4])
  assert.deepEqual(Object.entries(kode).filter(([, k]) => k.length === 4).map(([c]) => c).sort(), ['e', 'f'])
})

test('5.3: encoding "face" = 110001001101 (12 bit lawan 32 bit ASCII); decoding 10111011000 = beca dalam potongan 101, 1101, 100, 0 (Tabel 5)', () => {
  assert.equal(encode('face', kode), '110001001101')
  assert.equal(encode('face', kode).length, 12)
  assert.equal('face'.length * 8, 32)
  const d = decode('10111011000', kode)
  assert.equal(d.hasil, 'beca')
  assert.equal(d.sisa, '')
  assert.ok(md.includes(`| Bit yang dibaca | ${d.potongan.map((p) => p.bit).join(' | ')} |`))
  assert.ok(md.includes(`| Karakter | ${d.potongan.map((p) => p.ch).join(' | ')} |`))
  assert.equal(decode(encode('beca', kode), kode).hasil, 'beca')
})

test('Huffman optimal: biaya sama dengan minimum dari SEMUA urutan penggabungan dan kode berupa kode prefiks dari pohon penuh (acak)', () => {
  assert.equal(biayaMinimumBrute(frekuensiContoh.map(([, f]) => f)), 224, 'contoh modul')
  for (let u = 0; u < 120; u++) {
    const n = 2 + Math.floor(rand() * 5)
    const freq = Array.from({ length: n }, (_, i) => [String.fromCharCode(97 + i), 1 + Math.floor(rand() * 20)])
    const r = huffman(freq)
    const k = kodeDariPohon(r.akar)
    assert.equal(totalBit(freq, k), biayaMinimumBrute(freq.map(([, f]) => f)), `optimal untuk ${freq.map((x) => x.join(':'))}`)
    assert.ok(adalahPrefiks(Object.values(k)))
    assert.equal(simpulSatuAnak(r.akar), 0)
    assert.equal(r.langkah.length, n - 1)
    // Kraft: Σ 2^−panjang = 1 untuk pohon penuh
    assert.ok(Math.abs(Object.values(k).reduce((a, x) => a + 2 ** -x.length, 0) - 1) < 1e-12)
    // karakter berfrekuensi lebih besar tidak mendapat kode lebih panjang
    for (const [a, fa] of freq) for (const [b, fb] of freq) if (fa > fb) assert.ok(k[a].length <= k[b].length, `${a}:${fa} vs ${b}:${fb}`)
    assert.equal(decode(encode(freq.map(([c]) => c).join(''), k), k).hasil, freq.map(([c]) => c).join(''))
  }
})

test('6.3: pemecah seri atau pertukaran label 0 dan 1 mengubah kode tetapi total bit tetap 224.000', () => {
  const dibalik = Object.fromEntries(Object.entries(kode).map(([c, k]) => [c, [...k].map((b) => (b === '0' ? '1' : '0')).join('')]))
  assert.notDeepEqual(dibalik, kode)
  assert.ok(adalahPrefiks(Object.values(dibalik)))
  assert.equal(totalBit(frekuensiContoh, dibalik), 224)
  // frekuensi seri: dua pohon berbeda, biaya sama
  const seri = [['a', 1], ['b', 1], ['c', 1], ['d', 1]]
  const urutBalik = huffman([...seri].reverse())
  assert.equal(totalBit(seri, kodeDariPohon(huffman(seri).akar)), totalBit(seri, kodeDariPohon(urutBalik.akar)))
})

test('6.2 dan kuis soal 7: n − 1 putaran, 2 EXTRACT-MIN dan 1 INSERT tiap putaran; 256 karakter → 255 putaran, 765 operasi heap', () => {
  for (let n = 2; n <= 30; n++) {
    const freq = Array.from({ length: n }, (_, i) => [`k${i}`, 1 + Math.floor(rand() * 30)])
    const r = huffman(freq)
    assert.equal(r.langkah.length, n - 1)
    assert.equal(r.langkah.length * 3, 3 * (n - 1))
  }
  const [, , , , , , q7] = kuis15.soal
  assert.deepEqual([q7.isian[0].kunci, q7.isian[1].kunci], [255, 3 * 255])
  assert.equal(3 * 255, 765)
  assert.equal(Math.log2(256), 8)
})

test('pseudocode: nomor baris sama dengan PDF (1–9) dan penjelasan langkah 4–8 merujuk baris yang tepat', () => {
  const b = pseudo.huff.baris
  assert.equal(b.length, 9)
  assert.ok(b[0].startsWith('n = |C|') && b[1].startsWith('Q = C') && b[2].startsWith('for i = 1 to n - 1'))
  assert.ok(b[3].includes('allocate a new node z') && b[4].includes('z.left = x = EXTRACT-MIN(Q)') && b[5].includes('z.right = y = EXTRACT-MIN(Q)'))
  assert.ok(b[6].includes('z.freq = x.freq + y.freq') && b[7].includes('INSERT(Q, z)') && b[8].startsWith('return EXTRACT-MIN(Q)'))
  assert.ok(md.includes('**Langkah 4–8:**'))
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kodePy = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const model = [
    `{${Object.entries(kode).sort(([a], [b]) => (a < b ? -1 : 1)).map(([c, k]) => `'${c}': '${k}'`).join(', ')}}`,
    `${totalBit(frekuensiContoh, kode)} ribu bit`,
    `${encode('face', kode)} ${decode('10111011000', kode).hasil}`,
  ]
  assert.deepEqual(model, cetak)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kodePy], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('kunci kuis dihitung ulang: soal 1, 2, 3, 4, 7', () => {
  const [q1, q2, q3, q4] = kuis15.soal
  const opsi = { A: ['0', '01', '11'], B: ['0', '10', '110', '111'], C: ['1', '10', '100'], D: ['00', '0', '11'] }
  assert.deepEqual(Object.entries(opsi).filter(([, v]) => adalahPrefiks(v)).map(([k]) => k), [q1.kunci])
  assert.deepEqual([bitTetap(10), [2 ** (bitTetap(10) - 1) < 10, 10 <= 2 ** bitTetap(10)], 1000 * bitTetap(10)], [4, [true, true], 4000])
  assert.deepEqual([q2.isian[0].kunci, q2.isian[1].kunci], [4, 4000])
  const d = decode('0101100111', kode)
  assert.deepEqual([d.hasil, d.potongan.map((p) => p.bit).join('|')], ['abcd', '0|101|100|111'])
  assert.deepEqual([q3.isian[0].kunci, q3.isian[1].kunci, q3.isian[2].kunci], [d.hasil, encode('dad', kode), encode('dad', kode).length])
  assert.equal(encode('dad', kode), '1110111')
  // soal 4: A:20, B:10, C:5, D:40, E:25
  const freq = [['A', 20], ['B', 10], ['C', 5], ['D', 40], ['E', 25]]
  const r = huffman(freq)
  const k = kodeDariPohon(r.akar)
  assert.equal(r.langkah.map((l) => `${l.x} + ${l.y} = ${l.z}`).join('; '), q4.isian[0].kunci.replace(/\[15\] \+ A:20/, '[15] + A:20'))
  assert.equal(totalBit(freq, k), q4.isian[1].kunci)
  assert.deepEqual(Object.fromEntries(Object.entries(k).map(([c, x]) => [c, x.length])), { D: 1, E: 2, A: 3, B: 4, C: 4 })
  assert.equal(40 + 50 + 60 + 40 + 20, 210)
  assert.equal(biayaMinimumBrute(freq.map(([, f]) => f)), 210)
  // contoh kode di pembahasan: D = 0, E = 10, A = 111, C = 1100, B = 1101 adalah kode prefiks dengan total 210
  const contoh = { D: '0', E: '10', A: '111', C: '1100', B: '1101' }
  assert.ok(adalahPrefiks(Object.values(contoh)))
  assert.equal(totalBit(freq, contoh), 210)
  // pengecoh urutan penggabungan lain berbeda dari yang benar
  assert.equal(new Set(q4.isian[0].opsi).size, 4)
})

test('soal 5, 6, 8: Huffman terbukti optimal; pohon tetap punya simpul satu anak dan e, f cukup 2 bit; e dan f paling panjang', () => {
  assert.equal(kuis15.soal[4].kunci, 'Salah')
  assert.ok(kuis15.soal[5].kunciTeks.includes('10 dan 11'))
  // jika simpul 14 dihilangkan, e dan f cukup 2 bit (10 dan 11) dan total turun: 45·3 + 13·3 + 12·3 + 16·3 + 9·2 + 5·2 < 300
  assert.ok(45 * 3 + 13 * 3 + 12 * 3 + 16 * 3 + 9 * 2 + 5 * 2 < 300)
  const lebihPendek = { a: '000', b: '001', c: '010', d: '011', e: '10', f: '11' }
  assert.ok(adalahPrefiks(Object.values(lebihPendek)) && totalBit(frekuensiContoh, lebihPendek) < 300)
  assert.equal(kuis15.soal[7].kunci, 'B')
  const terpanjang = Math.max(...Object.values(kode).map((x) => x.length))
  assert.deepEqual(Object.entries(kode).filter(([, x]) => x.length === terpanjang).map(([c]) => c).sort(), ['e', 'f'])
  assert.deepEqual([langkah[0].x, langkah[0].y], ['f:5', 'e:9'], 'dua frekuensi terkecil digabung pada loop pertama')
})

test('struktur kuis: 8 soal, jenis sesuai PDF, hanya soal 6 dinilai sendiri', () => {
  assert.deepEqual(kuis15.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis15.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Perhitungan', 'Perhitungan', 'Penelusuran', 'Benar/Salah', 'Analisis', 'Perhitungan', 'Pilihan Ganda'])
  assert.deepEqual(kuis15.soal.filter((q) => q.mandiri).map((q) => q.no), [6])
  for (const q of kuis15.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    if (q.mandiri) assert.ok(q.kunciTeks)
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis15.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '15').tipe].sort())
})

test('penilaian soal Modul 15', () => {
  const [q1, q2, q3, q4, q5, , q7, q8] = kuis15.soal
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'C').benar, false)
  assert.equal(nilaiSoal(q2, ['4', '4.000']).benar, true, 'angka boleh memakai titik ribuan')
  assert.equal(nilaiSoal(q2, ['3', '3000']).benar, false)
  assert.equal(nilaiSoal(q3, ['abcd', '1110111', '7']).benar, true)
  assert.equal(nilaiSoal(q3, ['abcd', '1110011', '7']).benar, false)
  assert.equal(nilaiSoal(q4, [q4.isian[0].kunci, '210']).benar, true)
  assert.equal(nilaiSoal(q4, [q4.isian[0].opsi[1], '210']).benar, false)
  assert.equal(nilaiSoal(q5, 'Salah').benar, true)
  assert.equal(nilaiSoal(q7, ['255', '765']).benar, true)
  assert.equal(nilaiSoal(q8, 'B').benar, true)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: 'B', 2: ['4', '4000'], 3: ['abcd', '1110111', '7'], 4: [q4.isian[0].kunci, '210'], 5: 'Salah', 6: ok, 7: ['255', '765'], 8: 'B' }
  const h = hitungHasil(kuis15.soal, semua)
  assert.deepEqual([h.skor, h.lulus], [8, true])
  assert.deepEqual(hitungHasil(kuis15.soal, { ...semua, 6: undefined }).belumDinilai, [6])
})
