import { cx } from '../ui/cx.js'

const id = (n) => n.toLocaleString('id-ID')

function Simpul({ n, label, kode }) {
  const daun = n.ch !== undefined
  const anak = [n.kiri && ['0', n.kiri], n.kanan && ['1', n.kanan]].filter(Boolean)
  const satu = !daun && anak.length === 1
  return (
    <li>
      <span className="inline-flex flex-wrap items-center gap-x-2">
        {label !== undefined && (
          <span className="text-code inline-flex h-6 w-6 items-center justify-center rounded-sm bg-ink text-white" aria-label={`busur berlabel ${label}`}>{label}</span>
        )}
        <span className={cx('text-code inline-flex flex-wrap items-center gap-x-2 rounded-sm border-[1.5px] px-2 py-0.5', daun ? 'border-dashed border-ink-soft bg-surface text-ink' : 'border-brand-blue-strong bg-card text-ink')}>
          <span className="font-semibold">{daun ? `${n.ch}:${id(n.freq)}` : id(n.freq)}</span>
          {daun && kode && <span>· kode {kode[n.ch]}</span>}
          {satu && <span className="text-bad-text font-semibold">· ⚠ hanya satu anak</span>}
        </span>
      </span>
      {anak.length > 0 && (
        <ul className="mt-1 ml-3 space-y-1 border-l-2 border-line pl-3">
          {anak.map(([l, c]) => <Simpul key={l} n={c} label={l} kode={kode} />)}
        </ul>
      )}
    </li>
  )
}

/**
 * Pohon kode (pohon Huffman atau pohon kode panjang tetap) sebagai daftar bersarang yang terbaca urut oleh pembaca layar. Tiap baris anak diawali
 * label busur (0 = anak kiri, 1 = anak kanan). Daun bergaris putus dan membawa kodenya; simpul dalam bergaris solid; simpul dalam dengan satu anak
 * diberi tanda teks "⚠ hanya satu anak" (bukan hanya warna).
 * @param {{ akar: object, kode?: Record<string,string>, judul: string, className?: string }} props
 */
export default function PohonKode({ akar, kode, judul, className }) {
  return (
    <div className={className}>
      <ul aria-label={judul}>
        <Simpul n={akar} kode={kode} />
      </ul>
    </div>
  )
}
