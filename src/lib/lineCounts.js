/**
 * Berapa kali tiap baris sudah dieksekusi sampai (dan termasuk) langkah ke-`index`.
 * Dalam mode Tepat, satu langkah = satu eksekusi baris.
 * @param {Array<{ line: number }>} steps
 * @param {number} index  indeks langkah (mulai dari 0)
 * @returns {Record<number, number>}
 */
export function countLinesUpTo(steps, index) {
  const counts = {}
  const end = Math.min(index, steps.length - 1)
  for (let k = 0; k <= end; k++) counts[steps[k].line] = (counts[steps[k].line] ?? 0) + 1
  return counts
}

/**
 * Baris tabel hitungan: hanya baris yang bisa dieksekusi, termasuk yang masih 0 kali.
 * @param {string} code  kode yang sama dengan yang ditampilkan di CodeBlock
 * @param {number[]} execLines
 * @param {Record<number, number>} counts
 */
export function buildCountRows(code, execLines, counts) {
  const lines = code.trim().split('\n')
  return execLines.map((line) => ({ line, text: lines[line - 1], count: counts[line] ?? 0 }))
}
