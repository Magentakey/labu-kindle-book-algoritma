const R = 17

/**
 * Satu contoh RELAX(u, v, w) (Gambar 5 dan 6 Modul 22): graf kecil u → v sebelum relaksasi, tanda panah, dan simpul v sesudahnya.
 * Simpul v yang berubah digambar dengan cincin tebal dan label "berubah"; bila tidak, label "tetap". Tidak bergantung pada warna.
 * @param {{ ud: number, vd: number, w: number, label: string, className?: string }} props
 */
export default function GambarRelax({ ud, vd, w, label, className }) {
  const baru = vd > ud + w ? ud + w : vd
  const berubah = baru !== vd
  return (
    <div className={className}>
      <svg viewBox="0 0 330 120" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-md" focusable="false">
        <defs>
          <marker id="relax-panah" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L8 4 L0 8 z" className="fill-brand-blue" />
          </marker>
        </defs>
        <line x1={42 + R} y1="46" x2={140 - R - 1} y2="46" strokeWidth="2.5" className="stroke-brand-blue" markerEnd="url(#relax-panah)" />
        <text x="91" y="64" textAnchor="middle" className="fill-ink text-[13px] font-bold">{w}</text>
        {[[42, ud, 'u'], [140, vd, 'v']].map(([x, nilai, nama]) => (
          <g key={nama}>
            <circle cx={x} cy="46" r={R} strokeWidth="2.5" className="fill-card stroke-brand-blue" />
            <text x={x} y="46" textAnchor="middle" dominantBaseline="central" className="fill-ink text-[14px] font-bold">{nilai}</text>
            <text x={x} y="86" textAnchor="middle" className="fill-ink-soft text-[13px] font-semibold italic">{nama}</text>
          </g>
        ))}
        <text x="205" y="40" textAnchor="middle" className="fill-ink text-[20px] font-bold">→</text>
        <circle cx="270" cy="46" r={R} strokeWidth={berubah ? 4.5 : 2.5} className={berubah ? 'fill-brand-yellow stroke-brand-yellow-strong' : 'fill-card stroke-brand-blue'} />
        <text x="270" y="46" textAnchor="middle" dominantBaseline="central" className={`text-[14px] font-bold ${berubah ? 'fill-on-orange' : 'fill-ink'}`}>{baru}</text>
        <text x="270" y="86" textAnchor="middle" className="fill-ink-soft text-[13px] font-semibold italic">v</text>
        <text x="270" y="106" textAnchor="middle" className="fill-ink text-[12px] font-bold">{berubah ? 'berubah' : 'tetap'}</text>
      </svg>
      <p className="sr-only">
        Sebelum RELAX: u.d = {ud}, v.d = {vd}, w(u, v) = {w}. Sesudah RELAX: v.d = {baru}, {berubah ? 'berubah, dan v.π = u' : 'tidak ada perubahan'}.
      </p>
    </div>
  )
}
