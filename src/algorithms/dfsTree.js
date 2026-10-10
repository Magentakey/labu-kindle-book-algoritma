import { buildBinaryTree } from '../lib/binaryTree.js'

export const dfsTreeCode = `function dfs(node, order = []) {
  if (node === null) return order
  order.push(node.value)
  dfs(node.left, order)
  dfs(node.right, order)
  return order
}`

export const dfsTreeLines = dfsTreeCode.split('\n').length

const LABELS = {
  normal: 'belum dipanggil',
  current: 'sedang diproses (pemanggilan paling baru)',
  waiting: 'sudah dikunjungi, menunggu anak-anaknya selesai',
  visited: 'selesai (sudah return)',
}

/**
 * Menjalankan DFS preorder (simpul, kiri, kanan) secara rekursif dan merekam tiap langkah,
 * termasuk isi tumpukan pemanggilan (call stack).
 * @param {Array<number|null>} tokens
 * @returns {import('./bfsTree.js').TreeStep[]}
 */
export function dfsTreeSteps(tokens) {
  const { nodes: tree } = buildBinaryTree(tokens)
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]))
  const state = Object.fromEntries(tree.map((n) => [n.id, 'normal']))
  const orderIdx = {}
  const stack = []
  const order = []
  const v = (id) => byId[id].value

  /** @type {import('./bfsTree.js').TreeStep[]} */
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
          {
            type: 'list',
            title: 'Tumpukan pemanggilan (pemanggilan terbaru di kanan)',
            items: stack.map((id) => `dfs(${v(id)})`),
            empty: 'kosong',
          },
          { type: 'list', title: 'Urutan kunjungan', items: order.map(v).map(String), empty: 'belum ada' },
        ],
      },
    })

  if (tree.length === 0) return [{ line: 1, note: 'Pohon kosong.', view: { labels: LABELS, nodes: [], panels: [] } }]

  const markStack = () => {
    stack.forEach((id, i) => {
      state[id] = i === stack.length - 1 ? 'current' : 'waiting'
    })
  }

  function call(id, line, note) {
    stack.push(id)
    markStack()
    push(line, note)

    order.push(id)
    orderIdx[id] = order.length
    push(3, `dfs(${v(id)}) bukan null, jadi kunjungi simpul ${v(id)}: masukkan ke urutan sebagai yang ke-${order.length}.`)

    for (const [side, line2, name] of [['left', 4, 'kiri'], ['right', 5, 'kanan']]) {
      const child = byId[id][side]
      if (child) {
        call(child, line2, `Baris ${line2}: simpul ${v(id)} memanggil dfs untuk anak ${name}, yaitu ${v(child)}.`)
      } else {
        push(line2, `Simpul ${v(id)} tidak punya anak ${name}. dfs(null) langsung kembali di baris 2, tanpa mengunjungi apa pun.`)
      }
    }

    stack.pop()
    state[id] = 'visited'
    markStack()
    const last = stack.length === 0
    push(
      6,
      last
        ? `dfs(${v(id)}) selesai dan tumpukan kosong. Urutan kunjungan DFS: ${order.map(v).join(', ')}.`
        : `dfs(${v(id)}) selesai, kembali ke dfs(${v(stack[stack.length - 1])}).`,
    )
  }

  call('n0', 1, `Panggil dfs dengan akar, yaitu ${v('n0')}.`)
  return steps
}
