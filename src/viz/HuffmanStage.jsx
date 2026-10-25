import { buildForest, layoutForest } from './huffmanModel.js'
import { cx } from '../ui/cx.js'

const SLOT = 64
const ROW = 74
const R = 17
const CLASS = {
  queued: 'fill-brand-yellow stroke-brand-yellow-strong',
  active: 'fill-brand-orange stroke-brand-burnt',
  done: 'fill-brand-mint stroke-ok',
}
const TEXT = { queued: 'menunggu di Q', active: 'sedang digabung', done: 'bagian pohon' }

/**
 * Hutan pohon Huffman: tiap akar yang masih di Q (kuning), akar yang baru dikeluarkan dan digabung (oranye),
 * dan simpul yang sudah menjadi bagian pohon (mint). Sisi kiri diberi bit 0, sisi kanan bit 1.
 */
export default function HuffmanStage({ step, leaves }) {
  const forest = buildForest(leaves, step)
  const { pos, edges, width, depth } = layoutForest(forest)
  const VW = Math.max(width * SLOT, 320)
  const VH = (depth + 1) * ROW + 36
  const at = (n) => ({ x: (VW - (width - 1) * SLOT) / 2 + pos[n].x * SLOT, y: 28 + pos[n].y * ROW })
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Hutan pohon Huffman: ${forest.roots.length} pohon`} className="h-auto w-full min-w-[320px]" focusable="false">
        {edges.map((e) => {
          const a = at(e.from)
          const b = at(e.to)
          return (
            <g key={`${e.from}-${e.to}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="2" className="stroke-muted" />
              <rect x={(a.x + b.x) / 2 - 8} y={(a.y + b.y) / 2 - 8} width="16" height="16" rx="3" className="fill-card stroke-line" />
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} textAnchor="middle" dominantBaseline="central" className="fill-heading font-code text-[11px] font-bold">
                {e.bit}
              </text>
            </g>
          )
        })}
        {[...forest.nodes.values()].map((n) => {
          const p = at(n.name)
          const st = forest.status[n.name]
          return (
            <g key={n.name}>
              <circle cx={p.x} cy={p.y} r={R} strokeWidth="2" className={cx(CLASS[st])} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-on-orange text-[12px] font-bold">
                {n.name}
              </text>
              <text x={p.x} y={p.y + R + 12} textAnchor="middle" className="fill-ink-soft font-code text-[11px]">
                {n.freq}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {[...forest.nodes.values()].map((n) => (
          <li key={n.name}>
            Simpul {n.name}, frekuensi {n.freq}, {TEXT[forest.status[n.name]]}
          </li>
        ))}
      </ul>
    </div>
  )
}
