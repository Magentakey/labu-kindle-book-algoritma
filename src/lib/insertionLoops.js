// Penelusuran Insertion Sort per putaran j (indeks seperti pseudocode: mulai dari 1). Dipakai penelusuran interaktif di modul
// dan untuk menguji tabel di teks modul.

/**
 * @param {number[]} input
 * @returns {{ awal: number[], putaran: Array<{ j: number, key: number, pemeriksaan: string[], pergeseran: number, tj: number, sesudah: number[], posisiKey: number }> }}
 *   `pemeriksaan`: baris-baris penelusuran satu putaran, termasuk baris terakhir "A[i + 1] = key". `posisiKey`: indeks (mulai 1) tempat key diletakkan.
 */
export function insertionLoops(input) {
  const A = [null, ...input]
  const n = input.length
  const putaran = []
  for (let j = 2; j <= n; j++) {
    const key = A[j]
    let i = j - 1
    let tj = 1
    let pergeseran = 0
    const pemeriksaan = []
    while (true) {
      if (i > 0 && A[i] > key) {
        A[i + 1] = A[i]
        pergeseran += 1
        pemeriksaan.push(`while ${i} > 0 and A[${i}] > key   (${A[i]} > ${key}) TRUE → A[${i + 1}] = ${A[i]}, i = ${i - 1}`)
        i -= 1
        tj += 1
      } else {
        pemeriksaan.push(i > 0 ? `while ${i} > 0 and A[${i}] > key   (${A[i]} > ${key}) FALSE → keluar dari while` : `while ${i} > 0 ...   FALSE → keluar dari while`)
        break
      }
    }
    A[i + 1] = key
    const sesudah = A.slice(1)
    pemeriksaan.push(`A[${i + 1}] = key = ${key}   A = [${sesudah.join(', ')}]`)
    putaran.push({ j, key, pemeriksaan, pergeseran, tj, sesudah, posisiKey: i + 1 })
  }
  return { awal: [...input], putaran }
}

/** Jumlah t_j dan jumlah pergeseran seluruh putaran. */
export function totalLoops(input) {
  const { putaran } = insertionLoops(input)
  return { sumT: putaran.reduce((a, p) => a + p.tj, 0), sumGeser: putaran.reduce((a, p) => a + p.pergeseran, 0) }
}
