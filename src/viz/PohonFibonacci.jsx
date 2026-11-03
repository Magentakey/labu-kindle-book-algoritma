import { cx } from '../ui/cx.js'
import { hitungSimpul, pohonFibonacci } from './dpModel.js'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (k) => String(k).replace(/\d/g, (d) => SUB[Number(d)])

function Simpul({ s }) {
  return (
    <li className="relative">
      <span
        className={cx(
          'text-code inline-flex items-center gap-1 rounded-sm border-[1.5px] px-2 py-0.5',
          s.ulang ? 'border-dashed border-brand-yellow-strong bg-surface text-ink' : 'border-brand-blue-strong bg-card text-ink',
        )}
      >
        F{sub(s.k)}
        {s.ulang && (
          <>
            <span aria-hidden="true">↻</span>
            <span className="sr-only">(perhitungan ulang)</span>
          </>
        )}
      </span>
      {s.anak && (
        <ul className="mt-1 ml-3 space-y-1 border-l-2 border-line pl-3">
          {s.anak.map((a, i) => (
            <Simpul key={i} s={a} />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Pohon pemanggilan rekursif F(n) sebagai daftar bersarang (terbaca urut oleh pembaca layar). Simpul bergaris putus dengan tanda ↻ adalah
 * perhitungan ulang dari submasalah yang sudah pernah dihitung; warnanya tidak menjadi satu-satunya pembeda.
 * @param {{ n: number, className?: string }} props
 */
export default function PohonFibonacci({ n, className }) {
  const pohon = pohonFibonacci(n)
  const { semua, ulang, baru } = hitungSimpul(pohon)
  return (
    <div className={className}>
      <ul aria-label={`Pohon pemanggilan rekursif F${n}: ${semua} simpul, ${ulang} di antaranya perhitungan ulang`}>
        <Simpul s={pohon} />
      </ul>
      <p className="text-caption mt-3 text-ink-soft">
        {semua} pemanggilan: {baru} menghitung submasalah baru (F₀ sampai F{sub(n)}), {ulang} mengulang perhitungan.
      </p>
    </div>
  )
}
