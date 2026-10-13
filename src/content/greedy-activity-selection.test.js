import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { activitySelection } from '../algorithms/activitySelection.js'
import { traces, runTrace } from '../algorithms/traces.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/greedy-activity-selection.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'greedy-activity-selection')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/greedy-activity-selection.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

const S = [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12]
const F = [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16]
const n = S.length

// ---------------------------------------------------------------- pembanding independen
const compatible = (s, f, i, j) => s[j] >= f[i] || s[i] >= f[j]

/** Semua himpunan bagian (brute force): ukuran terbesar yang saling kompatibel dan semua subset berukuran itu. */
function bruteForce(s, f) {
  let best = 0
  let all = []
  for (let mask = 1; mask < 1 << s.length; mask++) {
    const idx = []
    for (let k = 0; k < s.length; k++) if (mask & (1 << k)) idx.push(k)
    let ok = true
    for (let a = 0; ok && a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) if (!compatible(s, f, idx[a], idx[b])) { ok = false; break }
    if (!ok) continue
    if (idx.length > best) { best = idx.length; all = [] }
    if (idx.length === best) all.push(idx.map((x) => x + 1))
  }
  return { best, all }
}

/** GREEDY-ACTIVITY-SELECTOR apa adanya (indeks 1), mencatat tiap pemeriksaan di baris 5. */
function greedy(s, f) {
  const log = []
  const nn = s.length
  const A = [1]
  let k = 1
  for (let m = 2; m <= nn; m++) {
    const ok = s[m - 1] >= f[k - 1]
    log.push({ m, sm: s[m - 1], k, fk: f[k - 1], ok, A: ok ? [...A, m] : [...A] })
    if (ok) { A.push(m); k = m }
  }
  return { A, log }
}

const lines = md.split('\n')
/** Membaca tabel aktivitas ($s_i$, $f_i$, $d_i$): kembalikan daftar tabel {s, f, d, bold}. */
function activityTables() {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('| $s_i$ |')) continue
    const cells = (l) => l.split('|').slice(2, -1).map((c) => c.trim())
    const sRow = cells(lines[i])
    const fRow = cells(lines[i + 1])
    const dRow = lines[i + 2]?.startsWith('| $d_i$ |') ? cells(lines[i + 2]) : null
    const num = (c) => Number(c.replace(/\*/g, ''))
    out.push({
      s: sRow.map(num),
      f: fRow.map(num),
      d: dRow?.map(num) ?? null,
      bold: sRow.map((c, k) => (c.startsWith('**') ? k + 1 : 0)).filter(Boolean),
      boldF: fRow.map((c, k) => (c.startsWith('**') ? k + 1 : 0)).filter(Boolean),
    })
  }
  return out
}

const quizzes = segs.filter((x) => x.type === 'quiz')
const right = (qi, qn) => quizzes[qi].questions[qn].options.find((o) => o.correct).text
const pairs = (s, f) => s.map((v, i) => `${v},${f[i]}`).sort()

// ---------------------------------------------------------------- tes
test('materi 10.1 bersih dari error dan saran', () => {
  assert.equal(meta.hasText, true)
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 10.1 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'reveal', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(segs.filter((x) => x.type === 'steps').map((x) => x.items.length), [3, 7], 'tiga contoh pemilihan, arti tiap langkah')
  assert.equal(segs.filter((x) => x.type === 'reveal').length, 2, 'jawaban latihan a dan b')
  assert.deepEqual(quizzes.map((q) => q.questions.length), [2, 3, 2, 3, 3, 2], 'kuis di bagian A sampai F')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## H\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 10.1', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'activitySelection' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Algoritma Greedy',
    'B. An Activity-Selection Problem',
    'C. Memilih Secara Manual',
    'D. Solusi Greedy',
    'E. Contoh Penelusuran',
    'F. Latihan: Urutan Selain Finish Time',
    'G. Mencoba Visualisasi',
    'Visualisasi',
    'H. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), ['Definisi', 'Contoh Himpunan Aktivitas', 'Pseudocode', 'Waktu Eksekusi', 'Peraga: Penelusuran GREEDY-ACTIVITY-SELECTOR'])
})

