// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
export const lcsCode = `function lcs(x, y) {
  const m = x.length, n = y.length
  const t = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (x[i - 1] === y[j - 1]) {
        t[i][j] = t[i - 1][j - 1] + 1
      } else {
        t[i][j] = Math.max(t[i - 1][j], t[i][j - 1])
      }
    }
  }
  let i = m, j = n, hasil = ''
  while (i > 0 && j > 0) {
    if (x[i - 1] === y[j - 1]) {
      hasil = x[i - 1] + hasil
      i--, j--
    } else if (t[i - 1][j] >= t[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return hasil
}`

export const LCS_MAX_LENGTH = 7

/** @typedef {{ x: string, y: string }} LcsInput */

/**
 * Membaca isian dua string. Hanya huruf dan angka, 1 sampai 7 karakter.
 * @param {{ x: string, y: string }} fields
 * @returns {{ ok: true, value: LcsInput } | { ok: false, error: string }}
 */
export function parseLcsInput(fields) {
  const out = {}
  for (const key of ['x', 'y']) {
    const s = String(fields[key] ?? '').trim()
    if (s === '') return { ok: false, error: `String ${key} tidak boleh kosong.` }
    if (!/^[A-Za-z0-9]+$/.test(s)) return { ok: false, error: `String ${key} hanya boleh berisi huruf dan angka, tanpa spasi atau tanda baca.` }
    if (s.length > LCS_MAX_LENGTH) return { ok: false, error: `String ${key} maksimal ${LCS_MAX_LENGTH} karakter (Anda mengisi ${s.length}).` }
    out[key] = s
  }
  return { ok: true, value: /** @type {LcsInput} */ (out) }
}

/** @param {LcsInput} v */
export const formatLcsInput = (v) => ({ x: v.x, y: v.y })

/** Tabel panjang LCS: t[i][j] untuk i karakter pertama x dan j karakter pertama y. */
export function lcsTable(x, y) {
  const t = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(0))
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      t[i][j] = x[i - 1] === y[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1])
    }
  }
  return t
}

/** Satu LCS dari penelusuran balik (aturan seri: naik dulu). */
export function lcsString(x, y) {
  const t = lcsTable(x, y)
  let i = x.length
  let j = y.length
  let out = ''
  while (i > 0 && j > 0) {
    if (x[i - 1] === y[j - 1]) {
      out = x[i - 1] + out
      i--
      j--
    } else if (t[i - 1][j] >= t[i][j - 1]) i--
    else j--
  }
  return out
}

/**
 * Dua string acak dari huruf A-D (alfabet kecil agar sering ada kecocokan), 5 sampai 7 karakter,
 * dengan LCS minimal 2.
 * @param {() => number} [rng]
 * @returns {LcsInput}
 */
export function randomLcsInput(rng = Math.random) {
  const pick = (n) => Math.floor(rng() * n)
  const word = () => Array.from({ length: 5 + pick(3) }, () => 'ABCD'[pick(4)]).join('')
  for (let i = 0; i < 100; i++) {
    const x = word()
    const y = word()
    if (lcsString(x, y).length >= 2) return { x, y }
  }
  return { x: 'ABCBDAB', y: 'BDCABA' }
}

// \uFE0E memaksa panah tampil sebagai simbol teks, bukan emoji berwarna.
const ARROW = { diag: '↖\uFE0E', up: '↑\uFE0E', left: '←\uFE0E' }

/**
 * Menjalankan LCS (mengisi tabel lalu penelusuran balik) dan merekam tiap langkah.
 * Setiap sel yang terisi diberi panah arah asalnya, yang dipakai saat penelusuran balik.
 * @param {LcsInput} input
 * @returns {import('./dpCommon.js').DpStep[]}
 */
