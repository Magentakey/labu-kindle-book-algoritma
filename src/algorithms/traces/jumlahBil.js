// Pseudocode JUMLAH_n_BIL(A) dari materi 1 (array A berindeks mulai dari 1).
export const jumlahBilCode = ['jumlah = 0', 'for i = 1 to n', '  jumlah = jumlah + A[i]', 'return jumlah'].join('\n')

/**
 * @param {{ A: number[] }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function jumlahBilTrace({ A }) {
  const n = A.length
  let jumlah
  let i
  const steps = []

  const marks = () => A.map((_, idx) => (i !== undefined && idx + 1 === i ? 'current' : i !== undefined && idx + 1 < i ? 'done' : 'normal'))
  const push = (line, note) =>
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'i', value: i === undefined ? '–' : String(i) },
        { name: 'jumlah', value: jumlah === undefined ? '–' : String(jumlah) },
      ],
      array: { title: 'Array A (indeks mulai dari 1)', values: [...A], marks: marks(), indexBase: 1 },
    })

  jumlah = 0
  push(1, 'Baris 1: jumlah = 0.')

  for (i = 1; ; i++) {
    const masuk = i <= n
    push(
      2,
      masuk
        ? `Baris 2: i = ${i}, ${i} ≤ ${n} sehingga langkah 3 dijalankan.`
        : `Baris 2: i = ${i} lebih besar dari n = ${n}, jadi perulangan selesai dan algoritma langsung menjalankan langkah 4.`,
    )
    if (!masuk) break
    const lama = jumlah
    jumlah = jumlah + A[i - 1]
    push(3, `Baris 3: jumlah = jumlah + A[${i}] = ${lama} + ${A[i - 1]} = ${jumlah}.`)
  }

  push(4, `Baris 4: return jumlah. Hasilnya ${jumlah}.`)
  return steps
}
