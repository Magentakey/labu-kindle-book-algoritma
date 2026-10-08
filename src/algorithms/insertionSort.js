// Kode yang ditampilkan di CodeBlock. Nomor baris dihitung dari 1 dan
// dipakai oleh generator steps (Hari 9), jadi jangan menambah/menghapus baris
// tanpa menyesuaikan nomor `line` di steps.
export const insertionSortCode = `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
  return arr
}`

/**
 * Satu langkah (snapshot) eksekusi algoritma.
 * @typedef {Object} InsertionStep
 * @property {number[]} array        isi array pada saat langkah ini (salinan)
 * @property {number} line           nomor baris kode yang sedang dieksekusi (mulai dari 1)
 * @property {number|null} i         indeks luar yang sedang diproses
 * @property {number|null} j         indeks pembanding di bagian terurut (bisa -1)
 * @property {number|null} key       nilai yang sedang disisipkan
 * @property {number} sortedCount    jumlah elemen paling kiri yang sudah terurut satu sama lain
 * @property {string} note           penjelasan singkat langkah ini (Bahasa Indonesia)
 */

/**
 * Menjalankan insertion sort sekali dan merekam setiap langkah penting.
 * Array masukan tidak diubah.
 * @param {number[]} input
 * @returns {InsertionStep[]}
 */
export function insertionSortSteps(input) {
  const arr = [...input]
  const n = arr.length
  /** @type {InsertionStep[]} */
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

  push(
    1,
    n === 0
      ? 'Array kosong, tidak ada yang perlu diurutkan.'
      : `Array awal: [${arr.join(', ')}]. Elemen pertama dianggap sudah terurut, lalu elemen berikutnya disisipkan satu per satu.`,
  )

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    push(
      3,
      `Iterasi i = ${i}: ambil key = ${key}. Key akan disisipkan ke bagian terurut di kiri (${i === 1 ? 'indeks 0' : `indeks 0 sampai ${i - 1}`}).`,
      { i, key, sortedCount: i },
    )

    let j = i - 1
    while (true) {
      if (j < 0) {
        push(
          5,
          `j = ${j}, kondisi j >= 0 tidak terpenuhi: tidak ada elemen lagi di kiri, perulangan berhenti.`,
          { i, j, key, sortedCount: i },
        )
        break
      }
      if (arr[j] > key) {
        push(
          5,
          `Bandingkan arr[${j}] = ${arr[j]} dengan key = ${key}: ${arr[j]} lebih besar, maka ${arr[j]} perlu digeser ke kanan.`,
          { i, j, key, sortedCount: i },
        )
        arr[j + 1] = arr[j]
        push(6, `Geser ${arr[j]} dari indeks ${j} ke indeks ${j + 1}.`, { i, j, key, sortedCount: i })
        j--
      } else {
        push(
          5,
          `Bandingkan arr[${j}] = ${arr[j]} dengan key = ${key}: ${arr[j]} tidak lebih besar, perulangan berhenti.`,
          { i, j, key, sortedCount: i },
        )
        break
      }
    }

    arr[j + 1] = key
    push(
      9,
      `Tempatkan key = ${key} di indeks ${j + 1}. Bagian terurut kini mencakup indeks 0 sampai ${i}.`,
      { i, j, key, sortedCount: i + 1 },
    )
  }

  push(11, `Selesai. Array terurut: [${arr.join(', ')}].`, { sortedCount: n })
  return steps
}