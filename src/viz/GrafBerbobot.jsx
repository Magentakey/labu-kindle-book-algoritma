import { bobotBusur, namaBusur } from './mstModel.js'

const VW = 340
const VH = 214
const R0 = 14
const HALO = { paintOrder: 'stroke' }

/**
 * Graf tak berarah berbobot (Gambar 1 dan 2 Modul 19). Bobot ditulis di tengah busur.
 * Penanda tidak bergantung warna: busur MST/A tebal (oranye atau biru), crossing edge putus-putus merah, busur lain tipis abu-abu;
 * simpul di S berisi biru dan bersegi, simpul di V − S berlingkar putus-putus. Daftar teks lengkap untuk pembaca layar.
 * `baru` (opsional, Modul 20): busur yang baru saja diterima, oranye dan paling tebal, berbeda dari `tebal` (biru, sudah ada).
 * `kunci`, `selesai`, `sementara` (opsional, Modul 21): teks key di dalam tiap simpul; simpul yang sudah di-extract (hijau, bertanda ✓);
 * busur sementara untuk simpul yang masih di Q (oranye putus-putus, calon sambungan termurah).
 * @param {{ simpul: string[], busur: Array<[string,string,number]>, posisi: object, tebal?: string[], gayaTebal?: 'oranye'|'biru', baru?: string[], sementara?: string[], namaSementara?: string, kunci?: Record<string,string>|null, selesai?: string[], silang?: string[], namaSilang?: string, namaTebal?: string|null, namaBaru?: string, light?: string|null, S?: string[]|null, label: string, className?: string }} props
 */
export default function GrafBerbobot({ simpul, busur, posisi, tebal = [], gayaTebal = 'oranye', baru = [], sementara = [], namaSementara = 'Busur sementara', silang = [], namaSilang = 'Crossing edge', namaTebal = null, namaBaru = 'Busur baru diterima', light = null, S = null, kunci = null, selesai = [], label, className }) {
  const R = kunci ? 18 : R0 // Modul 21: nilai key ditulis di dalam simpul, jadi lingkaran lebih besar
  const P = Object.fromEntries(simpul.map((v) => [v, { x: 24 + posisi[v].x * (VW - 48), y: 24 + posisi[v].y * (VH - 48) }]))
  const tebalSet = new Set(tebal)
  const silangSet = new Set(silang)
  const baruSet = new Set(baru)
  const sementaraSet = new Set(sementara)
  const selesaiSet = new Set(selesai)
  const dalamS = S ? new Set(S) : null
  const bobotGambar = (e) => { const n = namaBusur(e[0], e[1]); return baruSet.has(n) ? 3 : sementaraSet.has(n) ? 2 : tebalSet.has(n) ? 1 : 0 }
  const urut = [...busur].sort((p, q) => bobotGambar(p) - bobotGambar(q))
  const kelasTebal = gayaTebal === 'biru' ? 'stroke-brand-blue' : 'stroke-brand-orange'
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-xl" focusable="false">
        {urut.map(([u, v, w]) => {
          const n = namaBusur(u, v)
          const a = P[u]
          const b = P[v]
          const isBaru = baruSet.has(n)
          const isSementara = sementaraSet.has(n)
          const isTebal = tebalSet.has(n) || isBaru
          const isSilang = silangSet.has(n)
          const len = Math.hypot(b.x - a.x, b.y - a.y)
          const ux = (b.x - a.x) / len
          const uy = (b.y - a.y) / len
          return (
            <g key={n}>
              <line
                x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R}
                strokeWidth={isBaru ? 6.5 : isSementara ? 4.5 : isTebal ? (gayaTebal === 'oranye' ? 5 : 4) : isSilang ? 2.5 : 1.5}
                strokeDasharray={isSilang ? '6 4' : isSementara ? '7 4' : undefined}
                className={isBaru || isSementara ? 'stroke-brand-orange' : isTebal ? kelasTebal : isSilang ? 'stroke-bad' : 'stroke-muted'}
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
              {kunci ? (
                <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth="2.5" strokeDasharray={selesaiSet.has(v) ? undefined : '4 3'} className={selesaiSet.has(v) ? 'fill-brand-mint stroke-ok' : 'fill-card stroke-muted'} />
              ) : dalamS ? (
                masukS ? (
                  <rect x={P[v].x - R} y={P[v].y - R} width={R * 2} height={R * 2} rx="6" strokeWidth="2.5" className="fill-brand-blue stroke-brand-blue" />
                ) : (
                  <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth="2.5" strokeDasharray="4 3" className="fill-card stroke-muted" />
                )
              ) : (
                <circle cx={P[v].x} cy={P[v].y} r={R} strokeWidth="2.5" className="fill-card stroke-brand-blue" />
              )}
              {kunci ? (
                <>
                  <text x={P[v].x} y={P[v].y - 6} textAnchor="middle" dominantBaseline="central" className={`text-[11px] font-bold ${selesaiSet.has(v) ? 'fill-on-orange' : 'fill-ink'}`}>{kunci[v]}</text>
                  <text x={P[v].x} y={P[v].y + 8} textAnchor="middle" dominantBaseline="central" className={`text-[12px] font-semibold ${selesaiSet.has(v) ? 'fill-on-orange' : 'fill-ink-soft'}`}>{v}</text>
                  {selesaiSet.has(v) && <path d={`M${P[v].x + 12} ${P[v].y - 17}l3 3 6-6`} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-ok" />}
                </>
              ) : (
                <text x={P[v].x} y={P[v].y} textAnchor="middle" dominantBaseline="central" className={`text-[14px] font-bold ${masukS ? 'fill-on-blue' : 'fill-ink'}`}>{v}</text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="sr-only">
        <p>Graf tak berarah berbobot dengan {simpul.length} simpul dan {busur.length} busur: {busur.map(([u, v, w]) => `${u} dengan ${v} bobot ${w}`).join('; ')}.</p>
        {tebal.length > 0 && <p>{namaTebal ?? `Busur tebal (${gayaTebal})`}: {tebal.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}`).join('; ')}.</p>}
        {kunci && <p>{simpul.map((v) => `${v}: key ${kunci[v]}, ${selesaiSet.has(v) ? 'sudah di-extract (di tree)' : 'masih di Q'}`).join('; ')}.</p>}
        {sementara.length > 0 && <p>{namaSementara}: {sementara.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}`).join('; ')}.</p>}
        {S && <p>Cut: S = {'{'}{S.join(', ')}{'}'}, V − S = {'{'}{simpul.filter((v) => !dalamS.has(v)).join(', ')}{'}'}.</p>}
        {baru.length > 0 && <p>{namaBaru}: {baru.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}`).join('; ')}.</p>}
        {silang.length > 0 && <p>{namaSilang}: {silang.map((n) => `(${n[0]}, ${n[1]}) bobot ${bobotBusur(busur, n[0], n[1])}${light === n ? ', light edge' : ''}`).join('; ')}.</p>}
      </div>
    </div>
  )
}
