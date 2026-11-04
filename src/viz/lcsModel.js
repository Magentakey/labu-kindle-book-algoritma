// Model hitung Modul 12 (LCS): tabel c dan b (dengan tanda panah), penelusuran PRINT-LCS, dan pencarian semua LCS sebagai pembanding.
// Dipakai oleh Tabel 3 Modul 12 dan tesnya. Murni, tanpa React. Indeks tabel mulai 1 untuk xi dan yj, sama dengan teks modul.

export const contohX = 'ABCBDAB'
export const contohY = 'BDCABA'
export const PANAH = { diagonal: '↖', atas: '↑', kiri: '←' }

/**
 * LCS-LENGTH. Aturan seri (c[i-1][j] sama dengan c[i][j-1]): `utamakanAtas` true memilih "↑" (langkah 13 memakai ≥, seperti di modul),
 * false memilih "←" (memakai >). b[i][j] kosong pada baris 0 dan kolom 0.
 * @returns {{ c: number[][], b: string[][] }}
 */
export function lcsLength(X, Y, utamakanAtas = true) {
  const m = X.length
  const n = Y.length
  const c = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const b = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const atas = c[i - 1][j]
      const kiri = c[i][j - 1]
      if (X[i - 1] === Y[j - 1]) {
        c[i][j] = c[i - 1][j - 1] + 1
        b[i][j] = PANAH.diagonal
      } else if (utamakanAtas ? atas >= kiri : atas > kiri) {
        c[i][j] = atas
        b[i][j] = PANAH.atas
      } else {
        c[i][j] = kiri
        b[i][j] = PANAH.kiri
      }
    }
  }
  return { c, b }
}

/**
 * PRINT-LCS(b, X, i, j) dijalankan sungguhan (rekursif). `pemanggilan` berisi satu catatan per pemanggilan menurut urutan dipanggil,
 * `cetak` berisi { i, huruf } menurut urutan dicetak. Hasil: `lcs` (teks) dan `jalur` (sel yang dilewati, tidak termasuk sel batas baris/kolom 0).
 */
export function printLcs(b, X, i0 = X.length, j0 = b[0].length - 1) {
  const pemanggilan = []
  const cetak = []
  const jalur = []
  const f = (i, j) => {
    pemanggilan.push({ i, j, arah: i === 0 || j === 0 ? '' : b[i][j] })
    if (i === 0 || j === 0) return
    jalur.push([i, j])
    if (b[i][j] === PANAH.diagonal) {
      f(i - 1, j - 1)
      cetak.push({ i, huruf: X[i - 1] })
    } else if (b[i][j] === PANAH.atas) f(i - 1, j)
    else f(i, j - 1)
  }
  f(i0, j0)
  return { lcs: cetak.map((x) => x.huruf).join(''), cetak, pemanggilan, jalur }
}

/** Versi yang mencetak lebih dulu baru memanggil rekursi (urutan dibalik, Soal 5): hasilnya LCS terbalik. */
export function printLcsTerbalik(b, X, i = X.length, j = b[0].length - 1) {
  if (i === 0 || j === 0) return ''
  if (b[i][j] === PANAH.diagonal) return X[i - 1] + printLcsTerbalik(b, X, i - 1, j - 1)
  return b[i][j] === PANAH.atas ? printLcsTerbalik(b, X, i - 1, j) : printLcsTerbalik(b, X, i, j - 1)
}

/** Apakah Z subbarisan dari X (hapus nol atau lebih elemen tanpa mengubah urutan). */
export function subbarisan(Z, X) {
  let k = 0
  for (const h of X) if (k < Z.length && Z[k] === h) k++
  return k === Z.length
}

/** Semua subbarisan berbeda dari X (2^m kemungkinan, hanya untuk X pendek). */
export function semuaSubbarisan(X) {
  const hasil = new Set([''])
  for (const h of X) for (const s of [...hasil]) hasil.add(s + h)
  return hasil
}

/** Semua LCS (pembanding brute force): subbarisan persekutuan dengan panjang maksimum. */
export function semuaLcs(X, Y) {
  const sx = semuaSubbarisan(X)
  let terpanjang = 0
  const persekutuan = []
  for (const s of sx) if (subbarisan(s, Y)) { persekutuan.push(s); terpanjang = Math.max(terpanjang, s.length) }
  return { panjang: terpanjang, semua: persekutuan.filter((s) => s.length === terpanjang).sort() }
}

/** Posisi (indeks mulai 1) pertama kali Z dapat dicocokkan sebagai subbarisan X, atau null. */
export function posisiSubbarisan(Z, X) {
  const pos = []
  let k = 0
  for (let i = 0; i < X.length && k < Z.length; i++) if (X[i] === Z[k]) { pos.push(i + 1); k++ }
  return k === Z.length ? pos : null
}

/** Sel-sel yang menyusun tabel contoh Modul 12. */
export const tabelContoh = (utamakanAtas = true) => lcsLength(contohX, contohY, utamakanAtas)
