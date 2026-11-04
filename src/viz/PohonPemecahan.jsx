import { cx } from '../ui/cx.js'
import { daftarBiaya, jumlahPerkalian, pohonPemecahan, totalBiaya } from './rantaiModel.js'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (k) => String(k).replace(/\d/g, (d) => SUB[Number(d)])
const id = (n) => n.toLocaleString('id-ID')
const nama = (s) => (s.i === s.j ? `A${sub(s.i)}` : `A${sub(s.i)}..${sub(s.j)}`)

function Simpul({ s, p }) {
  const dalam = Boolean(s.kiri)
  return (
    <li>
      <span
        className={cx(
          'text-code inline-flex flex-wrap items-center gap-x-2 rounded-sm border-[1.5px] px-2 py-0.5',
          dalam ? 'border-brand-blue-strong bg-card text-ink' : 'border-dashed border-ink-soft bg-surface text-ink',
        )}
      >
        <span className="font-semibold">{nama(s)}</span>
        {dalam && (
          <span>
            · k={s.k} · {p[s.i - 1]}·{p[s.k]}·{p[s.j]} = {id(s.biaya)}
          </span>
        )}
        {!dalam && <span className="sr-only">(satu matriks, tanpa perkalian)</span>}
      </span>
      {dalam && (
        <ul className="mt-1 ml-3 space-y-1 border-l-2 border-line pl-3">
          <Simpul s={s.kiri} p={p} />
          <Simpul s={s.kanan} p={p} />
        </ul>
      )}
    </li>
  )
}

/**
 * Pohon pemecahan optimal dari tabel s sebagai daftar bersarang (terbaca urut oleh pembaca layar). Simpul bergaris solid adalah satu
 * perkalian dua matriks (letak pemecah k dan biaya perkalian terakhir); daun bergaris putus adalah satu matriks. Pembeda bukan hanya warna.
 * @param {{ s: number[][], p: number[], className?: string }} props
 */
export default function PohonPemecahan({ s, p, className }) {
  const pohon = pohonPemecahan(s, p)
  const biaya = daftarBiaya(pohon)
  return (
    <div className={className}>
      <ul aria-label={`Pohon pemecahan optimal ${nama(pohon)}: ${jumlahPerkalian(pohon)} perkalian dua matriks, total ${id(totalBiaya(pohon))} operasi`}>
        <Simpul s={pohon} p={p} />
      </ul>
      <p className="text-caption mt-3 text-ink-soft">
        Jumlah biaya semua perkalian: {biaya.map(id).join(' + ')} = {id(totalBiaya(pohon))}.
      </p>
    </div>
  )
}
