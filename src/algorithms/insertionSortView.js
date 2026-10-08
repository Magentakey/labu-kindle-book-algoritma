/**
 * Menerjemahkan satu step Insertion Sort menjadi data tampilan untuk BarChart.
 * @param {import('./insertionSort.js').InsertionStep} step
 * @returns {{ values: number[], marks: string[], held: number|null }}
 *   marks: 'normal' | 'sorted' | 'compare' | 'shift' | 'placed' | 'key'
 *   held : nilai key yang sedang "dipegang" (di luar array), atau null
 */
export function insertionSortView(step) {
  const { array, line, i, j, key, sortedCount } = step
  const marks = array.map((_, idx) => (idx < sortedCount ? 'sorted' : 'normal'))
  let held = null

  if (line === 3) {
    marks[i] = 'key' // asal key diambil
    held = key
  }
  if (line === 5 || line === 6) held = key
  if (line === 5 && j >= 0) marks[j] = 'compare'
  if (line === 6) marks[j + 1] = 'shift'
  if (line === 9) marks[j + 1] = 'placed'

  return { values: array, marks, held }
}