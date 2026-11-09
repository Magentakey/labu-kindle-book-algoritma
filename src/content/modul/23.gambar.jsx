// Gambar Modul 23 untuk penanda {{gambar:putaran}}: Gambar 1–5 (keadaan graf setelah INITIALIZE-SINGLE-SOURCE dan setelah loop 1 sampai 4).
// Nilai v.d, busur predecessor, dan simpul yang berubah dihitung dari bellmanFordJejak() di model (bukan diketik); keterangan dari bahan kuliah.
import GrafLintasan from '../../viz/GrafLintasan.jsx'
import { bellmanFordJejak, lengkungBF, posLabelBF, simpulBF, urutanBF } from '../../viz/bellmanFordModel.js'
import { posisiSP } from '../../viz/lintasanModel.js'

const KETERANGAN = [
  '(a) Setelah INITIALIZE-SINGLE-SOURCE.',
  '(b) Loop 1: RELAX berhasil untuk (s,t), (s,y).',
  '(c) Loop 2: RELAX berhasil untuk (t,x), (t,z), (y,x).',
  '(d) Loop 3: RELAX berhasil untuk (x,t).',
  '(e) Loop 4: RELAX berhasil untuk (t,z).',
]
const HURUF = 'abcde'

export function GambarPutaran() {
  const jejak = bellmanFordJejak(simpulBF, urutanBF, 's')
  const keadaan = [{ d: jejak.awal.d, pi: jejak.awal.pi, berubah: [] }, ...jejak.putaran]
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {keadaan.map((k, i) => (
          <figure key={i} className="rounded-sm border border-line bg-card p-3">
            <GrafLintasan
              simpul={simpulBF} posisi={posisiSP} busur={urutanBF} lengkung={lengkungBF} posLabel={posLabelBF} sumber="s"
              d={k.d} tebal={simpulBF.filter((v) => k.pi[v]).map((v) => `${k.pi[v]}${v}`)} diperbarui={k.berubah}
              label={`Keadaan Bellman-Ford tahap ${HURUF[i]}: ${KETERANGAN[i]}`}
            />
            <figcaption className="text-caption mt-2 text-ink-soft">
              Gambar {i + 1}. {KETERANGAN[i]}
              <span className="mt-1 block font-semibold text-ink">{k.berubah.length === 0 ? 'Belum ada putaran: hanya s yang berhingga.' : `Nilai yang berubah pada putaran ini: ${k.berubah.join(', ')}.`}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-caption mt-3 text-ink-soft">
        Angka di dekat simpul adalah v.d. Simpul kuning dengan cincin tebal adalah simpul yang nilainya berubah pada putaran itu; busur biru tebal adalah busur predecessor (v.π, v).
      </p>
    </div>
  )
}
