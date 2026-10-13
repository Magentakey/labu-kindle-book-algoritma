// Pseudocode LCS-LENGTH(X, Y) dan PRINT-LCS(b, X, i, j) dari materi 9 (Cormen halaman 394 sampai 395).
// Nomor baris sama dengan nomor langkah di materi (18 dan 8 baris). Tabel b dan c berindeks 1 sampai m dan 0 sampai m;
// karakter x_i dan y_j berindeks 1 (di kode JavaScript dibaca dengan X[i - 1]).
export const lcsLengthPseudoCode = [
  'm = X.length',
  'n = Y.length',
  'let b[1..m, 1..n] and c[0..m, 0..n] be new tables',
  'for i = 1 to m',
  '    c[i, 0] = 0',
  'for j = 0 to n',
  '    c[0, j] = 0',
  'for i = 1 to m',
  '    for j = 1 to n',
  '        if x_i == y_j',
  '            c[i, j] = c[i-1, j-1] + 1',
  '            b[i, j] = "↖"',
  '        elseif c[i-1, j] >= c[i, j-1]',
  '            c[i, j] = c[i-1, j]',
  '            b[i, j] = "↑"',
  '        else c[i, j] = c[i, j-1]',
  '            b[i, j] = "←"',
  'return c and b',
].join('\n')

export const printLcsPseudoCode = [
  'if i == 0 or j == 0',
  '    return',
  'if b[i, j] == "↖"',
  '    PRINT-LCS(b, X, i-1, j-1)',
  '    print x_i',
  'elseif b[i, j] == "↑"',
  '    PRINT-LCS(b, X, i-1, j)',
  'else PRINT-LCS(b, X, i, j-1)',
].join('\n')

export const LCS_PSEUDO_MAX = 7

const dash = '–'
// \uFE0E memaksa panah tampil sebagai simbol teks, bukan emoji berwarna.
const ARROW = { diag: '↖\uFE0E', up: '↑\uFE0E', left: '←\uFE0E' }
const ARROW_PLAIN = { diag: '↖', up: '↑', left: '←' }

/**
 * Tabel c dan b persis seperti LCS-LENGTH (indeks 1). Dipakai PRINT-LCS sebagai masukan dan oleh tes.
 * @param {string} X
 * @param {string} Y
 * @returns {{ c: number[][], b: Array<Array<'diag'|'up'|'left'|null>> }}
 */
export function lcsLengthTables(X, Y) {
  const m = X.length
  const n = Y.length
  const c = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const b = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        c[i][j] = c[i - 1][j - 1] + 1
        b[i][j] = 'diag'
      } else if (c[i - 1][j] >= c[i][j - 1]) {
        c[i][j] = c[i - 1][j]
        b[i][j] = 'up'
      } else {
        c[i][j] = c[i][j - 1]
        b[i][j] = 'left'
      }
    }
  }
  return { c, b }
}

const headers = (s) => ['0', ...Array.from(s, (ch, k) => `${k + 1} (${ch})`)]

