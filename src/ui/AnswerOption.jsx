import Icon from './Icon.jsx'
import { cx } from './cx.js'

// Opsi jawaban kuis (Figma: Opsi Jawaban). Terpilih = Kontrol (Biru), benar = Mint, salah = Merah, selalu dengan ikon dan teks.
const box = {
  default: 'border border-line bg-card hover:bg-panel',
  selected: 'border-2 border-brand-blue bg-info-bg',
  correct: 'border-2 border-ok bg-ok-bg',
  wrong: 'border-2 border-bad bg-bad-bg',
  missed: 'border-2 border-dashed border-ok bg-card',
}
const badge = {
  default: 'bg-panel text-ink',
  selected: 'bg-brand-blue-strong text-on-control',
  correct: 'bg-brand-mint text-on-orange',
  wrong: 'bg-bad text-on-error',
  missed: 'bg-brand-mint text-on-orange',
}
const label = {
  correct: { icon: 'check', text: 'Jawaban benar', cls: 'text-ok-text' },
  wrong: { icon: 'x', text: 'Pilihanmu salah', cls: 'text-bad-text' },
  missed: { icon: 'check', text: 'Seharusnya dipilih', cls: 'text-ok-text' },
}
// Pada soal banyak jawaban, opsi terpilih ditandai juga dengan centang dan tulisan, bukan hanya warna.
const labelBanyak = { selected: { icon: 'check', text: 'Dipilih', cls: 'text-control' } }

/**
 * Satu opsi jawaban. `multi` = soal banyak jawaban: opsi berperan sebagai kotak centang (role="checkbox"), bukan tombol tekan.
 * `dipilih` = opsi ini dipilih pengguna (dipakai setelah dikoreksi, saat `state` bukan 'selected'). `terkunci` = soal sudah dijawab: tombol tetap bisa difokus agar teks hasilnya terbaca, tetapi tidak bisa diubah.
 * @param {{ letter: string, state?: 'default'|'selected'|'correct'|'wrong'|'missed', onClick?: () => void, disabled?: boolean, multi?: boolean, dipilih?: boolean, terkunci?: boolean, children: any }} props
 */
export default function AnswerOption({ letter, state = 'default', onClick, disabled, multi = false, dipilih = false, terkunci = false, children }) {
  const l = (multi ? labelBanyak[state] : null) ?? label[state]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...(multi ? { role: 'checkbox', 'aria-checked': state === 'selected' || dipilih } : { 'aria-pressed': state === 'selected' || dipilih })}
      aria-disabled={terkunci || undefined}
      className={cx('flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors disabled:cursor-default', terkunci && 'cursor-default', box[state])}
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
