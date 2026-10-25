// Hutan pohon Huffman dari isi langkah peraga: simpul daun dari masukan C, simpul gabungan dari daftar
// "Simpul gabungan yang sudah dibuat", dan akar yang masih menunggu dari daftar "Isi Q".

const MERGED = /^(\S+):(\d+(?:\.\d+)?) = (\S+):(\d+(?:\.\d+)?) \(kiri, 0\) \+ (\S+):(\d+(?:\.\d+)?) \(kanan, 1\)$/

/** "a:45, b:13" → [{ name, freq }]. */
export function parseLeaves(text) {
  return String(text ?? '')
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const [name, freq] = t.split(':')
      return { name: name.trim(), freq: Number(freq) }
    })
}

/** "z1:14 = f:5 (kiri, 0) + e:9 (kanan, 1)" → { name, freq, left, right }, atau null bila bentuknya lain. */
export function parseMerged(item) {
  const m = MERGED.exec(item)
  return m ? { name: m[1], freq: Number(m[2]), left: m[3], right: m[5] } : null
}

/**
 * Menyusun hutan: semua simpul, akar (simpul yang bukan anak siapa pun), dan status tiap simpul.
 * Status: queued = akar yang masih di Q, active = akar yang sudah keluar dari Q (sedang digabung), done = bagian pohon.
 * @param {string} leavesText isian C
 * @param {{ lists?: Array<{ title: string, items: string[] }> }} step
 */
export function buildForest(leavesText, step) {
  const nodes = new Map()
  for (const l of parseLeaves(leavesText)) nodes.set(l.name, { name: l.name, freq: l.freq, left: null, right: null })
  const merged = (step.lists?.find((l) => l.title.startsWith('Simpul gabungan'))?.items ?? []).map(parseMerged).filter(Boolean)
  for (const m of merged) nodes.set(m.name, { ...m })
  const child = new Set(merged.flatMap((m) => [m.left, m.right]))
  const inQ = new Set((step.lists?.find((l) => l.title.startsWith('Isi Q'))?.items ?? []).map((i) => i.split(':')[0]))
  const roots = [...nodes.keys()].filter((n) => !child.has(n))
  const status = {}
  for (const n of nodes.keys()) status[n] = child.has(n) ? 'done' : inQ.has(n) ? 'queued' : 'active'
  return { nodes, roots, status }
}

/**
 * Tata letak hutan: daun disusun kiri ke kanan dengan jarak sama, induk di tengah anak-anaknya, dan kedalaman menentukan baris.
 * @returns {{ pos: Record<string, { x: number, y: number }>, edges: Array<{ from: string, to: string, bit: 0|1 }>, width: number, depth: number }}
 */
export function layoutForest({ nodes, roots }) {
  const pos = {}
  const edges = []
  let leaf = 0
  let depth = 0
  const place = (name, d) => {
    depth = Math.max(depth, d)
    const n = nodes.get(name)
    if (!n.left) {
      pos[name] = { x: leaf, y: d }
      leaf += 1
      return
    }
    place(n.left, d + 1)
    place(n.right, d + 1)
    edges.push({ from: name, to: n.left, bit: 0 }, { from: name, to: n.right, bit: 1 })
    pos[name] = { x: (pos[n.left].x + pos[n.right].x) / 2, y: d }
  }
  for (const r of roots) place(r, 0)
  return { pos, edges, width: Math.max(leaf, 1), depth }
}
