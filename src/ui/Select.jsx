import Icon from './Icon.jsx'
import { cx } from './cx.js'

/**
 * Pilihan berlabel (Figma: Select), mis. "Input  Preset 1 ⌄". Memakai <select> asli supaya aksesibel dan nyaman di HP.
 * @param {{ label: string, value: string, onChange: (v: string) => void, options: Array<{ value: string, label: string }>, className?: string }} props
 */
export default function Select({ label, value, onChange, options, className }) {
  return (
    <label className={cx('relative inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-card pl-3 pr-8 focus-within:shadow-[0_0_0_1px_var(--ring-gap),0_0_0_4px_var(--ring)]', className)}>
      <span className="text-body text-ink-soft">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-body-strong cursor-pointer appearance-none bg-transparent pr-1 text-ink focus-visible:shadow-none!"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="down" size={16} className="pointer-events-none absolute right-2.5 text-ink-soft" />
    </label>
  )
}
