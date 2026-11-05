import { aktivitasContoh, greedyActivitySelector } from './aktivitasModel.js'

const W = 460
const LEFT = 36
const ROW = 20
const GAP = 6

/**
 * Gambar 1 Modul 14: 11 aktivitas pada garis waktu. Batang hijau bertanda ✓ adalah solusi Greedy; batang abu-abu lainnya tidak dipilih.
 * Pembeda bukan hanya warna: tanda ✓, tebal garis tepi, dan daftar teks untuk pembaca layar. Isi dihitung dari GREEDY-ACTIVITY-SELECTOR.
 * @param {{ s?: number[], f?: number[], className?: string }} props
 */
export default function GarisWaktuAktivitas({ s = aktivitasContoh.s, f = aktivitasContoh.f, className }) {
  const { A } = greedyActivitySelector(s, f)
  const max = Math.max(...f)
  const unit = W / max
  const tinggi = s.length * (ROW + GAP) + 30
  const dipilih = new Set(A)
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${LEFT + W + 16} ${tinggi}`} role="img" aria-label={`Garis waktu ${s.length} aktivitas. Solusi Greedy: ${A.map((i) => `a${i}`).join(', ')}.`} className="h-auto w-full" focusable="false">
        {Array.from({ length: max + 1 }, (_, x) => (
          <g key={x}>
            <line x1={LEFT + x * unit} x2={LEFT + x * unit} y1="0" y2={tinggi - 22} className="stroke-line" strokeWidth="1" />
            <text x={LEFT + x * unit} y={tinggi - 6} textAnchor="middle" className="fill-ink-soft text-[10px]">{x}</text>
          </g>
        ))}
        {s.map((si, i) => {
          const y = 4 + i * (ROW + GAP)
          const pilih = dipilih.has(i + 1)
          return (
            <g key={i}>
              <text x={LEFT - 6} y={y + ROW / 2} textAnchor="end" dominantBaseline="central" className="fill-ink font-code text-[11px]">a{i + 1}</text>
              <rect x={LEFT + si * unit} y={y} width={(f[i] - si) * unit} height={ROW} rx="3" strokeWidth={pilih ? 2.5 : 1.5} className={pilih ? 'fill-brand-mint stroke-ok' : 'fill-panel stroke-muted'} />
              <text x={LEFT + si * unit + ((f[i] - si) * unit) / 2} y={y + ROW / 2} textAnchor="middle" dominantBaseline="central" className="fill-ink font-code text-[10px]">
                {pilih ? '✓ ' : ''}[{si}, {f[i]})
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {s.map((si, i) => (
          <li key={i}>a{i + 1}: selang [{si}, {f[i]}), {dipilih.has(i + 1) ? 'dipilih Greedy' : 'tidak dipilih'}</li>
        ))}
      </ul>
    </div>
  )
}
