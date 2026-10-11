import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { auditContent } from '../../scripts/auditContent.js'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { runTests } from '../lib/runTests.js'
import { splitContent } from '../lib/splitContent.js'
import { runTrace, traces } from '../algorithms/traces.js'
import { existsSync } from 'node:fs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

test('semua file materi lolos aturan penulisan (tanpa error)', () => {
  const { files } = auditContent(root)
  const errors = files.flatMap((f) =>
    f.issues.filter((i) => i.severity === 'error').map((i) => `${f.file}:${i.line} ${i.message}`),
  )
  assert.deepEqual(errors, [], '\n' + errors.join('\n'))
})

test('template penulisan (docs/template-materi.md) sendiri bersih dari error dan saran', () => {
  const md = readFileSync(join(root, 'docs/template-materi.md'), 'utf8')
  assert.deepEqual(checkMarkdown(md), [])
})

test('id di materials.json unik', () => {
  const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
  const ids = materials.map((m) => m.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('semua file challenge punya format yang benar dan terhubung ke materials.json', () => {
  const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
  const used = new Set(materials.map((m) => m.challenge).filter(Boolean))
  const dir = join(root, 'src/content/challenges')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  assert.ok(files.length > 0, 'minimal satu file challenge')

  for (const file of files) {
    const c = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    const id = file.replace(/\.json$/, '')
    assert.equal(c.id, id, `${file}: id harus sama dengan nama file`)
    assert.ok(used.has(id), `${file}: id tidak dipakai di field "challenge" materials.json`)
    for (const key of ['title', 'description', 'starterCode']) {
      assert.equal(typeof c[key], 'string', `${file}: ${key} harus teks`)
      assert.ok(c[key].trim(), `${file}: ${key} tidak boleh kosong`)
    }
    assert.ok(Array.isArray(c.testCases) && c.testCases.length > 0, `${file}: testCases kosong`)
    for (const [i, tc] of c.testCases.entries()) {
      assert.ok(Array.isArray(tc.input), `${file}: testCases[${i}].input harus array argumen`)
      assert.ok('expected' in tc, `${file}: testCases[${i}] tidak punya expected`)
    }
    // Kode awal harus valid dan mendefinisikan solve().
    const solve = new Function(`${c.starterCode}\nreturn typeof solve === 'function' ? solve : null`)()
    assert.ok(solve, `${file}: starterCode harus mendefinisikan fungsi solve`)
  }
})

test('setiap challenge: jawaban contoh (solution) lulus semua test case, kode awal tidak', () => {
  const dir = join(root, 'src/content/challenges')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const c = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    assert.equal(typeof c.solution, 'string', `${file}: field "solution" (jawaban contoh) wajib ada`)
    assert.ok(c.solution.trim(), `${file}: solution tidak boleh kosong`)

    const ref = runTests(c.solution, c.testCases)
    assert.equal(ref.status, 'done', `${file}: jawaban contoh error: ${ref.message ?? ''}`)
    assert.deepEqual(ref.results.filter((r) => !r.pass).map((r) => r.index), [], `${file}: jawaban contoh gagal di test case ini`)

    const starter = runTests(c.starterCode, c.testCases)
    assert.equal(starter.status, 'done')
    assert.ok(starter.results.some((r) => !r.pass), `${file}: kode awal tidak boleh sudah lulus semua`)
  }
})

// Materi yang soalnya sengaja belum ada (ditampilkan "Segera hadir"). Hapus dari daftar ini saat file soalnya dibuat.
const COMING_SOON = []

test('materi tanpa file soal harus sengaja ditandai "segera hadir"', () => {
  const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
  const dir = join(root, 'src/content/challenges')
  const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')))
  const missing = materials.map((m) => m.challenge).filter((id) => id && !files.has(id))
  assert.deepEqual(missing.sort(), [...COMING_SOON].sort(), 'daftar materi tanpa soal harus sama dengan COMING_SOON')
})

test('soal challenge: input dan expected bisa disimpan di JSON dan setiap soal punya minimal 4 test case', () => {
  const dir = join(root, 'src/content/challenges')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const c = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    assert.ok(c.testCases.length >= 4, `${file}: minimal 4 test case (termasuk kasus tepi)`)
    const serialized = JSON.stringify(c.testCases)
    assert.ok(!serialized.includes('null'), `${file}: null di test case biasanya tanda Infinity/NaN yang gagal disimpan; pakai -1 atau nilai lain`)
  }
})

const materialFiles = () =>
  readdirSync(join(root, 'src/content/materials'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ file: f, md: readFileSync(join(root, 'src/content/materials', f), 'utf8') }))

