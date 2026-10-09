import { insertionSortCode, insertionSortSteps } from './insertionSort.js'
import { insertionSortView } from './insertionSortView.js'

/**
 * Daftar visualizer. Kuncinya sama dengan field `visualizer` di materials.json.
 * Menambah algoritma baru = menambah satu entri di sini.
 */
export const visualizers = {
  insertionSort: {
    code: insertionSortCode,
    codeLabel: 'Kode insertion sort',
    chartLabel: 'Diagram batang insertion sort',
    initialArray: [5, 2, 4, 1, 3],
    buildSteps: insertionSortSteps,
    toView: insertionSortView,
  },
}