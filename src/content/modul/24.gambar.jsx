// Gambar Modul 24 untuk penanda {{gambar:langkah}}: Gambar 1–6 (keadaan Dijkstra setelah langkah 1–3 dan setelah loop 1 sampai 5). Nilai v.d, himpunan S, simpul berikutnya,
// dan busur predecessor dihitung dari dijkstraJejak() di model (bukan diketik); keterangan dari bahan kuliah.
import GrafLintasan from '../../viz/GrafLintasan.jsx'
import { adjDijkstra, busurDijkstra, dijkstraJejak, potretDijkstra, simpulDijkstra, tahapGambar } from '../../viz/dijkstraModel.js'
import { lengkungSP, posLabelSP, posisiSP } from '../../viz/lintasanModel.js'

const KETERANGAN = [
  '(a) Setelah langkah 1–3: s.d = 0, lainnya ∞; S kosong.',
  '(b) Loop 1: extract s; t.d=10, y.d=5.',
  '(c) Loop 2: extract y; x.d=14, z.d=7, t.d=8.',
  '(d) Loop 3: extract z; x.d=13.',
  '(e) Loop 4: extract t; x.d=9.',
  '(f) Loop 5: extract x; tidak ada nilai yang berubah.',
]
const HURUF = 'abcdef'

export function GambarLangkah() {
  const hasil = dijkstraJejak(adjDijkstra, 's')
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tahapGambar.map((k, i) => {
          const p = potretDijkstra(hasil, k)
          return (
            <figure key={k} className="rounded-sm border border-line bg-card p-3">
              <GrafLintasan
                simpul={simpulDijkstra} posisi={posisiSP} busur={busurDijkstra} lengkung={lengkungSP} posLabel={posLabelSP} sumber="s"
                d={p.d} tebal={p.tree} selesai={p.S} berikutnya={p.berikutnya ? [p.berikutnya] : []}
                label={`Keadaan Dijkstra tahap ${HURUF[i]}: ${KETERANGAN[i]}`}
              />
              <figcaption className="text-caption mt-2 text-ink-soft">
                Gambar {i + 1}. {KETERANGAN[i]}
                <span className="mt-1 block font-semibold text-ink">
                  S = {p.S.length === 0 ? '∅' : `{${p.S.join(', ')}}`}. {p.berikutnya ? `Berikutnya: ${p.berikutnya} (${p.d[p.berikutnya]}).` : 'Q kosong.'}
                </span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
