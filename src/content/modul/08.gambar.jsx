// Gambar Modul 08 untuk penanda {{gambar:id}}: Gambar 1 (Merge Sort pada 7 bilangan) dan Gambar 2 (pohon rekursi n = 8).
// Keduanya dibuat dari daftar HTML yang dihitung oleh 08.hitung.js (bukan diketik), sehingga terbaca urut oleh pembaca layar.
import { cx } from '../../ui/cx.js'
import { DATA_GAMBAR_1, N_GAMBAR_2, pohonMergeSort, tingkatPohon, totalPohon } from './08.hitung.js'

/** Satu tingkat: deretan kotak segmen. `jenis` menentukan warna dan teks untuk pembaca layar (status tidak hanya lewat warna). */
function Tingkat({ segmen, jenis, nama }) {
  return (
    <li className="flex flex-wrap items-center justify-center gap-2" aria-label={nama}>
      {segmen.map((s, i) => (
        <span key={i} className={cx('text-code flex gap-1.5 rounded-sm border-[1.5px] px-2 py-1.5', jenis === 'bagi' ? 'border-brand-blue-strong bg-surface text-ink' : 'border-ok bg-ok-bg text-ok-text')}>
          {s.map((v, k) => (
            <span key={k}>{v}</span>
          ))}
        </span>
      ))}
    </li>
  )
}

/** Gambar 1: tahap divide (atas, dari akar ke daun) dan tahap combine (bawah, dari daun ke akar). */
export function GambarMergeSort() {
  const { bagi, gabung } = pohonMergeSort(DATA_GAMBAR_1)
  const urutGabung = [...gabung].reverse() // dari tingkat terdalam ke akar
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <p className="text-body-strong text-heading">Divide: membagi sampai satu elemen</p>
      <ol className="mt-2 space-y-2" aria-label="Tahap divide, dari array utuh sampai satu elemen">
        {bagi.map((segmen, d) => (
          <Tingkat key={d} segmen={segmen} jenis="bagi" nama={`Divide, tingkat ${d + 1}: ${segmen.map((s) => `(${s.join(', ')})`).join(' ')}`} />
        ))}
      </ol>
      <p className="text-body-strong mt-5 text-heading">Combine: MERGE menyatukan kembali</p>
      <ol className="mt-2 space-y-2" aria-label="Tahap combine, dari bagian kecil sampai array utuh terurut">
        {urutGabung.map((segmen, d) => (
          <Tingkat key={d} segmen={segmen} jenis="gabung" nama={`Combine, tingkat ${d + 1}: ${segmen.map((s) => `(${s.join(', ')})`).join(' ')}`} />
        ))}
      </ol>
      <p className="text-caption mt-4 text-ink-soft">MERGE terakhir: L = (3, 27, 38, 43, ∞), R = (9, 10, 82, ∞)</p>
      <figcaption className="text-caption mt-2 text-ink-soft">
        Gambar 1. Merge Sort pada (38, 27, 43, 3, 9, 82, 10). Kotak berbingkai biru: hasil pembagian; kotak hijau: hasil penggabungan.
      </figcaption>
    </figure>
  )
}

/** Gambar 2: pohon rekursi T(n) = 2T(n/2) + cn untuk n = 8; tiap tingkat berbiaya total cn. */
export function GambarPohonRekursi() {
  const tingkat = tingkatPohon(N_GAMBAR_2)
  const lg = Math.log2(N_GAMBAR_2)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <ol className="space-y-2" aria-label="Pohon rekursi, dari akar ke daun">
        {tingkat.map((t) => (
          <li key={t.i} className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <ul className="flex flex-1 flex-wrap justify-center gap-2" aria-label={`Tingkat ${t.i}: ${t.simpul} simpul masing-masing berbiaya ${t.i === lg ? 'c' : t.biaya}`}>
              {Array.from({ length: t.simpul }, (_, k) => (
                <li key={k} className="text-code min-w-12 rounded-sm border-[1.5px] border-brand-blue-strong bg-surface px-2 py-1 text-center text-ink">
                  {t.i === lg ? 'c' : t.biaya}
                </li>
              ))}
            </ul>
            <span className="text-code w-24 shrink-0 text-right text-ink-soft">
              <span aria-hidden="true">→ </span>
              <span className="sr-only">total tingkat ini: </span>cn
            </span>
          </li>
        ))}
      </ol>
      <p className="text-body-strong mt-4 text-heading">
        Total = cn × (lg n + 1) = cn lg n + cn <span className="text-caption font-normal text-ink-soft">(untuk n = {N_GAMBAR_2}: {lg + 1} tingkat, {totalPohon(N_GAMBAR_2)}c)</span>
      </p>
      <figcaption className="text-caption mt-2 text-ink-soft">
        Gambar 2. Pohon rekursi untuk T(n) = 2T(n/2) + cn (digambar untuk n = 8). Setiap tingkat berbiaya total cn, dan ada lg n + 1 tingkat.
      </figcaption>
    </figure>
  )
}
