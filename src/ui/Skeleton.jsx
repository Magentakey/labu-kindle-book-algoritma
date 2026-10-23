import { cx } from './cx.js'
import Mascot from './Mascot.jsx'

/** Blok abu-abu penanda isi yang sedang dimuat. Berdenyut pelan, dan diam bila pengguna meminta gerak dikurangi. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-sm bg-placeholder motion-reduce:animate-none', className)} />
}

/** Tampilan "Memuat…": maskot kecil, teks, lalu dua kartu kerangka (Figma: State · Loading). */
export function PageLoading({ label = 'Memuat halaman…' }) {
  return (
    <div role="status" className="mx-auto w-full max-w-[1344px] px-4 py-8 md:px-8">
      <div className="flex items-center gap-3">
        <Mascot expression="netral" size={48} />
        <p className="text-body-strong text-ink-soft">{label}</p>
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 rounded-sm border border-line bg-card p-4">
            <Skeleton className="size-16 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
