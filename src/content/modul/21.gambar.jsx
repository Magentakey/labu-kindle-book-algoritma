// Gambar Modul 21 untuk penanda {{gambar:langkah}}: Gambar 1–6 (keadaan Prim dengan akar a: key di dalam simpul, simpul yang sudah di-extract, busur tree dan sementara).
// Dihitung dari prim() di model (bukan diketik); keterangan dari bahan kuliah. Simpul yang sudah di tree juga ditulis sebagai teks di bawah tiap gambar.
import GrafBerbobot from '../../viz/GrafBerbobot.jsx'
import { adjContoh, bobotContoh, potretPrim, prim, simpulPrim, tahapGambar, teksKey } from '../../viz/primModel.js'
import { busurContoh, posisiContoh } from '../../viz/mstModel.js'

const HURUF = 'abcdef'
const KETERANGAN = [
  '(a) Langkah 1–5: semua key = ∞ kecuali akar a (key 0).',
  '(b) Setelah extract a: b.key=4, h.key=8.',
  '(c) Setelah extract c: i.key=2, f.key=4, d.key=7.',
  '(d) Setelah extract i: g.key=6, h.key=7.',
  '(e) Setelah extract f: e.key=10, g.key=2.',
  '(f) Setelah extract e: tidak ada key yang berubah.',
]

export function GambarLangkah() {
  const hasil = prim(adjContoh, bobotContoh, 'a')
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tahapGambar.map((k, i) => {
          const p = potretPrim(hasil, k, simpulPrim, 'a')
          const kunci = Object.fromEntries(simpulPrim.map((v) => [v, teksKey(p.key[v])]))
          return (
            <figure key={k} className="rounded-sm border border-line bg-card p-3">
              <GrafBerbobot
                simpul={simpulPrim} busur={busurContoh} posisi={posisiContoh} gayaTebal="biru"
                tebal={p.tree} sementara={p.sementara} namaTebal="Busur tree (v, π) untuk simpul yang sudah di-extract (biru)" namaSementara="Busur sementara (v, π) untuk simpul di Q (oranye putus-putus)"
                kunci={kunci} selesai={p.sudah}
                label={`Keadaan Prim tahap ${HURUF[i]}: ${KETERANGAN[i]}`}
              />
              <figcaption className="text-caption mt-2 text-ink-soft">
                Gambar {i + 1}. {KETERANGAN[i]}
                <span className="mt-1 block font-semibold text-ink">Sudah di tree: {p.sudah.length === 0 ? 'belum ada' : p.sudah.join(', ')}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
