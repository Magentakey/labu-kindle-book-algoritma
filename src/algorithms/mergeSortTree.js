import { mergeSortCode } from './mergeSort.js'

// Memakai kode dan nomor baris yang sama dengan visualizer array merge sort.
export const mergeSortTreeCode = mergeSortCode
export const mergeSortTreeLines = mergeSortCode.split('\n').length

const LABELS = {
  normal: 'belum dipanggil',
  current: 'sedang diproses',
  waiting: 'menunggu kedua anaknya selesai',
  merged: 'selesai dan sudah terurut',
}

const range = (lo, hi) => (lo === hi ? `indeks ${lo}` : `indeks ${lo}–${hi}`)
const show = (arr) => arr.join(' ')

/**
 * Pohon rekursi merge sort: tiap simpul = satu pemanggilan mergeSort(lo, hi).
 * Seluruh pohon digambar sejak awal agar bentuk pembagiannya terlihat.
 * @param {number[]} input
 * @returns {import('./bfsTree.js').TreeStep[]}
 */
export function mergeSortTreeSteps(input) {
  const arr = [...input]
  const n = arr.length
  if (n === 0) return [{ line: 1, note: 'Array kosong.', view: { labels: LABELS, nodes: [], panels: [] } }]

  // 1) Bentuk pohon pemanggilan (urutan = urutan pemanggilan, kiri dulu).
  const nodes = []
  const byId = {}
  const build = (lo, hi, parent, side) => {
    const node = {
      id: `${lo}-${hi}`,
      lo,
      hi,
      parent,
      side,
      values: arr.slice(lo, hi + 1),
      mark: 'normal',
      left: null,
      right: null,
    }
    nodes.push(node)
    byId[node.id] = node
    if (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      node.mid = mid
      node.left = build(lo, mid, node.id, 'l')
      node.right = build(mid + 1, hi, node.id, 'r')
    }
    return node.id
  }
  build(0, n - 1, null, null)

  // 2) Jalankan dan rekam.
  /** @type {import('./bfsTree.js').TreeStep[]} */
  const steps = []
  const stack = []
  const push = (line, note) =>
    steps.push({
      line,
      note,
      view: {
        labels: LABELS,
        nodes: nodes.map((x) => ({
          id: x.id,
          parent: x.parent,
          side: x.side ?? undefined,
          label: show(x.values),
          sub: range(x.lo, x.hi),
          mark: x.mark,
        })),
        panels: [
          {
            type: 'list',
            title: 'Tumpukan pemanggilan (pemanggilan terbaru di kanan)',
            items: stack.map((id) => `mergeSort(${byId[id].lo}, ${byId[id].hi})`),
            empty: 'kosong',
          },
        ],
      },
    })

  const markStack = () => {
    stack.forEach((id, i) => {
      byId[id].mark = i === stack.length - 1 ? 'current' : 'waiting'
    })
  }

  function visit(id, line, note) {
    const x = byId[id]
    stack.push(id)
    markStack()
    push(line, note)

    if (x.lo >= x.hi) {
      stack.pop()
      x.mark = 'merged'
      markStack()
      push(2, `lo (${x.lo}) ≥ hi (${x.hi}): hanya satu elemen (${x.values[0]}), sudah terurut. Kembali tanpa melakukan apa pun.`)
      return
    }

    const l = byId[x.left]
    const r = byId[x.right]
    push(
      3,
      `mid = ⌊(${x.lo} + ${x.hi}) / 2⌋ = ${x.mid}. Bagian ini dibelah menjadi kiri [${show(l.values)}] dan kanan [${show(r.values)}].`,
    )
    visit(x.left, 4, `Baris 4: panggil mergeSort untuk bagian kiri, ${range(l.lo, l.hi)}: [${show(l.values)}].`)
    visit(x.right, 5, `Baris 5: panggil mergeSort untuk bagian kanan, ${range(r.lo, r.hi)}: [${show(r.values)}].`)

    // Penggabungan: kedua anak sudah terurut.
    const sorted = [...x.values].sort((a, b) => a - b)
    stack.pop()
    x.values = sorted
    x.mark = 'merged'
    markStack()
    push(
      6,
      `Gabungkan kiri [${show(l.values)}] dan kanan [${show(r.values)}] dengan merge menjadi [${show(sorted)}].`,
    )
  }

  visit('0-' + (n - 1), 1, `Panggil mergeSort untuk seluruh array, ${range(0, n - 1)}: [${show(arr)}].`)
  push(7, `Semua pemanggilan selesai. Array terurut: [${show(byId['0-' + (n - 1)].values)}].`)
  return steps
}
