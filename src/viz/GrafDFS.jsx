import { useId } from 'react'
import { cx } from '../ui/cx.js'
import { HURUF_KELAS, KELAS, adjContoh, gayaBusur, idPanah, teksDF } from './dfsModel.js'

const VW = 310
const VH = 142
const R = 15
const KOLOM = [45, 148, 250]
const BARIS = [40, 100]
/** Posisi piksel simpul contoh: dua baris, tiga kolom (u v w / x y z), sama dengan Gambar 1–6 bahan kuliah. */
const P = { u: [KOLOM[0], BARIS[0]], v: [KOLOM[1], BARIS[0]], w: [KOLOM[2], BARIS[0]], x: [KOLOM[0], BARIS[1]], y: [KOLOM[1], BARIS[1]], z: [KOLOM[2], BARIS[1]] }
const GAYA = {
  WHITE: { shape: 'fill-panel stroke-muted', dash: '4 3', text: 'fill-ink-soft', w: 2, nama: 'WHITE' },
  GRAY: { shape: 'fill-brand-yellow stroke-brand-yellow-strong', dash: undefined, text: 'fill-on-orange', w: 2.5, nama: 'GRAY' },
  BLACK: { shape: 'fill-brand-mint stroke-ok', dash: undefined, text: 'fill-on-orange', w: 2.5, nama: 'BLACK' },
}
const HALO = { paintOrder: 'stroke' }

/** Penanda panah (ujung busur berarah). Ukuran tetap dalam satuan layar agar panah pada busur tebal tidak membesar. */
export function Panah({ id, kelas }) {
  return (
    <marker id={id} viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0 0 L8 4 L0 8 z" className={kelas} />
    </marker>
  )
}

/**
 * Keadaan graf berarah pada satu saat DFS (Gambar 1–6 Modul 18). Nama simpul di dalam lingkaran, teks d/f di dekatnya ("1/" bila belum selesai).
 * Warna simpul tidak berdiri sendiri: WHITE bergaris putus, GRAY berisi kuning, BLACK berisi hijau dan bertanda ✓.
 * Busur tree biru tebal; busur non-tree merah putus-putus dengan huruf B, F, atau C; daftar teks lengkap untuk pembaca layar.
 * @param {{ Adj?: object, keadaan: { color: object, d: object, f: object, busur: Array<{u:string,v:string,kelas:string}> }, label: string, className?: string }} props
 */
export default function GrafDFS({ Adj = adjContoh, keadaan, label, className }) {
  const pid = idPanah(useId())
  const kelasBusur = Object.fromEntries(keadaan.busur.map((b) => [`${b.u}${b.v}`, b.kelas]))
  const simpul = Object.keys(Adj)
  const semuaBusur = simpul.flatMap((u) => Adj[u].map((v) => ({ u, v })))
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="h-auto w-full" focusable="false">
        <defs>
          <Panah id={pid('tree')} kelas="fill-brand-blue" />
          <Panah id={pid('non')} kelas="fill-bad" />
          <Panah id={pid('belum')} kelas="fill-muted" />
        </defs>
        {semuaBusur.map(({ u, v }) => {
          const kelas = kelasBusur[`${u}${v}`]
          const g = gayaBusur(kelas)
          const huruf = HURUF_KELAS[kelas]
          if (u === v) {
            const [cx0, cy0] = P[u]
            const sx = cx0 + R * 0.82
            const sy = cy0 - R * 0.57
            return (
              <g key={`${u}${v}`}>
                <path d={`M${sx} ${sy} C${cx0 + 36} ${cy0 - 26} ${cx0 + 36} ${cy0 + 26} ${sx} ${cy0 + R * 0.57}`} fill="none" strokeWidth={g.w} strokeDasharray={g.dash} className={g.stroke} markerEnd={`url(#${pid(g.panah)})`} />
                {huruf && <text x={cx0 + 40} y={cy0 + 4} textAnchor="middle" style={HALO} className="fill-bad-text stroke-card text-[11px] font-bold" strokeWidth="3">{huruf}</text>}
              </g>
            )
          }
          const [x1, y1] = P[u]
          const [x2, y2] = P[v]
          const len = Math.hypot(x2 - x1, y2 - y1)
          const ux = (x2 - x1) / len
          const uy = (y2 - y1) / len
          let ox = -uy * 9
          let oy = ux * 9
          if (oy > 0 || (oy === 0 && ox > 0)) { ox = -ox; oy = -oy }
          return (
            <g key={`${u}${v}`}>
              <line x1={x1 + ux * R} y1={y1 + uy * R} x2={x2 - ux * (R + 1)} y2={y2 - uy * (R + 1)} strokeWidth={g.w} strokeDasharray={g.dash} className={g.stroke} markerEnd={`url(#${pid(g.panah)})`} />
              {huruf && <text x={(x1 + x2) / 2 + ox} y={(y1 + y2) / 2 + oy + 4} textAnchor="middle" style={HALO} className="fill-bad-text stroke-card text-[11px] font-bold" strokeWidth="3">{huruf}</text>}
            </g>
          )
        })}
        {simpul.map((k) => {
          const g = GAYA[keadaan.color[k]]
          const [px, py] = P[k]
          const atas = py < 70
          return (
            <g key={k}>
              <circle cx={px} cy={py} r={R} strokeWidth={g.w} strokeDasharray={g.dash} className={g.shape} />
              <text x={px} y={py} textAnchor="middle" dominantBaseline="central" className={cx('text-[14px] font-bold', g.text)}>{k}</text>
              <text x={px} y={atas ? py - R - 6 : py + R + 13} textAnchor="middle" className="fill-ink text-[11px] font-semibold">{teksDF(keadaan.d[k], keadaan.f[k])}</text>
              {keadaan.color[k] === 'BLACK' && (
                <path d={`M${px + 10} ${py - 13}l3 3 6-6`} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-ok" />
              )}
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {simpul.map((k) => (
          <li key={k}>
            {k}: {GAYA[keadaan.color[k]].nama}
            {keadaan.d[k] === null ? ', belum ditemukan' : `, ditemukan pada waktu ${keadaan.d[k]}, ${keadaan.f[k] === null ? 'belum selesai' : `selesai pada waktu ${keadaan.f[k]}`}`}
          </li>
        ))}
        {keadaan.busur.map((b) => (
          <li key={`${b.u}${b.v}`}>busur ({b.u}, {b.v}): {KELAS[b.kelas]}</li>
        ))}
      </ul>
    </div>
  )
}
