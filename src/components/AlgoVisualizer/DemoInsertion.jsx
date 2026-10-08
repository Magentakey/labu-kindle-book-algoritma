// SEMENTARA: dipakai untuk melihat BarChart bergerak. Digantikan AlgoVisualizer di Hari 11.
import { useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import BarChart from '../BarChart/BarChart.jsx'
import { insertionSortCode, insertionSortSteps } from '../../algorithms/insertionSort.js'
import { insertionSortView } from '../../algorithms/insertionSortView.js'

const INPUT = [5, 2, 4, 1, 3]
const steps = insertionSortSteps(INPUT)
const MIN = Math.min(...INPUT)
const MAX = Math.max(...INPUT)

export default function DemoInsertion() {
  const [no, setNo] = useState(0)
  const step = steps[no]
  const view = insertionSortView(step)

  return (
    <div className="mt-2 grid gap-4 lg:grid-cols-2">
      <CodeBlock code={insertionSortCode} highlightLine={step.line} label="Kode insertion sort" />
      <div>
        <BarChart
          values={view.values}
          marks={view.marks}
          held={view.held}
          min={MIN}
          max={MAX}
          label="Diagram batang insertion sort"
        />
        <label htmlFor="demo-langkah" className="mt-3 block font-medium">
          Langkah {no + 1} dari {steps.length}
        </label>
        <input
          id="demo-langkah"
          type="range"
          min={0}
          max={steps.length - 1}
          value={no}
          onChange={(e) => setNo(Number(e.target.value))}
          className="w-full accent-stone-900"
        />
        <p aria-live="polite" className="mt-2">{step.note}</p>
      </div>
    </div>
  )
}