export const recurrenceTreeCode = `function T(n) {
  if (n <= 1) return
  kerjakan(n)
  for (let i = 0; i < a; i++) {
    T(n / b)
  }
}`

export const recurrenceTreeLines = recurrenceTreeCode.split('\n').length

export const LIMITS = { a: [1, 3], b: [2, 4], c: [0, 2], k: [1, 3] }

const LABELS = {
  normal: 'belum muncul / belum dihitung',
  current: 'level yang sedang dihitung',
  base: 'kasus dasar (n = 1), biaya konstan 1',
  visited: 'level yang sudah dihitung',
}

/**
 * Membaca isian "a, b, c, k": T(n) = a·T(n/b) + n^c dengan kedalaman k, sehingga n = b^k.
 * @param {string} text
 * @returns {{ ok: true, value: { a: number, b: number, c: number, k: number } } | { ok: false, error: string }}
 */
export function parseRecurrenceInput(text) {
  const parts = String(text).trim().split(/[\s,;]+/).filter(Boolean)
  if (parts.length !== 4) {
    return { ok: false, error: 'Isi tepat 4 angka dipisah koma: a, b, c, k. Contoh: 2, 2, 1, 3.' }
  }
  const names = ['a', 'b', 'c', 'k']
  const value = {}
  for (const [i, p] of parts.entries()) {
    const key = names[i]
    if (!/^\d+$/.test(p)) return { ok: false, error: `"${p}" (nilai ${key}) harus bilangan bulat tidak negatif.` }
    const v = Number(p)
    const [lo, hi] = LIMITS[key]
    if (v < lo || v > hi) return { ok: false, error: `Nilai ${key} harus antara ${lo} dan ${hi} (Anda mengisi ${v}).` }
    value[key] = v
  }
  return { ok: true, value: /** @type {any} */ (value) }
}

/** @param {{ a: number, b: number, c: number, k: number }} v */
export const formatRecurrenceInput = (v) => `${v.a}, ${v.b}, ${v.c}, ${v.k}`

/** Rumus dalam teks, contoh: "T(n) = 2T(n/2) + n²". */
export function recurrenceFormula({ a, b, c }) {
  const f = c === 0 ? '1' : c === 1 ? 'n' : `n${c === 2 ? '²' : `^${c}`}`
  return `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${f}`
}

const fmt = (x) => String(x)
const pow = (x, y) => x ** y

/**
 * Pohon rekursi untuk T(n) = a·T(n/b) + n^c, dibuka level demi level, dengan tabel biaya per level.
 * @param {{ a: number, b: number, c: number, k: number }} input   n = b^k
 * @returns {import('./bfsTree.js').TreeStep[]}
 */
