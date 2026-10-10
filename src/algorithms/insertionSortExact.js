import { insertionSortCode } from './insertionSort.js'

export { insertionSortCode }

/**
 * Baris kode yang bisa dieksekusi (baris `}` dan baris kosong tidak dihitung).
 * Nomor baris mengacu ke `insertionSortCode`.
 */
export const insertionSortExecLines = [1, 2, 3, 4, 5, 6, 7, 9, 11]

/**
 * Mode "Tepat": satu langkah = satu kali sebuah baris kode dieksekusi.
 *
 * Aturan hitung (sama dengan analisis running time di buku):
 * - Baris `for` dan `while` dihitung setiap kali kondisinya diperiksa, termasuk pemeriksaan terakhir yang gagal.
 *   Jadi baris 2 dieksekusi n kali, dan baris 5 dieksekusi (jumlah penggeseran + 1) kali per iterasi luar.
 * - Setiap langkah merekam keadaan SESUDAH baris itu dieksekusi.
 * - Jumlah semua langkah = total eksekusi baris = running time bila tiap baris berbiaya 1.
 *
 * Bentuk datanya sama dengan insertionSortSteps, jadi insertionSortView bisa dipakai.
 * Array masukan tidak diubah.
 * @param {number[]} input
 * @returns {import('./insertionSort.js').InsertionStep[]}
 */
export function insertionSortTrace(input) {
  const arr = [...input]
  const n = arr.length
  const steps = []

  const push = (line, note, state = {}) =>
    steps.push({
      array: [...arr],
      line,
      i: null,
      j: null,
      key: null,
      sortedCount: Math.min(1, n),
      note,
      ...state,
    })

  push(1, n === 0 ? 'Baris 1: insertionSort dipanggil dengan array kosong.' : `Baris 1: insertionSort dipanggil dengan array [${arr.join(', ')}].`)

  let i = 1
  let first = true
  while (true) {
    const cont = i < n
    const sortedCount = Math.min(i, n)
    push(
      2,
      `Baris 2: ${first ? `i diberi nilai awal ${i}` : `i++ membuat i = ${i}`}, lalu periksa i < ${n}: ${
        cont ? 'benar, masuk iterasi.' : 'salah, perulangan luar selesai.'
      }`,
      { i: cont ? i : null, sortedCount },
    )
    first = false
    if (!cont) break

    const key = arr[i]
    push(3, `Baris 3: key = arr[${i}] = ${key}.`, { i, key, sortedCount: i })

    let j = i - 1
    push(4, `Baris 4: j = ${j}, indeks terakhir bagian terurut.`, { i, j, key, sortedCount: i })

    while (true) {
      const ok = j >= 0 && arr[j] > key
      const why =
        j < 0
          ? `j = ${j}, jadi j >= 0 salah (arr[j] tidak diperiksa): perulangan dalam berhenti.`
          : `j = ${j}, arr[${j}] = ${arr[j]} ${ok ? '>' : '≤'} key = ${key}: ${ok ? 'benar, masuk perulangan.' : 'salah, perulangan dalam berhenti.'}`
      push(5, `Baris 5: ${why}`, { i, j, key, sortedCount: i })
      if (!ok) break

      arr[j + 1] = arr[j]
      push(6, `Baris 6: arr[${j + 1}] = arr[${j}], jadi ${arr[j]} digeser ke indeks ${j + 1}.`, { i, j, key, sortedCount: i })
      j--
      push(7, `Baris 7: j-- membuat j = ${j}.`, { i, j, key, sortedCount: i })
    }

    arr[j + 1] = key
    push(9, `Baris 9: arr[${j + 1}] = key, jadi ${key} ditempatkan di indeks ${j + 1}.`, { i, j, key, sortedCount: i + 1 })
    i++
  }

  push(11, `Baris 11: return arr. Selesai, array terurut: [${arr.join(', ')}].`, { sortedCount: n })
  return steps
}
