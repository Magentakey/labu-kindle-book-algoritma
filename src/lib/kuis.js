// Mesin kuis: jenis soal, penilaian, hasil, dan "ulangi yang salah saja". Dipakai kuis modul dan halaman Quiz.
import { PASS_PERCENT } from '../data/modul.js'

/**
 * Jenis soal:
 * - pilihan / benarsalah: satu opsi benar (`kunci` = id opsi), dinilai otomatis.
 * - isian: satu atau beberapa kolom (angka atau pilihan), dinilai otomatis; angka boleh memakai koma desimal.
 * - mandiri (penelusuran, analisis): jawaban ditulis lalu dibandingkan dengan `kunciTeks`; pengguna menilai sendiri.
 */
export const TIPE_LABEL = { penelusuran: 'Penelusuran', pilihan: 'Pilihan Ganda', perhitungan: 'Perhitungan', benarsalah: 'Benar/Salah', analisis: 'Analisis' }

/** "1.000" → 1000, "1,5" → 1.5, "20" → 20; null bila bukan angka. */
export function parseAngka(text) {
  const t = String(text ?? '').trim().replace(/\s+/g, '')
  if (!/^-?[\d.,]+$/.test(t)) return null
  let s = t
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  else if ((s.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

const sama = (a, b) => Math.abs(a - b) < 1e-9

/** Menilai satu soal. @returns {{ benar: boolean | null, jawabanTeks: string, kunciTeks: string }} `benar` null = belum dinilai (soal mandiri yang belum dinilai sendiri). */
export function nilaiSoal(q, jawaban) {
  if (q.mandiri) {
    return { benar: typeof jawaban?.sesuai === 'boolean' ? jawaban.sesuai : null, jawabanTeks: String(jawaban?.teks ?? '').trim(), kunciTeks: q.kunciTeks }
  }
  if (q.opsi) {
    const dipilih = q.opsi.find((o) => o.id === jawaban)
    const kunci = q.opsi.find((o) => o.id === q.kunci)
    return { benar: jawaban === q.kunci, jawabanTeks: dipilih ? `${dipilih.id}. ${dipilih.teks}` : '', kunciTeks: `${kunci.id}. ${kunci.teks}` }
  }
  // isian: jawaban = daftar nilai kolom
  const isi = Array.isArray(jawaban) ? jawaban : []
  const benar = q.isian.every((f, i) => (f.jenis === 'pilih' ? isi[i] === f.kunci : parseAngka(isi[i]) !== null && sama(parseAngka(isi[i]), f.kunci)))
  const fmt = (vals) => q.isian.map((f, i) => `${f.label} = ${vals[i] === undefined || vals[i] === '' ? '…' : vals[i]}`).join(' · ')
  return { benar, jawabanTeks: fmt(isi), kunciTeks: fmt(q.isian.map((f) => f.kunci)) }
}

/**
 * Menghitung hasil seluruh kuis.
 * @param {Array<object>} soal daftar soal yang dikerjakan (boleh sebagian saja pada "ulangi yang salah")
 * @param {Record<number, any>} jawaban jawaban menurut nomor soal
 * @returns {{ skor: number, total: number, persen: number, lulus: boolean, perSoal: Array<{ no: number, benar: boolean | null, jawabanTeks: string, kunciTeks: string }>, salah: number[], belumDinilai: number[] }}
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
export function sudahDijawab(q, jawaban) {
  if (q.mandiri) return String(jawaban?.teks ?? '').trim() !== ''
  if (q.opsi) return jawaban !== undefined && jawaban !== ''
  return Array.isArray(jawaban) && jawaban.some((v) => String(v ?? '').trim() !== '')
}

/**
 * Rincian benar per jenis soal untuk kartu statistik hasil, mis. [{ tipe: 'pilihan', label: 'Pilihan Ganda', benar: 2, total: 2 }].
 * Urutan mengikuti kemunculan pertama jenis di daftar soal. Soal yang belum dinilai dihitung belum benar.
 */
export function rincianTipe(soal, hasil) {
  const out = []
  for (const q of soal) {
    let row = out.find((r) => r.tipe === q.tipe)
    if (!row) out.push((row = { tipe: q.tipe, label: TIPE_LABEL[q.tipe] ?? q.tipe, benar: 0, total: 0 }))
    row.total++
    if (hasil.perSoal.find((r) => r.no === q.no)?.benar === true) row.benar++
  }
  return out
}
