// Pohon biner dari daftar urutan level (level-order), dengan `null` untuk anak yang tidak ada.
// Contoh: [1, 2, 3, 4, 5] adalah pohon pada gambar contoh (1 punya anak 2 dan 3; 2 punya anak 4 dan 5).

export const MAX_TREE_NODES = 15
export const TREE_MIN_VALUE = -99
export const TREE_MAX_VALUE = 99

/**
 * @typedef {Object} BinaryNode
 * @property {string} id        `n<indeks token>`
 * @property {number} value
 * @property {string|null} parent
 * @property {'l'|'r'|null} side
 * @property {string|null} left
 * @property {string|null} right
 */

/**
 * Membangun pohon dari token level-order. Anak-anak diberikan ke simpul non-null menurut urutan antrean.
 * @param {Array<number|null>} tokens
 * @returns {{ nodes: BinaryNode[], used: number }}  used = jumlah token yang berhasil dipasang
 */
export function buildBinaryTree(tokens) {
  if (tokens.length === 0 || tokens[0] === null) return { nodes: [], used: 0 }
  /** @type {BinaryNode[]} */
  const nodes = [{ id: 'n0', value: tokens[0], parent: null, side: null, left: null, right: null }]
  const queue = [nodes[0]]
  let idx = 1
  for (let head = 0; head < queue.length && idx < tokens.length; head++) {
    const parent = queue[head]
    for (const side of ['l', 'r']) {
      if (idx >= tokens.length) break
      const t = tokens[idx]
      const id = `n${idx}`
      idx += 1
      if (t === null) continue
      const node = { id, value: t, parent: parent.id, side, left: null, right: null }
      if (side === 'l') parent.left = id
      else parent.right = id
      nodes.push(node)
      queue.push(node)
    }
  }
  return { nodes, used: idx }
}

/**
 * Membaca isian pengguna, contoh: "1, 2, 3, 4, 5" atau "1, 2, null, 3".
 * @param {string} text
 * @returns {{ ok: true, value: Array<number|null> } | { ok: false, error: string }}
 */
export function parseTreeInput(text) {
  const raw = String(text).trim()
  if (raw === '') return { ok: false, error: 'Isi minimal satu angka sebagai akar.' }
  const parts = raw.split(/[\s,;]+/).filter(Boolean)
  if (parts.length > MAX_TREE_NODES) {
    return { ok: false, error: `Maksimal ${MAX_TREE_NODES} isian (Anda mengisi ${parts.length}).` }
  }
  const tokens = []
  for (const p of parts) {
    if (/^(null|nil|-|#)$/i.test(p)) {
      tokens.push(null)
      continue
    }
    if (!/^-?\d+$/.test(p)) {
      return { ok: false, error: `"${p}" bukan bilangan bulat atau null. Pisahkan isian dengan koma.` }
    }
    const v = Number(p)
    if (v < TREE_MIN_VALUE || v > TREE_MAX_VALUE) {
      return { ok: false, error: `Angka ${p} di luar rentang ${TREE_MIN_VALUE} sampai ${TREE_MAX_VALUE}.` }
    }
    tokens.push(v)
  }
  if (tokens[0] === null) return { ok: false, error: 'Isian pertama (akar) tidak boleh null.' }
  const { used } = buildBinaryTree(tokens)
  if (used < tokens.length) {
    return {
      ok: false,
      error: 'Ada angka yang tidak punya induk, karena induknya null. Anak dari simpul null tidak ditulis.',
    }
  }
  return { ok: true, value: tokens }
}

/** @param {Array<number|null>} tokens */
export function formatTreeInput(tokens) {
  return tokens.map((t) => (t === null ? 'null' : String(t))).join(', ')
}
