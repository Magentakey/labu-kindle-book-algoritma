// Gambar Modul 16 untuk penanda {{gambar:grafa}} dan {{gambar:grafb}}: Gambar 1 (graf tak berarah) dan Gambar 2 (graf berarah). Digambar dari data graf di model.
import GrafStatis from '../../viz/GrafStatis.jsx'
import { grafA, grafB, posisiA, posisiB } from '../../viz/representasiGrafModel.js'

export function GambarGrafA() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafStatis {...grafA} posisi={posisiA} label="Graf tak berarah dengan 5 simpul dan 7 busur" />
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 1. (a) Graf tak berarah dengan 5 simpul dan 7 busur.</figcaption>
    </figure>
  )
}

export function GambarGrafB() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafStatis {...grafB} posisi={posisiB} label="Graf berarah dengan 6 simpul dan 8 busur, termasuk self-loop pada simpul 6" />
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 2. (b) Graf berarah dengan 6 simpul dan 8 busur (termasuk self-loop pada simpul 6).</figcaption>
    </figure>
  )
}
