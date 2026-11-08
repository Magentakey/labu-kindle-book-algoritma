// Gambar Modul 20 untuk penanda {{gambar:langkah}}: Gambar 1–6 (perkembangan himpunan A pada graf contoh). Dihitung dari kruskal() di model (bukan diketik);
// keterangan dari bahan kuliah. Himpunan simpul ditulis sebagai teks di bawah tiap gambar.
import GrafBerbobot from '../../viz/GrafBerbobot.jsx'
import { kruskal, potretTahap, tahapGambar, teksHimpunan, urutanBahan } from '../../viz/kruskalModel.js'
import { posisiContoh, simpulContoh } from '../../viz/mstModel.js'

const HURUF = 'abcdef'
const KETERANGAN = [
  '(a) Setelah memproses (h,g), (c,i), (g,f): ketiganya diterima.',
  '(b) (a,b) dan (c,f) diterima. (c,f) menyatukan {c,i} dengan {f,g,h}.',
  '(c) (g,i) ditolak: g dan i sudah satu tree, akan membentuk cycle.',
  '(d) (c,d) diterima; (h,i) ditolak.',
  '(e) (b,c) diterima; (a,h) ditolak karena a dan h sudah terhubung.',
  '(f) (d,e) diterima; (e,f), (b,h), (d,f) ditolak. MST selesai, bobot 37.',
]

export function GambarLangkah() {
  const hasil = kruskal(simpulContoh, urutanBahan, false)
  return (
    <div className="my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tahapGambar.map((sampai, i) => {
          const p = potretTahap(hasil, i === 0 ? 0 : tahapGambar[i - 1], sampai, simpulContoh)
          return (
            <figure key={sampai} className="rounded-sm border border-line bg-card p-3">
              <GrafBerbobot
                simpul={simpulContoh} busur={hasil.urutan} posisi={posisiContoh} gayaTebal="biru"
                tebal={p.lama} baru={p.baru} silang={p.tolak} namaSilang="Busur baru ditolak" namaTebal="Busur yang sudah ada di A (biru)" namaBaru="Busur baru diterima (oranye)"
                label={`Tahap ${HURUF[i]} algoritma Kruskal: ${KETERANGAN[i]}`}
              />
              <figcaption className="text-caption mt-2 text-ink-soft">
                Gambar {i + 1}. {KETERANGAN[i]}
                <span className="mt-1 block font-semibold text-ink">Himpunan simpul: {teksHimpunan(p.himpunan)}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
