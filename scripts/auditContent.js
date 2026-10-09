import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { checkMarkdown } from '../src/lib/checkMarkdown.js'
import { scanLines } from '../src/lib/markdownLines.js'
import { MARKERS } from '../src/lib/splitContent.js'

/**
 * Memeriksa semua src/content/materials/*.md terhadap aturan penulisan dan materials.json.
 * @param {string} root  folder akar project
 * @returns {{ files: Array<{ file: string, id: string, issues: import('../src/lib/checkMarkdown.js').Issue[] }>, missing: string[] }}
 */
export function auditContent(root) {
  const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
  const dir = join(root, 'src/content/materials')
  const names = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : []
  const byId = new Map(materials.map((m) => [m.id, m]))

  const files = names.map((file) => {
    const id = basename(file, '.md')
    const md = readFileSync(join(dir, file), 'utf8')
    const issues = checkMarkdown(md)
    const m = byId.get(id)

    if (!m) {
      issues.push({ line: 1, severity: 'error', rule: 'unknown-id', message: `Nama file "${file}" tidak cocok dengan id mana pun di materials.json.` })
    } else {
      if (!m.hasText) {
        issues.push({ line: 1, severity: 'warning', rule: 'hastext-false', message: 'File ada, tetapi "hasText" di materials.json masih false. Ubah ke true agar kartu di Home tidak bertanda "Segera hadir".' })
      }
      // Penanda untuk fitur yang tidak dimiliki materi ini tidak akan tampil.
      const { lines } = scanLines(md)
      for (const l of lines) {
        const type = !l.inFence ? MARKERS[l.text.trim()] : undefined
        if (type === 'visualizer' && !m.visualizer) {
          issues.push({ line: l.no, severity: 'error', rule: 'marker-no-feature', message: 'Materi ini tidak punya visualizer di materials.json, jadi penanda ::visualizer tidak berguna.' })
        }
        if (type === 'challenge' && !m.challenge) {
          issues.push({ line: l.no, severity: 'error', rule: 'marker-no-feature', message: 'Materi ini tidak punya challenge di materials.json, jadi penanda ::challenge tidak berguna.' })
        }
      }
    }
    return { file, id, issues: issues.sort((a, b) => a.line - b.line) }
  })

  const written = new Set(files.map((f) => f.id))
  const missing = materials.filter((m) => m.hasText && !written.has(m.id)).map((m) => m.id)
  return { files, missing }
}
