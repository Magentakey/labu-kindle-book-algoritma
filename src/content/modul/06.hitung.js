// Rumus kurva Gambar 1 Modul 06, dipisah dari komponen supaya urutannya bisa dites tanpa memuat JSX.
// t = n dinormalkan ke 0..1. f(t) punya "punuk" di awal (perilaku bebas untuk n kecil), lalu tumbuh seperti g(t) = t².
// Batas bawah = 0,4·t² dan batas atas = 1,1·t² + 0,04 hanya disyaratkan berlaku mulai n₀ = 0,35.
const f = (t) => 0.7 * t * t + 0.1 * t + 0.06 * Math.sin(9 * t) * (1 - t) + 0.02
const bawah = (t) => 0.4 * t * t
const atas = (t) => 1.1 * t * t + 0.04

export const GAMBAR_1 = { n0: 0.35, titik: 80, maks: 1.2, f, bawah, atas }
