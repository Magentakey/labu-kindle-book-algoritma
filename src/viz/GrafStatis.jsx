import { useId } from 'react'
import { posisiMelingkar } from './representasiGrafModel.js'
import { cx } from '../ui/cx.js'

const VW = 340
const VH = 200
const R = 17

/**
 * Gambar graf statis (simpul bernomor, busur tak berarah atau berarah dengan panah, self-loop). Dipakai Gambar 1 dan 2 Modul 16 dan penjelajah
 * Representasi Graf. Daftar busur tersedia juga sebagai teks untuk pembaca layar.
 * @param {{ n: number, busur: Array<[number, number]>, berarah: boolean, posisi?: object, sorot?: [number, number] | null, label: string, className?: string }} props
 */
export default function GrafStatis({ n, busur, berarah, posisi, sorot = null, label, className }) {
  const uid = useId().replace(/:/g, '')
  const norm = posisi && Array.from({ length: n }, (_, i) => i + 1).every((k) => posisi[k]) ? posisi : posisiMelingkar(n)
  const P = Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { x: 30 + norm[i + 1].x * (VW - 60), y: 30 + norm[i + 1].y * (VH - 60) }]))
  const pusat = { x: Object.values(P).reduce((s, q) => s + q.x, 0) / n, y: Object.values(P).reduce((s, q) => s + q.y, 0) / n }
  const ada = new Set(busur.map(([u, v]) => `${u}-${v}`))
  const sorotKey = sorot ? `${sorot[0]}-${sorot[1]}` : null
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-md" focusable="false">
        <defs>
          {['biasa', 'sorot'].map((k) => (
            <marker key={k} id={`${uid}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0 0L10 5L0 10z" className={k === 'sorot' ? 'fill-brand-orange' : 'fill-muted'} />
            </marker>
          ))}
        </defs>
        {busur.map(([u, v], k) => {
          const aktif = sorotKey === `${u}-${v}` || (!berarah && sorotKey === `${v}-${u}`)
          const cls = aktif ? 'stroke-brand-orange' : 'stroke-muted'
          const w = aktif ? 4 : 2
          if (u === v) {
            // self-loop diarahkan keluar dari pusat graf agar tidak bertabrakan dengan busur lain
            const { x, y } = P[u]
            const jarak = Math.hypot(x - pusat.x, y - pusat.y)
            const sudut = jarak < 1 ? -90 : (Math.atan2(y - pusat.y, x - pusat.x) * 180) / Math.PI
            return (
              <g key={k} transform={`translate(${x} ${y}) rotate(${sudut})`}>
                <path d={`M${R - 1} -8C${R + 36} -28 ${R + 36} 28 ${R + 3} 8`} fill="none" strokeWidth={w} className={cls} markerEnd={berarah ? `url(#${uid}-${aktif ? 'sorot' : 'biasa'})` : undefined} />
              </g>
            )
          }
          const a = P[u]
          const b = P[v]
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
          const ux = (b.x - a.x) / len
          const uy = (b.y - a.y) / len
          const dua = berarah && ada.has(`${v}-${u}`)
          const off = dua ? (u < v ? 5 : -5) : 0
          const nx = -uy * off
          const ny = ux * off
          return (
            <line key={k} x1={a.x + nx + ux * R} y1={a.y + ny + uy * R} x2={b.x + nx - ux * (R + (berarah ? 4 : 0))} y2={b.y + ny - uy * (R + (berarah ? 4 : 0))} strokeWidth={w} className={cls} markerEnd={berarah ? `url(#${uid}-${aktif ? 'sorot' : 'biasa'})` : undefined} />
          )
        })}
        {Array.from({ length: n }, (_, i) => i + 1).map((k) => (
          <g key={k}>
            <circle cx={P[k].x} cy={P[k].y} r={R} strokeWidth="2.5" className={cx('fill-card', sorot && sorot.includes(k) ? 'stroke-brand-orange' : 'stroke-brand-blue')} />
            <text x={P[k].x} y={P[k].y} textAnchor="middle" dominantBaseline="central" className="fill-ink text-[15px] font-bold">{k}</text>
          </g>
        ))}
      </svg>
      <p className="sr-only">
        Graf {berarah ? 'berarah' : 'tak berarah'} dengan {n} simpul dan {busur.length} busur: {busur.map(([u, v]) => (berarah ? `${u} ke ${v}` : `${u} dengan ${v}`)).join('; ') || 'tanpa busur'}.
      </p>
    </div>
  )
}
