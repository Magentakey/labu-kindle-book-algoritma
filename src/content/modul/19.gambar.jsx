// Gambar Modul 19 untuk penanda {{gambar:contoh}} (Gambar 1) dan {{gambar:cut}} (Gambar 2). Graf dan himpunan busur diambil dari model (mstModel.js),
// busur crossing dan light edge dihitung dari cut, bukan diketik.
import GrafBerbobot from '../../viz/GrafBerbobot.jsx'
import { busurContoh, mstT1, posisiContoh, potongan, simpulContoh } from '../../viz/mstModel.js'

/** Himpunan A pada Gambar 2 dan simpul S (biru). */
const himpunanA = ['ab', 'ci', 'fg', 'gh']
const simpulS = ['a', 'b', 'd', 'e']

export function GambarContoh() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafBerbobot simpul={simpulContoh} busur={busurContoh} posisi={posisiContoh} tebal={mstT1} label="Graf contoh dengan 9 simpul dan 14 busur; MST A berbobot total 37 ditebalkan" />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Graf contoh. Busur tebal oranye adalah MST A = {'{'}(a,b), (b,c), (c,d), (c,f), (c,i), (d,e), (f,g), (g,h){'}'} dengan bobot total 37. Angka di tengah busur adalah bobotnya.
      </figcaption>
    </figure>
  )
}

export function GambarCut() {
  const { silang, light } = potongan(simpulContoh, busurContoh, simpulS)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafBerbobot
        simpul={simpulContoh} busur={busurContoh} posisi={posisiContoh} gayaTebal="biru"
        tebal={himpunanA} silang={silang.map((e) => e.nama)} light={light[0].nama} S={simpulS}
        label="Cut dengan S = {a, b, d, e}: enam crossing edge putus-putus, light edge (c, d) berbobot 7"
      />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 2. Contoh cut dengan S = {'{'}a, b, d, e{'}'} (simpul biru bersegi; V − S berlingkar putus-putus). Busur merah putus-putus adalah crossing edge; busur tebal biru adalah A = {'{'}(a,b), (c,i), (f,g), (g,h){'}'}, yang tidak menyeberangi cut. Light edge-nya adalah (c,d) berbobot 7 (bertanda ★), sehingga (c,d) safe.
      </figcaption>
    </figure>
  )
}
