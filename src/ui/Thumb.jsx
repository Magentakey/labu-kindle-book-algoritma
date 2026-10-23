import Mascot from './Mascot.jsx'

// Gambar kecil di kartu algoritma (Figma: Thumbnail): batang, pohon, graf, dan tabel DP. Warna mengikuti token.
const BAR_H = [34, 46, 64, 88, 60, 102, 40, 74]

function Bars() {
  return (
    <g>
      {BAR_H.map((h, i) => {
        const cls = i < 3 ? 'fill-brand-mint stroke-ok' : i === 3 ? 'fill-brand-orange stroke-brand-burnt' : 'fill-viz-unvisited stroke-viz-unvisited'
        return <rect key={i} x={56 + i * 24} y={130 - h} width="20" height={h} strokeWidth="1.5" className={cls} />
      })}
    </g>
  )
}

function Tree() {
  const edge = 'stroke-muted'
  return (
    <g strokeWidth="2">
      <line x1="150" y1="30" x2="112" y2="62" className="stroke-brand-blue" strokeWidth="3" />
      <line x1="150" y1="30" x2="190" y2="62" className={edge} />
      <line x1="112" y1="72" x2="86" y2="104" className={edge} />
      <line x1="112" y1="72" x2="136" y2="104" className={edge} />
      <line x1="190" y1="72" x2="168" y2="104" className={edge} />
      <line x1="190" y1="72" x2="214" y2="104" className={edge} />
      <rect x="133" y="12" width="34" height="18" rx="1" className="fill-card stroke-brand-blue" strokeWidth="2.5" />
      <rect x="95" y="58" width="34" height="16" rx="1" className="fill-brand-orange stroke-brand-orange" />
      <rect x="173" y="58" width="34" height="16" rx="1" className="fill-viz-unvisited stroke-viz-unvisited" />
      <rect x="68" y="102" width="34" height="16" rx="1" className="fill-brand-mint stroke-ok" />
      <rect x="120" y="102" width="34" height="16" rx="1" className="fill-brand-mint stroke-ok" />
      <rect x="151" y="102" width="34" height="16" rx="1" className="fill-viz-unvisited stroke-viz-unvisited" />
      <rect x="198" y="102" width="34" height="16" rx="1" className="fill-viz-unvisited stroke-viz-unvisited" />
    </g>
  )
}

function Graph() {
  return (
    <g>
      <g strokeWidth="2" className="stroke-muted">
        <line x1="62" y1="86" x2="108" y2="112" />
        <line x1="118" y1="48" x2="108" y2="112" />
        <line x1="108" y1="112" x2="214" y2="94" />
        <line x1="118" y1="48" x2="214" y2="94" />
      </g>
      <line x1="62" y1="86" x2="118" y2="48" strokeWidth="3.5" className="stroke-brand-blue" />
      <line x1="118" y1="48" x2="182" y2="40" strokeWidth="3.5" className="stroke-brand-blue" />
      <line x1="182" y1="40" x2="214" y2="94" strokeWidth="3.5" strokeDasharray="5 5" className="stroke-brand-orange" />
      <rect x="52" y="76" width="20" height="20" rx="2" className="fill-brand-mint stroke-ok" strokeWidth="2" />
      <rect x="108" y="38" width="20" height="20" rx="2" className="fill-brand-mint stroke-ok" strokeWidth="2" />
      <rect x="172" y="30" width="20" height="20" rx="2" className="fill-brand-orange stroke-brand-burnt" strokeWidth="2" />
      <rect x="204" y="84" width="20" height="20" rx="2" className="fill-card stroke-brand-blue" strokeWidth="3" />
      <rect x="98" y="102" width="20" height="20" rx="2" className="fill-viz-unvisited stroke-viz-unvisited" strokeWidth="2" />
    </g>
  )
}

const YELLOW = new Set(['1-3', '1-4', '2-3'])
function Table() {
  const cells = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      const key = `${r}-${c}`
      const cls = key === '2-4' ? 'fill-brand-orange stroke-brand-burnt' : YELLOW.has(key) ? 'fill-brand-yellow stroke-brand-yellow' : 'fill-card stroke-line'
      cells.push(<rect key={key} x={56 + c * 24} y={24 + r * 26} width="22" height="22" strokeWidth="1.5" className={cls} />)
    }
  }
  return (
    <g>
      {cells}
      {Array.from({ length: 8 }, (_, c) => <rect key={`d${c}`} x={56 + c * 24} y={102} width="22" height="22" strokeWidth="1" strokeDasharray="3 3" className="fill-none stroke-line" />)}
    </g>
  )
}

const art = { bars: Bars, tree: Tree, graph: Graph, table: Table }

/** Gambar kartu. `kind="pumpkin"` (atau jenis yang belum ada) memakai maskot labu sebagai pengganti. */
export default function Thumb({ kind }) {
  const Art = art[kind]
  if (!Art) {
    return (
      <div className="flex h-37 items-center justify-center bg-panel">
        <Mascot expression="netral" size={116} />
      </div>
    )
  }
  return (
    <div className="h-37 bg-panel" aria-hidden="true">
      <svg viewBox="0 0 300 148" className="h-full w-full" preserveAspectRatio="xMidYMid meet" focusable="false">
        <Art />
      </svg>
    </div>
  )
}
