import { useRef, useState } from 'react'
import { swipeDirection } from '../../lib/swipe.js'
import { focusRing } from './styles.js'

const arrowClass =
  'inline-flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-stone-900 bg-white text-2xl font-bold ' +
  'hover:bg-orange-200 aria-disabled:cursor-not-allowed aria-disabled:border-stone-400 aria-disabled:text-stone-600 ' +
  'aria-disabled:hover:bg-white ' +
  focusRing

/**
 * Slide bernomor: lingkaran dengan nomor di tengah, panah « » di kiri dan kanan, dan isi di bawahnya.
 * Bisa digeser dengan tombol, panah keyboard, atau geseran jari.
 *
 * @param {Object} props
 * @param {string} [props.title]  nama komponen untuk pembaca layar
 * @param {Array<{ title: string, content: import('react').ReactNode }>} props.items
 * @param {string} [props.itemLabel]  kata untuk "Langkah" pada pengumuman, misalnya "Slide"
 */
export default function Stepper({ title = 'Slide', items, itemLabel = 'Langkah' }) {
  const [no, setNo] = useState(0)
  const touch = useRef(null)
  const total = items.length
  const atStart = no <= 0
  const atEnd = no >= total - 1
  const go = (n) => setNo(Math.min(Math.max(n, 0), total - 1))
  const item = items[Math.min(no, total - 1)]
  const position = `${itemLabel} ${Math.min(no, total - 1) + 1} dari ${total}`

  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(no - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(no + 1)
    }
  }

  return (
    <section aria-label={title} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <div role="group" aria-label="Pindah slide" className="flex items-center justify-center gap-4">
        <button type="button" aria-disabled={atStart} onClick={() => !atStart && go(no - 1)} onKeyDown={onKeyDown} className={arrowClass}>
          <span aria-hidden="true">«</span>
          <span className="sr-only">Sebelumnya</span>
        </button>
        <div aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-full bg-stone-900 text-3xl font-bold text-orange-50">
          {no + 1}
        </div>
        <button type="button" aria-disabled={atEnd} onClick={() => !atEnd && go(no + 1)} onKeyDown={onKeyDown} className={arrowClass}>
          <span aria-hidden="true">»</span>
          <span className="sr-only">Berikutnya</span>
        </button>
      </div>
      <p className="mt-2 text-center text-sm">
        {position}
      </p>
      <p role="status" className="sr-only">
        {position}: {item.title}
      </p>

      <div
        key={no}
        role="group"
        aria-label={`${position}: ${item.title}`}
        className="mt-3 touch-pan-y"
        onTouchStart={(e) => {
          const t = e.touches[0]
          touch.current = { x: t.clientX, y: t.clientY }
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return
          const t = e.changedTouches[0]
          const dir = swipeDirection(t.clientX - touch.current.x, t.clientY - touch.current.y)
          touch.current = null
          if (dir !== 0) go(no + dir)
        }}
      >
        <p className="text-center text-lg font-semibold">{item.title}</p>
        <div className="mx-auto mt-2 max-w-2xl">{item.content}</div>
      </div>
    </section>
  )
}
