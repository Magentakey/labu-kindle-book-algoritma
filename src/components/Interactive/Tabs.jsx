import { useId, useRef, useState } from 'react'
import { focusRing } from './styles.js'

/**
 * Tab dengan pola ARIA standar: panah kiri/kanan berpindah tab, Home/End ke tab pertama/terakhir,
 * dan hanya tab aktif yang masuk urutan Tab. Semua panel tetap terpasang (yang tidak aktif disembunyikan),
 * sehingga isi interaktif di dalamnya tidak kehilangan keadaannya saat berpindah tab.
 *
 * @param {Object} props
 * @param {string} [props.title]  nama kelompok tab untuk pembaca layar
 * @param {Array<{ title: string, content: import('react').ReactNode }>} props.items
 */
export default function Tabs({ title = 'Tab', items }) {
  const uid = useId()
  const [active, setActive] = useState(0)
  const refs = useRef([])
  const last = items.length - 1

  function select(i, focus = false) {
    setActive(i)
    if (focus) refs.current[i]?.focus()
  }

  function onKeyDown(e) {
    const keys = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }
    if (e.key in keys) {
      e.preventDefault()
      select(keys[e.key], true)
    }
  }

  return (
    <div className="my-6">
      <div role="tablist" aria-label={title} className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={onKeyDown}
            className={
              'min-h-12 rounded-t-xl border-2 border-b-0 border-stone-900 px-4 font-semibold ' +
              (i === active ? 'bg-stone-900 text-orange-50' : 'bg-white hover:bg-orange-100') +
              ' ' +
              focusRing
            }
          >
            {it.title}
          </button>
        ))}
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${uid}-panel-${i}`}
          aria-labelledby={`${uid}-tab-${i}`}
          hidden={i !== active}
          // Panel bisa difokus agar pengguna keyboard bisa membaca isinya setelah memilih tab (pola ARIA).
          tabIndex={0}
          className={'rounded-b-xl rounded-tr-xl border-2 border-stone-900 bg-white p-4 ' + focusRing}
        >
          {it.content}
        </div>
      ))}
    </div>
  )
}
