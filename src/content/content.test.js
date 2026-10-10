import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { auditContent } from '../../scripts/auditContent.js'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { runTests } from '../lib/runTests.js'

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
