// Pseudocode CARI_BIL_K(A, k) dari contoh soal di materi 2 (array A berindeks mulai dari 1).
export const cariBilKCode = [
  'for i = 1 to A.length',
  '  if (k == A[i])',
  '    then return i',
  'return -1',
].join('\n')

/** Cost dan rumus jumlah operasi untuk KASUS TERBURUK (k tidak ada di array), persis tabel di materi. */
export const cariBilKCost = {
  formulaLabel: 'Jumlah operasi (kasus terburuk)',
  note: 'Rumus di kolom ini berlaku untuk kasus terburuk, yaitu k tidak ada di dalam array A. Kolom terakhir menghitung jalannya algoritma untuk masukan Anda.',
  rows: [
    { line: 1, cost: 'c₁', formula: 'n + 1' },
    { line: 2, cost: 'c₂', formula: 'n' },
    { line: 3, cost: 'c₃', formula: '0' },
    { line: 4, cost: 'c₄', formula: '1' },
  ],
}

/**
 * Menjalankan CARI_BIL_K(A, k) satu langkah per pembacaan satu baris, sambil menghitung berapa kali tiap baris terbaca.
 * Baris 1 dihitung setiap kali kondisinya diperiksa, termasuk pemeriksaan terakhir saat i = n + 1.
 *
 * @param {{ A: number[], k: number }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function cariBilKTrace({ A, k }) {
  const n = A.length
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  const steps = []
  let i

  const marksFor = (line) =>
    A.map((_, idx) => {
      const c = idx + 1
      if (i === undefined || i > n) return i > n ? 'done' : 'normal'
      if (line === 3 && c === i) return 'found'
      if (c === i) return 'current'
      return c < i ? 'done' : 'normal'
    })

  const push = (line, note) => {
    counts[line] += 1
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'k', value: String(k) },
        { name: 'i', value: i === undefined ? '–' : String(i) },
      ],
      array: { title: 'Array A (indeks mulai dari 1)', values: [...A], marks: marksFor(line), indexBase: 1 },
      counts: { ...counts },
    })
  }

  let foundAt = null
  for (i = 1; ; i++) {
    const masuk = i <= n
    push(
      1,
      masuk
        ? `Baris 1: i = ${i}, ${i} ≤ ${n} sehingga langkah 2 dijalankan.`
        : `Baris 1: i = ${i} lebih besar dari n = ${n}, jadi end for dan algoritma lanjut ke baris 4.`,
    )
    if (!masuk) break

    const sama = k === A[i - 1]
    push(2, `Baris 2: k == A[${i}] → ${k} == ${A[i - 1]} bernilai ${sama ? 'TRUE, lanjut ke baris 3' : 'FALSE, jadi baris 3 tidak dijalankan'}.`)
    if (sama) {
      push(3, `Baris 3: return ${i}. Bilangan ${k} ditemukan di indeks ${i}, algoritma berhenti.`)
      foundAt = i
      break
    }
  }
  if (foundAt === null) push(4, `Baris 4: return -1. Bilangan ${k} tidak ada di dalam array A.`)

  const last = steps[steps.length - 1]
  last.note += ' ' + summarize(n, counts, foundAt)
  return steps
}

function summarize(n, c, foundAt) {
  const t = `T(n) = c₁·${c[1]} + c₂·${c[2]} + c₃·${c[3]} + c₄·${c[4]}.`
  if (foundAt === null) return `${t} Ini kasus terburuk (k tidak ada): c₁·(n + 1) + c₂·n + c₃·0 + c₄·1 dengan n = ${n}.`
  return `${t} Bilangan k ditemukan di indeks ${foundAt}, jadi algoritma berhenti lebih awal dan ini bukan kasus terburuk.`
}
