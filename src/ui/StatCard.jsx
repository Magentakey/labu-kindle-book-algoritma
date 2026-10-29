import Icon from './Icon.jsx'
import { cx } from './cx.js'

/**
 * Kartu angka (Figma: kartu statistik): ikon dan label kecil, angka besar berfon piksel, lalu keterangan.
 * Fon piksel sulit dibaca pembaca layar, jadi angka dibacakan lewat `teksAngka` (bila beda dari tampilan) dan tampilannya disembunyikan dari pembaca layar.
 * @param {{ icon: string, label: string, value: string, teksAngka?: string, sub?: string, className?: string }} props
 */
export default function StatCard({ icon, label, value, teksAngka, sub, className }) {
  return (
    <div className={cx('rounded-sm border border-line bg-card p-4 shadow-block', className)}>
      <p className="text-caption flex items-center gap-2 text-ink-soft">
        <Icon name={icon} size={18} />
        {label}
      </p>
      <p className="mt-2">
        <span className="text-pixel-l text-heading" aria-hidden="true">
          {value}
        </span>
        <span className="sr-only">{teksAngka ?? value}</span>
      </p>
      {sub && <p className="text-caption mt-1 text-ink-soft">{sub}</p>}
    </div>
  )
}
