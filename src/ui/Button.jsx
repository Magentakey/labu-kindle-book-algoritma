import Icon from './Icon.jsx'
import { cx } from './cx.js'
import { base, buttonVariants, off, sizes } from './buttonStyles.js'

/**
 * Tombol. Fokus keyboard memakai cincin global (tokens.css).
 * @param {{ variant?: keyof typeof buttonVariants, size?: 'm'|'s', icon?: string, iconRight?: string, as?: any } & Record<string, any>} props
 */
export default function Button({ variant = 'navigasi', size = 'm', icon, iconRight, as: Tag = 'button', className, children, ...rest }) {
  const props = Tag === 'button' ? { type: 'button', ...rest } : rest
  return (
    <Tag className={cx(base, sizes[size], buttonVariants[variant], off, className)} {...props}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </Tag>
  )
}
