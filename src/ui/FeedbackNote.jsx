import { cx } from './cx.js'
import Icon from './Icon.jsx'
import Mascot from './Mascot.jsx'

/**
 * Umpan balik setelah menjawab (Figma: State · Feedback kuis): maskot, kotak hasil, dan satu kalimat penjelasan.
 * Benar = maskot senang + Mint; salah = maskot berpikir + Merah. Hasil selalu ditulis dengan teks dan ikon, tidak hanya warna.
 * @param {{ benar: boolean, huruf: string, jawaban: string, catatan: string }} props
 */
export default function FeedbackNote({ benar, huruf, jawaban, catatan }) {
  return (
    <div className="flex items-start gap-3">
      <Mascot expression={benar ? 'senang' : 'berpikir'} size={56} />
      <div className="min-w-0 flex-1">
        <div className={cx('flex items-center gap-3 rounded-sm border-2 px-3 py-2.5', benar ? 'border-ok bg-ok-bg' : 'border-bad bg-bad-bg')}>
          <span className={cx('text-body-strong flex size-7 shrink-0 items-center justify-center rounded-sm', benar ? 'bg-brand-mint text-on-orange' : 'bg-bad text-on-error')}>{huruf}</span>
          <span className="text-body flex-1 text-ink">{jawaban}</span>
          <span className={cx('text-body-strong inline-flex shrink-0 items-center gap-1.5', benar ? 'text-ok-text' : 'text-bad-text')}>
            <Icon name={benar ? 'check' : 'x'} size={16} />
            {benar ? 'Jawaban benar' : 'Jawabanmu'}
          </span>
        </div>
        <p className="text-caption mt-1.5 text-ink-soft">{catatan}</p>
      </div>
    </div>
  )
}
