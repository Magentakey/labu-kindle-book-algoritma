// Gambar Modul 02 untuk penanda {{gambar:id}}: Gambar 1 (tumpukan pemanggilan) dan Gambar 2 (rentang pencarian menyusut).
import { Icon } from '../../ui/index.js'
import { cx } from '../../ui/cx.js'
import { jejakBinarySearch, tumpukan } from './02.hitung.js'

/** Gambar 1: tumpukan pemanggilan JUMLAH_REKURSIF(A, 3). Dibuat dari daftar HTML supaya teksnya terbaca urut oleh pembaca layar. */
export function GambarTumpukan() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <ol className="space-y-2" aria-label="Tumpukan pemanggilan JUMLAH_REKURSIF(A, 3), dari pemanggilan pertama ke kasus dasar">
        {tumpukan.map((t, i) => (
          <li key={t.panggil} style={{ marginLeft: `${i * 1.25}rem` }} className={cx('flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-sm border px-3 py-2', t.dasar ? 'border-brand-yellow-strong bg-surface' : 'border-line bg-panel')}>
            <span className="text-code flex items-center gap-2 text-ink">
              <Icon name="arrowR" size={16} className="shrink-0 rotate-90 text-ink-soft" aria-hidden="true" />
              {t.panggil}
            </span>
            <span className="text-code flex items-center gap-2 text-ink">
              <span className="sr-only">nilai yang dikembalikan: </span>
              <Icon name="arrowR" size={16} className="shrink-0 -rotate-90 text-ink-soft" aria-hidden="true" />
              <span className="whitespace-nowrap">{t.kembali}</span>
              {t.dasar && <span className="text-caption text-ink-soft">(kasus dasar tercapai)</span>}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 1. Tumpukan pemanggilan JUMLAH_REKURSIF(A, 3). Panah ke bawah: pemanggilan; panah ke atas: nilai yang dikembalikan.</figcaption>
    </figure>
  )
}

const A = [null, 5, 8, 9, 10, 14, 20]

/**
 * Gambar 2: rentang pencarian menyusut setiap putaran (x = 12). Kotak biru tua = elemen tengah yang dibandingkan,
 * kotak putus-putus = di luar rentang. Status tiap kotak juga ditulis untuk pembaca layar, bukan hanya warna.
 */
export function GambarRentang() {
  const { putaran } = jejakBinarySearch(A, 12, 1, 6)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <ol className="space-y-4">
        {putaran.map((r, k) => (
          <li key={k}>
            <p className="text-body-strong text-heading">
              Putaran {k + 1} <span className="text-code font-normal text-ink-soft">p={r.p}, n={r.n}, mid={r.mid}</span>
            </p>
            <ul className="mt-1.5 flex gap-1.5" aria-label={`Isi array pada putaran ${k + 1}`}>
              {A.slice(1).map((v, i) => {
                const idx = i + 1
                const dalam = idx >= r.p && idx <= r.n
                const tengah = idx === r.mid
                return (
                  <li key={idx} className={cx('text-code flex h-10 w-12 items-center justify-center rounded-sm border-[1.5px]', tengah ? 'border-brand-blue-strong bg-brand-blue-strong text-on-control' : dalam ? 'border-line bg-card text-ink' : 'border-dashed border-muted bg-panel text-ink-soft')}>
                    {v}
                    <span className="sr-only">{tengah ? ' (elemen tengah)' : dalam ? ' (dalam rentang)' : ' (di luar rentang)'}</span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 2. Rentang pencarian menyusut setiap putaran (x = 12). Kotak biru tua: elemen tengah yang dibandingkan.</figcaption>
    </figure>
  )
}
