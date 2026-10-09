const MERGE_LINES = [11, 13, 14, 16, 17]

/**
 * Menerjemahkan satu step merge sort menjadi data tampilan.
 * @param {import('./mergeSort.js').MergeStep} step
 * @returns {{ values: number[], marks: string[], aux: { title: string, values: number[], marks: string[] } }}
 *   marks: 'normal' | 'left' | 'right' | 'compare' | 'taken' | 'merged' | 'sorted'
 */
export function mergeSortView(step) {
  const { array, line, lo, hi, mid, i, j, tmp, cmp, merged } = step
  let marks = array.map(() => 'normal')

  if (line === 7) {
    marks = marks.map(() => 'sorted')
  } else {
    for (const [a, b] of merged) for (let k = a; k <= b; k++) marks[k] = 'merged'

    if (line === 3) {
      for (let k = lo; k <= mid; k++) marks[k] = 'left'
      for (let k = mid + 1; k <= hi; k++) marks[k] = 'right'
    }
    if (MERGE_LINES.includes(line)) {
      for (let k = lo; k <= mid; k++) marks[k] = k < i ? 'taken' : 'left'
      for (let k = mid + 1; k <= hi; k++) marks[k] = k < j ? 'taken' : 'right'
      if (cmp) {
        marks[cmp[0]] = 'compare'
        marks[cmp[1]] = 'compare'
      }
    }
  }

  return {
    values: array,
    marks,
    aux: {
      title: 'Penampung (hasil gabungan sementara)',
      values: tmp,
      marks: tmp.map(() => (line === 18 ? 'merged' : 'taken')),
    },
  }
}