test('tabel contoh sama dengan data di dokumen dan terurut menurut finish time', () => {
  const [tab] = activityTables()
  assert.deepEqual(tab.s, S)
  assert.deepEqual(tab.f, F)
  assert.deepEqual(F, [...F].sort((a, b) => a - b))
  assert.ok(S.every((s, i) => s >= 0 && s < F[i]), '0 ≤ s_i < f_i')
})

test('tiga contoh pemilihan manual: kompatibel, ukuran benar, dan yang dicetak tebal sama dengan subset di teks', () => {
  const tabs = activityTables().slice(1, 4)
  const expected = [[3, 7, 11], [1, 4, 8, 11], [2, 4, 8, 11]]
  tabs.forEach((t, k) => {
    assert.deepEqual(t.s, S)
    assert.deepEqual(t.f, F)
    assert.deepEqual(t.bold, expected[k])
    assert.deepEqual(t.boldF, expected[k])
    const idx = expected[k].map((x) => x - 1)
    for (let a = 0; a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) assert.ok(compatible(S, F, idx[a], idx[b]), `${expected[k]}`)
    const tok = (x) => (x > 9 ? `a_{${x}}` : `a_${x}`)
    assert.ok(md.includes(`$\\{${expected[k].map(tok).join(', ')}\\}$`), `subset ${expected[k]} tertulis`)
  })
  assert.deepEqual(expected.map((e) => e.length), [3, 4, 4])
})

test('brute force: ukuran maksimum 4 dan tepat 4 subset berukuran 4', () => {
  const { best, all } = bruteForce(S, F)
  assert.equal(best, 4)
  assert.equal(all.length, 4)
  assert.ok(all.some((x) => x.join() === '1,4,8,11'))
  assert.ok(all.some((x) => x.join() === '2,4,8,11'))
  assert.equal(2 ** n, 2048)
  assert.equal(right(2, 1), '4')
  assert.equal(right(2, 0), '3')
})

