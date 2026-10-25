import { useId } from 'react'
import { layoutPositions } from './graphModel.js'
import { cx } from '../ui/cx.js'

const VW = 560
const VH = 400
const R = 22

// Gaya per status (token warna). Teks di atas warna terang selalu gelap (aturan kontras style guide).
const NODE_CLASS = {
  unvisited: { shape: 'fill-panel stroke-muted', dash: '4 3', text: 'fill-ink-soft', w: 2 },
  queued: { shape: 'fill-brand-yellow stroke-brand-yellow-strong', text: 'fill-on-orange', w: 2.5 },
  reached: { shape: 'fill-ok-bg stroke-ok', text: 'fill-ink', w: 2.5 },
  active: { shape: 'fill-brand-orange stroke-brand-burnt', text: 'fill-on-orange', w: 2.5 },
  relax: { shape: 'fill-card stroke-brand-blue', text: 'fill-ink', w: 4 },
  done: { shape: 'fill-brand-mint stroke-ok', text: 'fill-on-orange', w: 2.5 },
}
const EDGE_CLASS = {
  normal: { line: 'stroke-muted', w: 2, arrow: 'fill-muted' },
  tree: { line: 'stroke-brand-blue', w: 4, arrow: 'fill-brand-blue' },
  rejected: { line: 'stroke-bad', w: 2, dash: '4 4', arrow: 'fill-bad' },
  flow: { line: 'stroke-brand-orange edge-flow', w: 3.5, dash: '8 6', arrow: 'fill-brand-orange' },
}
const DRAW_ORDER = ['normal', 'tree', 'rejected', 'flow']
const statusText = { unvisited: 'belum dikunjungi', queued: 'menunggu', reached: 'terjangkau', active: 'sedang diproses', relax: 'sedang diperiksa', done: 'selesai' }

const NODE_SWATCH = {
  unvisited: 'border border-dashed border-muted bg-panel',
  queued: 'border border-brand-yellow-strong bg-brand-yellow',
  reached: 'border border-ok bg-ok-bg',
  active: 'bg-brand-orange',
  relax: 'border-[3px] border-brand-blue bg-card',
  done: 'bg-brand-mint',
  idle: 'border border-viz-unvisited bg-viz-unvisited',
  compare: 'border border-brand-yellow-strong bg-brand-yellow',
  left: 'border border-brand-blue bg-info-bg',
  range: 'border-[3px] border-brand-blue bg-card',
  discarded: 'border border-dashed border-muted bg-panel',
  shift: 'border border-brand-orange bg-orange-soft',
  gap: 'border border-dashed border-muted bg-card',
}
const EDGE_SWATCH = {
  flow: { cls: 'stroke-brand-orange', w: 3, dash: '5 3' },
  tree: { cls: 'stroke-brand-blue', w: 4 },
  rejected: { cls: 'stroke-bad', w: 2, dash: '3 3' },
}

/** Legenda warna: lingkaran untuk status simpul, garis untuk status sisi. */
export function Legend({ legend }) {
  return (
    <ul className="text-caption flex flex-wrap gap-x-5 gap-y-2 text-ink">
      {legend.nodes.map(([k, label]) => (
        <li key={k} className="flex items-center gap-2">
          <span className={cx('size-3.5 shrink-0 rounded-full', NODE_SWATCH[k])} aria-hidden="true" />
          {label}
        </li>
      ))}
      {legend.edges.map(([k, label]) => (
        <li key={k} className="flex items-center gap-2">
          <svg width="26" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="25" y2="4" strokeWidth={EDGE_SWATCH[k].w} strokeDasharray={EDGE_SWATCH[k].dash} className={EDGE_SWATCH[k].cls} />
          </svg>
          {label}
        </li>
      ))}
    </ul>
  )
}

/**
 * Gambar graf untuk satu langkah (Figma: Visualisasi). Simpul bernama huruf dengan keterangan nilai di bawahnya,
 * bobot di kotak kecil pada garis, busur yang sedang dilewati mengalir (garis putus oranye), dan simpul selesai bertanda ✓.
 * @param {{ view: { nodes: Array<{ name: string, status: string, sub: string }>, edges: Array<{ u: string, v: string, w: number|null, status: string }> }, graph: { names: string[], directed: boolean, weighted: boolean }, positions?: object|null, showWeights?: boolean, showArrows?: boolean, label?: string }} props
 */
