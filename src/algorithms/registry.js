import { insertionSortCode, insertionSortSteps } from './insertionSort.js'
import { insertionSortView } from './insertionSortView.js'
import { mergeSortCode, mergeSortSteps } from './mergeSort.js'
import { mergeSortView } from './mergeSortView.js'

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
    legend: ['normal', 'sorted', 'compare', 'shift', 'placed', 'key'],
  },
  mergeSort: {
    code: mergeSortCode,
    codeLabel: 'Kode merge sort',
    chartLabel: 'Diagram batang merge sort',
    initialArray: [6, 3, 8, 1, 5, 2],
    buildSteps: mergeSortSteps,
    toView: mergeSortView,
    legend: ['normal', 'left', 'right', 'compare', 'taken', 'merged', 'sorted'],
  },
}