/**
 * Menjalankan LCS-LENGTH(X, Y) satu langkah per pembacaan satu baris. Perulangan for dicatat sekali tiap putaran
 * ditambah sekali saat kondisinya tidak terpenuhi lagi (seperti peraga MATRIX-CHAIN-ORDER). Tiap langkah memuat
 * tabel c dan b dalam satu tabel: angka adalah c[i,j], panah kecil adalah b[i,j].
 *
 * @param {{ X: string, Y: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function lcsLengthPseudoTrace({ X, Y }) {
  let m
  let n
  let i
  let j
  let created = false
  const c = []
  const b = []
  const steps = []

  const labels = {
    current: 'sel c[i,j] yang sedang diisi',
    source: 'sel yang dipakai untuk mengisi (panah menunjukkan arahnya)',
  }

  /** Membuat satu langkah. Panggil setelah baris itu "dijalankan" sehingga nilai variabel sudah yang baru. */
  function push(line, note, { cur, src } = {}) {
    const cells = []
    for (let a = 0; created && a <= m; a++) {
      const row = []
      for (let k = 0; k <= n; k++) {
        const has = c[a][k] !== undefined
        row.push({ text: has ? String(c[a][k]) : '', sub: has && b[a][k] ? ARROW[b[a][k]] : '', mark: has ? 'filled' : 'empty' })
      }
      cells.push(row)
    }
    if (cur && created) cells[cur[0]][cur[1]].mark = 'current'
    for (const [a, k, glyph] of created ? (src ?? []) : []) {
      cells[a][k].mark = 'source'
      cells[a][k].glyph = glyph
    }
    const inX = i >= 1 && i <= (m ?? 0)
    const inY = j >= 1 && j <= (n ?? 0)
    const cur_c = created && inX && inY && c[i][j] !== undefined ? String(c[i][j]) : dash
    const cur_b = created && inX && inY && b[i][j] ? ARROW[b[i][j]] : dash
    steps.push({
      line,
      note,
      vars: [
        { name: 'm', value: m === undefined ? dash : String(m) },
        { name: 'n', value: n === undefined ? dash : String(n) },
        { name: 'i', value: i === undefined ? dash : String(i) },
        { name: 'j', value: j === undefined ? dash : String(j) },
        { name: 'x_i', value: inX ? X[i - 1] : dash },
        { name: 'y_j', value: inY ? Y[j - 1] : dash },
        { name: 'c[i,j]', value: cur_c },
        { name: 'b[i,j]', value: cur_b },
      ],
      // Tabel baru ada sesudah baris 3 (let ... be new tables), sebelum itu belum ada yang ditampilkan.
      tables: !created
        ? undefined
        : [
              {
                table: {
                  caption: 'Tabel c dan b (LCS-LENGTH). Angka adalah c[i,j], panah kecil di bawahnya adalah b[i,j]',
                  corner: 'i \\ j',
                  rowHeaders: headers(X),
                  colHeaders: headers(Y),
                  cells,
                },
                labels,
                legend: ['empty', 'filled', 'current', 'source'],
              },
            ],
    })
  }

  m = X.length
  push(1, `Baris 1: m = X.length = ${m}. Barisan X = ${X} punya ${m} anggota.`)
  n = Y.length
  push(2, `Baris 2: n = Y.length = ${n}. Barisan Y = ${Y} punya ${n} anggota.`)
  for (let a = 0; a <= m; a++) {
    c[a] = Array(n + 1).fill(undefined)
    b[a] = Array(n + 1).fill(null)
  }
  created = true
  push(3, `Baris 3: dibuat tabel b berukuran ${m} × ${n} dan tabel c berukuran ${m + 1} × ${n + 1}. Semua sel belum berisi.`)

  for (i = 1; ; i++) {
    const masuk = i <= m
    push(4, masuk ? `Baris 4: i = ${i}, ${i} ≤ ${m} sehingga baris 5 dijalankan.` : `Baris 4: i = ${i} lebih besar dari m = ${m}, jadi kolom 0 selesai diisi dan algoritma lanjut ke baris 6.`)
    if (!masuk) break
    c[i][0] = 0
    push(5, `Baris 5: c[${i},0] = 0. LCS antara ${i} anggota pertama X dan barisan kosong panjangnya 0.`, { cur: [i, 0] })
  }
  for (j = 0; ; j++) {
    const masuk = j <= n
    push(6, masuk ? `Baris 6: j = ${j}, ${j} ≤ ${n} sehingga baris 7 dijalankan.` : `Baris 6: j = ${j} lebih besar dari n = ${n}, jadi baris 0 selesai diisi dan algoritma lanjut ke baris 8.`)
    if (!masuk) break
    c[0][j] = 0
    push(7, `Baris 7: c[0,${j}] = 0. LCS antara barisan kosong dan ${j} anggota pertama Y panjangnya 0.`, { cur: [0, j] })
  }

  for (i = 1; ; i++) {
    j = undefined
    const masukI = i <= m
    push(8, masukI ? `Baris 8: i = ${i}, ${i} ≤ ${m}. Sekarang baris ${i} tabel diisi, yaitu untuk x_${i} = ${X[i - 1]}.` : `Baris 8: i = ${i} lebih besar dari m = ${m}, jadi semua baris sudah terisi dan algoritma lanjut ke baris 18.`)
    if (!masukI) break
    for (j = 1; ; j++) {
      const masukJ = j <= n
      push(
        9,
        masukJ ? `Baris 9: j = ${j}, ${j} ≤ ${n}. Sekarang sel [${i},${j}] diisi.` : `Baris 9: j = ${j} lebih besar dari n = ${n}, jadi baris ${i} selesai dan i dinaikkan.`,
        masukJ ? { cur: [i, j] } : {},
      )
      if (!masukJ) break
      const xi = X[i - 1]
      const yj = Y[j - 1]
      const sama = xi === yj
      push(
        10,
        `Baris 10: x_${i} == y_${j} → ${xi} == ${yj} bernilai ${sama ? 'TRUE' : 'FALSE'}, jadi ${sama ? 'baris 11 dan 12 dijalankan' : 'lanjut ke baris 13'}.`,
        { cur: [i, j] },
      )
      if (sama) {
        c[i][j] = c[i - 1][j - 1] + 1
        push(11, `Baris 11: c[${i},${j}] = c[${i - 1},${j - 1}] + 1 = ${c[i - 1][j - 1]} + 1 = ${c[i][j]}.`, { cur: [i, j], src: [[i - 1, j - 1, ARROW.diag]] })
        b[i][j] = 'diag'
        push(12, `Baris 12: b[${i},${j}] = "↖". Isi sel ini berasal dari sel kiri-atas.`, { cur: [i, j] })
        continue
      }
      const atas = c[i - 1][j]
      const kiri = c[i][j - 1]
      const srcBoth = [[i - 1, j, ARROW.up], [i, j - 1, ARROW.left]]
      push(
        13,
        `Baris 13: c[${i - 1},${j}] ≥ c[${i},${j - 1}] → ${atas} ≥ ${kiri} bernilai ${atas >= kiri ? 'TRUE' : 'FALSE'}, jadi ${atas >= kiri ? 'baris 14 dan 15 dijalankan' : 'lanjut ke baris 16'}.`,
        { cur: [i, j], src: srcBoth },
      )
      if (atas >= kiri) {
        c[i][j] = atas
        push(14, `Baris 14: c[${i},${j}] = c[${i - 1},${j}] = ${atas}.`, { cur: [i, j], src: [[i - 1, j, ARROW.up]] })
        b[i][j] = 'up'
        push(15, `Baris 15: b[${i},${j}] = "↑". Isi sel ini berasal dari sel di atasnya.`, { cur: [i, j] })
      } else {
        c[i][j] = kiri
        push(16, `Baris 16: c[${i},${j}] = c[${i},${j - 1}] = ${kiri}.`, { cur: [i, j], src: [[i, j - 1, ARROW.left]] })
        b[i][j] = 'left'
        push(17, `Baris 17: b[${i},${j}] = "←". Isi sel ini berasal dari sel di kirinya.`, { cur: [i, j] })
      }
    }
  }
  i = undefined
  j = undefined
  push(18, `Baris 18: return c dan b. Panjang LCS ada di sel kanan-bawah: c[${m},${n}] = ${c[m][n]}.`, { cur: [m, n] })
  return steps
}

