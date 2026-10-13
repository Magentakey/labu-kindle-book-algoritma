// Pseudocode MATRIX-CHAIN-ORDER(p) dari materi 8 (Cormen halaman 375), 14 baris.
// Nomor baris sama dengan nomor langkah di materi. Tabel m dan s berindeks 1 sampai n; barisan p berindeks 0 sampai n.
export const matrixChainPseudoCode = [
  'n = p.length - 1',
  'let m[1..n, 1..n] and s[1..n-1, 2..n] be new tables',
  'for i = 1 to n',
  '    m[i, i] = 0',
  'for l = 2 to n                      // l adalah panjang rantai',
  '    for i = 1 to n - l + 1',
  '        j = i + l - 1',
  '        m[i, j] = ∞',
  '        for k = i to j - 1',
  '            q = m[i, k] + m[k+1, j] + p[i-1] * p[k] * p[j]',
  '            if q < m[i, j]',
  '                m[i, j] = q',
  '                s[i, j] = k',
  'return m and s',
].join('\n')

export const MC_PSEUDO_MIN_P = 3 // minimal 2 matriks
export const MC_PSEUDO_MAX_P = 7 // maksimal 6 matriks

/** Pesan kesalahan untuk barisan p, atau null bila sah. */
export function checkMatrixChainP(p) {
  if (p.length < MC_PSEUDO_MIN_P) return `Isi minimal ${MC_PSEUDO_MIN_P} angka, karena rantai butuh minimal 2 matriks (n matriks = n + 1 angka).`
  if (p.length > MC_PSEUDO_MAX_P) return `Maksimal ${MC_PSEUDO_MAX_P} angka, yaitu ${MC_PSEUDO_MAX_P - 1} matriks (Anda mengisi ${p.length}).`
  const bad = p.find((v) => v < 1)
  if (bad !== undefined) return `Ukuran matriks harus bilangan bulat positif, tetapi ada ${bad}.`
  return null
}

