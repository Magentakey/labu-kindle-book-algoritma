// Mesin kuis: jenis soal, penilaian, hasil, dan "ulangi yang salah saja". Dipakai kuis modul dan halaman Quiz.
import { PASS_PERCENT } from '../data/modul.js'

/**
 * Jenis soal (semuanya pilihan ganda, dinilai otomatis):
 * - satu jawaban: `opsi` dan `kunci` = id satu opsi (mis. 'C').
 * - banyak jawaban: `opsi` dan `kunci` = daftar id (mis. ['A', 'C']). Benar hanya bila yang dipilih persis sama dengan kunci:
 *   semua pilihan benar terpilih dan tidak ada pilihan salah (tanpa nilai sebagian). Jumlah jawaban ditulis di soal.
 */

/** Soal pilihan ganda yang harus memilih lebih dari satu jawaban (kunci berupa daftar). */
export const banyakJawaban = (q) => Array.isArray(q.kunci)
/** Banyaknya jawaban yang harus dipilih pada soal pilihan ganda (1 untuk satu jawaban). */
export const jumlahKunci = (q) => (Array.isArray(q.kunci) ? q.kunci.length : 1)
/** Jenis soal menurut bentuk jawabannya: 'banyak' atau 'satu'. */
export const jenisSoal = (q) => (banyakJawaban(q) ? 'banyak' : 'satu')
export const JENIS_LABEL = { satu: 'Satu jawaban', banyak: 'Banyak jawaban' }
/** Label kecil di atas soal, mis. "Pilih 2 jawaban". */
export const labelSoal = (q) => `Pilih ${jumlahKunci(q)} jawaban`
/** Jawaban terpilih sebagai daftar id (satu jawaban dibungkus menjadi daftar). */
export const terpilih = (q, jawaban) => (banyakJawaban(q) ? (Array.isArray(jawaban) ? jawaban : []) : jawaban === undefined || jawaban === '' || jawaban === null ? [] : [jawaban])

/** Menilai satu soal. @returns {{ benar: boolean, jawabanTeks: string, kunciTeks: string }} */
export function nilaiSoal(q, jawaban) {
  const kunciIds = banyakJawaban(q) ? q.kunci : [q.kunci]
  const pilih = [...new Set(terpilih(q, jawaban))]
  const benar = pilih.length === kunciIds.length && kunciIds.every((k) => pilih.includes(k))
  const teks = (ids) => q.opsi.filter((o) => ids.includes(o.id)).map((o) => `${o.id}. ${o.teks}`).join(' · ')
  return { benar, jawabanTeks: teks(pilih), kunciTeks: teks(kunciIds) }
}

/**
 * Menghitung hasil seluruh kuis.
 * @param {Array<object>} soal daftar soal yang dikerjakan (boleh sebagian saja pada "ulangi yang salah")
 * @param {Record<number, any>} jawaban jawaban menurut nomor soal
 * @returns {{ skor: number, total: number, persen: number, lulus: boolean, perSoal: Array<{ no: number, benar: boolean, jawabanTeks: string, kunciTeks: string }>, salah: number[], belumDinilai: number[] }}
 */
export function hitungHasil(soal, jawaban) {
  const perSoal = soal.map((q) => ({ no: q.no, ...nilaiSoal(q, jawaban[q.no]) }))
  const skor = perSoal.filter((r) => r.benar === true).length
  const total = soal.length
  const persen = total === 0 ? 0 : Math.round((skor / total) * 100)
  return {
    skor,
    total,
    persen,
    lulus: persen >= PASS_PERCENT,
    perSoal,
    salah: perSoal.filter((r) => r.benar !== true).map((r) => r.no),
    belumDinilai: perSoal.filter((r) => r.benar === null).map((r) => r.no),
  }
}

/** Soal untuk "Ulangi yang salah saja": soal yang tidak benar pada percobaan terakhir. */
export const soalSalah = (soal, hasilTerakhir) => soal.filter((q) => hasilTerakhir?.salah?.includes(q.no))

