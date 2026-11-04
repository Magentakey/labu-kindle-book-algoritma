// Gambar Modul 11 untuk penanda {{gambar:id}}: Gambar 1 (pohon pemecahan optimal enam matriks). Isinya dihitung dari tabel s hasil MATRIX-CHAIN-ORDER, bukan diketik.
import PohonPemecahan from '../../viz/PohonPemecahan.jsx'
import { penyelesaianContoh, ukuranContoh } from '../../viz/rantaiModel.js'

export function GambarPohon() {
  const { s } = penyelesaianContoh()
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <PohonPemecahan s={s} p={ukuranContoh} />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Pohon pemecahan optimal dari tabel s. Setiap simpul dalam (garis solid) adalah satu perkalian dua matriks, ditulis bersama letak pemecah k dan biaya perkalian terakhirnya; simpul bergaris putus adalah satu matriks.
      </figcaption>
    </figure>
  )
}
