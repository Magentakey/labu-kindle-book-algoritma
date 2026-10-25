import { BAR_GROUP, barLayout } from './barsModel.js'
import { cx } from '../ui/cx.js'

const W = 560
const H = 210
const PAD = 12

const GROUP_CLASS = {
  idle: 'fill-viz-unvisited stroke-viz-unvisited',
  done: 'fill-brand-mint stroke-ok',
  active: 'fill-brand-orange stroke-brand-burnt',
  shift: 'fill-orange-soft stroke-brand-orange',
  gap: 'fill-none stroke-muted',
  compare: 'fill-brand-yellow stroke-brand-yellow-strong',
  left: 'fill-info-bg stroke-brand-blue',
  range: 'fill-card stroke-brand-blue',
  discarded: 'fill-panel stroke-line',
}
const GROUP_TEXT = { idle: 'belum diproses', done: 'selesai', active: 'sedang diproses', shift: 'digeser', gap: 'kosong', compare: 'dibandingkan', left: 'bagian kiri', range: 'dalam rentang', discarded: 'dibuang' }

/**
 * Tampilan array sebagai batang (Figma: Bar Array). Warna menurut tanda langkah, nilai di bawah tiap batang,
 * dan nomor indeks di bawahnya. Tiap batang punya teks untuk pembaca layar.
 * @param {{ array: { title: string, values: number[], marks: string[], indexBase: number } }} props
 */
export default function ArrayBars({ array }) {
  const { values, marks, indexBase } = array
  const bars = barLayout(values, W - 2 * PAD, H)
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 52}`} role="img" aria-label={array.title} className="h-auto w-full" focusable="false">
        {bars.map((b, i) => {
          const group = BAR_GROUP[marks[i]] ?? 'idle'
          return (
            <g key={i}>
              <rect x={PAD + b.x} y={12 + b.y} width={b.w} height={b.h} rx="2" strokeWidth="1.5" strokeDasharray={group === 'gap' ? '4 3' : undefined} className={cx(GROUP_CLASS[group], group === 'discarded' && 'opacity-80')} />
              <text x={PAD + b.x + b.w / 2} y={12 + H + 16} textAnchor="middle" className="fill-ink font-code text-[13px]">
                {group === 'gap' ? '' : values[i]}
              </text>
              <text x={PAD + b.x + b.w / 2} y={12 + H + 34} textAnchor="middle" className="fill-ink-soft text-[11px]">
                {i + indexBase}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {values.map((v, i) => (
          <li key={i}>
            Indeks {i + indexBase}: {v}, {GROUP_TEXT[BAR_GROUP[marks[i]] ?? 'idle']}
          </li>
        ))}
      </ul>
    </div>
  )
}