test('pemeriksaan kompatibel pada tabel pasangan benar', () => {
  const rows = lines.filter((l) => /^\| \$a_\d\$ dan \$a_\d\$ \|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  assert.equal(rows.length, 3)
  const expect = [[1, 4, true], [1, 2, false], [3, 7, true]]
  rows.forEach((r, k) => {
    const [i, j, ok] = expect[k]
    assert.ok(r[1].includes(`$[${S[i - 1]}, ${F[i - 1]})$ dan $[${S[j - 1]}, ${F[j - 1]})$`), `selang pasangan ${i},${j}`)
    assert.equal(compatible(S, F, i - 1, j - 1), ok, `pasangan ${i},${j}`)
    assert.equal(r[3].startsWith('Kompatibel'), ok)
  })
  assert.equal(right(1, 0), 'Ya, karena $s_7 \\geq f_3$')
  assert.equal(right(1, 1), 'Tidak, karena kedua selang tumpang tindih')
  assert.equal(compatible(S, F, 2, 6), true)
  assert.equal(compatible(S, F, 0, 1), false)
})

test('pseudocode GREEDY-ACTIVITY-SELECTOR (8 baris), tanpa nomor tulisan tangan', () => {
  const blocks = [...md.matchAll(/```pseudocode\n([\s\S]*?)```/g)].map((m) => m[1].trimEnd().split('\n'))
  assert.equal(blocks.length, 1)
  assert.deepEqual(blocks[0], ['n = s.length', 'A = {a_1}', 'k = 1', 'for m = 2 to n', '    if s[m] >= f[k]', '        A = A ∪ {a_m}', '        k = m', 'return A'])
  assert.deepEqual(segs.filter((x) => x.type === 'steps')[1].items.map((i) => i.title), [
    'Langkah 1: banyak aktivitas',
    'Langkah 2: aktivitas pertama',
    'Langkah 3: penanda aktivitas terakhir',
    'Langkah 4: perulangan',
    'Langkah 5: cek kompatibel',
    'Langkah 6 dan 7: memilih a_m',
    'Langkah 8: hasil',
  ])
})

test('tabel penelusuran sama dengan eksekusi pseudocode apa adanya, sel demi sel', () => {
  const { A, log } = greedy(S, F)
  assert.deepEqual(A, [1, 4, 8, 11])
  assert.equal(log.length, 10)
  const rows = lines.filter((l) => /^\| \d+ \| \d+ \| \$s\[/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  assert.equal(rows.length, log.length)
  log.forEach((e, k) => {
    assert.equal(rows[k][0], String(k + 1), 'nomor loop')
    assert.equal(rows[k][1], String(e.m))
    assert.equal(rows[k][2], `$s[${e.m}] = ${e.sm}$, $f[${e.k}] = ${e.fk}$`)
    assert.equal(rows[k][3], e.ok ? 'True' : 'False')
    if (e.ok) assert.equal(rows[k][4], `$A = \\{${e.A.map((x) => `a_{${x}}`).join(', ')}\\}$, $k = ${e.m}$`)
    else assert.match(rows[k][4], /^tidak berubah \(\$k = \d+\$\)$/)
  })
  // salah ketik dokumen (f[4] = 4 pada loop 7) diperbaiki menjadi f[4] = 7
  assert.equal(F[3], 7)
  assert.ok(!md.includes('$f[4] = 4$'))
  assert.ok(md.includes('Langkah 4 sampai 7 adalah badan perulangan'))
  assert.equal(n - 1, 10, 'perulangan berjalan n - 1 kali')
  assert.ok(md.includes('Perulangan di langkah 4 berjalan $n - 1$ kali'))
  // kuis E
  assert.deepEqual([log[2].sm, log[2].fk, log[2].ok], [5, 4, true])
  assert.deepEqual([log[5].m, log[5].sm, log[5].fk, log[5].ok], [7, 6, 7, false])
})

test('latihan: urutan start time memberi 3 (tidak optimal), urutan durasi memberi 4 tetapi tidak dijamin', () => {
  const tabs = activityTables()
  const [, , , , ta, tb, tc] = tabs
  // tabel a: permutasi dari data contoh, terurut naik menurut start time
  assert.deepEqual(pairs(ta.s, ta.f), pairs(S, F))
  assert.deepEqual(ta.s, [...ta.s].sort((x, y) => x - y))
  assert.deepEqual(greedy(ta.s, ta.f).A, [1, 8, 11])
  assert.ok(md.includes('$A = \\{a_1, a_8, a_{11}\\}$'))
  assert.ok(!md.includes('a_1,,'), 'koma ganda di dokumen dirapikan')
  // tabel b: permutasi, durasi di tabel sesuai f - s dan terurut naik
  assert.deepEqual(pairs(tb.s, tb.f), pairs(S, F))
  assert.deepEqual(tb.d, tb.f.map((v, i) => v - tb.s[i]))
  assert.deepEqual(tb.d, [...tb.d].sort((x, y) => x - y))
  assert.deepEqual(greedy(tb.s, tb.f).A, [1, 2, 4, 8])
  assert.ok(md.includes('$A = \\{a_1, a_2, a_4, a_8\\}$'))
  // contoh tandingan: urut durasi, greedy hanya 1 padahal maksimum 2
  assert.deepEqual(tc.d, tc.f.map((v, i) => v - tc.s[i]))
  assert.deepEqual(tc.d, [...tc.d].sort((x, y) => x - y))
  assert.equal(greedy(tc.s, tc.f).A.length, 1)
  assert.equal(bruteForce(tc.s, tc.f).best, 2)
  assert.ok(compatible(tc.s, tc.f, 1, 2), 'a_2 dan a_3 hanya bersentuhan')
  // kuis F
  assert.equal(right(5, 0), '3, dan hasilnya tidak optimal')
  // greedy menurut finish time optimal pada data acak (pembanding brute force)
  let seed = 7
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  for (let t = 0; t < 200; t++) {
    const len = 1 + Math.floor(rnd() * 8)
    const s = Array.from({ length: len }, () => Math.floor(rnd() * 15))
    const f = s.map((v) => v + 1 + Math.floor(rnd() * 8))
    const order = s.map((_, i) => i).sort((a, b) => f[a] - f[b])
    const ss = order.map((i) => s[i])
    const ff = order.map((i) => f[i])
    assert.equal(greedy(ss, ff).A.length, bruteForce(s, f).best)
  }
})

test('teks selaras dengan soal challenge dan visualizer', () => {
  assert.equal(meta.visualizer, 'activitySelection')
  assert.deepEqual(challenge.testCases[0], { input: [S, F], expected: 4 })
  assert.deepEqual(activitySelection(S, F).map((i) => i + 1), [1, 4, 8, 11])
  const registry = readFileSync(join(root, 'src/algorithms/registry.js'), 'utf8')
  assert.ok(registry.includes('initialInput: { start: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], finish: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] }'), 'isian awal visualizer sama dengan tabel contoh')
  assert.ok(md.includes('Jumlah aktivitas 1 sampai 12, waktu 0 sampai 30'))
  const code = readFileSync(join(root, 'src/algorithms/activitySelection.js'), 'utf8')
  assert.ok(code.includes('let akhir = -Infinity') && code.includes('const pilih = []'), 'nama variabel yang disebut di teks ada di kode visualizer')
  // visualizer mengurutkan lebih dulu menurut finish time: data terurut start time tetap menghasilkan 4
  const ta = activityTables()[4]
  assert.equal(activitySelection(ta.s, ta.f).length, 4)
})

test('peraga ::trace greedy-activity-selector: ada di bagian F, pseudocode dan angka di teks sama dengan peraga', () => {
  const def = traces['greedy-activity-selector']
  const types = segs.map((x) => x.type)
  assert.equal(segs.filter((x) => x.type === 'trace').length, 1)
  const trace = segs.find((x) => x.type === 'trace')
  assert.equal(trace.id, 'greedy-activity-selector')
  // peraga di bagian F, sesudah contoh tandingan dan sebelum kuis F
  const iTrace = types.indexOf('trace')
  assert.ok(segs[iTrace - 1].text.includes('Hasil optimal pada b **kebetulan**'), 'sesudah contoh tandingan')
  assert.match(segs[iTrace - 1].text, /^### Peraga: Penelusuran GREEDY-ACTIVITY-SELECTOR$/m)
  assert.equal(segs[iTrace + 1].type, 'quiz')
  // pseudocode peraga sama persis dengan blok pseudocode di materi
  const block = [...md.matchAll(/```pseudocode\n([\s\S]*?)```/g)][0][1].trimEnd()
  assert.equal(def.code, block)
  // isian awal = tabel contoh, dan angka yang disebut di teks cocok dengan hasil peraga
  assert.deepEqual(def.inputs.map((i) => i.value), [S.join(', '), F.join(', ')])
  const results = def.presets.map((p) => {
    const r = runTrace(def, p.values)
    return [r.steps.length, r.steps.at(-1).vars.find((v) => v.name === 'A').value]
  })
  assert.deepEqual(results, [[31, '{a1, a4, a8, a11}'], [29, '{a1, a8, a11}'], [31, '{a1, a2, a4, a8}'], [9, '{a1}']])
  assert.ok(md.includes('(31 langkah, hasil $\\{a_1, a_4, a_8, a_{11}\\}$)'))
  assert.ok(md.includes('latihan a (urut start time, hasil 3 aktivitas)'))
  assert.ok(md.includes('latihan b (urut durasi, hasil 4 aktivitas)'))
  assert.ok(md.includes('contoh tandingan tiga aktivitas (hasil hanya 1)'))
  assert.ok(md.includes('Peraga menerima 1 sampai 12 aktivitas dan waktu 0 sampai 30'))
  // data latihan pada tombol contoh sama dengan tabel latihan di teks
  const [, , , , ta, tb, tc] = activityTables()
  assert.equal(def.presets[1].values.s, ta.s.join(', '))
  assert.equal(def.presets[1].values.f, ta.f.join(', '))
  assert.equal(def.presets[2].values.s, tb.s.join(', '))
  assert.equal(def.presets[2].values.f, tb.f.join(', '))
  assert.equal(def.presets[3].values.s, tc.s.join(', '))
  assert.equal(def.presets[3].values.f, tc.f.join(', '))
})