export default function GraphStage({ view, graph, positions, showWeights = true, showArrows = true, label }) {
  const uid = useId().replace(/:/g, '')
  const norm = layoutPositions(graph.names, positions)
  const P = Object.fromEntries(graph.names.map((n) => [n, { x: 60 + norm[n].x * (VW - 120), y: 48 + norm[n].y * (VH - 130) }]))
  const arrows = graph.directed && showArrows
  const pairs = new Set(view.edges.map((e) => `${e.u}\u0000${e.v}`))

  const edgeGeom = (e) => {
    const a = P[e.u]
    const b = P[e.v]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const nx = -uy
    const ny = ux
    const both = graph.directed && pairs.has(`${e.v}\u0000${e.u}`)
    const off = both ? (graph.names.indexOf(e.u) < graph.names.indexOf(e.v) ? 7 : -7) : 0
    const gap = arrows ? 4 : 0
    return {
      x1: a.x + nx * off + ux * R,
      y1: a.y + ny * off + uy * R,
      x2: b.x + nx * off - ux * (R + gap),
      y2: b.y + ny * off - uy * (R + gap),
      mx: (a.x + b.x) / 2 + nx * off * 1.6,
      my: (a.y + b.y) / 2 + ny * off * 1.6,
    }
  }

  return (
    <div>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="h-auto w-full" focusable="false">
        <defs>
          {Object.entries(EDGE_CLASS).map(([k, c]) => (
            <marker key={k} id={`${uid}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0 0L10 5L0 10z" className={c.arrow} />
            </marker>
          ))}
        </defs>
        {DRAW_ORDER.flatMap((st) =>
          view.edges.map((e, k) => ({ e, k })).filter(({ e }) => e.status === st),
        ).map(({ e, k }) => {
          const c = EDGE_CLASS[e.status]
          if (e.u === e.v) {
            const { x, y } = P[e.u]
            return <path key={k} d={`M${x - 9} ${y - R + 2}C${x - 26} ${y - R - 34} ${x + 26} ${y - R - 34} ${x + 9} ${y - R + 2}`} fill="none" strokeWidth={c.w} strokeDasharray={c.dash} className={c.line} />
          }
          const g = edgeGeom(e)
          return <line key={k} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} strokeWidth={c.w} strokeDasharray={c.dash} markerEnd={arrows ? `url(#${uid}-${e.status})` : undefined} className={c.line} />
        })}
        {showWeights && graph.weighted &&
          view.edges.map((e, k) => {
            if (e.u === e.v) return null
            const g = edgeGeom(e)
            const text = String(e.w).replace('-', '−')
            const w = Math.max(24, text.length * 9 + 12)
            const flow = e.status === 'flow'
            return (
              <g key={`w${k}`}>
                <rect x={g.mx - w / 2} y={g.my - 10} width={w} height="20" rx="3" className={flow ? 'fill-brand-orange stroke-brand-burnt' : 'fill-card stroke-line'} strokeWidth="1" />
                <text x={g.mx} y={g.my} textAnchor="middle" dominantBaseline="central" className={cx('text-[12px] font-semibold', flow ? 'fill-on-orange' : 'fill-ink')}>
                  {text}
                </text>
              </g>
            )
          })}
        {view.nodes.map((n) => {
          const c = NODE_CLASS[n.status]
          const { x, y } = P[n.name]
          const change = n.sub.includes('→')
          return (
            <g key={n.name} style={n.status === 'active' ? { filter: 'drop-shadow(0 0 8px rgb(255 127 80 / 0.7))' } : undefined}>
              <circle cx={x} cy={y} r={R} strokeWidth={c.w} strokeDasharray={c.dash} className={c.shape} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className={cx('text-[16px] font-bold', c.text)}>
                {n.name}
              </text>
              {n.status === 'done' && (
                <g>
                  <circle cx={x + 16} cy={y - 16} r="8" className="fill-card stroke-ok" strokeWidth="1.5" />
                  <path d={`M${x + 12.5} ${y - 16}l2.6 2.6 5-5.2`} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-ok" />
                </g>
              )}
              {n.sub &&
                (change ? (
                  <g>
                    <rect x={x - (n.sub.length * 3.6 + 8)} y={y + R + 6} width={n.sub.length * 7.2 + 16} height="20" rx="3" className="fill-info-bg stroke-brand-blue" strokeWidth="1" />
                    <text x={x} y={y + R + 16} textAnchor="middle" dominantBaseline="central" className="fill-ink text-[12px]">
                      {n.sub}
                    </text>
                  </g>
                ) : (
                  <text x={x} y={y + R + 16} textAnchor="middle" dominantBaseline="central" className="fill-ink-soft text-[12px]">
                    {n.sub}
                  </text>
                ))}
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {view.nodes.map((n) => (
          <li key={n.name}>
            Simpul {n.name}: {statusText[n.status]}
            {n.sub ? `, ${n.sub}` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
