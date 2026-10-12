// Pseudocode MERGE_SORT(A, p, r) dari materi 6 (Cormen), array A berindeks mulai dari 1.
// MERGE(A, p, q, r) ditampilkan sebagai SATU langkah (baris 5): isi dalamnya ada di gambar pseudocode MERGE di materi.
export const mergeSortPseudoCode = [
  'if p < r',
  '    then q = ⌊(p + r)/2⌋',
  '    MERGE_SORT(A, p, q)',
  '    MERGE_SORT(A, q+1, r)',
  '    MERGE(A, p, q, r)',
].join('\n')

const dash = '–'

/**
 * Menjalankan MERGE_SORT(A, 1, n) satu langkah per pembacaan satu baris.
 * Tiap pemanggilan punya p, q, r sendiri; yang tampil di tabel variabel adalah milik pemanggilan yang sedang berjalan,
 * dan tumpukan panggilan menunjukkan siapa yang menunggu. Banyak langkah: 6n - 5 (daun 1 langkah, simpul dalam 5 langkah).
 *
 * Status sel: bagian yang belum selesai 'range' (atau 'left' dan 'right' saat dibagi), satu bilangan yang sudah pasti
 * terurut 'sorted', dan bagian hasil MERGE 'merged'.
 *
 * @param {{ A: number[] }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function mergeSortPseudoTrace({ A: input }) {
  const A = [...input]
  const n = A.length
  const done = Array(n).fill('normal') // 'normal' | 'sorted' | 'merged', indeks 0-based
  const steps = []
  const stack = []
  let calls = 0

  const show = (a, b) => A.slice(a - 1, b).join(' ')

  function marks(p, r, q) {
    return done.map((d, idx) => {
      if (d !== 'normal') return d
      const i = idx + 1
      if (i < p || i > r) return 'normal'
      if (q === undefined) return 'range'
      return i <= q ? 'left' : 'right'
    })
  }

  function push(line, note, p, r, q) {
    steps.push({
      line,
      note,
      vars: [
        { name: 'p', value: String(p) },
        { name: 'q', value: q === undefined ? dash : String(q) },
        { name: 'r', value: String(r) },
      ],
      array: { title: 'Array A (indeks mulai dari 1)', values: [...A], marks: marks(p, r, q), indexBase: 1 },
      stack: [...stack],
    })
  }

  function mergeSort(p, r) {
    calls++
    const where = `panggilan ke-${calls}, kedalaman ${stack.length + 1}`
    stack.push(`MERGE_SORT(A, ${p}, ${r})`)

    const lanjut = p < r
    push(
      1,
      lanjut
        ? `Baris 1 (${where}): p < r → ${p} < ${r} bernilai TRUE, bagian ini berisi ${r - p + 1} bilangan sehingga masih dibagi.`
        : `Baris 1 (${where}): p < r → ${p} < ${r} bernilai FALSE. Bagian ini hanya berisi satu bilangan (${A[p - 1]}), sudah terurut, dan fungsi langsung selesai (kasus dasar).`,
      p,
      r,
    )
    if (!lanjut) {
      done[p - 1] = 'sorted'
      // Tandai hasilnya pada langkah yang sama: sel ini sudah pasti terurut.
      steps[steps.length - 1].array.marks = marks(p, r)
      stack.pop()
      return
    }

    const q = Math.floor((p + r) / 2)
    push(
      2,
      `Baris 2 (${where}): q = ⌊(${p} + ${r})/2⌋ = ⌊${p + r}/2⌋ = ${q}. Bagian kiri adalah indeks ${p} sampai ${q}, bagian kanan indeks ${q + 1} sampai ${r}.`,
      p,
      r,
      q,
    )

    push(3, `Baris 3 (${where}): MERGE_SORT(A, ${p}, ${q}). Fungsi memanggil dirinya sendiri untuk mengurutkan bagian kiri.`, p, r, q)
    mergeSort(p, q)

    push(
      4,
      `Baris 4 (${where}): MERGE_SORT(A, ${q + 1}, ${r}). Bagian kiri sudah selesai (${show(p, q)}). Sekarang fungsi memanggil dirinya sendiri untuk bagian kanan.`,
      p,
      r,
      q,
    )
    mergeSort(q + 1, r)

    const kiri = show(p, q)
    const kanan = show(q + 1, r)
    // Gagasan MERGE: ambil yang lebih kecil dari ujung depan kedua bagian (bagian yang habis lebih dulu diabaikan).
    const L = A.slice(p - 1, q)
    const R = A.slice(q, r)
    const hasil = []
    let i = 0
    let j = 0
    while (i < L.length || j < R.length) {
      if (j >= R.length || (i < L.length && L[i] <= R[j])) hasil.push(L[i++])
      else hasil.push(R[j++])
    }
    for (let i = p; i <= r; i++) A[i - 1] = hasil[i - p]
    for (let i = p; i <= r; i++) done[i - 1] = 'merged'
    push(
      5,
      `Baris 5 (${where}): MERGE(A, ${p}, ${q}, ${r}) menggabungkan ${kiri} dengan ${kanan} menjadi ${hasil.join(' ')}. Seluruh A = ${A.join(' ')}.`,
      p,
      r,
      q,
    )
    stack.pop()
  }

  mergeSort(1, n)
  const last = steps[steps.length - 1]
  last.note += n === 1 ? ' Hanya satu bilangan, jadi array sudah terurut.' : ' Pemanggilan pertama selesai, jadi seluruh array A sudah terurut dari kecil ke besar.'
  return steps
}