export function lcsSteps({ x, y }) {
  const m = x.length
  const n = y.length
  const t = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const grid = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) =>
      i === 0 || j === 0 ? { text: '0', sub: '', mark: 'filled' } : { text: '', sub: '', mark: 'empty' },
    ),
  )
  const rowHeaders = Array.from({ length: m + 1 }, (_, i) => (i === 0 ? '0' : `${i} (${x[i - 1]})`))
  const colHeaders = Array.from({ length: n + 1 }, (_, j) => (j === 0 ? '0' : `${j} (${y[j - 1]})`))
  const labels = {
    current: 'sel yang sedang dihitung (atau diperiksa saat penelusuran balik)',
    source: 'sel sumber yang dipakai untuk menghitung',
    path: 'sel yang sudah dilewati penelusuran balik',
  }

  /** @type {import('./dpCommon.js').DpStep[]} */
  const steps = []
  /**
   * @param {number} line
   * @param {string} note
   * @param {Array<[number, number, string, string?]>} overrides  [i, j, mark, glyph?] hanya berlaku di langkah ini
   * @param {string[]} items  isi panel variabel
   * @param {string[]|null} [result]  isi panel hasil penelusuran balik (null = tanpa panel)
   * @param {boolean} [final]  true di langkah terakhir: judul panel hasil menjadi hasil akhir
   */
  const push = (line, note, overrides, items, result = null, final = false) => {
    const cells = grid.map((row) => row.map((c) => ({ ...c })))
    for (const [i, j, mark, glyph] of overrides) {
      cells[i][j].mark = mark
      if (glyph) cells[i][j].glyph = glyph
    }
    const panels = [{ type: 'list', title: 'Variabel', items, empty: '' }]
    if (result) panels.push({ type: 'list', title: final ? 'LCS (hasil akhir)' : 'Hasil sementara (ditulis dari belakang)', items: result, empty: 'masih kosong' })
    steps.push({
      line,
      note,
      view: {
        labels,
        table: { caption: 'Tabel t. Baris adalah karakter x, kolom adalah karakter y', corner: 'i \\ j', rowHeaders, colHeaders, cells },
        panels,
      },
    })
  }

  push(
    3,
    `Buat tabel t berukuran ${m + 1} × ${n + 1}, semuanya 0. Baris 0 dan kolom 0 tetap 0 karena string kosong tidak punya karakter yang sama. ` +
      'Sel t[i][j] nanti berisi panjang LCS dari i karakter pertama x dan j karakter pertama y.',
    [],
    [`x = ${x}`, `y = ${y}`],
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const same = x[i - 1] === y[j - 1]
      let note
      let sources
      let dir
      if (same) {
        t[i][j] = t[i - 1][j - 1] + 1
        dir = 'diag'
        sources = [[i - 1, j - 1, 'source', ARROW.diag]]
        note = `x[${i - 1}] = '${x[i - 1]}' dan y[${j - 1}] = '${y[j - 1]}' sama. Perpanjang LCS dari sel kiri-atas: t[${i}][${j}] = t[${i - 1}][${j - 1}] + 1 = ${t[i - 1][j - 1]} + 1 = ${t[i][j]}.`
      } else {
        const up = t[i - 1][j]
        const left = t[i][j - 1]
        t[i][j] = Math.max(up, left)
        dir = up >= left ? 'up' : 'left'
        sources = [
          [i - 1, j, 'source', ARROW.up],
          [i, j - 1, 'source', ARROW.left],
        ]
        note =
          `x[${i - 1}] = '${x[i - 1]}' dan y[${j - 1}] = '${y[j - 1]}' berbeda. Ambil yang terbaik dari sel atas (${up}) dan sel kiri (${left}): ` +
          `t[${i}][${j}] = max(${up}, ${left}) = ${t[i][j]}.`
      }
      grid[i][j] = { text: String(t[i][j]), sub: ARROW[dir], mark: 'filled' }
      push(same ? 7 : 9, note, [[i, j, 'current'], ...sources], [`i = ${i}`, `j = ${j}`, `t[${i}][${j}] = ${t[i][j]}`])
    }
  }

  // ---- Penelusuran balik
  let i = m
  let j = n
  let out = ''
  const chars = () => out.split('')
  push(
    13,
    `Tabel penuh. Panjang LCS ada di sel kanan-bawah: t[${m}][${n}] = ${t[m][n]}. Untuk mendapatkan stringnya, telusuri balik dari sel itu mengikuti panah.`,
    [[m, n, 'current']],
    [`i = ${i}`, `j = ${j}`],
    [],
  )
  while (i > 0 && j > 0) {
    if (x[i - 1] === y[j - 1]) {
      out = x[i - 1] + out
      push(
        16,
        `x[${i - 1}] = y[${j - 1}] = '${x[i - 1]}': karakter ini termasuk LCS, tulis di depan hasil. Geser diagonal ke t[${i - 1}][${j - 1}].`,
        [[i, j, 'current']],
        [`i = ${i}`, `j = ${j}`],
        chars(),
      )
      grid[i][j].mark = 'path'
      i--
      j--
    } else if (t[i - 1][j] >= t[i][j - 1]) {
      push(
        19,
        `Karakter berbeda dan t[${i - 1}][${j}] = ${t[i - 1][j]} ≥ t[${i}][${j - 1}] = ${t[i][j - 1]}, jadi naik ke t[${i - 1}][${j}] tanpa mengambil karakter.`,
        [[i, j, 'current']],
        [`i = ${i}`, `j = ${j}`],
        chars(),
      )
      grid[i][j].mark = 'path'
      i--
    } else {
      push(
        21,
        `Karakter berbeda dan t[${i}][${j - 1}] = ${t[i][j - 1]} > t[${i - 1}][${j}] = ${t[i - 1][j]}, jadi geser ke kiri ke t[${i}][${j - 1}] tanpa mengambil karakter.`,
        [[i, j, 'current']],
        [`i = ${i}`, `j = ${j}`],
        chars(),
      )
      grid[i][j].mark = 'path'
      j--
    }
  }
  grid[i][j].mark = 'path'
  push(14, `i = ${i} dan j = ${j}: salah satunya 0, sudah mencapai tepi tabel, jadi penelusuran berhenti.`, [], [`i = ${i}`, `j = ${j}`], chars())
  push(
    24,
    `Selesai. LCS dari "${x}" dan "${y}" adalah "${out}" dengan panjang ${out.length}, sama dengan t[${m}][${n}] = ${t[m][n]}.`,
    [],
    [`i = ${i}`, `j = ${j}`],
    chars(),
    true,
  )
  return steps
}
