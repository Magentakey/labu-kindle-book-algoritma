import { cx } from './cx.js'

/** Satu tab bergaris bawah (Figma: Tab Item). Aktif (terpilih = Kontrol): teks Biru Tua tebal dengan garis bawah. */
export default function TabItem({ active, className, children, ...rest }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={Boolean(active)}
      className={cx('border-b-2 px-3 py-1.5 text-body transition-colors', active ? 'border-line font-semibold text-control' : 'border-transparent text-ink-soft hover:text-ink', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
