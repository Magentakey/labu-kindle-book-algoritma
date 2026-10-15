import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { splitContent } from './splitContent.js'
import { buildToc } from './tableOfContents.js'
import { SHOW_TRACES, hideTraces, scrubTraceMentions, stripTraceLeadIn, stripTraceTail } from './traceVisibility.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
const load = (m) => splitContent(readFileSync(join(root, 'src/content/materials', `${m.id}.md`), 'utf8'), { hasVisualizer: Boolean(m.visualizer), hasChallenge: Boolean(m.challenge) })

const count = (segs, type) => segs.reduce((n, s) => n + (s.type === type ? 1 : 0) + (s.items ?? []).reduce((k, it) => k + count(it.segments, type), 0), 0)
const texts = (segs) => segs.flatMap((s) => [s.text ?? '', ...(s.items ?? []).flatMap((it) => texts(it.segments))])

test('peraga disembunyikan saat ini (saklar SHOW_TRACES = false)', () => {
  assert.equal(SHOW_TRACES, false)
})

test('stripTraceLeadIn: memotong dari subbagian "### Peraga", atau paragraf pengantar terakhir', () => {
  assert.equal(stripTraceLeadIn('Teks awal.\n\n### Peraga: Uji\n\nPeraga ini menjalankan X.\n\n- butir'), 'Teks awal.')
  assert.equal(stripTraceLeadIn('Teks awal.\n\nCoba jalankan sendiri:'), 'Teks awal.')
  assert.equal(stripTraceLeadIn('Teks awal.\n\n```text\nkode\n```'), 'Teks awal.\n\n```text\nkode\n```', 'blok kode tidak dibuang')
  assert.equal(stripTraceLeadIn('Teks awal.\n\nParagraf analisis biasa.'), 'Teks awal.\n\nParagraf analisis biasa.')
})

test('scrubTraceMentions: membuang kalimat peraga, mempertahankan sisanya, dan menyederhanakan frasa', () => {
  assert.equal(scrubTraceMentions('Satu. Gunakan peraga di bagian D. Tiga.'), 'Satu. Tiga.')
  assert.equal(scrubTraceMentions('- Visualisasi ini bagus. Untuk menelusuri, gunakan peraga di akhir bagian C.'), '- Visualisasi ini bagus.')
  assert.equal(scrubTraceMentions('Hasilnya 4, sama dengan angka di kolom langkah 4 pada peraga. Jadi benar.'), 'Hasilnya 4. Jadi benar.')
  assert.equal(scrubTraceMentions('- indeks mulai 0, sedangkan pseudocode dan peraga di atas mulai 1.'), '- indeks mulai 0, sedangkan pseudocode mulai 1.')
  assert.equal(scrubTraceMentions('Baris A\n\nHanya peraga di sini.\n\nBaris B'), 'Baris A\n\n\nBaris B')
})

test('stripTraceTail: membuang pengamatan peraga setelah ::trace, tetapi bukan analisis atau heading', () => {
  assert.equal(stripTraceTail('Beberapa hal yang bisa diamati:\n\n- a\n- b\n\nContoh menghasilkan 240 langkah.\n\n## E. Judul'), '## E. Judul')
  assert.equal(stripTraceTail('## E. Judul\n\nIsi'), '## E. Judul\n\nIsi')
  assert.equal(stripTraceTail('Terlihat bahwa langkah 4 terbaca 1 kali.'), 'Terlihat bahwa langkah 4 terbaca 1 kali.')
})

test('semua materi: tidak ada ::trace tersisa, visualizer/kuis/soal challenge tetap sama, dan isi tidak jadi kosong', () => {
  let withTraces = 0
  for (const m of materials) {
    const segs = load(m)
    const hidden = hideTraces(segs)
    const before = count(segs, 'trace')
    assert.equal(count(hidden, 'trace'), 0, `${m.id}: masih ada trace`)
    if (before > 0) withTraces++
    for (const t of ['visualizer', 'challenge', 'quiz', 'steps', 'reveal', 'tabs', 'growth', 'ratio', 'bound', 'limit', 'master']) {
      assert.equal(count(hidden, t), count(segs, t), `${m.id}: jumlah ${t} berubah`)
    }
    assert.ok(hidden.length > 0)
    // tidak ada subbagian "Peraga" tersisa di daftar isi
    const toc = buildToc(hidden, { visualizers: [].concat(m.visualizer ?? []).map((id) => ({ id })) })
    assert.deepEqual(toc.filter((i) => /^Peraga/.test(i.text)), [], `${m.id}: daftar isi masih memuat peraga`)
    if (before > 0) {
      const all = texts(hidden).join('\n')
      assert.doesNotMatch(all, /^#{2,4}\s+Peraga/m, `${m.id}: heading peraga`)
      assert.doesNotMatch(all, /peraga/i, `${m.id}: masih menyebut peraga`)
    }
  }
  assert.equal(withTraces, 12, `materi yang punya peraga: ${withTraces}`)
})

test('materi tanpa ::trace tidak diubah sama sekali (komponen lain seperti pemeriksa master tetap utuh)', () => {
  const m = materials.find((x) => x.id === 'recurrence-master')
  const segs = load(m)
  assert.equal(count(segs, 'trace'), 0)
  assert.deepEqual(hideTraces(segs), segs)
})

test('isi materi dan peraga tetap ada di sumber, jadi bisa dimunculkan kembali', () => {
  for (const id of ['bellman-ford', 'dijkstra', 'mst']) {
    const m = materials.find((x) => x.id === id)
    assert.ok(count(load(m), 'trace') >= 1, `${id}: ::trace masih di file materi`)
  }
})
