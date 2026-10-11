// Pseudocode BILANGAN_MAX(bil1, bil2, bil3) dari materi 1. Nomor baris sengaja sama dengan nomor langkah di materi.
export const bilanganMaxCode = [
  'max = bil1',
  'if (max < bil2)',
  '  then max = bil2',
  'if (max < bil3)',
  '  then max = bil3',
  'return max',
].join('\n')

/**
 * @param {{ bil1: number, bil2: number, bil3: number }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function bilanganMaxTrace({ bil1, bil2, bil3 }) {
  let max
  const steps = []
  const push = (line, note) =>
    steps.push({
      line,
      note,
      vars: [
        { name: 'bil1', value: String(bil1) },
        { name: 'bil2', value: String(bil2) },
        { name: 'bil3', value: String(bil3) },
        { name: 'max', value: max === undefined ? '–' : String(max) },
      ],
      array: null,
    })

  max = bil1
  push(1, `Baris 1: max = bil1, jadi max = ${max}.`)

  const first = max < bil2
  push(
    2,
    `Baris 2: max < bil2 → ${max} < ${bil2} bernilai ${first ? 'TRUE, jadi lanjut ke baris 3' : 'FALSE, jadi baris 3 tidak dijalankan dan lanjut ke baris 4'}.`,
  )
  if (first) {
    max = bil2
    push(3, `Baris 3: max = bil2, jadi max = ${max}.`)
  }

  const second = max < bil3
  push(
    4,
    `Baris 4: max < bil3 → ${max} < ${bil3} bernilai ${second ? 'TRUE, jadi lanjut ke baris 5' : 'FALSE, jadi baris 5 tidak dijalankan dan lanjut ke baris 6'}.`,
  )
  if (second) {
    max = bil3
    push(5, `Baris 5: max = bil3, jadi max = ${max}.`)
  }

  push(6, `Baris 6: return max. Nilai max adalah ${max}, itulah bilangan terbesar.`)
  return steps
}
