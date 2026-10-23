import { cx } from './cx.js'

/**
 * Filter segmented (Figma: Tab di dalam wadah abu-abu). Aktif: latar kartu, teks biru tebal, bayangan blok.
 * Sempit: wadah bisa digeser mendatar. Tiap tombol memakai aria-pressed karena ini filter, bukan tab panel.
 * @param {{ options: Array<{ id: string, label: string }>, value: string, onChange: (id: string) => void, label: string, className?: string }} props
 */
export default function Segmented({ options, value, onChange, label, className }) {
  return (
    <div role="group" aria-label={label} className={cx('flex max-w-full gap-1 overflow-x-auto rounded-sm bg-placeholder p-1 [scrollbar-width:none]', className)}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cx('shrink-0 whitespace-nowrap rounded-[3px] px-3.5 py-1.5 text-body transition-colors', active ? 'bg-card font-semibold text-control shadow-block' : 'text-ink-soft hover:text-ink')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
