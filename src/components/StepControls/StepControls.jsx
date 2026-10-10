import { useId } from 'react'
import { SPEEDS } from './useStepPlayer.js'

// Tombol memakai aria-disabled (bukan disabled) agar fokus keyboard tidak hilang di ujung langkah.
export const buttonClass =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl px-4 font-semibold ' +
  'bg-stone-900 text-orange-50 hover:bg-stone-700 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-stone-300 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-300 ' +
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

export const secondaryButtonClass =
  'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-4 font-semibold ' +
  'hover:bg-orange-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

/**
 * Kontrol langkah: Sebelumnya, Berikutnya, Ulangi, Putar otomatis, Kecepatan, slider, dan status untuk pembaca layar.
 * @param {{ player: ReturnType<typeof import('./useStepPlayer.js').useStepPlayer> }} props
 */
export default function StepControls({ player }) {
  const uid = useId()
  const { index, last, total, atStart, atEnd, running, speed, setSpeed, status, jump, toggle } = player

  return (
    <>
      <div role="group" aria-label="Kontrol langkah" className="flex flex-wrap items-center gap-3">
        <button type="button" aria-disabled={atStart} onClick={() => !atStart && jump(index - 1)} className={buttonClass}>
          ← Sebelumnya
        </button>
        <button type="button" aria-disabled={atEnd} onClick={() => !atEnd && jump(index + 1)} className={buttonClass}>
          Berikutnya →
        </button>
        <button type="button" onClick={() => jump(0)} className={secondaryButtonClass}>
          Ulangi dari awal
        </button>
        <button type="button" onClick={toggle} className={secondaryButtonClass}>
          {running ? (
            <>
              <span aria-hidden="true">⏸&nbsp;</span>Jeda
            </>
          ) : (
            <>
              <span aria-hidden="true">▶&nbsp;</span>Putar otomatis
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <label htmlFor={`${uid}-speed`} className="font-medium">
            Kecepatan
          </label>
          <select
            id={`${uid}-speed`}
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="min-h-12 rounded-xl border-2 border-stone-900 bg-white px-3 text-base"
          >
            {SPEEDS.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`${uid}-slider`} className="sr-only">
          Pilih langkah
        </label>
        <input
          id={`${uid}-slider`}
          type="range"
          min={0}
          max={last}
          value={index}
          aria-valuetext={`Langkah ${index + 1} dari ${total}`}
          onChange={(e) => jump(Number(e.target.value))}
          className="h-8 w-full accent-stone-900"
        />
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>
    </>
  )
}
