import Icon from './Icon.jsx'
import { cx } from './cx.js'

// Opsi jawaban kuis (Figma: Opsi Jawaban). Terpilih = Kontrol (Biru), benar = Mint, salah = Merah, selalu dengan ikon dan teks.
const box = {
  default: 'border border-line bg-card hover:bg-panel',
  selected: 'border-2 border-brand-blue bg-info-bg',
  correct: 'border-2 border-ok bg-ok-bg',
  wrong: 'border-2 border-bad bg-bad-bg',
}
const badge = {
  default: 'bg-panel text-ink',
  selected: 'bg-brand-blue-strong text-on-control',
  correct: 'bg-brand-mint text-on-orange',
  wrong: 'bg-bad text-on-error',
}
const label = {
  correct: { icon: 'check', text: 'Jawaban benar', cls: 'text-ok-text' },
  wrong: { icon: 'x', text: 'Jawabanmu', cls: 'text-bad-text' },
}

/** @param {{ letter: string, state?: 'default'|'selected'|'correct'|'wrong', onClick?: () => void, disabled?: boolean, children: any }} props */
export default function AnswerOption({ letter, state = 'default', onClick, disabled, children }) {
  const l = label[state]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={cx('flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors disabled:cursor-default', box[state])}
    >
      <span className={cx('text-body-strong flex size-7 shrink-0 items-center justify-center rounded-sm', badge[state])}>{letter}</span>
      <span className="text-body flex-1 text-ink">{children}</span>
      {l && (
        <span className={cx('text-body-strong inline-flex shrink-0 items-center gap-1.5', l.cls)}>
          <Icon name={l.icon} size={16} />
          {l.text}
        </span>
      )}
    </button>
  )
}