export function recurrenceTreeSteps({ a, b, c, k }) {
  const n = pow(b, k)
  const formula = recurrenceFormula({ a, b, c })

  // Ringkasan per level. Level k adalah kasus dasar: ukuran 1, biaya 1 per simpul.
  const levels = Array.from({ length: k + 1 }, (_, i) => {
    const count = pow(a, i)
    const size = n / pow(b, i)
    const each = i === k ? 1 : pow(size, c)
    return { i, count, size, each, total: count * each }
  })
  const grand = levels.reduce((s, l) => s + l.total, 0)

  // Pohon lengkap (ditampilkan bertahap lewat `hidden`).
  const tree = []
  for (const l of levels) {
    for (let j = 0; j < l.count; j++) {
      tree.push({
        id: `L${l.i}-${j}`,
        parent: l.i === 0 ? null : `L${l.i - 1}-${Math.floor(j / a)}`,
        level: l.i,
        label: fmt(l.size),
        sub: `biaya ${l.each}`,
      })
    }
  }

  // Teks ukuran dibuat sederhana dan jelas: "8" untuk level 0, "n/2 = 4" untuk level 1, dst.
  const sizeText = (l) => (l.i === 0 ? `n = ${l.size}` : `n/${pow(b, l.i)} = ${l.size}`)
  const rows = levels.map((l) => [String(l.i), String(l.count), sizeText(l), String(l.each), String(l.total)])

  const headers = ['Level', 'Jumlah simpul', 'Ukuran tiap simpul', 'Biaya tiap simpul', 'Total biaya level']

  /** @type {import('./bfsTree.js').TreeStep[]} */
  const steps = []
  /**
   * @param {number|null} line
   * @param {string} note
   * @param {{ shown: number, done: number, active?: number, rowsShown: number, allDone?: boolean, sum?: boolean }} s
   */
  const push = (line, note, s) =>
    steps.push({
      line,
      note,
      view: {
        labels: LABELS,
        nodes: tree.map((x) => {
          let mark = 'normal'
          if (s.allDone || x.level < s.done) mark = 'visited'
          else if (x.level === s.active) mark = x.level === k ? 'base' : 'current'
          return { id: x.id, parent: x.parent, label: x.label, sub: x.sub, mark, hidden: x.level >= s.shown }
        }),
        panels: [
          {
            type: 'table',
            caption: `Biaya per level untuk ${formula}, dengan n = ${n}`,
            headers,
            rows: [
              ...rows.slice(0, s.rowsShown),
              ...(s.sum ? [['Total', '', '', '', String(grand)]] : []),
            ],
            activeRow: s.active ?? -1,
          },
        ],
      },
    })

  push(
    1,
    `Pohon rekursi untuk ${formula}, dengan n = ${n} (karena ${b}^${k} = ${n}). Akar mewakili pemanggilan T(${n}) pada level 0.`,
    { shown: 1, done: 0, active: 0, rowsShown: 0 },
  )

  for (let i = 0; i < k; i++) {
    const l = levels[i]
    push(
      3,
      `Level ${i}: ada ${l.count} simpul berukuran ${l.size}. Tiap simpul mengerjakan biaya ${c === 0 ? '1' : `${l.size}${c === 1 ? '' : `^${c}`}`} = ${l.each}. Total level ${i}: ${l.count} × ${l.each} = ${l.total}.`,
      { shown: i + 1, done: i, active: i, rowsShown: i + 1 },
    )
    const nx = levels[i + 1]
    push(
      5,
      `Tiap simpul level ${i} memanggil T(n/${b}) sebanyak ${a} kali. Muncul level ${i + 1}: ${l.count} × ${a} = ${nx.count} simpul berukuran ${nx.size}.`,
      { shown: i + 2, done: i + 1, rowsShown: i + 1 },
    )
  }

  const leaf = levels[k]
  push(
    2,
    `Level ${k}: ukuran simpul sudah 1, yaitu kasus dasar (n ≤ 1). Tiap simpul berbiaya konstan 1, jadi total level ${k}: ${leaf.count} × 1 = ${leaf.total}.`,
    { shown: k + 1, done: k, active: k, rowsShown: k + 1 },
  )

  const totals = levels.map((l) => l.total)
  const sameAll = totals.every((t) => t === totals[0])
  const falling = totals.every((t, i) => i === 0 || t < totals[i - 1])
  const rising = totals.every((t, i) => i === 0 || t > totals[i - 1])
  let reading = 'Total tiap level berubah naik-turun, sehingga perlu dihitung manual.'
  if (sameAll) {
    reading = 'Total tiap level sama besar, jadi total ≈ (jumlah level) × (biaya per level). Ini pola kasus 2 Metode Master.'
  } else if (falling) {
    reading = 'Total level mengecil ke bawah, jadi biaya akar mendominasi. Ini pola kasus 3 Metode Master.'
  } else if (rising) {
    reading = 'Total level membesar ke bawah, jadi biaya daun mendominasi. Ini pola kasus 1 Metode Master.'
  }
  push(
    null,
    `Jumlahkan semua level: ${totals.join(' + ')} = ${grand}. ${reading}`,
    { shown: k + 1, done: k + 1, rowsShown: k + 1, allDone: true, sum: true },
  )
  return steps
}

/**
 * Parameter acak dalam batas LIMITS. Kedalaman minimal 2 agar pohonnya tidak terlalu kecil.
 * @param {() => number} [rng]
 * @returns {{ a: number, b: number, c: number, k: number }}
 */
export function randomRecurrenceInput(rng = Math.random) {
  const between = ([lo, hi]) => lo + Math.floor(rng() * (hi - lo + 1))
  return { a: between(LIMITS.a), b: between(LIMITS.b), c: between(LIMITS.c), k: between([2, LIMITS.k[1]]) }
}
