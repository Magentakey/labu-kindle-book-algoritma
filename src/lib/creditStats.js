// Angka untuk halaman Credit: status tiap blok labu, ringkasan progres, dan modul berikutnya.
import { petaBab } from '../data/credit.js'
import { TOTAL_MODUL, modul as modulTersedia, modulById } from '../data/modul.js'
import { entryOf, lastOpened, percent, status } from './progress.js'

/** Status tiap modul 1..24 untuk peta dan koleksi blok. Modul yang belum ditulis selalu 'belum'. @returns {Map<string, 'belum'|'sedang'|'selesai'>} */
export function statusSemuaModul(progres) {
  const m = new Map()
  for (const b of petaBab) for (const x of b.modul) m.set(x.id, status(entryOf(progres, x.id)))
  return m
}

/**
 * Ringkasan progres.
 * @param {Record<string, object>} progres
 * @param {Array<{ modul: string }>} daftarKuis kuis yang tersedia
 */
export function ringkasProgres(progres, daftarKuis) {
  const st = [...statusSemuaModul(progres).values()]
  const selesai = st.filter((s) => s === 'selesai').length
  const sedang = st.filter((s) => s === 'sedang').length
  const best = daftarKuis.map((k) => progres[k.modul]?.kuis?.best).filter(Boolean)
  return {
    selesai,
    sedang,
    total: TOTAL_MODUL,
    kuisDicoba: best.length,
    rataRata: best.length ? Math.round(best.reduce((n, b) => n + b.persen, 0) / best.length) : null,
    kuisLulus: daftarKuis.filter((k) => progres[k.modul]?.kuis?.passed).length,
    kuisTotal: daftarKuis.length,
  }
}

/** Modul yang disarankan sebagai blok berikutnya: yang terakhir dibuka, kalau tidak ada modul tersedia pertama yang belum selesai; null bila semua selesai. */
export function blokBerikutnya(progres) {
  const lanjut = lastOpened(progres)
  const id = lanjut?.id ?? modulTersedia.find((m) => status(entryOf(progres, m.id)) !== 'selesai')?.id
  const m = id && modulById(id)
  return m ? { id: m.id, judul: m.judul, persen: percent(entryOf(progres, m.id)) } : null
}

/** Kalimat sorotan di bagian atas Credit. */
export function sorotan(selesai, total, streak) {
  const judul = selesai === 0 ? 'Mulai menyusun blok labu pertamamu!' : selesai >= total ? `Selamat! Kamu sudah menyusun semua ${total} blok labu!` : `Kamu sudah menyusun ${selesai} dari ${total} blok labu!`
  const ajak = streak >= 2 ? ` Streak ${streak} hari — pertahankan!` : ''
  return { judul, isi: `Setiap modul yang selesai menambah satu blok sampai logo labu tersusun penuh.${ajak}` }
}