test('gambar yang dirujuk materi 1 ada filenya di public/ (materi lain hanya diberi saran oleh check:content)', () => {
  const { md } = materialFiles().find((f) => f.file === 'algoritma-pemrograman.md')
  const paths = [...md.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)].map((m) => m[1])
  assert.ok(paths.length >= 1)
  for (const path of paths) assert.ok(existsSync(join(root, 'public', path)), `gambar ${path} tidak ditemukan di public/`)
})

test('materi 1 memakai semua jenis komponen interaktif dan semua peraga yang dirujuk ada', () => {
  const md = readFileSync(join(root, 'src/content/materials/algoritma-pemrograman.md'), 'utf8')
  const m = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((x) => x.id === 'algoritma-pemrograman')
  const segs = splitContent(md, { hasVisualizer: Boolean(m.visualizer), hasChallenge: Boolean(m.challenge) })
  const types = new Set(segs.map((s) => s.type))
  for (const t of ['steps', 'tabs', 'quiz', 'reveal', 'growth', 'trace']) {
    const inTabs = segs.filter((s) => s.type === 'tabs').flatMap((s) => s.items.flatMap((i) => i.segments.map((x) => x.type)))
    assert.ok(types.has(t) || inTabs.includes(t), `materi 1 belum memakai komponen "${t}"`)
  }
  assert.equal(segs.find((s) => s.type === 'steps').items.length, 6, 'enam karakteristik algoritma')
  const used = [...md.matchAll(/^::trace (\S+)$/gm)].map((m) => m[1])
  assert.deepEqual(used.sort(), ['bilangan-max', 'binary-search-iteratif', 'binary-search-rekursif', 'jumlah-n-bil'])
  assert.equal(segs.at(-1).type, 'challenge', 'soal challenge tetap paling akhir')
  const order = segs.map((x) => x.type)
  assert.ok(order.includes('visualizer'), 'visualizer binary search ditempatkan eksplisit di teks, bukan otomatis di akhir')
  assert.ok(order.indexOf('visualizer') < order.indexOf('challenge'), 'visualizer sebelum challenge')
  assert.match(segs[order.indexOf('visualizer') + 1].text, /^## F\. Latihan Binary Search/, 'teks sesudah penanda diawali judul ##')
})

test('tabel jawaban latihan binary search di materi 1 cocok dengan hasil peraga', () => {
  const md = readFileSync(join(root, 'src/content/materials/algoritma-pemrograman.md'), 'utf8')
  const rows = [...md.matchAll(/^\| (\d+) \| (\d+) \| (\d+|–) \| (\d+|–) \| ([^|]+) \| ([^|]+) \|$/gm)].map((m) => ({ p: +m[1], n: +m[2], mid: m[3], aMid: m[4] }))
  assert.equal(rows.length, 4)

  const def = traces['binary-search-iteratif']
  const r = runTrace(def, Object.fromEntries(def.inputs.map((i) => [i.key, i.value])))
  const A = [5, 8, 9, 10, 14, 20]
  const fromTrace = r.steps
    .filter((s) => s.line === 1)
    .map((s) => ({ p: +s.vars.find((v) => v.name === 'p').value, n: +s.vars.find((v) => v.name === 'n').value }))
  assert.deepEqual(rows.map(({ p, n }) => ({ p, n })), fromTrace, 'p dan n tiap pemeriksaan')
  for (const row of rows.filter((x) => x.mid !== '–')) {
    assert.equal(row.mid, String(Math.floor((row.p + row.n) / 2)))
    assert.equal(row.aMid, String(A[Number(row.mid) - 1]))
  }
  assert.match(r.steps.at(-1).note, /NIL/)
})

test('isian bawaan peraga binary search di materi sama dengan soal latihan (x = 12, A = 5, 8, 9, 10, 14, 20)', () => {
  for (const id of ['binary-search-iteratif', 'binary-search-rekursif']) {
    const vals = Object.fromEntries(traces[id].inputs.map((i) => [i.key, i.value]))
    assert.equal(vals.A, '5, 8, 9, 10, 14, 20')
    assert.equal(vals.x, '12')
  }
})
