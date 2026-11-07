import { useId } from 'react'
import { cx } from '../ui/cx.js'
import { INF, busurGraf, busurPohon, posisiContoh, teksAntrean } from './bfsModel.js'

const VW = 300
const VH = 138
const R = 15
const GAYA = {
  WHITE: { shape: 'fill-panel stroke-muted', dash: '4 3', text: 'fill-ink-soft', w: 2, nama: 'WHITE' },
  GRAY: { shape: 'fill-brand-yellow stroke-brand-yellow-strong', dash: undefined, text: 'fill-on-orange', w: 2.5, nama: 'GRAY' },
  BLACK: { shape: 'fill-brand-mint stroke-ok', dash: undefined, text: 'fill-on-orange', w: 2.5, nama: 'BLACK' },
}

/**
 * Keadaan graf pada satu tahap BFS (Gambar 1–9 Modul 17): nama simpul di dalam lingkaran, jarak d di atasnya, busur predecessor tebal.
 * Warna simpul tidak berdiri sendiri: WHITE bergaris putus, GRAY berisi kuning, BLACK berisi hijau dan bertanda ✓; daftar teks untuk pembaca layar.
 * @param {{ Adj: object, keadaan: { color: object, d: object, pi: object }, Q: string[], label: string, className?: string }} props
 */
export default function GrafBFS({ Adj, keadaan, Q, label, className }) {
  useId()
  const P = Object.fromEntries(Object.keys(Adj).map((k) => [k, { x: 18 + posisiContoh[k].x * (VW - 36), y: 24 + posisiContoh[k].y * (VH - 62) }]))
  const pohon = new Set(busurPohon(keadaan.pi).map(([p, v]) => [p, v].sort().join('|')))
  const simpul = Object.keys(Adj)
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="h-auto w-full" focusable="false">
        {busurGraf(Adj).map(([u, v]) => {
          const aktif = pohon.has([u, v].sort().join('|'))
          return <line key={`${u}${v}`} x1={P[u].x} y1={P[u].y} x2={P[v].x} y2={P[v].y} strokeWidth={aktif ? 4 : 1.5} className={aktif ? 'stroke-brand-blue' : 'stroke-muted'} />
        })}
        {simpul.map((k) => {
          const g = GAYA[keadaan.color[k]]
          return (
            <g key={k}>
              <circle cx={P[k].x} cy={P[k].y} r={R} strokeWidth={g.w} strokeDasharray={g.dash} className={g.shape} />
              <text x={P[k].x} y={P[k].y} textAnchor="middle" dominantBaseline="central" className={cx('text-[14px] font-bold', g.text)}>{k}</text>
              <text x={P[k].x} y={posisiContoh[k].y > 0.5 ? P[k].y + R + 12 : P[k].y - R - 6} textAnchor="middle" className="fill-ink text-[11px] font-semibold">{keadaan.d[k] === INF ? '∞' : keadaan.d[k]}</text>
              {keadaan.color[k] === 'BLACK' && (
                <path d={`M${P[k].x + 10} ${P[k].y - 13}l3 3 6-6`} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-ok" />
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-code mt-1 text-center text-ink">Q = {teksAntrean(Q, keadaan.d)}</p>
      <ul className="sr-only">
        {simpul.map((k) => (
          <li key={k}>
            {k}: {GAYA[keadaan.color[k]].nama}, jarak {keadaan.d[k] === INF ? 'tak hingga' : keadaan.d[k]}, predecessor {keadaan.pi[k] ?? 'NIL'}
          </li>
        ))}
      </ul>
    </div>
  )
}
