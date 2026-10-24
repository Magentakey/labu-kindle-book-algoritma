import { cx } from './cx.js'

/**
 * Penggeser (Figma: Slider). Kecepatan memakai warna Kontrol (Biru), posisi langkah memakai warna Lokasi (Coral).
 * @param {{ value: number, min: number, max: number, step?: number, onChange: (v: number) => void, label: string, tone?: 'kontrol'|'lokasi', className?: string }} props
 */
export default function Slider({ value, min, max, step = 1, onChange, label, tone = 'kontrol', className }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cx('h-2 min-w-0 cursor-pointer rounded-sm', tone === 'lokasi' ? 'accent-brand-orange' : 'accent-brand-blue', className)}
    />
  )
}
