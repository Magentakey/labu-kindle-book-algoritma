// Pseudocode GREEDY-ACTIVITY-SELECTOR(s, f) dari materi 10.1 (Cormen), array s dan f berindeks mulai dari 1.
// Peraga ini menjalankan pseudocode APA ADANYA menurut urutan masukan: data TIDAK diurutkan lebih dulu,
// jadi pembaca bisa mengulang latihan bagian F (urut start time atau durasi) dan melihat hasil yang tidak optimal.
export const greedyActivityCode = [
  'n = s.length',
  'A = {a_1}',
  'k = 1',
  'for m = 2 to n',
  '    if s[m] >= f[k]',
  '        A = A ∪ {a_m}',
  '        k = m',
  'return A',
].join('\n')

/** Batas masukan, sama dengan visualizer garis waktu: 1 sampai 12 aktivitas, waktu 0 sampai 30. */
export const GREEDY_LIMITS = { maxLength: 12, minValue: 0, maxValue: 30 }

/** Memeriksa pasangan s dan f: sama panjang, dan 0 ≤ s_i < f_i untuk tiap aktivitas. */
export function checkGreedyInput({ s, f }) {
  if (s.length !== f.length) return `Array s berisi ${s.length} angka, sedangkan array f berisi ${f.length}. Keduanya harus sama panjang (satu pasangan start dan finish per aktivitas).`
  for (let i = 0; i < s.length; i++) {
    if (f[i] <= s[i]) return `Aktivitas ke-${i + 1} mulai pada ${s[i]} tetapi selesai pada ${f[i]}. Waktu selesai harus lebih besar dari waktu mulai.`
  }
  return null
}

/** Ukuran maksimum himpunan aktivitas kompatibel (urutkan menurut finish time, lalu greedy). Dipakai untuk membandingkan hasil peraga. */
export function maxCompatible(s, f) {
  const order = s.map((_, i) => i).sort((a, b) => f[a] - f[b] || s[a] - s[b])
  let count = 0
  let end = -Infinity
  for (const i of order) {
    if (s[i] >= end) {
      count++
      end = f[i]
    }
  }
  return count
}

const setText = (A) => `{${A.map((x) => `a${x}`).join(', ')}}`
const dash = '–'

/**
 * Menjalankan GREEDY-ACTIVITY-SELECTOR(s, f) satu langkah per pembacaan satu baris, menurut urutan masukan.
 * Header perulangan (baris 4) dicatat tiap putaran, termasuk pemeriksaan terakhir saat m > n, seperti `jumlah-n-bil`.
 * Banyak langkah: 3 (baris 1 sampai 3) + 2(n - 1) (baris 4 dan 5 tiap putaran) + 2(|A| - 1) (baris 6 dan 7) + 2 (baris 4 terakhir dan 8).
 *
 * Status sel: yang masuk A 'chosen', yang dilewati 'skipped', yang sedang diperiksa 'current' (baris 4) atau 'compare'
 * (baris 5: s[m] dan f[k]), dan sisanya 'normal'.
 *
 * @param {{ s: number[], f: number[] }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function greedyActivityTrace({ s, f }) {
  const n = s.length
  const status = Array(n).fill('normal') // 'normal' | 'chosen' | 'skipped'
  const steps = []
  const A = []
  let k
  let m

  const sorted = f.every((v, i) => i === 0 || v >= f[i - 1])

  function marks(line) {
    const sMarks = status.map((st, idx) => (idx + 1 === m && line === 4 ? 'current' : idx + 1 === m && line === 5 ? 'compare' : st))
    const fMarks = status.map((st, idx) => (line === 5 && idx + 1 === k ? 'compare' : st))
    return { sMarks, fMarks }
  }

  function push(line, note) {
    const { sMarks, fMarks } = marks(line)
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'k', value: k === undefined ? dash : String(k) },
        { name: 'm', value: m === undefined ? dash : String(m) },
        { name: 'A', value: A.length ? setText(A) : dash },
      ],
      arrays: [
        { title: 'Array s (start time, indeks mulai dari 1)', values: [...s], marks: sMarks, indexBase: 1 },
        { title: 'Array f (finish time, indeks mulai dari 1)', values: [...f], marks: fMarks, indexBase: 1 },
      ],
    })
  }

  push(1, `Baris 1: n = s.length = ${n}. Aktivitas dibaca menurut urutan masukan, tanpa diurutkan.${sorted ? '' : ' Perhatikan: array f tidak terurut naik, jadi asumsi prosedur (terurut menurut finish time) tidak terpenuhi.'}`)

  A.push(1)
  status[0] = 'chosen'
  push(2, `Baris 2: A = {a1}. Aktivitas pertama pada masukan selalu dipilih lebih dulu, yaitu a1 pada [${s[0]}, ${f[0]}).`)

  k = 1
  push(3, `Baris 3: k = 1. Aktivitas terakhir di A adalah a1, sehingga f[k] = f[1] = ${f[0]}.`)

  for (m = 2; ; m++) {
    const masuk = m <= n
    push(
      4,
      masuk
        ? `Baris 4: m = ${m}, ${m} ≤ ${n} sehingga langkah 5 dijalankan.`
        : `Baris 4: m = ${m} lebih besar dari n = ${n}, jadi perulangan selesai dan algoritma lanjut ke baris 8.`,
    )
    if (!masuk) break

    const ok = s[m - 1] >= f[k - 1]
    push(
      5,
      `Baris 5: s[${m}] ≥ f[${k}] → ${s[m - 1]} ≥ ${f[k - 1]} bernilai ${ok ? 'TRUE, lanjut ke baris 6 dan 7' : `FALSE, a${m} dilewati (mulai pada ${s[m - 1]}, padahal a${k} baru selesai pada ${f[k - 1]}), kembali ke baris 4`}.`,
    )
    if (!ok) {
      status[m - 1] = 'skipped'
      continue
    }
    A.push(m)
    status[m - 1] = 'chosen'
    push(6, `Baris 6: A = A ∪ {a${m}} = ${setText(A)}.`)
    k = m
    push(7, `Baris 7: k = m = ${m}. Aktivitas terakhir di A sekarang a${m}, jadi f[k] = ${f[m - 1]}.`)
  }

  m = undefined
  const best = maxCompatible(s, f)
  const verdict =
    A.length === best
      ? `Jumlah ini sama dengan maksimum yang mungkin untuk data ini (${best}), jadi hasilnya optimal.`
      : `Padahal maksimum untuk data ini adalah ${best} aktivitas, jadi hasilnya TIDAK optimal.${sorted ? '' : ' Penyebabnya data tidak terurut menurut finish time.'}`
  push(8, `Baris 8: return A = ${setText(A)}, yaitu ${A.length} aktivitas. ${verdict}`)
  return steps
}
