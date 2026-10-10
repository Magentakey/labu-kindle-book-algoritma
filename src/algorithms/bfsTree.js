import { buildBinaryTree } from '../lib/binaryTree.js'

// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
export const bfsTreeCode = `function bfs(root) {
  const queue = [root]
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node.value)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return order
}`

const LINES = bfsTreeCode.split('\n').length

/**
 * @typedef {import('../lib/treeLayout.js').TreeNode} TreeNode
 * @typedef {Object} TreeStep
 * @property {number|null} line
 * @property {string} note
 * @property {{ nodes: TreeNode[], panels: any[], labels?: Record<string,string> }} view
 */

const LABELS = {
  normal: 'belum dimasukkan ke antrean',
  current: 'sedang diproses (baru keluar dari antrean)',
  queued: 'menunggu di antrean',
  visited: 'sudah dikunjungi dan anaknya sudah diproses',
}

/**
 * Menjalankan BFS (penelusuran per level) pada pohon biner dan merekam tiap langkah.
 * @param {Array<number|null>} tokens  pohon dalam urutan level, null = tidak ada anak
 * @returns {TreeStep[]}
 */
export function bfsTreeSteps(tokens) {
  const { nodes: tree } = buildBinaryTree(tokens)
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]))
  const state = Object.fromEntries(tree.map((n) => [n.id, 'normal']))
  const orderIdx = {}
  const queue = []
  const order = []
  const v = (id) => byId[id].value

  /** @type {TreeStep[]} */
  const steps = []
  const push = (line, note) =>
    steps.push({
      line,
      note,
      view: {
        labels: LABELS,
        nodes: tree.map((n) => ({
          id: n.id,
          parent: n.parent,
          side: n.side ?? undefined,
          label: String(n.value),
          sub: n.id in orderIdx ? `#${orderIdx[n.id]}` : '',
          mark: state[n.id],
        })),
        panels: [
          { type: 'list', title: 'Antrean (depan di kiri, belakang di kanan)', items: queue.map(v).map(String), empty: 'kosong' },
          { type: 'list', title: 'Urutan kunjungan', items: order.map(v).map(String), empty: 'belum ada' },
        ],
      },
    })

  if (tree.length === 0) return [{ line: 1, note: 'Pohon kosong.', view: { labels: LABELS, nodes: [], panels: [] } }]

  const q = () => `[${queue.map(v).join(', ')}]`
  queue.push('n0')
  state.n0 = 'queued'
  push(2, `Buat antrean berisi akar, yaitu ${v('n0')}. Antrean: ${q()}. Urutan kunjungan masih kosong.`)

  let current = null
  while (queue.length > 0) {
    if (current) state[current] = 'visited'
    const id = /** @type {string} */ (queue.shift())
    current = id
    state[id] = 'current'
    push(5, `Ambil simpul ${v(id)} dari depan antrean. Sisa antrean: ${q()}.`)

    order.push(id)
    orderIdx[id] = order.length
    push(6, `Kunjungi simpul ${v(id)}: masukkan ke urutan kunjungan sebagai yang ke-${order.length}.`)

    for (const [side, line, name] of [['left', 7, 'kiri'], ['right', 8, 'kanan']]) {
      const child = byId[id][side]
      if (child) {
        queue.push(child)
        state[child] = 'queued'
        push(line, `Simpul ${v(id)} punya anak ${name}, yaitu ${v(child)}. Masukkan ke belakang antrean. Antrean: ${q()}.`)
      } else {
        push(line, `Simpul ${v(id)} tidak punya anak ${name}, jadi tidak ada yang dimasukkan ke antrean.`)
      }
    }
  }
  if (current) state[current] = 'visited'
  push(4, 'Antrean kosong, jadi perulangan berhenti.')
  push(10, `Selesai. Urutan kunjungan BFS: ${order.map(v).join(', ')}.`)
  return steps
}

export const bfsTreeLines = LINES
