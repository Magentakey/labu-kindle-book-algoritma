// Gambar Modul 15 untuk penanda {{gambar:tetap}} dan {{gambar:huffman}}: Gambar 1 (pohon kode panjang tetap) dan Gambar 2 (pohon Huffman).
// Keduanya dihitung dari model (HUFFMAN dan trie kode), bukan diketik.
import PohonKode from '../../viz/PohonKode.jsx'
import { frekuensiContoh, huffman, kodeDariPohon, kodeTetapContoh, pohonDariKode } from '../../viz/kodeHuffmanModel.js'

export function GambarTetap() {
  const akar = pohonDariKode(kodeTetapContoh, frekuensiContoh)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <PohonKode akar={akar} kode={kodeTetapContoh} judul="Pohon kode panjang tetap 3 bit untuk enam karakter" />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Pohon kode panjang tetap (3 bit). Simpul 14 di kanan hanya punya satu anak (ditandai ⚠), tanda bahwa kode ini tidak optimal.
      </figcaption>
    </figure>
  )
}

export function GambarHuffman() {
  const { akar } = huffman(frekuensiContoh)
  const kode = kodeDariPohon(akar)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <PohonKode akar={akar} kode={kode} judul="Pohon Huffman hasil akhir untuk enam karakter" />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 2. Pohon Huffman hasil akhir. Label 0 untuk busur ke anak kiri, 1 untuk busur ke anak kanan.
      </figcaption>
    </figure>
  )
}
