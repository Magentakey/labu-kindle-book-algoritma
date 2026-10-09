// Pemakaian: npm run check:content
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { auditContent } from './auditContent.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { files, missing } = auditContent(root)

let errors = 0
let warnings = 0
for (const f of files) {
  if (f.issues.length === 0) {
    console.log(`OK    ${f.file}`)
    continue
  }
  console.log(`\n${f.file}`)
  for (const i of f.issues) {
    if (i.severity === 'error') errors++
    else warnings++
    const tag = i.severity === 'error' ? 'ERROR  ' : 'SARAN  '
    console.log(`  ${tag} baris ${i.line}: ${i.message}  [${i.rule}]`)
  }
}
if (missing.length) {
  console.log(`\nBelum ada file .md untuk materi bertanda hasText=true: ${missing.join(', ')}`)
}
console.log(`\n${files.length} file diperiksa: ${errors} error, ${warnings} saran.`)
process.exit(errors > 0 ? 1 : 0)
