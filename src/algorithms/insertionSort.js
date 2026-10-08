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
