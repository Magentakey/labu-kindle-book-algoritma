import { mergeSortCode } from './mergeSort.js'

export { mergeSortCode }

/**
 * Baris kode yang bisa dieksekusi (baris `}`, baris kosong, dan `else` yang berdiri sendiri tidak ada di kode ini).
 * Nomor baris mengacu ke `mergeSortCode`.
 */
export const mergeSortExecLines = [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 16, 17, 18]

const rangeText = (a, b) => (a === b ? `indeks ${a}` : `indeks ${a} sampai ${b}`)

/**
 * Mode "Tepat" untuk merge sort: satu langkah = satu kali sebuah baris kode dieksekusi.
 *
 * Aturan hitung:
 * - Baris 1 dihitung setiap kali mergeSort dipanggil (2n - 1 kali untuk n ≥ 1), baris 9 setiap kali merge dipanggil.
 * - Baris `while` dan `for` dihitung setiap kali kondisinya diperiksa, termasuk pemeriksaan terakhir yang gagal.
 *   Pada baris 16, 17, dan 18 isi perulangan satu baris dengan kondisinya, jadi pemeriksaan yang berhasil sudah termasuk isi.
 * - Baris 13 dieksekusi tiap perbandingan; baris 14 (else) hanya saat perbandingan itu salah.
 * - Setiap langkah merekam keadaan SESUDAH baris itu dieksekusi. Baris pemanggilan (4, 5, 6) direkam saat dipanggil.
 *
 * Data langkah sama dengan mergeSortSteps, ditambah `copied` (jumlah posisi yang sudah disalin pada baris 18)
 * dan `final` (langkah terakhir). Gunakan mergeSortExactView untuk tampilannya.
 * Array masukan tidak diubah.
 * @param {number[]} input
 * @returns {Array<import('./mergeSort.js').MergeStep & { copied: number|null, final: boolean }>}
 */
export function mergeSortTrace(input) {
  const arr = [...input]
  const n = arr.length
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
      copied: null,
      final: false,
      note,
      ...state,
    })

  function merge(lo, mid, hi) {
    const base = { lo, hi, mid }
    push(
      9,
      `Baris 9: merge(arr, ${lo}, ${mid}, ${hi}) dipanggil. Bagian kiri [${arr.slice(lo, mid + 1).join(', ')}] dan kanan [${arr.slice(mid + 1, hi + 1).join(', ')}] sudah terurut.`,
      base,
    )

    const tmp = []
    push(10, 'Baris 10: tmp = [], penampung dibuat kosong.', { ...base, tmp: [] })

    let i = lo
    let j = mid + 1
    push(11, `Baris 11: i = ${i}, j = ${j}.`, { ...base, i, j, tmp: [] })

    while (true) {
      const ok = i <= mid && j <= hi
      const why = ok
        ? `i = ${i} ≤ mid = ${mid} dan j = ${j} ≤ hi = ${hi}: benar, masuk perulangan.`
        : i > mid
          ? `i = ${i} > mid = ${mid}: salah, bagian kiri habis.`
          : `j = ${j} > hi = ${hi}: salah, bagian kanan habis.`
      push(12, `Baris 12: ${why}`, { ...base, i, j, tmp: [...tmp] })
      if (!ok) break

      const a = arr[i]
      const b = arr[j]
      const cmp = [i, j]
      if (a <= b) {
        tmp.push(a)
        i++
        push(13, `Baris 13: arr[${cmp[0]}] = ${a} ≤ arr[${cmp[1]}] = ${b} benar, jadi ${a} dari bagian kiri masuk ke penampung.`, {
          ...base, i, j, tmp: [...tmp], cmp,
        })
      } else {
        push(13, `Baris 13: arr[${cmp[0]}] = ${a} ≤ arr[${cmp[1]}] = ${b} salah, lanjut ke else (baris 14).`, {
          ...base, i, j, tmp: [...tmp], cmp,
        })
        tmp.push(b)
        j++
        push(14, `Baris 14: ${b} dari bagian kanan masuk ke penampung.`, { ...base, i, j, tmp: [...tmp], cmp })
      }
    }

    while (true) {
      const ok = i <= mid
      if (ok) {
        tmp.push(arr[i])
        i++
      }
      push(
        16,
        ok
          ? `Baris 16: i ≤ mid benar, sisa bagian kiri ${arr[i - 1]} disalin ke penampung.`
          : `Baris 16: i = ${i} > mid = ${mid} salah, tidak ada sisa bagian kiri.`,
        { ...base, i, j, tmp: [...tmp] },
      )
      if (!ok) break
    }

    while (true) {
      const ok = j <= hi
      if (ok) {
        tmp.push(arr[j])
        j++
      }
      push(
        17,
        ok
          ? `Baris 17: j ≤ hi benar, sisa bagian kanan ${arr[j - 1]} disalin ke penampung.`
          : `Baris 17: j = ${j} > hi = ${hi} salah, tidak ada sisa bagian kanan.`,
        { ...base, i, j, tmp: [...tmp] },
      )
      if (!ok) break
    }

    for (let k = 0; ; k++) {
      const ok = k < tmp.length
      if (ok) arr[lo + k] = tmp[k]
      else merged.push([lo, hi])
      push(
        18,
        ok
          ? `Baris 18: k = ${k} < ${tmp.length} benar, tmp[${k}] = ${tmp[k]} disalin ke arr[${lo + k}].`
          : `Baris 18: k = ${k} < ${tmp.length} salah, penyalinan selesai. ${rangeText(lo, hi)} kini terurut: [${tmp.join(', ')}].`,
        { ...base, i, j, tmp: [...tmp], copied: ok ? k + 1 : tmp.length },
      )
      if (!ok) break
    }
  }

  function sort(lo, hi) {
    push(1, `Baris 1: mergeSort(arr, ${lo}, ${hi}) dipanggil untuk ${hi < lo ? 'rentang kosong' : rangeText(lo, hi)}.`, { lo, hi })
    const base = lo >= hi
    push(
      2,
      base
        ? `Baris 2: lo = ${lo} >= hi = ${hi} benar, ${hi < lo ? 'rentang kosong' : 'bagian satu elemen sudah terurut'}, langsung return.`
        : `Baris 2: lo = ${lo} >= hi = ${hi} salah, bagian ini masih perlu dibagi.`,
      { lo, hi },
    )
    if (base) return

    const mid = Math.floor((lo + hi) / 2)
    push(3, `Baris 3: mid = ${mid}. Kiri ${rangeText(lo, mid)}, kanan ${rangeText(mid + 1, hi)}.`, { lo, hi, mid })
    push(4, `Baris 4: mergeSort(arr, ${lo}, ${mid}) dipanggil untuk mengurutkan bagian kiri.`, { lo, hi, mid })
    sort(lo, mid)
    push(5, `Baris 5: mergeSort(arr, ${mid + 1}, ${hi}) dipanggil untuk mengurutkan bagian kanan.`, { lo, hi, mid })
    sort(mid + 1, hi)
    push(6, `Baris 6: merge(arr, ${lo}, ${mid}, ${hi}) dipanggil untuk menggabungkan kedua bagian.`, { lo, hi, mid })
    merge(lo, mid, hi)
  }

  sort(0, n - 1)
  const last = steps[steps.length - 1]
  last.final = true
  last.note += ` Selesai, array terurut: [${arr.join(', ')}].`
  return steps
}
