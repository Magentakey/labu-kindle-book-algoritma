// Gambar Modul 22 untuk penanda {{gambar:graf}} (Gambar 1), {{gambar:pohon}} (Gambar 2 dan 3), {{gambar:negatif}} (Gambar 4) dan {{gambar:relax}} (Gambar 5 dan 6).
// Nilai v.d dan busur tree dihitung dari model (lintasanModel.js), bukan diketik; keterangan dari bahan kuliah.
import GambarRelax from '../../viz/GambarRelax.jsx'
import GrafLintasan from '../../viz/GrafLintasan.jsx'
import { busurNeg, busurSP, jarakTerpendek, lengkungNeg, lengkungSP, pohonA, pohonB, posLabelSP, posisiNeg, posisiSP, simpulNeg, simpulSP } from '../../viz/lintasanModel.js'

const KET_POHON = [
  '(a) t: s→t (3); x: s→t→x (9); y: s→y (5); z: s→y→z (11).',
  '(b) t: s→t (3); y: s→t→y (5); x: s→t→y→x (9); z: s→t→y→x→z (11).',
]
const kunciPohon = (pi) => Object.entries(pi).map(([v, u]) => `${u}${v}`)

export function GambarGraf() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafLintasan simpul={simpulSP} posisi={posisiSP} busur={busurSP} lengkung={lengkungSP} posLabel={posLabelSP} sumber="s" label="Graf berarah berbobot dengan sumber s, lima simpul, dan sepuluh busur" />
      <figcaption className="text-caption mt-3 text-ink-soft">Gambar 1. Graf berarah berbobot dengan sumber s.</figcaption>
    </figure>
  )
}

export function GambarPohon() {
  const d = jarakTerpendek(simpulSP, busurSP, 's')
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      {[pohonA, pohonB].map((pi, i) => (
        <figure key={i} className="rounded-sm border border-line bg-card p-3">
          <GrafLintasan simpul={simpulSP} posisi={posisiSP} busur={busurSP} lengkung={lengkungSP} posLabel={posLabelSP} d={d} sumber="s" tebal={kunciPohon(pi)} label={`Shortest-path tree ${i + 1}: ${KET_POHON[i]}`} />
          <figcaption className="text-caption mt-2 text-ink-soft">
            Gambar {i + 2}. {KET_POHON[i]}
            <span className="mt-1 block text-ink">Angka di dekat simpul adalah v.d; busur biru tebal adalah busur shortest-path tree.</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function GambarNegatif() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GrafLintasan simpul={simpulNeg} posisi={posisiNeg} busur={busurNeg} lengkung={lengkungNeg} sumber="s" label="Graf dengan busur dan cycle berbobot negatif: cycle c–d–c berbobot 3 (positif), cycle e–f–e berbobot −3 (negatif)" />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 4. Contoh dari bahan kuliah: cycle c–d–c berbobot 6 + (−3) = 3 (positif), cycle e–f–e berbobot 3 + (−6) = −3 (negatif).
      </figcaption>
    </figure>
  )
}

export function GambarRelaxPasangan() {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      <figure className="rounded-sm border border-line bg-card p-3">
        <GambarRelax ud={5} vd={9} w={2} label="RELAX berhasil: u.d = 5, v.d = 9, w = 2, sehingga v.d menjadi 7" />
        <figcaption className="text-caption mt-2 text-ink-soft">Gambar 5. (a) u.d = 5, v.d = 9, w(u,v) = 2. Karena 9 &gt; 5 + 2, v.d menjadi 7 dan v.π = u.</figcaption>
      </figure>
      <figure className="rounded-sm border border-line bg-card p-3">
        <GambarRelax ud={5} vd={6} w={2} label="RELAX tidak mengubah apa pun: u.d = 5, v.d = 6, w = 2" />
        <figcaption className="text-caption mt-2 text-ink-soft">Gambar 6. (b) u.d = 5, v.d = 6, w(u,v) = 2. Karena 6 ≤ 5 + 2, tidak ada perubahan.</figcaption>
      </figure>
    </div>
  )
}
