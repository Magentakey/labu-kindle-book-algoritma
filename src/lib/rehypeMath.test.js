import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeMath, { renderMath } from './rehypeMath.js'
import { hasMath } from './hasMath.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const html = async (md) =>
  String(await unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkRehype).use(rehypeMath).use(rehypeStringify).process(md))

test('hasMath hanya benar bila ada tanda dolar', () => {
  assert.equal(hasMath('Θ(n²) saja'), false)
  assert.equal(hasMath('nilai $n^2$'), true)
  assert.equal(hasMath(undefined), false)
})

test('rumus dalam kalimat: SVG disembunyikan, pembungkus punya nama bacaan', async () => {
  const out = await html('Kompleksitas $T(n) = \\Theta(n^2)$ untuk n besar.')
  assert.match(out, /<span class="math-inline" role="math" aria-label="T \( n \) sama dengan Theta \( n kuadrat \)">/)
  assert.match(out, /<svg[^>]*>/)
  assert.match(out, /aria-hidden="true"/, 'SVG disembunyikan dari pembaca layar')
  assert.doesNotMatch(out, /<math|<script|href=|xlink:href/i)
})

test('bacaan: pecahan, pangkat, indeks bawah, dan simbol', () => {
  const read = (tex) => renderMath(tex, false).properties.ariaLabel
  assert.equal(read('\\frac{3}{4}'), '3 per 4')
  assert.equal(read('\\frac{8 - 6 + 1}{4}'), 'pecahan 8 kurang 6 tambah 1 per 4, akhir pecahan')
  assert.equal(read('n_0'), 'n sub 0')
  assert.equal(read('n^3'), 'n kubik')
  assert.equal(read('2^n'), '2 pangkat n')
  assert.equal(read('c_1 \\le f(n)'), 'c sub 1 kurang dari atau sama dengan f ( n )')
  assert.equal(read('n \\to \\infty'), 'n menuju tak hingga')
  assert.equal(read('\\text{untuk semua } n \\ge n_0'), 'untuk semua n lebih dari atau sama dengan n sub 0')
})

test('rumus tampil ($$ pada baris sendiri) bisa difokus dan digeser dengan keyboard', async () => {
  const out = await html('Rumus:\n\n$$\n\\frac{a}{b}\n$$\n')
  assert.match(out, /<span class="math-display" role="group" tabindex="0" aria-label="Rumus, bisa digeser ke samping: a per b">/)
  assert.doesNotMatch(out, /<pre/)
})

test('rumus tidak dirender di dalam blok kode', async () => {
  const out = await html('```text\n$x^2$\n```\n\nDan `$y$` juga.')
  assert.doesNotMatch(out, /<svg/)
  assert.match(out, /\$x\^2\$/)
})

test('rumus yang salah tampil sebagai catatan, tidak merusak halaman', () => {
  const node = renderMath('\\frac{', false)
  assert.equal(node.tagName, 'code')
  assert.deepEqual(node.properties.className, ['math-error'])
  assert.match(node.children[0].value, /Rumus tidak valid/)
})

test('perintah TeX yang bisa menyisipkan tautan, gaya, atau ekstensi ditolak', () => {
  for (const tex of ['\\href{javascript:alert(1)}{x}', '\\unicode{x41}', '\\require{html}x', '\\style{color:red}{x}', '\\class{a}{x}']) {
    const node = renderMath(tex, false)
    assert.deepEqual(node.properties.className, ['math-error'], tex)
    assert.equal(node.tagName, 'code', tex)
    assert.equal(node.properties.href, undefined, tex)
  }
})

test('semua rumus di semua teks materi valid dan tanda dolar berpasangan', async () => {
  const dir = join(root, 'src/content/materials')
  let total = 0
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const md = readFileSync(join(dir, f), 'utf8')
    if (!hasMath(md)) continue
    const out = await html(md)
    const bad = [...out.matchAll(/<code class="math-error">(.*?)<\/code>/g)].map((m) => m[1])
    assert.deepEqual(bad, [], `${f}: ada rumus tidak valid`)
    total += (out.match(/class="math-(inline|display)"/g) ?? []).length
  }
  assert.ok(total > 0, 'minimal satu materi sudah memakai rumus')
})

test('paket TeX (aligned, dll.) di-import eksplisit agar tidak dibuang bundler', () => {
  const src = readFileSync(join(root, 'src/lib/rehypeMath.js'), 'utf8')
  assert.match(src, /import 'mathjax-full\/js\/input\/tex\/ams\/AmsConfiguration\.js'/)
  assert.equal(renderMath('\\begin{aligned} a &= 1 \\\\ b &= 2 \\end{aligned}', true).properties.className[0], 'math-display')
})
