import { cx } from './cx.js'
import { PROGRESS_SEGMENTS, filledSegments } from './uiLogic.js'

/** Progres berbentuk 8 balok (Figma: Progres Blok). Angka persen tetap ditulis lewat aria-valuenow dan sebaiknya juga di teks sekitarnya. */
export default function ProgressBlocks({ value, label = 'Progres', className }) {
  const filled = filledSegments(value)
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label} className={cx('flex gap-[3px]', className)}>
      {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
        <span key={i} className={cx('h-2 w-3.5 rounded-[1px]', i < filled ? 'border border-ok bg-brand-mint' : 'bg-placeholder')} />
      ))}
    </div>
  )
}
