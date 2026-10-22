import { cx } from './cx.js'

/** Satu tab (Figma: Tab Item). Aktif: latar kartu, bayangan blok, dan teks tebal berwarna judul. */
export default function TabItem({ active, className, children, ...rest }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={Boolean(active)}
      className={cx('rounded-[3px] px-3 py-1.5 text-body transition-colors', active ? 'bg-card font-semibold text-heading shadow-block' : 'text-ink-soft hover:text-ink', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
