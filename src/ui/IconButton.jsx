import Icon from './Icon.jsx'
import { cx } from './cx.js'
import { iconButtonVariants } from './buttonStyles.js'

/**
 * Tombol ikon. `label` wajib: dipakai sebagai nama tombol untuk pembaca layar dan tooltip.
 * @param {{ icon: string, label: string, variant?: keyof typeof iconButtonVariants, pressed?: boolean } & Record<string, any>} props
 */
export default function IconButton({ icon, label, variant = 'netral', pressed, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx('inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50', iconButtonVariants[variant], className)}
      {...rest}
    >
      <Icon name={icon} size={variant === 'kontrolUtama' ? 22 : 18} />
    </button>
  )
}