const dash = '–'
/** Titik ribuan seperti di materi: 15125 menjadi 15.125. */
export const fmt = (v) => (v === Infinity ? '∞' : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'))

const MLABELS = {
  current: 'sel m[i,j] yang sedang dihitung',
  source: 'sel yang dipakai: m[i,k] (Ki) dan m[k+1,j] (Ka)',
  path: 'sel yang terpakai pada urutan pengurungan optimal',
  unused: 'tidak dipakai (i > j)',
}
const SLABELS = { current: 'sel s[i,j] yang baru diisi', unused: 'tidak dipakai (i ≥ j)' }

/**
 * Menjalankan MATRIX-CHAIN-ORDER(p) satu langkah per pembacaan satu baris. Perulangan for dicatat sekali tiap
 * putaran ditambah satu kali saat kondisinya tidak terpenuhi lagi (seperti peraga JUMLAH_n_BIL). Tiap langkah memuat
 * tabel m dan tabel s pada saat itu.
 *
 * @param {{ p: number[] }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function matrixChainPseudoTrace({ p }) {
  let n
  let l, i, j, k, q
  const m = []
  const s = []
  let created = false
  const steps = []
  const names = (len) => Array.from({ length: len }, (_, x) => `${x + 1}`)

  const mText = (a, b) => (b < a ? '' : m[a]?.[b] === undefined ? '' : fmt(m[a][b]))

  /** Membuat satu langkah. Panggil setelah baris itu "dijalankan" sehingga nilai variabel sudah yang baru. */
  function push(line, note, { cur, src, factors, path } = {}) {
    const mCells = []
    const sCells = []
    for (let a = 1; a <= (n ?? 0); a++) {
      const mr = []
      const sr = []
      for (let b = 1; b <= n; b++) {
        if (a > b) {
          mr.push({ text: '', sub: '', mark: 'unused' })
          sr.push({ text: '', sub: '', mark: 'unused' })
          continue
        }
        const has = created && m[a][b] !== undefined
        mr.push({ text: has ? mText(a, b) : '', sub: has && a < b && s[a][b] !== undefined ? `k=${s[a][b]}` : '', mark: has ? 'filled' : 'empty' })
        if (a === b) sr.push({ text: '', sub: '', mark: 'unused' })
        else sr.push({ text: created && s[a][b] !== undefined ? String(s[a][b]) : '', sub: '', mark: created && s[a][b] !== undefined ? 'filled' : 'empty' })
      }
      mCells.push(mr)
      sCells.push(sr)
    }
    if (cur) mCells[cur[0] - 1][cur[1] - 1].mark = 'current'
    for (const [a, b, glyph] of src ?? []) {
      mCells[a - 1][b - 1].mark = 'source'
      mCells[a - 1][b - 1].glyph = glyph
    }
    for (const [a, b] of path ?? []) mCells[a - 1][b - 1].mark = 'path'
    if (line === 13 && cur) sCells[cur[0] - 1][cur[1] - 1].mark = 'current'

    const pMarks = p.map((_, x) => (factors && factors.includes(x) ? 'factor' : 'normal'))
    const v = (x) => (x === undefined ? dash : String(x))
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: v(n) },
        { name: 'l', value: v(l) },
        { name: 'i', value: v(i) },
        { name: 'j', value: v(j) },
        { name: 'k', value: v(k) },
        { name: 'q', value: q === undefined ? dash : fmt(q) },
        { name: 'm[i,j]', value: i === undefined || j === undefined || !created || m[i]?.[j] === undefined ? dash : fmt(m[i][j]) },
      ],
      array: { title: 'Barisan p (indeks mulai dari 0)', values: [...p], marks: pMarks, indexBase: 0 },
      tables: n
        ? [
            {
              table: {
                caption: 'Tabel m. Isi sel adalah biaya minimum m[i,j], angka kecil di bawahnya adalah titik pecah terbaik k',
                corner: 'i \\ j',
                rowHeaders: names(n),
                colHeaders: names(n),
                cells: mCells,
              },
              labels: MLABELS,
              legend: ['empty', 'filled', 'current', 'source', 'path', 'unused'],
            },
            {
              table: {
                caption: 'Tabel s. Isi sel adalah titik pecah k terbaik untuk rantai Ai sampai Aj',
                corner: 'i \\ j',
                rowHeaders: names(n),
                colHeaders: names(n),
                cells: sCells,
              },
              labels: SLABELS,
              legend: ['empty', 'filled', 'current', 'unused'],
            },
          ]
        : undefined,
    })
  }

  n = p.length - 1
  push(1, `Baris 1: n = p.length - 1 = ${p.length} - 1 = ${n}. Ada ${n} matriks, dan matriks Ai berukuran p[i-1] × p[i].`)

  for (let a = 0; a <= n; a++) {
    m[a] = Array(n + 1).fill(undefined)
    s[a] = Array(n + 1).fill(undefined)
  }
  created = true
  push(2, `Baris 2: dibuat tabel m berukuran ${n} × ${n} dan tabel s untuk menyimpan titik pecah. Semua sel belum berisi.`)

  for (i = 1; ; i++) {
    const masuk = i <= n
    push(3, masuk ? `Baris 3: i = ${i}, ${i} ≤ ${n} sehingga baris 4 dijalankan.` : `Baris 3: i = ${i} lebih besar dari n = ${n}, jadi perulangan selesai dan algoritma lanjut ke baris 5.`)
    if (!masuk) break
    m[i][i] = 0
    push(4, `Baris 4: m[${i},${i}] = 0, karena satu matriks (A${i}) tidak perlu dikalikan.`, { cur: [i, i] })
  }

  for (l = 2; ; l++) {
    const masukL = l <= n
    i = undefined
    j = undefined
    k = undefined
    q = undefined
    push(
      5,
      masukL
        ? `Baris 5: l = ${l}, ${l} ≤ ${n}. Sekarang dihitung semua rantai sepanjang ${l} matriks.`
        : `Baris 5: l = ${l} lebih besar dari n = ${n}, jadi semua panjang rantai sudah dihitung dan algoritma lanjut ke baris 14.`,
    )
    if (!masukL) break

    for (i = 1; ; i++) {
      const masukI = i <= n - l + 1
      push(
        6,
        masukI
          ? `Baris 6: i = ${i}, ${i} ≤ n - l + 1 = ${n - l + 1}. Rantai dimulai dari A${i}.`
          : `Baris 6: i = ${i} lebih besar dari n - l + 1 = ${n - l + 1}, jadi semua rantai sepanjang ${l} sudah dihitung dan l dinaikkan.`,
      )
      if (!masukI) break
      j = i + l - 1
      k = undefined
      q = undefined
      push(7, `Baris 7: j = i + l - 1 = ${i} + ${l} - 1 = ${j}. Rantai yang dihitung adalah A${i} sampai A${j}, yaitu m[${i},${j}].`, { cur: [i, j] })
      m[i][j] = Infinity
      push(8, `Baris 8: m[${i},${j}] = ∞, supaya titik pecah pertama yang dicoba pasti lebih kecil.`, { cur: [i, j] })

      for (k = i; ; k++) {
        const masukK = k <= j - 1
        push(
          9,
          masukK ? `Baris 9: k = ${k}, ${k} ≤ j - 1 = ${j - 1}. Dicoba memecah rantai di k = ${k}.` : `Baris 9: k = ${k} lebih besar dari j - 1 = ${j - 1}, jadi semua titik pecah sudah dicoba.`,
          { cur: [i, j] },
        )
        if (!masukK) break
        q = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
        const sources = [[i, k, 'Ki'], [k + 1, j, 'Ka']]
        const factors = [i - 1, k, j]
        push(
          10,
          `Baris 10: q = m[${i},${k}] + m[${k + 1},${j}] + p[${i - 1}] × p[${k}] × p[${j}] = ${fmt(m[i][k])} + ${fmt(m[k + 1][j])} + ${p[i - 1]} × ${p[k]} × ${p[j]} = ${fmt(q)}.`,
          { cur: [i, j], src: sources, factors },
        )
        const lebih = q < m[i][j]
        push(
          11,
          lebih
            ? `Baris 11: q < m[${i},${j}] → ${fmt(q)} < ${fmt(m[i][j])} bernilai TRUE, jadi baris 12 dan 13 dijalankan.`
            : `Baris 11: q < m[${i},${j}] → ${fmt(q)} < ${fmt(m[i][j])} bernilai FALSE, jadi baris 12 dan 13 dilewati.`,
          { cur: [i, j], src: sources, factors },
        )
        if (lebih) {
          m[i][j] = q
          push(12, `Baris 12: m[${i},${j}] = q = ${fmt(q)}.`, { cur: [i, j] })
          s[i][j] = k
          push(13, `Baris 13: s[${i},${j}] = k = ${k}. Titik pecah terbaik sementara untuk A${i} sampai A${j} adalah ${k}.`, { cur: [i, j] })
        }
      }
    }
  }

  // Urutan pengurungan dan sel yang terpakai, dari tabel s.
  const path = []
  const order = (a, b) => {
    path.push([a, b])
    if (a === b) return `A${a}`
    return `(${order(a, s[a][b])}${order(s[a][b] + 1, b)})`
  }
  const text = order(1, n)
  i = undefined
  j = undefined
  k = undefined
  q = undefined
  push(
    14,
    `Baris 14: return m dan s. Biaya minimum mengalikan seluruh rantai adalah m[1,${n}] = ${fmt(m[1][n])} operasi perkalian, dengan urutan pengurungan ${text} (disusun dari tabel s).`,
    { path },
  )
  return steps
}
