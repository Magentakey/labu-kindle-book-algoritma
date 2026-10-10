// Tata letak pohon/hutan. Fungsi murni tanpa React, supaya bisa dites dengan `node --test`.

export const UNIT = 64 // lebar satu "slot daun" (px)
export const NODE_H = 44
export const LEVEL_H = 86 // jarak vertikal antar level (termasuk teks kecil di bawah simpul)
export const PAD = 16

/**
 * Bentuk simpul pada view pohon.
 * @typedef {Object} TreeNode
 * @property {string} id
 * @property {string|null} parent          id induk; null = akar
 * @property {'l'|'r'} [side]              posisi anak pada pohon biner (menjaga kiri/kanan walau anak tunggal)
 * @property {string} label                teks utama di dalam simpul
 * @property {string} [sub]                teks kecil di bawah simpul
 * @property {string} [edge]               teks pada sisi menuju induk (misalnya 0/1 pada Huffman)
 * @property {string} [mark]               kunci pada TREE_STATUS
 * @property {boolean} [hidden]            ikut dihitung tata letaknya, tetapi tidak digambar
 */

/**
 * Menghitung posisi tiap simpul. Daun menempati slot berurutan dari kiri, induk berada di tengah anak-anaknya.
 * Urutan anak = urutan kemunculan di array `nodes`; akar-akar diletakkan berdampingan (hutan).
 * @param {TreeNode[]} nodes
 * @param {{ rootGap?: number }} [options]
 * @returns {{ pos: Record<string, { x: number, depth: number }>, slots: number, maxDepth: number }}
 */
export function layoutForest(nodes, { rootGap = 0.5 } = {}) {
  const kids = new Map()
  const roots = []
  for (const n of nodes) {
    if (n.parent == null) roots.push(n)
    else {
      if (!kids.has(n.parent)) kids.set(n.parent, [])
      kids.get(n.parent).push(n)
    }
  }

  /** @type {Record<string, { x: number, depth: number }>} */
  const pos = {}
  let slot = 0
  let maxDepth = 0

  function place(n, depth) {
    maxDepth = Math.max(maxDepth, depth)
    const children = kids.get(n.id) ?? []
    let x
    if (children.length === 0) {
      x = slot + 0.5
      slot += 1
    } else if (children.length === 1 && children[0].side) {
      // Anak tunggal pada pohon biner: sisakan satu slot kosong di sisi lainnya.
      const side = children[0].side
      if (side === 'r') slot += 1
      const cx = place(children[0], depth + 1)
      if (side === 'l') slot += 1
      x = side === 'l' ? cx + 0.5 : cx - 0.5
    } else {
      const xs = children.map((c) => place(c, depth + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
    }
    pos[n.id] = { x, depth }
    return x
  }

  roots.forEach((r, i) => {
    if (i > 0) slot += rootGap
    place(r, 0)
  })
  return { pos, slots: slot, maxDepth }
}

/** Lebar simpul (px). Label pendek = lingkaran seperti pada gambar contoh; label panjang = kapsul. */
export function nodeWidth(label) {
  const text = String(label ?? '')
  if (text.length <= 3 && !text.includes(' ')) return NODE_H
  return Math.min(300, Math.round(text.length * 8.5 + 28))
}

/**
 * Posisi dalam piksel untuk simpul yang tidak disembunyikan, plus ukuran kanvas.
 * @param {TreeNode[]} nodes
 * @returns {{ items: Array<TreeNode & { left: number, top: number, width: number, cx: number }>, width: number, height: number }}
 */
export function layoutPixels(nodes) {
  const { pos, maxDepth } = layoutForest(nodes)
  // Ukuran kanvas dihitung dari SEMUA simpul (termasuk yang hidden) agar tidak berubah saat pohon dibuka bertahap.
  const raw = nodes
    .filter((n) => pos[n.id])
    .map((n) => {
      const width = nodeWidth(n.label)
      const cx = pos[n.id].x * UNIT
      return { ...n, width, cx, top: PAD + pos[n.id].depth * LEVEL_H }
    })
  const minLeft = raw.length ? Math.min(...raw.map((n) => n.cx - n.width / 2)) : 0
  const shift = PAD - Math.min(minLeft, PAD) // geser ke kanan bila ada simpul lebar yang keluar dari tepi
  const all = raw.map((n) => ({ ...n, cx: n.cx + shift, left: n.cx + shift - n.width / 2 }))
  const right = all.length ? Math.max(...all.map((n) => n.left + n.width)) : 0
  return {
    items: all.filter((n) => !n.hidden),
    width: Math.round(right + PAD),
    height: PAD * 2 + maxDepth * LEVEL_H + NODE_H + 20,
  }
}

/**
 * Mengubah daftar datar menjadi bentuk bersarang (untuk tampilan teks yang bisa dibaca pembaca layar).
 * @param {TreeNode[]} nodes
 * @returns {Array<{ node: TreeNode, children: any[] }>}
 */
export function buildOutline(nodes) {
  const visible = nodes.filter((n) => !n.hidden)
  const byParent = new Map()
  for (const n of visible) {
    const key = n.parent ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(n)
  }
  const make = (n) => ({ node: n, children: (byParent.get(n.id) ?? []).map(make) })
  return (byParent.get(null) ?? []).map(make)
}
