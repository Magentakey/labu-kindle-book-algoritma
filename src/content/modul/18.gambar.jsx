// Gambar Modul 18 untuk penanda {{gambar:tahap}} dan {{gambar:hutan}}: Gambar 1–6 (keadaan graf pada time = 1, 4, 5, 8, 10, 12) dan Gambar 7 (DFS-forest).
// Semuanya dihitung dari dfs() di model (bukan diketik). Keterangan dari bahan kuliah.
import GrafDFS from '../../viz/GrafDFS.jsx'
import HutanDFS from '../../viz/HutanDFS.jsx'
import { adjContoh, dfs, keteranganGambar, potret, urutanTabel, waktuGambar } from '../../viz/dfsModel.js'

const HURUF = 'abcdef'

export function GambarTahap() {
  const hasil = dfs(adjContoh, urutanTabel)
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {waktuGambar.map((T, i) => (
          <figure key={T} className="rounded-sm border border-line bg-card p-3">
            <GrafDFS Adj={adjContoh} keadaan={potret(hasil, T)} label={`Keadaan graf pada tahap ${HURUF[i]}: ${keteranganGambar[i]}`} />
            <figcaption className="text-caption mt-2 text-ink-soft">Gambar {i + 1}. {keteranganGambar[i]}</figcaption>
          </figure>
        ))}
      </div>
      <p className="text-caption mt-3 text-ink-soft">
        Warna simpul: WHITE bergaris putus (belum ditemukan), GRAY berisi kuning (sedang dikunjungi), BLACK berisi hijau dan bertanda ✓ (selesai). Teks d/f di dekat simpul adalah waktu ditemukan dan waktu selesai. Busur biru tebal adalah tree edge; busur merah putus-putus berhuruf B, F, atau C adalah busur non-tree; busur abu-abu tipis belum diperiksa.
      </p>
    </div>
  )
}

export function GambarHutan() {
  const hasil = dfs(adjContoh, urutanTabel)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <HutanDFS hasil={hasil} label="DFS-forest: dua tree dengan akar u dan w, beserta busur non-tree" />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 7. DFS-forest: dua tree dengan akar u dan w. Busur biru tebal adalah tree edge; busur putus-putus adalah busur non-tree (B = back, F = forward, C = cross).
      </figcaption>
    </figure>
  )
}
