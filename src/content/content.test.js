import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { auditContent } from '../../scripts/auditContent.js'
import { checkMarkdown } from '../lib/checkMarkdown.js'

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
