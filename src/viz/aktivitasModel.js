// Model hitung Modul 14 (Activity-Selection Problem): GREEDY-ACTIVITY-SELECTOR menurut pseudocode modul (indeks mulai 1), penelusuran per putaran,
// pengurutan stabil menurut kriteria lain, dan pencarian himpunan kompatibel terbesar sebagai pembanding. Murni, tanpa React.

/** Data 11 aktivitas bahan kuliah (Tabel 1), terurut menurut waktu selesai. */
export const aktivitasContoh = { s: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], f: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] }

/** Dua aktivitas [s, f) kompatibel bila selangnya tidak tumpang tindih: s_j ≥ f_i atau s_i ≥ f_j (selang setengah terbuka). */
export const kompatibel = (a, b) => b.s >= a.f || a.s >= b.f

/**
 * GREEDY-ACTIVITY-SELECTOR(s, f) persis menurut pseudocode: data dibaca menurut urutan masukan (TIDAK diurutkan di sini).
 * `A` berisi nomor aktivitas mulai 1. `putaran` berisi satu catatan per putaran perulangan for (m = 2..n).
 * @returns {{ A: number[], putaran: Array<{ loop: number, m: number, sm: number, fk: number, ya: boolean, A: number[], k: number }> }}
 */
export function greedyActivitySelector(s, f) {
  const n = s.length
  const A = [1]
  let k = 1
  const putaran = []
  for (let m = 2; m <= n; m++) {
    const ya = s[m - 1] >= f[k - 1]
    if (ya) { A.push(m); k = m }
    putaran.push({ loop: m - 1, m, sm: s[m - 1], fk: ya ? f[A.at(-2) - 1] : f[k - 1], ya, A: [...A], k })
  }
  return { A, putaran }
}

/** Mengurutkan aktivitas (stabil) menurut kunci; mengembalikan s, f baru dan `asal` (nomor aktivitas asal, mulai 1). */
export function urutkan(s, f, kunci) {
  const idx = s.map((_, i) => i).sort((a, b) => kunci(s[a], f[a]) - kunci(s[b], f[b]) || a - b)
  return { s: idx.map((i) => s[i]), f: idx.map((i) => f[i]), asal: idx.map((i) => i + 1) }
}
export const menurutSelesai = (s, f) => urutkan(s, f, (_, fi) => fi)
export const menurutMulai = (s, f) => urutkan(s, f, (si) => si)
export const menurutDurasi = (s, f) => urutkan(s, f, (si, fi) => fi - si)

/** Ukuran himpunan aktivitas saling kompatibel terbesar (brute force atas semua himpunan bagian, untuk n kecil) dan semua himpunan optimalnya (indeks mulai 0). */
export function optimalBrute(s, f) {
  const n = s.length
  let terbesar = 0
  let semua = []
  for (let m = 0; m < 1 << n; m++) {
    const idx = []
    for (let i = 0; i < n; i++) if (m & (1 << i)) idx.push(i)
    if (idx.length < terbesar) continue
    let ok = true
    for (let x = 0; x < idx.length && ok; x++) for (let y = x + 1; y < idx.length; y++) if (!kompatibel({ s: s[idx[x]], f: f[idx[x]] }, { s: s[idx[y]], f: f[idx[y]] })) { ok = false; break }
    if (!ok) continue
    if (idx.length > terbesar) { terbesar = idx.length; semua = [] }
    semua.push(idx)
  }
  return { ukuran: terbesar, semua }
}

/** Kriteria "durasi terpendek" dengan pemeriksaan terhadap SEMUA aktivitas terpilih (fungsi durasi_terpendek di modul). Mengembalikan pasangan [s, f]. */
export function durasiTerpendek(akt) {
  const dipilih = []
  for (const a of [...akt].sort((x, y) => x[1] - x[0] - (y[1] - y[0]))) if (dipilih.every((b) => a[0] >= b[1] || b[0] >= a[1])) dipilih.push(a)
  return dipilih
}

/** Apakah himpunan indeks (mulai 0) saling kompatibel. */
export const saling = (s, f, idx) => idx.every((i, x) => idx.slice(x + 1).every((j) => kompatibel({ s: s[i], f: f[i] }, { s: s[j], f: f[j] })))
