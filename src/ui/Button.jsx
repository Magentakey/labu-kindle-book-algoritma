import Icon from './Icon.jsx'
import { cx } from './cx.js'

const base = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-button transition-colors disabled:cursor-not-allowed'
const sizes = { m: 'h-10 px-4', s: 'h-8 px-3' }
const variants = {
  primary:
    'bg-brand-orange text-on-orange shadow-block hover:bg-brand-burnt hover:text-on-burnt disabled:bg-placeholder disabled:text-ink-soft disabled:shadow-none',
  secondary:
    'border-[1.5px] border-brand-blue bg-card text-link hover:bg-info-bg hover:shadow-block disabled:border-line disabled:bg-placeholder disabled:text-ink-soft disabled:shadow-none',
  ghost: 'text-link hover:bg-info-bg disabled:text-ink-soft disabled:hover:bg-transparent',
}

/**
 * Tombol (Figma: Tombol). Tiga varian × dua ukuran; fokus keyboard memakai cincin global (tokens.css).
 * @param {{ variant?: 'primary'|'secondary'|'ghost', size?: 'm'|'s', icon?: string, iconRight?: string, as?: any } & Record<string, any>} props
 */
export default function Button({ variant = 'primary', size = 'm', icon, iconRight, as: Tag = 'button', className, children, ...rest }) {
  const props = Tag === 'button' ? { type: 'button', ...rest } : rest
  return (
    <Tag className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </Tag>
  )
}
