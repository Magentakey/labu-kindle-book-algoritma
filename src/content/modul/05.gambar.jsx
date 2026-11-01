// Gambar Modul 05 untuk penanda {{gambar:id}}: Gambar 1 (grafik fungsi pertumbuhan). Memakai komponen grafik yang sama dengan visualizer.
import GrafikPertumbuhan from '../../viz/GrafikPertumbuhan.jsx'
import { GAMBAR_1 } from './05.hitung.js'

/** Gambar 1: grafik lg n, n, n lg n, n² dan 2ⁿ untuk n = 1 sampai 20; sumbu tegak dipotong di 120. */
export function GambarGrafik() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafikPertumbuhan keys={GAMBAR_1.keys} nMax={GAMBAR_1.nMax} skala={GAMBAR_1.skala} />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Grafik lg n, n, n lg n, n² dan 2ⁿ untuk n = 1 sampai 20 (sumbu tegak dipotong di 120). Kurva 2ⁿ dan n² melesat ke atas jauh lebih awal daripada yang lain.
      </figcaption>
    </figure>
  )
}
