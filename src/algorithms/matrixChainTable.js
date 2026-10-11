// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
// Matriks Ai berukuran dims[i-1] × dims[i], jadi dims berisi n + 1 angka (sama seperti soal challenge).
export const matrixChainCode = `function matrixChain(dims) {
  const n = dims.length - 1
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const s = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let panjang = 2; panjang <= n; panjang++) {
    for (let i = 1; i <= n - panjang + 1; i++) {
      const j = i + panjang - 1
      m[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const q = m[i][k] + m[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
        if (q < m[i][j]) {
          m[i][j] = q
          s[i][j] = k
        }
      }
    }
  }
  return m[1][n]
}

function kurung(s, i, j) {
  if (i === j) return 'A' + i
  return '(' + kurung(s, i, s[i][j]) + kurung(s, s[i][j] + 1, j) + ')'
}`

export const MC_MIN_DIMS = 3 // minimal 2 matriks
export const MC_MAX_DIMS = 7 // maksimal 6 matriks
export const MC_MIN_VALUE = 1
export const MC_MAX_VALUE = 99

/**
 * Membaca isian dims, contoh "30, 35, 15, 5".
 * @param {{ dims: string }} fields
 * @returns {{ ok: true, value: number[] } | { ok: false, error: string }}
 */
export function parseMatrixChainInput(fields) {
  const parts = String(fields.dims ?? '').trim().split(/[\s,;]+/).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: 'Isi ukuran matriks, contoh: 30, 35, 15, 5.' }
  const dims = []
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return { ok: false, error: `"${p}" bukan bilangan bulat positif. Pisahkan angka dengan koma.` }
    const v = Number(p)
    if (v < MC_MIN_VALUE || v > MC_MAX_VALUE) return { ok: false, error: `Angka ${p} di luar rentang ${MC_MIN_VALUE} sampai ${MC_MAX_VALUE}.` }
    dims.push(v)
  }
  if (dims.length < MC_MIN_DIMS) return { ok: false, error: `Isi minimal ${MC_MIN_DIMS} angka, karena rantai butuh minimal 2 matriks (n matriks = n + 1 angka).` }
  if (dims.length > MC_MAX_DIMS) return { ok: false, error: `Maksimal ${MC_MAX_DIMS} angka, yaitu ${MC_MAX_DIMS - 1} matriks (Anda mengisi ${dims.length}).` }
  return { ok: true, value: dims }
}

/** @param {number[]} dims */
export const formatMatrixChainInput = (dims) => ({ dims: dims.join(', ') })

/**
 * Menyelesaikan rantai matriks. Tabel m dan s berindeks 1 sampai n (baris/kolom 0 tidak dipakai).
 * @param {number[]} dims
 * @returns {{ n: number, m: number[][], s: number[][], cost: number, order: string }}
 */
export function solveMatrixChain(dims) {
  const n = dims.length - 1
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const s = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1
      m[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const q = m[i][k] + m[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
        if (q < m[i][j]) {
          m[i][j] = q
          s[i][j] = k
        }
      }
    }
  }
  return { n, m, s, cost: m[1][n], order: parenthesize(s, 1, n) }
}

/** Urutan pengurungan dari tabel s, contoh "((A1(A2A3))((A4A5)A6))". */
export function parenthesize(s, i, j) {
  if (i === j) return `A${i}`
  return `(${parenthesize(s, i, s[i][j])}${parenthesize(s, s[i][j] + 1, j)})`
}

/**
 * Ukuran acak: 3 sampai 6 matriks, tiap angka 2 sampai 40.
 * @param {() => number} [rng]
 * @returns {number[]}
 */
export function randomMatrixChainInput(rng = Math.random) {
  const pick = (n) => Math.floor(rng() * n)
  return Array.from({ length: 4 + pick(4) }, () => 2 + pick(39))
}

/**
 * Menjalankan rantai matriks dan merekam tiap langkah: satu langkah untuk memulai tiap sel m[i][j],
 * lalu satu langkah untuk setiap titik potong k yang dicoba.
 * @param {number[]} dims
 * @returns {import('./dpCommon.js').DpStep[]}
 */