/** Detik menjadi "6 menit 40 detik" (atau "40 detik"). */
export function durasi(detik) {
  const s = Math.max(0, Math.round(detik))
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} menit ${s % 60} detik` : `${s} detik`
}

/** Detik menjadi "07:42" untuk penghitung waktu. */
export const jam = (detik) => `${String(Math.floor(Math.max(0, detik) / 60)).padStart(2, '0')}:${String(Math.max(0, detik) % 60).padStart(2, '0')}`

/**
 * Menggabungkan hasil "ulangi yang salah saja" ke hasil penuh sebelumnya: soal yang diulang diganti hasilnya,
 * soal lain tetap, lalu skor dihitung ulang dari seluruh soal.
 * @param {ReturnType<typeof hitungHasil>} lama hasil penuh sebelumnya
 * @param {ReturnType<typeof hitungHasil>} baru hasil soal yang diulang
 */
export function gabungHasil(lama, baru) {
  const ganti = new Map(baru.perSoal.map((r) => [r.no, r]))
  const perSoal = lama.perSoal.map((r) => ganti.get(r.no) ?? r)
  const skor = perSoal.filter((r) => r.benar === true).length
  const total = perSoal.length
  const persen = total === 0 ? 0 : Math.round((skor / total) * 100)
  return {
    skor,
    total,
    persen,
    lulus: persen >= PASS_PERCENT,
    perSoal,
    salah: perSoal.filter((r) => r.benar !== true).map((r) => r.no),
    belumDinilai: perSoal.filter((r) => r.benar === null).map((r) => r.no),
  }
}

// ------------------------------------------------------------------ draf jawaban (tersimpan otomatis, juga saat offline)
export const draftKey = (modulId) => `labu-kuis-draf-${modulId}`

/** Membaca draf. Nomor soal yang tidak dikenal dibuang; draf rusak atau tanpa soal menghasilkan null. */
export function loadDraft(storage, modulId, nomorSah) {
  try {
    const d = JSON.parse(storage?.getItem(draftKey(modulId)) ?? 'null')
    if (!d || !Array.isArray(d.nos)) return null
    const nos = d.nos.filter((n) => nomorSah.includes(n))
    if (nos.length === 0) return null
    const jawaban = Object.fromEntries(Object.entries(d.jawaban ?? {}).filter(([k]) => nomorSah.includes(Number(k))))
    return { nos, index: Math.min(Math.max(Number(d.index) || 0, 0), nos.length - 1), jawaban, ragu: (d.ragu ?? []).filter((n) => nos.includes(n)), detik: Math.max(0, Number(d.detik) || 0) }
  } catch {
    return null
  }
}

export function saveDraft(storage, modulId, draft) {
  try {
    storage?.setItem(draftKey(modulId), JSON.stringify(draft))
  } catch {
    // penyimpanan tidak tersedia: draf hanya berlaku selama halaman terbuka
  }
}

export function clearDraft(storage, modulId) {
  try {
    storage?.removeItem(draftKey(modulId))
  } catch {
    // diabaikan
  }
}

/** Apakah soal sudah dijawab (untuk penanda blok soal). */
export const sudahDijawab = (q, jawaban) => terpilih(q, jawaban).length > 0

/**
 * Rincian benar per bentuk soal untuk kartu statistik hasil, mis. [{ tipe: 'satu', label: 'Satu jawaban', benar: 3, total: 4 }].
 * Urutan mengikuti kemunculan pertama bentuk di daftar soal. Soal yang belum dinilai dihitung belum benar.
 */
export function rincianTipe(soal, hasil) {
  const out = []
  for (const q of soal) {
    const tipe = jenisSoal(q)
    let row = out.find((r) => r.tipe === tipe)
    if (!row) out.push((row = { tipe, label: JENIS_LABEL[tipe], benar: 0, total: 0 }))
    row.total++
    if (hasil.perSoal.find((r) => r.no === q.no)?.benar === true) row.benar++
  }
  return out
}
