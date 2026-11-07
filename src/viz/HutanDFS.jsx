import { useId } from 'react'
import { Panah } from './GrafDFS.jsx'
import { HURUF_KELAS, KELAS, hutan, idPanah } from './dfsModel.js'

const VW = 330
const VH = 182
const W = 56
const H = 24
const HALO = { paintOrder: 'stroke' }
// Tree pertama (akar u) berantai di kiri, tree kedua (akar w) di kanan; busur non-tree digambar melengkung di sisinya.
const POS = { u: [100, 24], v: [100, 68], y: [100, 112], x: [100, 156], w: [250, 24], z: [250, 68] }

/**
 * DFS-forest (Gambar 7 Modul 18): tiap simpul berupa kotak "simpul d/f", busur tree biru tebal, busur non-tree merah putus-putus berhuruf B, F, atau C.
 * Dihitung dari hasil dfs() di model. Untuk pembaca layar tersedia daftar bersarang tree dan daftar busur non-tree.
 * @param {{ hasil: object, label: string, className?: string }} props
 */
export default function HutanDFS({ hasil, label, className }) {
  const pid = idPanah(useId())
  const pohon = hutan(hasil)
  const nonTree = hasil.busur.filter((b) => b.kelas !== 'tree')
  const kotak = (k) => POS[k]
  const garisTree = hasil.busur.filter((b) => b.kelas === 'tree')
  const lengkung = (b) => {
    const [ux, uy] = kotak(b.u)
    const [vx, vy] = kotak(b.v)
    if (b.u === b.v) return { d: `M${ux + W / 2} ${uy - 6} C${ux + W / 2 + 32} ${uy - 16} ${ux + W / 2 + 32} ${uy + 16} ${ux + W / 2} ${uy + 6}`, lx: ux + W / 2 + 40, ly: uy + 4 }
    if (b.kelas === 'forward') return { d: `M${ux - W / 2} ${uy} Q${ux - W / 2 - 90} ${(uy + vy) / 2} ${vx - W / 2} ${vy + 6}`, lx: ux - W / 2 - 62, ly: (uy + vy) / 2 + 4 }
    if (b.kelas === 'back') return { d: `M${ux - W / 2} ${uy - 6} Q${ux - W / 2 - 40} ${(uy + vy) / 2} ${vx - W / 2} ${vy + 2}`, lx: ux - W / 2 - 32, ly: (uy + vy) / 2 + 4 }
    // cross: garis lurus dari sudut kiri-bawah w ke sisi kanan y
    return { d: `M${ux - W / 2} ${uy + 8} L${vx + W / 2 + 2} ${vy - 4}`, lx: (ux + vx) / 2 + 6, ly: (uy + vy) / 2 - 2 }
  }
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="h-auto w-full" focusable="false">
        <defs>
          <Panah id={pid('tree')} kelas="fill-brand-blue" />
          <Panah id={pid('non')} kelas="fill-bad" />
        </defs>
        {garisTree.map((b) => {
          const [ux, uy] = kotak(b.u)
          const [vx, vy] = kotak(b.v)
          return <line key={`${b.u}${b.v}`} x1={ux} y1={uy + H / 2} x2={vx} y2={vy - H / 2 - 1} strokeWidth="3.5" className="stroke-brand-blue" markerEnd={`url(#${pid('tree')})`} />
        })}
        {nonTree.map((b) => {
          const g = lengkung(b)
          return (
            <g key={`${b.u}${b.v}`}>
              <path d={g.d} fill="none" strokeWidth="2" strokeDasharray="5 3" className="stroke-bad" markerEnd={`url(#${pid('non')})`} />
              <text x={g.lx} y={g.ly} textAnchor="middle" style={HALO} className="fill-bad-text stroke-card text-[11px] font-bold" strokeWidth="3">{HURUF_KELAS[b.kelas]}</text>
            </g>
          )
        })}
        {Object.keys(POS).map((k) => {
          const [px, py] = POS[k]
          return (
            <g key={k}>
              <rect x={px - W / 2} y={py - H / 2} width={W} height={H} rx="5" strokeWidth="2.5" className="fill-brand-mint stroke-ok" />
              <text x={px} y={py} textAnchor="middle" dominantBaseline="central" className="fill-on-orange text-[12px] font-bold">{k} · {hasil.d[k]}/{hasil.f[k]}</text>
            </g>
          )
        })}
      </svg>
      <div className="sr-only">
        <p>DFS-forest terdiri dari {pohon.length} tree.</p>
        <ul>
          {pohon.map((t) => <li key={t.u}><Cabang n={t} hasil={hasil} /></li>)}
        </ul>
        <p>Busur non-tree:</p>
        <ul>
          {nonTree.map((b) => <li key={`${b.u}${b.v}`}>({b.u}, {b.v}): {KELAS[b.kelas]}</li>)}
        </ul>
      </div>
    </div>
  )
}

function Cabang({ n, hasil }) {
  return (
    <>
      <span>{n.u} ({hasil.d[n.u]}/{hasil.f[n.u]})</span>
      {n.anak.length > 0 && <ul>{n.anak.map((c) => <li key={c.u}><Cabang n={c} hasil={hasil} /></li>)}</ul>}
    </>
  )
}
