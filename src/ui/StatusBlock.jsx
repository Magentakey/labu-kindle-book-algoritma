import { cx } from './cx.js'
import { statusLabels } from './uiLogic.js'

/** Penanda status modul (Figma: Status Blok): kosong, setengah, atau penuh. Teks status tersedia untuk pembaca layar. */
export default function StatusBlock({ status = 'belum', className }) {
  const box = {
    belum: 'border-[1.5px] border-muted',
    sedang: 'border-[1.5px] border-brand-burnt',
    selesai: 'border-[1.5px] border-brand-burnt bg-brand-orange',
  }[status]
  return (
    <span role="img" aria-label={statusLabels[status]} className={cx('relative inline-block h-3 w-4 rounded-[2px]', box, className)}>
      {status === 'sedang' && <span className="absolute inset-y-0 left-0 w-2 bg-brand-orange" />}
    </span>
  )
}
