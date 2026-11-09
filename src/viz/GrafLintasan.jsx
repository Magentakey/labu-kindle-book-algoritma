import { useId } from 'react'
import { idPanah } from './dfsModel.js'
import { Panah } from './GrafDFS.jsx'
import { teksJarak } from './lintasanModel.js'

const VW = 340
const VH = 200
const MX = 28
const MY = 34
const R = 15
const HALO = { paintOrder: 'stroke' }

/**
 * Graf berarah berbobot (Gambar 1–4 Modul 22). Busur berbentuk garis lurus atau lengkung (agar dua busur berlawanan arah tidak bertumpuk), bobot di tengah busur
 * (bobot negatif tertulis dengan tanda minus dan berwarna merah), nilai v.d (estimasi jarak) di dekat simpul bila `d` diberikan.
 * Busur shortest-path tree (`tebal`, kunci "uv" berarah) digambar tebal dan biru; busur lain tipis abu-abu. Daftar teks lengkap untuk pembaca layar.
 * `diperbarui` (opsional, Modul 23): simpul yang nilai v.d-nya berubah pada putaran ini; digambar kuning dengan cincin lebih tebal (juga disebut di teks untuk pembaca layar).
 * @param {{ simpul: string[], posisi: object, busur: Array<[string,string,number]>, lengkung?: object, posLabel?: object, tebal?: string[], diperbarui?: string[], d?: object|null, sumber?: string|null, label: string, className?: string }} props
 */
export default function GrafLintasan({ simpul, posisi, busur, lengkung = {}, posLabel = {}, tebal = [], diperbarui = [], d = null, sumber = null, label, className }) {
  const pid = idPanah(useId())
  const P = Object.fromEntries(simpul.map((v) => [v, { x: MX + posisi[v].x * (VW - 2 * MX), y: MY + posisi[v].y * (VH - 2 * MY) }]))
  const tebalSet = new Set(tebal)
  const barui = new Set(diperbarui)
  const urut = [...busur].sort((p, q) => (tebalSet.has(`${p[0]}${p[1]}`) ? 1 : 0) - (tebalSet.has(`${q[0]}${q[1]}`) ? 1 : 0))
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-xl" focusable="false">
        <defs>
          <Panah id={pid('tree')} kelas="fill-brand-blue" />
          <Panah id={pid('biasa')} kelas="fill-muted" />
        </defs>
        {urut.map(([u, v, w]) => {
          const kunci = `${u}${v}`
          const a = P[u]
          const b = P[v]
          const bow = lengkung[kunci] ?? 0
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy)
          const nx = dy / len
          const ny = -dx / len
          const c = { x: (a.x + b.x) / 2 + nx * bow * 2, y: (a.y + b.y) / 2 + ny * bow * 2 }
          const satuan = (p, q) => { const l = Math.hypot(q.x - p.x, q.y - p.y); return { x: (q.x - p.x) / l, y: (q.y - p.y) / l } }
          const ua = satuan(a, c)
          const ub = satuan(c, b)
          const s = { x: a.x + ua.x * R, y: a.y + ua.y * R }
          const e = { x: b.x - ub.x * (R + 1), y: b.y - ub.y * (R + 1) }
          const isTebal = tebalSet.has(kunci)
          const t = posLabel[kunci] ?? 0.5
          const titik = { x: (1 - t) ** 2 * a.x + 2 * t * (1 - t) * c.x + t ** 2 * b.x, y: (1 - t) ** 2 * a.y + 2 * t * (1 - t) * c.y + t ** 2 * b.y }
          const arah = bow !== 0 ? Math.sign(bow) : 1
          const lx = titik.x + nx * 9 * arah
          const ly = titik.y + ny * 9 * arah
          return (
            <g key={kunci}>
              <path d={`M${s.x} ${s.y} Q${c.x} ${c.y} ${e.x} ${e.y}`} fill="none" strokeWidth={isTebal ? 4 : 1.8} className={isTebal ? 'stroke-brand-blue' : 'stroke-muted'} markerEnd={`url(#${pid(isTebal ? 'tree' : 'biasa')})`} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" style={HALO} strokeWidth="4" className={`stroke-card text-[12px] font-bold ${w < 0 ? 'fill-bad-text' : 'fill-ink'}`}>{teksJarak(w)}</text>
            </g>
          )
        })}
        {simpul.map((v) => {
          const atas = posisi[v].y < 0.35
          return (
            <g key={v}>
              <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth={barui.has(v) ? 4.5 : v === sumber ? 3.5 : 2.5} className={barui.has(v) ? 'fill-brand-yellow stroke-brand-yellow-strong' : 'fill-card stroke-brand-blue'} />
              <text x={P[v].x} y={P[v].y} textAnchor="middle" dominantBaseline="central" className={`text-[14px] font-bold ${barui.has(v) ? 'fill-on-orange' : 'fill-ink'}`}>{v}</text>
              {d && <text x={P[v].x} y={atas || posisi[v].y === 0.5 ? P[v].y - R - 6 : P[v].y + R + 13} textAnchor="middle" className="fill-ink text-[12px] font-semibold">{teksJarak(d[v])}</text>}
            </g>
          )
        })}
      </svg>
      <div className="sr-only">
        <p>Graf berarah berbobot dengan {simpul.length} simpul dan {busur.length} busur: {busur.map(([u, v, w]) => `${u} ke ${v} bobot ${teksJarak(w)}`).join('; ')}.</p>
        {sumber && <p>Simpul sumber: {sumber}.</p>}
        {d && <p>Nilai v.d: {simpul.map((v) => `${v} = ${teksJarak(d[v])}`).join('; ')}.</p>}
        {diperbarui.length > 0 && <p>Nilai v.d yang berubah pada putaran ini: {diperbarui.join(', ')}.</p>}
        {tebal.length > 0 && <p>Busur tebal (shortest-path tree): {tebal.map((k) => `${k[0]} ke ${k[1]}`).join('; ')}.</p>}
      </div>
    </div>
  )
}