export function matrixChainSteps(dims) {
  const n = dims.length - 1
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const s = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const names = Array.from({ length: n }, (_, k) => `A${k + 1}`)
  const grid = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      if (r === c) return { text: '0', sub: '', mark: 'filled' }
      return c > r ? { text: '', sub: '', mark: 'empty' } : { text: '', sub: '', mark: 'unused' }
    }),
  )
  const cellAt = (i, j) => grid[i - 1][j - 1]
  const labels = {
    current: 'sel m[i][j] yang sedang dihitung',
    source: 'sel yang dipakai: m[i][k] (Ki) dan m[k+1][j] (Ka)',
    path: 'sel yang terpakai pada urutan pengurungan optimal',
    unused: 'tidak dipakai (i > j)',
  }
  const sizes = {
    type: 'list',
    title: 'Ukuran matriks',
    items: names.map((nm, k) => `${nm}: ${dims[k]}×${dims[k + 1]}`),
    empty: '',
  }

  /** @type {import('./dpCommon.js').DpStep[]} */
  const steps = []
  /**
   * @param {number} line
   * @param {string} note
   * @param {Array<[number, number, string, string?]>} overrides
   * @param {string[]} items
   * @param {any[]} [extra]
   */
  const push = (line, note, overrides, items, extra = []) => {
    const cells = grid.map((row) => row.map((c) => ({ ...c })))
    for (const [i, j, mark, glyph] of overrides) {
      cells[i - 1][j - 1].mark = mark
      if (glyph) cells[i - 1][j - 1].glyph = glyph
    }
    steps.push({
      line,
      note,
      view: {
        labels,
        table: {
          caption: 'Tabel m. Isi sel adalah biaya minimum m[i][j], angka kecil di bawahnya adalah titik potong terbaik k',
          corner: 'i \\ j',
          rowHeaders: names.map((_, k) => `${k + 1}`),
          colHeaders: names.map((_, k) => `${k + 1}`),
          cells,
        },
        panels: [{ type: 'list', title: 'Variabel', items, empty: '' }, sizes, ...extra],
      },
    })
  }

  push(
    3,
    `Ada ${n} matriks (${names.join(', ')}). Tabel m dan s dibuat berukuran ${n + 1} × ${n + 1}, semuanya 0. ` +
      `Diagonal m[i][i] = 0 karena satu matriks tidak butuh perkalian. Sel m[i][j] nanti berisi biaya minimum mengalikan matriks Ai sampai Aj, dan hanya sel dengan i ≤ j yang dipakai.`,
    [],
    [`n = ${n}`],
  )

  for (let panjang = 2; panjang <= n; panjang++) {
    for (let i = 1; i <= n - panjang + 1; i++) {
      const j = i + panjang - 1
      m[i][j] = Infinity
      cellAt(i, j).text = '∞'
      cellAt(i, j).mark = 'filled' // di langkah ini ditampilkan sebagai current lewat overrides; setelahnya tetap terisi
      push(
        8,
        `Panjang rantai ${panjang}: hitung m[${i}][${j}], yaitu biaya minimum mengalikan ${names[i - 1]} sampai ${names[j - 1]}. ` +
          `Mulai dari ∞, lalu coba setiap titik potong k dari ${i} sampai ${j - 1}.`,
        [[i, j, 'current']],
        [`panjang = ${panjang}`, `i = ${i}`, `j = ${j}`],
      )
      for (let k = i; k < j; k++) {
        const left = m[i][k]
        const right = m[k + 1][j]
        const mult = dims[i - 1] * dims[k] * dims[j]
        const q = left + right + mult
        const better = q < m[i][j]
        const before = m[i][j]
        if (better) {
          m[i][j] = q
          s[i][j] = k
          cellAt(i, j).text = String(q)
          cellAt(i, j).sub = `k=${k}`
        }
        const where = `(${names[i - 1]}…${names[k - 1]})(${names[k]}…${names[j - 1]})`
        push(
          better ? 12 : 11,
          `k = ${k}: potong menjadi ${where}. q = m[${i}][${k}] + m[${k + 1}][${j}] + dims[${i - 1}]·dims[${k}]·dims[${j}] = ` +
            `${left} + ${right} + ${dims[i - 1]}·${dims[k]}·${dims[j]} = ${q}. ` +
            (better
              ? `${before === Infinity ? 'Ini yang pertama' : `Lebih kecil dari ${before}`}, jadi m[${i}][${j}] = ${q} dan s[${i}][${j}] = ${k}.`
              : `Tidak lebih kecil dari ${before}, jadi m[${i}][${j}] tetap ${before}.`),
          [
            [i, j, 'current'],
            [i, k, 'source', 'Ki'],
            [k + 1, j, 'source', 'Ka'],
          ],
          [`panjang = ${panjang}`, `i = ${i}`, `j = ${j}`, `k = ${k}`, `q = ${q}`, `m[${i}][${j}] = ${m[i][j]}`],
        )
      }
    }
  }

  const { order } = solveMatrixChain(dims)
  push(
    18,
    `Semua sel terisi. Biaya minimum mengalikan seluruh rantai ${names[0]} sampai ${names[n - 1]} ada di m[1][${n}] = ${m[1][n]} perkalian skalar.`,
    [[1, n, 'current']],
    [`m[1][${n}] = ${m[1][n]}`],
  )

  // Sel yang terpakai pada urutan optimal: seluruh sel (i, j) yang dikunjungi kurung().
  const used = []
  const walk = (i, j) => {
    used.push([i, j, 'path'])
    if (i < j) {
      walk(i, s[i][j])
      walk(s[i][j] + 1, j)
    }
  }
  walk(1, n)
  push(
    23,
    `Urutan pengurungan dibaca dari tabel s: s[1][${n}] = ${s[1][n]} berarti rantai dipotong setelah ${names[s[1][n] - 1]}, lalu tiap bagian dipotong dengan cara yang sama. ` +
      `Hasilnya ${order} dengan biaya ${m[1][n]}.`,
    used,
    [`m[1][${n}] = ${m[1][n]}`],
    [{ type: 'list', title: 'Urutan pengurungan optimal', items: [order], empty: '' }],
  )
  return steps
}
