import { cx } from './cx.js'

// Tipe chip dari Figma: warna latar, warna titik, dan gaya teks. "bab" bergaris tepi dan tebal, "kode" bertipe monospace.
const types = {
  default: { box: 'bg-panel', dot: 'bg-muted' },
  prasyarat: { box: 'bg-info-bg', dot: 'bg-info' },
  bab: { box: 'border border-line font-semibold', dot: 'bg-ink-soft' },
  sedang: { box: 'bg-surface', dot: 'bg-brand-yellow-strong' },
  sukses: { box: 'bg-ok-bg', dot: 'bg-ok' },
  gagal: { box: 'bg-bad-bg', dot: 'bg-bad' },
  info: { box: 'bg-info-bg', dot: 'bg-info' },
  kode: { box: 'border border-line bg-code-bg font-code text-[13px]', dot: 'bg-muted' },
}

/**
 * Chip berlabel dengan titik kecil di kiri (status tidak hanya lewat warna: selalu ada teks).
 * @param {{ type?: keyof typeof types, className?: string, children: any }} props
 */
export default function Chip({ type = 'default', className, children }) {
  const t = types[type] ?? types.default
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-sm px-2 py-[3px] text-caption text-ink', t.box, className)}>
      <span className={cx('size-1.5 shrink-0', t.dot)} aria-hidden="true" />
      {children}
    </span>
  )
}
