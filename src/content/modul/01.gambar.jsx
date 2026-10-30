// Gambar Modul 01 untuk penanda {{gambar:id}}: Gambar 1 (masukan → algoritma → keluaran) dan Gambar 2 (flowchart BILANGAN_MAX).
import { Icon } from '../../ui/index.js'

function Kotak({ label, isi, tegas }) {
  return (
    <div className={`flex-1 rounded-sm border-[1.5px] px-4 py-3 text-center ${tegas ? 'border-brand-yellow-strong bg-surface' : 'border-line bg-panel'}`}>
      <p className="text-label text-accent uppercase">{label}</p>
      <p className="text-body-strong mt-1 text-heading">{isi}</p>
    </div>
  )
}

const Panah = () => <Icon name="arrowR" size={22} className="shrink-0 rotate-90 self-center text-ink-soft sm:rotate-0" aria-hidden="true" />

/** Gambar 1: algoritma sebagai jembatan dari masukan ke keluaran (contoh: pengurutan). Dibuat dari HTML supaya teksnya terbaca dan ikut menyesuaikan lebar layar. */
export function GambarIO() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Kotak label="Input" isi="12, 10, 15, 7" />
        <Panah />
        <Kotak label="Algoritma" isi="langkah-langkah komputasi" tegas />
        <Panah />
        <Kotak label="Output" isi="7, 10, 12, 15" />
      </div>
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 1. Algoritma sebagai jembatan dari masukan ke keluaran. Contoh: masalah pengurutan.</figcaption>
    </figure>
  )
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' }
const bentuk = { stroke: 'currentColor', strokeWidth: 1.6, style: { fill: 'var(--bg-card)' } }
const T = (props) => <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="currentColor" {...props} />

/**
 * Gambar 2: flowchart BILANGAN_MAX (digambar ulang dari bahan kuliah). Gambar bermakna, jadi diberi nama dan deskripsi teks;
 * urutan yang sama juga tersedia sebagai pseudocode dan penjelasan di sekitarnya.
 */
export function GambarFlowchart() {
  const deskripsi =
    'Mulai. Baca bil1, bil2, bil3. maks = bil1. Apakah maks < bil2? Jika ya, maks = bil2. Lalu apakah maks < bil3? Jika ya, maks = bil3. ' +
    'Jika tidak pada kedua pemeriksaan, lanjut ke pemeriksaan berikutnya. Tampilkan maks. Selesai.'
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 430 580" role="img" aria-labelledby="fc-judul fc-desc" className="mx-auto block h-auto w-full min-w-[340px] max-w-[430px] text-ink">
          <title id="fc-judul">Flowchart menentukan bilangan terbesar dari tiga bilangan</title>
          <desc id="fc-desc">{deskripsi}</desc>
          <defs>
            <marker id="fc-panah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
            </marker>
          </defs>
          {/* garis alir */}
          <g {...stroke} markerEnd="url(#fc-panah)">
            <path d="M150 44 V70" />
            <path d="M150 112 V138" />
            <path d="M150 178 V208" />
            <path d="M150 288 V328" />
            <path d="M240 248 H278" />
            <path d="M240 368 H278" />
            <path d="M150 408 V454" />
            <path d="M150 496 V526" />
          </g>
          {/* garis yang bergabung kembali ke alur utama (tanpa kepala panah) */}
          <g {...stroke}>
            <path d="M335 268 V308 H150" />
            <path d="M335 388 V428 H150" />
          </g>
          {/* bentuk */}
          <rect x="100" y="8" width="100" height="36" rx="18" {...bentuk} />
          <T x="150" y="26">Mulai</T>
          <path d="M75 72 H240 L225 112 H60 Z" {...bentuk} />
          <T x="150" y="92">Baca bil1, bil2, bil3</T>
          <rect x="75" y="138" width="150" height="40" {...bentuk} />
          <T x="150" y="158">maks = bil1</T>
          <path d="M150 208 L240 248 L150 288 L60 248 Z" {...bentuk} />
          <T x="150" y="248">maks &lt; bil2 ?</T>
          <rect x="278" y="228" width="115" height="40" {...bentuk} />
          <T x="335" y="248">maks = bil2</T>
          <path d="M150 328 L240 368 L150 408 L60 368 Z" {...bentuk} />
          <T x="150" y="368">maks &lt; bil3 ?</T>
          <rect x="278" y="348" width="115" height="40" {...bentuk} />
          <T x="335" y="368">maks = bil3</T>
          <path d="M75 454 H240 L225 496 H60 Z" {...bentuk} />
          <T x="150" y="475">Tampilkan maks</T>
          <rect x="100" y="526" width="100" height="36" rx="18" {...bentuk} />
          <T x="150" y="544">Selesai</T>
          {/* label cabang */}
          <T x="259" y="236" fontSize="13">Ya</T>
          <T x="259" y="356" fontSize="13">Ya</T>
          <T x="140" y="303" fontSize="13" textAnchor="end">Tidak</T>
          <T x="140" y="423" fontSize="13" textAnchor="end">Tidak</T>
        </svg>
      </div>
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 2. Flowchart untuk menentukan bilangan terbesar dari tiga bilangan (digambar ulang dari bahan kuliah).</figcaption>
    </figure>
  )
}

