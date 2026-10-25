import ArrayBars from './ArrayBars.jsx'
import GraphStage from './GraphStage.jsx'
import HuffmanStage from './HuffmanStage.jsx'
import TableStage from './TableStage.jsx'
import TimelineStage from './TimelineStage.jsx'

/** Memilih gambar menurut jenis tampilan (`stage`) algoritma, dari data langkah yang sedang aktif. */
export default function StageView({ stage, step, view, graph, positions, values, showWeights, showArrows, label }) {
  if (stage === 'graph') return <GraphStage view={view} graph={graph} positions={positions} showWeights={showWeights} showArrows={showArrows} label={label} />
  if (stage === 'bars') return <ArrayBars array={step.array} />
  if (stage === 'table') return <TableStage step={step} />
  if (stage === 'timeline') return <TimelineStage step={step} />
  if (stage === 'huffman') return <HuffmanStage step={step} leaves={values.C} />
  return null
}
