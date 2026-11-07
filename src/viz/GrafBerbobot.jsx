import { bobotBusur, namaBusur } from './mstModel.js'

const VW = 340
const VH = 214
const R = 14
const HALO = { paintOrder: 'stroke' }

/**
 * Graf tak berarah berbobot (Gambar 1 dan 2 Modul 19). Bobot ditulis di tengah busur.
 * Penanda tidak bergantung warna: busur MST/A tebal (oranye atau biru), crossing edge putus-putus merah, busur lain tipis abu-abu;
 * simpul di S berisi biru dan bersegi, simpul di V − S berlingkar putus-putus. Daftar teks lengkap untuk pembaca layar.
 * @param {{ simpul: string[], busur: Array<[string,string,number]>, posisi: object, tebal?: string[], gayaTebal?: 'oranye'|'biru', silang?: string[], light?: string|null, S?: string[]|null, label: string, className?: string }} props
 */
export default function GrafBerbobot({ simpul, busur, posisi, tebal = [], gayaTebal = 'oranye', silang = [], light = null, S = null, label, className }) {
  const P = Object.fromEntries(simpul.map((v) => [v, { x: 24 + posisi[v].x * (VW - 48), y: 24 + posisi[v].y * (VH - 48) }]))
  const tebalSet = new Set(tebal)
  const silangSet = new Set(silang)
  const dalamS = S ? new Set(S) : null
  const urut = [...busur].sort((p, q) => (tebalSet.has(namaBusur(p[0], p[1])) ? 1 : 0) - (tebalSet.has(namaBusur(q[0], q[1])) ? 1 : 0))
  const kelasTebal = gayaTebal === 'biru' ? 'stroke-brand-blue' : 'stroke-brand-orange'
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-xl" focusable="false">
        {urut.map(([u, v, w]) => {
          const n = namaBusur(u, v)
          const a = P[u]
          const b = P[v]
          const isTebal = tebalSet.has(n)
          const isSilang = silangSet.has(n)
          const len = Math.hypot(b.x - a.x, b.y - a.y)
          const ux = (b.x - a.x) / len
          const uy = (b.y - a.y) / len
          return (
            <g key={n}>
              <line
                x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R}
                strokeWidth={isTebal ? 5 : isSilang ? 2.5 : 1.5}
                strokeDasharray={isSilang ? '6 4' : undefined}
                className={isTebal ? kelasTebal : isSilang ? 'stroke-bad' : 'stroke-muted'}
              />
              <text x={(a.x + b.x) / 2} y={(b.y + a.y) / 2 + (light === n ? -13 : 0)} textAnchor="middle" dominantBaseline="central" style={HALO} strokeWidth="4" className={`stroke-card font-bold ${light === n ? 'text-[13px]' : 'text-[11px]'} ${isSilang ? 'fill-bad-text' : 'fill-ink'}`}>
                {w}{light === n ? '★' : ''}
              </text>
            </g>
          )
        })}
        {simpul.map((v) => {
          const masukS = dalamS?.has(v)
          return (
            <g key={v}>
              {dalamS ? (
                masukS ? (
                  <rect x={P[v].x - R} y={P[v].y - R} width={R * 2} height={R * 2} rx="6" strokeWidth="2.5" className="fill-brand-blue stroke-brand-blue" />
                ) : (
                  <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth="2.5" strokeDasharray="4 3" className="fill-card stroke-muted" />
                )
              ) : (
                <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth="2.5" className="fill-card stroke-brand-blue" />
              )}
              <text x={P[v].x} y={P[v].y} textAnchor="middle" dominantBaseline="central" className={`text-[14px] font-bold ${masukS ? 'fill-on-blue' : 'fill-ink'}`}>{v}</text>
            </g>
          )
        })}
      </svg>
      <div className="sr-only">
        <p>Graf tak berarah berbobot dengan {simpul.length} simpul dan {busur.length} busur: {busur.map(([u, v, w]) => `${u} dengan ${v} bobot ${w}`).join('; ')}.</p>
        {tebal.length > 0 && <p>Busur tebal ({gayaTebal}): {tebal.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}`).join('; ')}.</p>}
        {S && <p>Cut: S = {'{'}{S.join(', ')}{'}'}, V − S = {'{'}{simpul.filter((v) => !dalamS.has(v)).join(', ')}{'}'}.</p>}
        {silang.length > 0 && <p>Crossing edge: {silang.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}${light === n ? ', light edge' : ''}`).join('; ')}.</p>}
      </div>
    </div>
  )
}
