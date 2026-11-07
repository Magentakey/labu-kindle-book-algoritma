// Gambar Modul 17 untuk penanda {{gambar:tahap}}: Gambar 1–9, keadaan graf contoh pada awal dan sesudah setiap putaran BFS.
// Dihitung dari bfs() di model (bukan diketik). Keterangan tiap gambar dibuat dari data putaran.
import GrafBFS from '../../viz/GrafBFS.jsx'
import { adjContoh, bfs, keteranganGambar } from '../../viz/bfsModel.js'

const HURUF = 'abcdefghi'

export function GambarTahap() {
  const r = bfs(adjContoh, 's')
  const tahap = [r.awal, ...r.putaran]
  const ket = keteranganGambar(r)
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tahap.map((t, i) => (
          <figure key={i} className="rounded-sm border border-line bg-card p-3">
            <GrafBFS Adj={adjContoh} keadaan={t} Q={t.Q} label={`Keadaan graf pada tahap ${HURUF[i]}: ${ket[i]}`} />
            <figcaption className="text-caption mt-2 text-ink-soft">Gambar {i + 1}. {ket[i]}</figcaption>
          </figure>
        ))}
      </div>
      <p className="text-caption mt-3 text-ink-soft">
        Warna simpul: WHITE bergaris putus (belum ditemukan), GRAY berisi kuning (di antrean), BLACK berisi hijau dan bertanda ✓ (selesai). Angka di dekat simpul (di atas atau di bawahnya) adalah jarak d; busur biru tebal adalah busur predecessor.
      </p>
    </div>
  )
}
