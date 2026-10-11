import { headingIds } from './tableOfContents.js'

// Plugin rehype: memberi atribut id pada judul h1-h3 di hasil Markdown, memakai fungsi id yang sama
// dengan daftar isi (headingIds), sehingga tautan di sidebar selalu menunjuk judul yang benar.

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''))

/** @param {{ prefix: string }} options */
export default function rehypeHeadingIds({ prefix }) {
  return (tree) => {
    const found = []
    const walk = (node) => {
      if (node.type === 'element' && /^h[1-3]$/.test(node.tagName)) found.push(node)
      for (const child of node.children ?? []) walk(child)
    }
    walk(tree)
    const ids = headingIds(
      found.map((h) => textOf(h).trim()),
      prefix,
    )
    found.forEach((h, i) => {
      h.properties = { ...h.properties, id: ids[i] }
    })
  }
}
