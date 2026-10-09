// Kode yang ditampilkan di CodeBlock. Nomor baris dihitung dari 1 dan dipakai oleh
// generator steps di bawah, jadi jangan menambah/menghapus baris tanpa menyesuaikan
// nomor `line` di steps (jalankan `npm test` untuk memastikan).
export const mergeSortCode = `function mergeSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return
  const mid = Math.floor((lo + hi) / 2)
  mergeSort(arr, lo, mid)
  mergeSort(arr, mid + 1, hi)
  merge(arr, lo, mid, hi)
}

function merge(arr, lo, mid, hi) {
  const tmp = []
  let i = lo, j = mid + 1
  while (i <= mid && j <= hi) {
    if (arr[i] <= arr[j]) tmp.push(arr[i++])
    else tmp.push(arr[j++])
  }
  while (i <= mid) tmp.push(arr[i++])
  while (j <= hi) tmp.push(arr[j++])
  for (let k = 0; k < tmp.length; k++) arr[lo + k] = tmp[k]
}`

/**
 * Satu langkah (snapshot) eksekusi merge sort.
 * @typedef {Object} MergeStep
 * @property {number[]} array         isi array saat itu (salinan)
 * @property {number} line            nomor baris kode yang sedang dieksekusi (mulai dari 1)
 * @property {number|null} lo         batas kiri rentang yang sedang diproses
 * @property {number|null} hi         batas kanan rentang yang sedang diproses
 * @property {number|null} mid        titik tengah pembagian
 * @property {number|null} i          penunjuk berikutnya di bagian kiri (saat penggabungan)
 * @property {number|null} j          penunjuk berikutnya di bagian kanan (saat penggabungan)
 * @property {number[]} tmp           isi penampung (salinan)
 * @property {[number, number]|null} cmp   indeks dua elemen yang baru dibandingkan
 * @property {Array<[number, number]>} merged  rentang yang sudah selesai digabung
 * @property {string} note            penjelasan singkat langkah ini (Bahasa Indonesia)
 */

const rangeText = (a, b) => (a === b ? `indeks ${a}` : `indeks ${a} sampai ${b}`)

/**
 * Menjalankan merge sort sekali dan merekam setiap langkah penting.
 * Bagian berukuran 1 elemen (kasus dasar) tidak diberi langkah sendiri agar langkah tidak membengkak.
 * Array masukan tidak diubah.
 * @param {number[]} input
 * @returns {MergeStep[]}
 */
export function mergeSortSteps(input) {
  const arr = [...input]
  const n = arr.length
  /** @type {MergeStep[]} */
  const steps = []
  /** @type {Array<[number, number]>} */
  const merged = []

  const push = (line, note, state = {}) =>
    steps.push({
      array: [...arr],
      line,
      lo: null,
      hi: null,
      mid: null,
      i: null,
      j: null,
      tmp: [],
      cmp: null,
      merged: merged.map((r) => [...r]),
      note,
      ...state,
    })

  function merge(lo, mid, hi) {
    const tmp = []
    let i = lo
    let j = mid + 1
    const base = { lo, hi, mid }

    push(
      11,
      `Gabungkan bagian kiri [${arr.slice(lo, mid + 1).join(', ')}] dan bagian kanan [${arr.slice(mid + 1, hi + 1).join(', ')}], masing-masing sudah terurut. Penampung masih kosong.`,
      { ...base, i, j },
    )

    while (i <= mid && j <= hi) {
      const a = arr[i]
      const b = arr[j]
      const cmp = [i, j]
      if (a <= b) {
        tmp.push(a)
        i++
        push(
          13,
          `Bandingkan arr[${cmp[0]}] = ${a} dengan arr[${cmp[1]}] = ${b}: ${a} ≤ ${b}, jadi ${a} dari bagian kiri dipindah ke penampung.`,
          { ...base, i, j, tmp: [...tmp], cmp },
        )
      } else {
        tmp.push(b)
        j++
        push(
          14,
          `Bandingkan arr[${cmp[0]}] = ${a} dengan arr[${cmp[1]}] = ${b}: ${a} > ${b}, jadi ${b} dari bagian kanan dipindah ke penampung.`,
          { ...base, i, j, tmp: [...tmp], cmp },
        )
      }
    }

    while (i <= mid) {
      const v = arr[i]
      tmp.push(v)
      i++
      push(16, `Bagian kanan sudah habis. Sisa dari bagian kiri disalin ke penampung: ${v}.`, {
        ...base, i, j, tmp: [...tmp],
      })
    }
    while (j <= hi) {
      const v = arr[j]
      tmp.push(v)
      j++
      push(17, `Bagian kiri sudah habis. Sisa dari bagian kanan disalin ke penampung: ${v}.`, {
        ...base, i, j, tmp: [...tmp],
      })
    }

    for (let k = 0; k < tmp.length; k++) arr[lo + k] = tmp[k]
    merged.push([lo, hi])
    push(
      18,
      `Salin isi penampung kembali ke arr[${lo}..${hi}]. Bagian ini sekarang terurut: [${tmp.join(', ')}].`,
      { ...base, i, j, tmp: [...tmp] },
    )
  }

  function sort(lo, hi) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    const leftSize = mid - lo + 1
    const rightSize = hi - mid
    push(
      3,
      `Bagi ${rangeText(lo, hi)} di mid = ${mid}: bagian kiri ${rangeText(lo, mid)} berisi [${arr.slice(lo, mid + 1).join(', ')}], bagian kanan ${rangeText(mid + 1, hi)} berisi [${arr.slice(mid + 1, hi + 1).join(', ')}].` +
      (leftSize === 1 || rightSize === 1 ? ' Bagian berukuran satu elemen sudah terurut (kasus dasar, baris 2).' : ''),
      { lo, hi, mid },
    )
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  push(
    1,
    n === 0
      ? 'Array kosong, tidak ada yang perlu diurutkan.'
      : n === 1
        ? 'Array hanya berisi satu elemen, sudah terurut.'
        : `Array awal: [${arr.join(', ')}]. Merge sort membagi array menjadi dua bagian, mengurutkan masing-masing, lalu menggabungkannya.`,
    { lo: 0, hi: n - 1 },
  )
  sort(0, n - 1)
  push(7, `Selesai. Array terurut: [${arr.join(', ')}].`, { lo: 0, hi: n - 1 })
  return steps
}