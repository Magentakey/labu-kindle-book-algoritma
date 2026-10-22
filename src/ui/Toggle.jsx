import { cx } from './cx.js'

/** Sakelar (Figma: Toggle), 36 × 20. Dioperasikan sebagai tombol role="switch" sehingga bisa lewat keyboard. */
export default function Toggle({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cx('flex h-5 w-9 shrink-0 items-center rounded-sm p-0.5 transition-colors', checked ? 'bg-brand-blue' : 'bg-placeholder', className)}
    >
      <span className={cx('size-4 rounded-[3px] bg-card transition-transform motion-reduce:transition-none', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  )
}
