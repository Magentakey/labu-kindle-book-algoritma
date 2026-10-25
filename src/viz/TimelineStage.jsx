import { BAR_GROUP } from './barsModel.js'
import { timelineLayout } from './timelineModel.js'

const W = 460
const LEFT = 44
const ROW = 22
const GAP = 7
const CLASS = {
  idle: 'fill-viz-unvisited stroke-viz-unvisited',
  done: 'fill-brand-mint stroke-ok',
  active: 'fill-brand-orange stroke-brand-burnt',
  compare: 'fill-brand-yellow stroke-brand-yellow-strong',
  discarded: 'fill-panel stroke-muted',
}

/**
 * Garis waktu pemilihan aktivitas (Greedy Activity-Selection): tiap aktivitas satu batang dari waktu mulai ke waktu selesai.
 * Dipilih = mint, sedang diperiksa = oranye, dibandingkan = kuning, ditolak karena bertabrakan = abu putus-putus.
 */
export default function TimelineStage({ step }) {
  const [s, f] = step.arrays
  const t = timelineLayout(s.values, f.values, s.marks, W)
  const height = t.rows.length * (ROW + GAP) + 30
  return (
    <div>
      <svg viewBox={`0 0 ${LEFT + W + 16} ${height}`} role="img" aria-label="Garis waktu aktivitas: tiap batang dari waktu mulai sampai waktu selesai" className="h-auto w-full" focusable="false">
        {t.ticks.map((x) => (
          <g key={x}>
            <line x1={LEFT + (x * W) / t.max} x2={LEFT + (x * W) / t.max} y1="0" y2={height - 22} className="stroke-line" strokeWidth="1" />
            <text x={LEFT + (x * W) / t.max} y={height - 6} textAnchor="middle" className="fill-ink-soft text-[11px]">
              {x}
            </text>
          </g>
        ))}
        {t.rows.map((r, i) => {
          const group = BAR_GROUP[r.mark] ?? 'idle'
          const y = 4 + i * (ROW + GAP)
          return (
            <g key={r.label}>
              <text x={LEFT - 8} y={y + ROW / 2} textAnchor="end" dominantBaseline="central" className="fill-ink font-code text-[12px]">
                {r.label}
              </text>
              <rect x={LEFT + r.x} y={y} width={r.w} height={ROW} rx="3" strokeWidth="1.5" strokeDasharray={group === 'discarded' ? '4 3' : undefined} className={CLASS[group]} />
              {r.w > 34 && (
                <text x={LEFT + r.x + r.w / 2} y={y + ROW / 2} textAnchor="middle" dominantBaseline="central" className="fill-on-orange font-code text-[11px]">
                  {r.start}–{r.finish}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {t.rows.map((r) => (
          <li key={r.label}>
            {r.label}: mulai {r.start}, selesai {r.finish}, {r.mark === 'chosen' ? 'dipilih' : r.mark === 'skipped' ? 'ditolak' : r.mark === 'current' ? 'sedang diperiksa' : r.mark === 'compare' ? 'dibandingkan' : 'belum diperiksa'}
          </li>
        ))}
      </ul>
    </div>
  )
}
