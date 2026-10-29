import { creditTabs } from '../data/credit.js'
import { cx } from '../ui/cx.js'
import { gulirKe } from '../materi/scroll.js'

/** Bar tab menempel di bawah header (Figma: Credit). Tab yang sedang dibaca ditandai aria-current dan latar oranye. */
export default function CreditBar({ aktif }) {
  return (
    <div className="sticky top-14 z-20 border-b border-line bg-page md:top-0">
      <nav aria-label="Bagian Credit" className="mx-auto flex w-full max-w-[1344px] gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-8">
        {creditTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-current={aktif === t.id ? 'location' : undefined}
            onClick={() => gulirKe(t.id)}
            className={cx('text-body shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 transition-colors', aktif === t.id ? 'bg-brand-orange font-semibold text-on-orange shadow-glow' : 'text-ink-soft hover:text-ink')}
          >
            {t.tab}
          </button>
        ))}
      </nav>
    </div>
  )
}
