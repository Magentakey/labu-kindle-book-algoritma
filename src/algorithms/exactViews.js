import { insertionSortView } from './insertionSortView.js'

/**
 * Tampilan mode Tepat untuk insertion sort. Memakai insertionSortView, ditambah:
 * baris 4 dan 7 juga memperlihatkan key yang sedang dipegang.
 * @param {import('./insertionSort.js').InsertionStep} step
 */
export function insertionSortExactView(step) {
  const v = insertionSortView(step)
  if (step.line === 4 || step.line === 7) v.held = step.key
  return v
}

/**
 * Tampilan mode Tepat untuk merge sort.
 * marks: 'normal' | 'range' | 'left' | 'right' | 'compare' | 'taken' | 'merged' | 'sorted'
 * @param {ReturnType<typeof import('./mergeSortExact.js').mergeSortTrace>[number]} step
 */
export function mergeSortExactView(step) {
  const { array, line, lo, hi, mid, i, j, tmp, cmp, merged, copied, final } = step
  const auxTitle = 'Penampung (hasil gabungan sementara)'

  if (final) {
    return {
      values: array,
      marks: array.map(() => 'sorted'),
      aux: { title: auxTitle, values: tmp, marks: tmp.map(() => 'merged') },
    }
  }

  const marks = array.map(() => 'normal')
  for (const [a, b] of merged) for (let k = a; k <= b; k++) marks[k] = 'merged'
  const fill = (from, to, status) => {
    for (let k = from; k <= to; k++) marks[k] = status
  }

  if (line === 1 || line === 2) fill(lo, hi, 'range')
  if (line === 3 || line === 6 || line === 9 || line === 10) {
    fill(lo, mid, 'left')
    fill(mid + 1, hi, 'right')
  }
  if (line === 4) fill(lo, mid, 'left')
  if (line === 5) fill(mid + 1, hi, 'right')
  if ([11, 12, 13, 14, 16, 17].includes(line)) {
    for (let k = lo; k <= mid; k++) marks[k] = k < i ? 'taken' : 'left'
    for (let k = mid + 1; k <= hi; k++) marks[k] = k < j ? 'taken' : 'right'
    if (cmp) {
      marks[cmp[0]] = 'compare'
      marks[cmp[1]] = 'compare'
    }
  }
  if (line === 18) {
    // Semua elemen sudah ada di penampung; yang sudah disalin kembali ke array ditandai "digabung".
    fill(lo, hi, 'taken')
    fill(lo, lo + copied - 1, 'merged')
  }

  return {
    values: array,
    marks,
    aux: {
      title: auxTitle,
      values: tmp,
      marks: tmp.map((_, k) => (line === 18 && k < copied ? 'merged' : 'taken')),
    },
  }
}
