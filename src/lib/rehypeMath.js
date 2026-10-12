import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
// Paket TeX harus di-import eksplisit: konfigurasinya mendaftar lewat efek samping, dan bundler membuangnya bila tidak.
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js'
import 'mathjax-full/js/input/tex/noerrors/NoErrorsConfiguration.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { STATE } from 'mathjax-full/js/core/MathItem.js'
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'

// Plugin rehype: mengubah hasil remark-math (<code class="language-math math-inline|math-display">)
// menjadi rumus MathJax. Tampilan berupa SVG (tanpa font eksternal, jadi jalan offline di PWA),
// SVG disembunyikan dari pembaca layar; sebagai gantinya pembungkus rumus diberi aria-label berbahasa Indonesia
// yang disusun dari struktur MathML (lihat speak). Label dipakai, bukan <math> tersembunyi, karena teks di dalam
// <math> tidak dihitung sebagai nama oleh banyak alat (mis. label radio kuis yang isinya hanya rumus), dan
// <math> yang disembunyikan secara visual ikut melebarkan halaman di layar sempit.

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const doc = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams', 'noerrors'], formatError: (_jax, err) => { throw err } }),
  OutputJax: new SVG({ fontCache: 'none' }),
})
const toMml = new SerializedMmlVisitor()

const OPERATORS = {
  '=': 'sama dengan', '+': 'tambah', '−': 'kurang', '-': 'kurang', '±': 'tambah kurang', '·': 'kali', '×': 'kali', '⋅': 'kali',
  '≤': 'kurang dari atau sama dengan', '≥': 'lebih dari atau sama dengan', '<': 'kurang dari', '>': 'lebih dari', '≠': 'tidak sama dengan',
  '≈': 'kira-kira', '∞': 'tak hingga', '…': 'dan seterusnya', '⋮': 'dan seterusnya', '∣': 'dengan', '|': 'dengan',
  '{': 'himpunan', '}': 'akhir himpunan', '∃': 'terdapat', '∀': 'untuk semua', '→': 'menuju', '∈': 'anggota', '/': 'bagi', ':': ':',
}
const LETTERS = { Θ: 'Theta', Ω: 'Omega', θ: 'theta', ω: 'omega', ε: 'epsilon', α: 'alfa', β: 'beta', Σ: 'sigma', π: 'pi', ℓ: 'l' }
const POWERS = { 2: 'kuadrat', 3: 'kubik' }

/** Bacaan bahasa Indonesia dari pohon MathML (hast). Tidak sempurna, tetapi cukup untuk rumus di materi ini. */
export function speak(node) {
  if (node.type === 'text') return node.value.trim()
  const kids = (node.children ?? []).filter((c) => c.type === 'element' || c.value?.trim())
  const part = (i) => speak(kids[i] ?? { type: 'text', value: '' })
  const all = (sep = ' ') => kids.map(speak).filter(Boolean).join(sep)
  switch (node.tagName) {
    case 'mo': {
      const t = textOf(node).trim()
      return OPERATORS[t] ?? (t === '(' || t === ')' ? t : LETTERS[t] ?? t)
    }
    case 'mi':
    case 'mn': {
      const t = textOf(node).trim()
      return LETTERS[t] ?? OPERATORS[t] ?? t
    }
    case 'mtext':
      return textOf(node).replace(/\s+/g, ' ').trim()
    case 'mfrac': {
      const [a, b] = [part(0), part(1)]
      return /\s/.test(a + b) ? `pecahan ${a} per ${b}, akhir pecahan` : `${a} per ${b}`
    }
    case 'msup': {
      const e = part(1)
      return `${part(0)} ${e === '2' || e === '3' ? POWERS[e] : `pangkat ${e}`}`
    }
    case 'msub':
      return `${part(0)} sub ${part(1)}`
    case 'msubsup':
      return `${part(0)} sub ${part(1)} pangkat ${part(2)}`
    case 'msqrt':
      return `akar ${all()}`
    case 'mtr':
      return all(', ')
    case 'mtable':
      return kids.map(speak).filter(Boolean).join('. ')
    case 'mspace':
      return ''
    default:
      return all()
  }
}

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''))
const hasClass = (node, name) => {
  const c = node.properties?.className
  return Array.isArray(c) ? c.includes(name) : typeof c === 'string' && c.split(/\s+/).includes(name)
}

/** Ubah satu rumus TeX menjadi node hast. Galat TeX tidak merusak halaman: tampil sebagai kode merah dengan pesannya. */
export function renderMath(tex, display) {
  try {
    const mml = toMml.visitTree(doc.convert(tex, { display, end: STATE.CONVERT }))
    const svg = adaptor.outerHTML(doc.convert(tex, { display }))
    const svgNode = fromHtmlIsomorphic(svg, { fragment: true }).children[0]
    const spoken = speak(fromHtmlIsomorphic(mml, { fragment: true }).children[0]).replace(/\s+/g, ' ').trim()
    svgNode.properties = { ...svgNode.properties, ariaHidden: 'true' }
    const wrapper = {
      type: 'element',
      tagName: 'span',
      properties: display
        ? { className: ['math-display'], role: 'group', tabIndex: 0, ariaLabel: `Rumus, bisa digeser ke samping: ${spoken}` }
        : { className: ['math-inline'], role: 'math', ariaLabel: spoken },
      children: [svgNode],
    }
    return wrapper
  } catch (err) {
    return {
      type: 'element',
      tagName: 'code',
      properties: { className: ['math-error'] },
      children: [{ type: 'text', value: `Rumus tidak valid (${String(err?.message ?? err).slice(0, 80)}): ${tex}` }],
    }
  }
}

export default function rehypeMath() {
  return (tree) => {
    const visit = (node) => {
      const kids = node.children
      if (!kids) return
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i]
        if (k.type !== 'element') continue
        const inline = k.tagName === 'code' && hasClass(k, 'math-inline')
        const display = k.tagName === 'code' && hasClass(k, 'math-display')
        // remark-math membungkus rumus tampil dalam <pre><code class="math-display">.
        if (k.tagName === 'pre' && k.children?.length === 1 && k.children[0].tagName === 'code' && hasClass(k.children[0], 'math-display')) {
          kids[i] = renderMath(textOf(k.children[0]), true)
          continue
        }
        if (inline || display) {
          kids[i] = renderMath(textOf(k), display)
          continue
        }
        visit(k)
      }
    }
    visit(tree)
  }
}
