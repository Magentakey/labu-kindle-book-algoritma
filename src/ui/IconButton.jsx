import Icon from './Icon.jsx'
import { cx } from './cx.js'

const variants = {
  primary: 'size-12 rounded-md bg-brand-orange text-on-orange shadow-block hover:bg-brand-burnt hover:text-on-burnt',
  outline: 'size-10 rounded-sm border border-line bg-card text-ink hover:bg-panel',
  ghost: 'size-10 rounded-sm text-ink hover:bg-panel',
}

/**
 * Tombol ikon (Figma: Tombol Ikon). `label` wajib: dipakai sebagai nama tombol untuk pembaca layar dan tooltip.
 * @param {{ icon: string, label: string, variant?: 'primary'|'outline'|'ghost', pressed?: boolean } & Record<string, any>} props
 */
export default function IconButton({ icon, label, variant = 'ghost', pressed, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx('inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}
      {...rest}
    >
      <Icon name={icon} size={variant === 'primary' ? 22 : 18} />
    </button>
  )
}
