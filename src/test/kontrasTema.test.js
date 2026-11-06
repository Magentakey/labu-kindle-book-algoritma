// Penjaga kontras antar tema: warna tetap (text-white, text-black) tidak boleh dipasangkan dengan latar token yang berbalik di mode gelap
// (bg-ink, bg-heading, bg-page, bg-surface, bg-card, bg-panel). Contoh kasus: label busur pohon Huffman memakai bg-ink + text-white, sehingga
// angkanya hilang di mode gelap (ink menjadi terang). Pakai pasangan token yang berbalik, mis. bg-ink + text-page.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath (bukan URL.pathname) agar jalur dengan spasi atau tanda kurung, mis. "semester 5/Interaksi (IF A)", tidak ter-encode (%20)
const akar = fileURLToPath(new URL('..', import.meta.url))
const berkas = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? berkas(p) : /\.(jsx|js)$/.test(n) && !/\.test\.js$/.test(n) ? [p] : []
})

test('tidak ada warna teks tetap (text-white/text-black) pada latar token yang berbalik di mode gelap', () => {
  const buruk = []
  for (const f of berkas(akar)) {
    readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
      if (/\btext-(white|black)\b/.test(l) && /\bbg-(ink|heading|page|surface|card|panel)\b/.test(l)) buruk.push(`${f.slice(akar.length)}:${i + 1}`)
    })
  }
  assert.deepEqual(buruk, [])
})