/**
 * Menjalankan PRINT-LCS(b, X, m, n) satu langkah per pembacaan satu baris. Tabel b dihitung lebih dulu oleh
 * LCS-LENGTH (tidak ditelusuri di sini). Tumpukan panggilan bertambah saat baris 4, 7, atau 8 memanggil dirinya, dan
 * berkurang saat pemanggilan selesai. Tabel menandai sel pemanggilan yang sedang berjalan ('current') dan sel yang
 * sudah pernah dimasuki ('path').
 *
 * @param {{ X: string, Y: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function printLcsPseudoTrace({ X, Y }) {
  const m = X.length
  const n = Y.length
  const { c, b } = lcsLengthTables(X, Y)
  const steps = []
  const stack = []
  const visited = new Set()
  const printed = []
  let calls = 0

  const labels = {
    current: 'sel b[i,j] milik pemanggilan yang sedang berjalan',
    path: 'sel yang sudah pernah dimasuki penelusuran',
  }
  const call = (i, j) => `PRINT-LCS(b, X, ${i}, ${j})`

  function push(line, note, i, j) {
    const cells = []
    for (let a = 0; a <= m; a++) {
      const row = []
      for (let k = 0; k <= n; k++) {
        const filled = { text: String(c[a][k]), sub: b[a][k] ? ARROW[b[a][k]] : '', mark: 'filled' }
        if (visited.has(`${a},${k}`)) filled.mark = 'path'
        row.push(filled)
      }
      cells.push(row)
    }
    cells[i][j].mark = 'current'
    const real = i > 0 && j > 0
    steps.push({
      line,
      note,
      vars: [
        { name: 'i', value: String(i) },
        { name: 'j', value: String(j) },
        { name: 'b[i,j]', value: real ? ARROW[b[i][j]] : dash },
        { name: 'x_i', value: i > 0 ? X[i - 1] : dash },
        { name: 'Tercetak', value: printed.length ? printed.join(' ') : dash },
      ],
      stack: [...stack],
      tables: [
        {
          table: {
            caption: 'Tabel b untuk PRINT-LCS. Angka adalah c[i,j], panah kecil di bawahnya adalah b[i,j] yang dibaca algoritma',
            corner: 'i \\ j',
            rowHeaders: headers(X),
            colHeaders: headers(Y),
            cells,
          },
          labels,
          legend: ['filled', 'current', 'path'],
        },
      ],
    })
  }

  function printLcs(i, j) {
    calls++
    const where = `panggilan ke-${calls}, kedalaman ${stack.length + 1}`
    stack.push(call(i, j))
    visited.add(`${i},${j}`)

    const berhenti = i === 0 || j === 0
    push(
      1,
      berhenti
        ? `Baris 1 (${where}): i == 0 or j == 0 → i = ${i}, j = ${j} bernilai TRUE, jadi penelusuran sampai di tepi tabel dan lanjut ke baris 2.`
        : `Baris 1 (${where}): i == 0 or j == 0 → i = ${i}, j = ${j} bernilai FALSE, jadi lanjut ke baris 3.`,
      i,
      j,
    )
    if (berhenti) {
      push(2, `Baris 2 (${where}): return. Kembali ke fungsi yang memanggil${stack.length > 1 ? `, yaitu ${stack[stack.length - 2]}` : ''}.`, i, j)
      stack.pop()
      return
    }

    const arrow = b[i][j]
    push(3, `Baris 3 (${where}): b[${i},${j}] == "↖" → b[${i},${j}] = "${ARROW_PLAIN[arrow]}" bernilai ${arrow === 'diag' ? 'TRUE' : 'FALSE'}, jadi ${arrow === 'diag' ? 'baris 4 dan 5 dijalankan' : 'lanjut ke baris 6'}.`, i, j)
    if (arrow === 'diag') {
      push(4, `Baris 4 (${where}): ${call(i - 1, j - 1)}. Fungsi memanggil dirinya sendiri untuk sel kiri-atas.`, i, j)
      printLcs(i - 1, j - 1)
      printed.push(X[i - 1])
      push(5, `Baris 5 (${where}): kembali dari ${call(i - 1, j - 1)}. print x_${i} = ${X[i - 1]}. Hasil tercetak sejauh ini: ${printed.join(' ')}.`, i, j)
      stack.pop()
      return
    }
    push(6, `Baris 6 (${where}): b[${i},${j}] == "↑" → b[${i},${j}] = "${ARROW_PLAIN[arrow]}" bernilai ${arrow === 'up' ? 'TRUE' : 'FALSE'}, jadi ${arrow === 'up' ? 'baris 7 dijalankan' : 'baris 8 dijalankan'}.`, i, j)
    if (arrow === 'up') {
      push(7, `Baris 7 (${where}): ${call(i - 1, j)}. Naik ke sel di atasnya tanpa mencetak apa pun.`, i, j)
      printLcs(i - 1, j)
    } else {
      push(8, `Baris 8 (${where}): ${call(i, j - 1)}. Geser ke sel di kirinya tanpa mencetak apa pun.`, i, j)
      printLcs(i, j - 1)
    }
    stack.pop()
  }

  printLcs(m, n)
  const last = steps[steps.length - 1]
  last.note += printed.length
    ? ` Pemanggilan pertama selesai. Urutan yang tercetak adalah ${printed.join(', ')}, jadi LCS-nya adalah ${printed.join('')}.`
    : ' Pemanggilan pertama selesai. Tidak ada yang tercetak, jadi LCS-nya kosong (tidak ada anggota yang sama).'
  return steps
}
