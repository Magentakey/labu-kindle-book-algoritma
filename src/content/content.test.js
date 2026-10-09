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

// Jawaban acuan hanya ada di tes ini (bukan di bundle), untuk membuktikan test case benar dan bisa dilulusi.
const referenceSolutions = {
  'insertion-sort': `function solve(arr) {
    const a = [...arr]
    for (let i = 1; i < a.length; i++) {
      const key = a[i]
      let j = i - 1
      while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j-- }
      a[j + 1] = key
    }
    return a
  }`,
}

test('setiap challenge: jawaban acuan lulus semua, kode awal tidak lulus', () => {
  const dir = join(root, 'src/content/challenges')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const id = file.replace(/\.json$/, '')
    const c = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    assert.ok(referenceSolutions[id], `${file}: tambahkan jawaban acuan di content.test.js`)

    const ref = runTests(referenceSolutions[id], c.testCases)
    assert.equal(ref.status, 'done', `${file}: jawaban acuan error`)
    assert.deepEqual(ref.results.filter((r) => !r.pass).map((r) => r.index), [], `${file}: jawaban acuan gagal di test case ini`)

    const starter = runTests(c.starterCode, c.testCases)
    assert.equal(starter.status, 'done')
    assert.ok(starter.results.some((r) => !r.pass), `${file}: kode awal tidak boleh sudah lulus semua`)
  }
})
