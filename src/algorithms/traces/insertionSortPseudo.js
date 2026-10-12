// Pseudocode INSERTION_SORT(A) dari materi 2. Nomor baris sengaja sama dengan nomor langkah di materi (1 sampai 7),
// dan array A berindeks mulai dari 1. Perhatikan penamaannya: di materi, j adalah indeks luar dan i indeks dalam
// (kebalikan dari kode JavaScript di diagram batang).
export const insertionSortPseudoCode = [
  'for j = 2 to length[A]',
  '  key = A[j]',
  '  i = j - 1',
  '  while i > 0 and A[i] > key',
  '    A[i + 1] = A[i]',
  '    i = i - 1',
  '  A[i + 1] = key',
].join('\n')

/** Cost dan rumus jumlah operasi tiap baris, persis tabel "Analisis Running Time" di materi. */
export const insertionSortCost = {
  formulaLabel: 'Jumlah operasi',
  note: 'Semua Σ dihitung untuk j = 2 sampai n. tⱼ adalah berapa kali langkah 4 dibaca pada iterasi ke-j.',
  rows: [
    { line: 1, cost: 'c₁', formula: 'n' },
    { line: 2, cost: 'c₂', formula: 'n − 1' },
    { line: 3, cost: 'c₃', formula: 'n − 1' },
    { line: 4, cost: 'c₄', formula: 'Σ tⱼ' },
    { line: 5, cost: 'c₅', formula: 'Σ (tⱼ − 1)' },
    { line: 6, cost: 'c₆', formula: 'Σ (tⱼ − 1)' },
    { line: 7, cost: 'c₇', formula: 'n − 1' },
  ],
}

const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
const sub = (k) => String(k).split('').map((d) => SUB[Number(d)]).join('')

