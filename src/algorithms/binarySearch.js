// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
export const binarySearchCode = `function binarySearch(arr, x) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === x) return mid
    else if (arr[mid] < x) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`

export const BS_MAX_LENGTH = 12
export const BS_MIN_VALUE = -99
export const BS_MAX_VALUE = 99

/**
 * @typedef {{ array: number[], x: number }} SearchInput
 * @typedef {Object} SearchStep
 * @property {number} line
 * @property {string} note
 * @property {{ values: number[], marks: string[], panels: any[] }} view
 */

/**
 * Membaca isian array dan nilai yang dicari. Array harus terurut naik (nilai sama boleh).
 * @param {string} arrayText  contoh "5, 8, 9, 10, 14, 20"
 * @param {string} xText      contoh "12"
 * @returns {{ ok: true, value: SearchInput } | { ok: false, error: string }}
 */
export function parseBinarySearchInput(arrayText, xText) {
  const parts = String(arrayText).trim().split(/[\s,;]+/).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: 'Isi minimal satu angka pada array.' }
  const array = []
  for (const p of parts) {
    if (!/^-?\d+$/.test(p)) return { ok: false, error: `"${p}" bukan bilangan bulat. Pisahkan angka dengan koma.` }
    const v = Number(p)
    if (v < BS_MIN_VALUE || v > BS_MAX_VALUE) return { ok: false, error: `Angka ${p} di luar rentang ${BS_MIN_VALUE} sampai ${BS_MAX_VALUE}.` }
    array.push(v)
  }
  if (array.length > BS_MAX_LENGTH) return { ok: false, error: `Maksimal ${BS_MAX_LENGTH} angka (Anda mengisi ${array.length}).` }
  for (let i = 1; i < array.length; i++) {
    if (array[i] < array[i - 1]) {
      return { ok: false, error: `Array harus terurut naik, tetapi ${array[i]} (indeks ${i}) lebih kecil dari ${array[i - 1]} sebelumnya.` }
    }
  }
  const xRaw = String(xText).trim()
  if (!/^-?\d+$/.test(xRaw)) return { ok: false, error: 'Nilai yang dicari (x) harus bilangan bulat.' }
  const x = Number(xRaw)
  if (x < BS_MIN_VALUE || x > BS_MAX_VALUE) return { ok: false, error: `Nilai x di luar rentang ${BS_MIN_VALUE} sampai ${BS_MAX_VALUE}.` }
  return { ok: true, value: { array, x } }
}

/** @param {SearchInput} v */
export const formatBinarySearchInput = (v) => ({ array: v.array.join(', '), x: String(v.x) })

/**
 * Masukan acak: array terurut 6 sampai 12 angka berbeda, dan x yang separuh waktu ada di array.
 * @param {() => number} [rng]
 * @returns {SearchInput}
 */
export function randomBinarySearchInput(rng = Math.random) {
  const pick = (n) => Math.floor(rng() * n)
  const length = 6 + pick(7)
  const array = []
  let v = 1 + pick(10)
  for (let i = 0; i < length; i++) {
    array.push(v)
    v += 1 + pick(6)
  }
  if (rng() < 0.5) return { array, x: array[pick(length)] }
  // x yang pasti tidak ada di array: dekat rentang array supaya tetap menarik.
  const lo = array[0] - 3
  const span = array[length - 1] + 3 - lo + 1
  for (let i = 0; i < 50; i++) {
    const x = lo + pick(span)
    if (!array.includes(x)) return { array, x }
  }
  return { array, x: array[length - 1] + 1 }
}

/**
 * Menjalankan binary search (iteratif) sekali dan merekam tiap langkah.
 * @param {SearchInput} input
 * @returns {SearchStep[]}
 */
export function binarySearchSteps({ array, x }) {
  const n = array.length
  let lo = 0
  let hi = n - 1
  /** @type {SearchStep[]} */
  const steps = []

  const push = (line, note, mid = null, found = false) => {
    const marks = array.map((_, i) => {
      if (i === mid) return found ? 'found' : 'compare'
      return i >= lo && i <= hi ? 'range' : 'discarded'
    })
    steps.push({
      line,
      note,
      view: {
        values: array,
        marks,
        panels: [
          {
            type: 'list',
            title: 'Variabel',
            items: [`x = ${x}`, `lo = ${lo}`, `hi = ${hi}`, `mid = ${mid ?? '–'}`],
            empty: '',
          },
        ],
      },
    })
  }

  push(2, `Mulai dengan lo = 0 dan hi = ${n - 1}. Seluruh ${n} elemen masih mungkin berisi x = ${x}.`)

  while (lo <= hi) {
    push(3, `lo (${lo}) ≤ hi (${hi}): masih ada ${hi - lo + 1} elemen yang mungkin berisi x, jadi ulangi.`)

    const mid = Math.floor((lo + hi) / 2)
    push(4, `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}. Periksa elemen di tengah, yaitu arr[${mid}] = ${array[mid]}.`, mid)

    if (array[mid] === x) {
      push(5, `arr[${mid}] = ${array[mid]} sama dengan x (${x}). Ditemukan di indeks ${mid}, jadi return ${mid}.`, mid, true)
      return steps
    }
    if (array[mid] < x) {
      const from = lo
      lo = mid + 1
      push(
        6,
        `arr[${mid}] = ${array[mid]} tidak sama dengan x dan lebih kecil dari x (${x}). Karena array terurut, x hanya mungkin di kanan. ` +
          `Buang indeks ${from} sampai ${mid}: lo = ${mid} + 1 = ${lo}.`,
      )
    } else {
      const to = hi
      hi = mid - 1
      push(
        7,
        `arr[${mid}] = ${array[mid]} tidak sama dengan x dan lebih besar dari x (${x}). Karena array terurut, x hanya mungkin di kiri. ` +
          `Buang indeks ${mid} sampai ${to}: hi = ${mid} − 1 = ${hi}.`,
      )
    }
  }

  push(3, `lo (${lo}) > hi (${hi}): tidak ada elemen tersisa, perulangan berhenti.`)
  push(9, `x = ${x} tidak ditemukan di array, jadi return -1 (pada pseudocode materi: NIL).`)
  return steps
}
