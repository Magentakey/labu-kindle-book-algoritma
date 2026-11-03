// Gambar Modul 10 untuk penanda {{gambar:id}}: Gambar 1 (pohon pemanggilan rekursif F5). Isinya dihitung dari rekursi sebenarnya, bukan diketik.
import PohonFibonacci from '../../viz/PohonFibonacci.jsx'

export function GambarFibonacci() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <PohonFibonacci n={5} />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Pohon pemanggilan rekursif untuk F₅. Simpul bergaris putus kuning dengan tanda ↻ adalah perhitungan ulang dari submasalah yang sudah pernah dihitung.
      </figcaption>
    </figure>
  )
}