/**
 * Menjalankan INSERTION_SORT(A) persis seperti pseudocode materi, satu langkah per pembacaan satu baris,
 * sambil menghitung berapa kali tiap baris terbaca (kolom "Jumlah operasi" di materi).
 *
 * Aturan hitung sama dengan materi: baris 1 dan baris 4 dihitung setiap kali kondisinya diperiksa, termasuk
 * pemeriksaan terakhir yang gagal (j = n + 1 untuk baris 1, dan kondisi while yang FALSE untuk baris 4).
 *
 * @param {{ A: number[] }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function insertionSortPseudoTrace({ A: input }) {
  const A = [...input]
  const n = A.length
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
  const tList = [] // tⱼ yang sudah selesai, untuk j = 2, 3, ...
  const steps = []

  let j
  let key
  let i
  let tNow // tⱼ pada iterasi sekarang (jumlah pembacaan baris 4)

  const marksFor = (line) => {
    // Sel di luar bagian yang sedang diproses tetap "belum diproses".
    const m = A.map(() => 'normal')
    if (j === undefined) return m
    if (line === 1) {
      // Sebelum loop ke-j dimulai, A[1..j-1] sudah terurut; saat j = n + 1 seluruh array terurut.
      const sorted = j > n ? n : j - 1
      for (let c = 1; c <= sorted; c++) m[c - 1] = 'sorted'
      return m
    }
    if (line === 2 || line === 3) {
      for (let c = 1; c < j; c++) m[c - 1] = 'sorted'
      m[j - 1] = 'key'
      return m
    }
    // Baris 4 sampai 7: sel 1..i sudah terurut, sel i+1 adalah celah, sel i+2..j baru digeser.
    for (let c = 1; c <= i; c++) m[c - 1] = 'sorted'
    for (let c = i + 2; c <= j; c++) m[c - 1] = 'shift'
    if (line === 4) {
      m[i] = 'gap' // sel i+1 (indeks 0-based: i)
      if (i >= 1) m[i - 1] = 'compare'
    } else if (line === 5) {
      // A[i+1] sudah berisi salinan A[i]; sel i kini bebas (celah) dan sel i+1 baru digeser.
      m[i] = 'shift'
      m[i - 1] = 'gap'
    } else if (line === 6) {
      m[i] = 'gap'
    } else if (line === 7) {
      m[i] = 'placed'
    }
    return m
  }

  const push = (line, note) => {
    counts[line] += 1
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'j', value: j === undefined ? '–' : String(j) },
        { name: 'key', value: key === undefined ? '–' : String(key) },
        { name: 'i', value: i === undefined ? '–' : String(i) },
        { name: 'tⱼ (iterasi ini)', value: tNow === undefined ? '–' : String(tNow) },
        { name: 'tⱼ yang sudah selesai', value: tList.length ? tList.join(', ') : '–' },
      ],
      array: { title: 'Array A (indeks mulai dari 1)', values: [...A], marks: marksFor(line), indexBase: 1 },
      counts: { ...counts },
    })
  }

  for (j = 2; ; j++) {
    const masuk = j <= n
    push(
      1,
      masuk
        ? `Baris 1: j = ${j}, ${j} ≤ ${n} sehingga langkah 2 sampai 7 dijalankan (loop ke-${j - 1}).`
        : `Baris 1: j = ${j} lebih besar dari n = ${n}, jadi end for dan algoritma selesai.`,
    )
    if (!masuk) break

    tNow = undefined
    key = A[j - 1]
    push(2, `Baris 2: key = A[${j}] = ${key}.`)

    i = j - 1
    push(3, `Baris 3: i = j − 1 = ${j} − 1 = ${i}.`)

    tNow = 0
    for (;;) {
      tNow += 1
      const ok = i > 0 && A[i - 1] > key
      push(
        4,
        i === 0
          ? `Baris 4: i > 0 → ${i} > 0 bernilai FALSE (A[i] tidak diperiksa lagi), jadi end while. Baris 4 sudah terbaca ${tNow} kali pada loop ini (tⱼ = ${tNow}).`
          : `Baris 4: i > 0 and A[i] > key → ${i} > 0 and A[${i}] = ${A[i - 1]} > ${key} bernilai ${ok ? 'TRUE, lanjut ke baris 5' : `FALSE, jadi end while. Baris 4 sudah terbaca ${tNow} kali pada loop ini (tⱼ = ${tNow})`}.`,
      )
      if (!ok) break

      A[i] = A[i - 1]
      push(5, `Baris 5: A[${i + 1}] = A[${i}] = ${A[i]}, jadi ${A[i]} digeser satu tempat ke kanan.`)
      i -= 1
      push(6, `Baris 6: i = i − 1, jadi i = ${i}.`)
    }

    A[i] = key
    push(7, `Baris 7: A[${i + 1}] = key = ${key}. Selesai loop ke-${j - 1}.`)
    tList.push(tNow)
  }

  // Ringkasan pada langkah terakhir: hitungan tiap baris dan bentuk T(n) untuk masukan ini.
  const last = steps[steps.length - 1]
  last.note += ' ' + summarize(n, counts, tList)
  return steps
}

/** Kalimat ringkasan: nilai T(n) untuk masukan ini dan jenis kasusnya. */
function summarize(n, counts, tList) {
  const terms = [1, 2, 3, 4, 5, 6, 7].map((k) => `c${sub(k)}·${counts[k]}`).join(' + ')
  const sumT = tList.reduce((a, b) => a + b, 0)
  let kasus
  if (n < 2) kasus = 'Dengan satu bilangan tidak ada loop yang dijalankan.'
  else if (tList.every((t) => t === 1)) kasus = 'Semua tⱼ = 1, jadi ini kasus terbaik (best case).'
  else if (tList.every((t, idx) => t === idx + 2)) kasus = 'Semua tⱼ = j, jadi ini kasus terburuk (worst case).'
  else kasus = 'Nilai tⱼ ada di antara 1 dan j, jadi ini kasus di antara terbaik dan terburuk.'
  return `Σ tⱼ = ${sumT}. T(n) = ${terms}. ${kasus}`
}
