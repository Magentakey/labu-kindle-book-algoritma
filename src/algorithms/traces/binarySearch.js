// Pseudocode BINARY-SEARCH(A, x, p, n) dari materi 1, versi iteratif dan rekursif. Array A berindeks mulai dari 1,
// dan n adalah indeks TERAKHIR (bukan jumlah elemen), persis seperti di materi.
export const binarySearchIterCode = [
  'while p ≤ n',
  '  mid = ⌊(p + n) / 2⌋',
  '  if (x == A[mid])',
  '    return mid',
  '  else if x > A[mid]',
  '    p = mid + 1',
  '  else n = mid - 1',
  'return NIL',
].join('\n')

export const binarySearchRecCode = [
  'if p > n',
  '  return NIL',
  'mid = ⌊(p + n) / 2⌋',
  'if (x == A[mid])',
  '  return mid',
  'else if x > A[mid]',
  '  return BINARY-SEARCH(A, x, mid + 1, n)',
  'else return BINARY-SEARCH(A, x, p, mid - 1)',
].join('\n')

/** @returns {string|null} pesan kesalahan bila array belum terurut naik. */
export function checkSorted(A) {
  for (let k = 1; k < A.length; k++) {
    if (A[k - 1] > A[k]) return 'Array A harus terurut dari kecil ke besar (binary search hanya bekerja pada array terurut).'
  }
  return null
}

const fmt = (v) => (v === undefined ? '–' : String(v))

// Memakai status yang sama dengan visualizer binary search (BarChart/statuses.js):
// range = masih dalam rentang, compare = elemen tengah yang dibandingkan, discarded = sudah dibuang, found = ditemukan.
function marksFor(A, p, n, mid, kind) {
  return A.map((_, idx) => {
    const i = idx + 1
    if (mid !== undefined && i === mid && kind === 'found') return 'found'
    if (mid !== undefined && i === mid && kind === 'current') return 'compare'
    return i < p || i > n ? 'discarded' : 'range'
  })
}

function makePush(A, x, steps) {
  return (line, note, { p, n, mid, kind = null, stack } = {}) =>
    steps.push({
      line,
      note,
      vars: [
        { name: 'x', value: String(x) },
        { name: 'p', value: fmt(p) },
        { name: 'n', value: fmt(n) },
        { name: 'mid', value: fmt(mid) },
      ],
      array: { title: 'Array A (indeks mulai dari 1)', values: [...A], marks: marksFor(A, p, n, mid, kind), indexBase: 1 },
      ...(stack ? { stack: [...stack] } : {}),
    })
}

/**
 * @param {{ A: number[], x: number }} input  A sudah terurut naik
 * @returns {import('../traces.js').TraceStep[]}
 */
export function binarySearchIterTrace({ A, x }) {
  const steps = []
  const push = makePush(A, x, steps)
  let p = 1
  let n = A.length
  let mid

  for (;;) {
    const masuk = p <= n
    push(
      1,
      `Baris 1: p ≤ n → ${p} ≤ ${n} bernilai ${masuk ? 'TRUE, masuk perulangan' : 'FALSE, perulangan berhenti dan lanjut ke baris 8'}.`,
      { p, n, mid: undefined },
    )
    if (!masuk) break

    mid = Math.floor((p + n) / 2)
    push(2, `Baris 2: mid = ⌊(p + n) / 2⌋ = ⌊(${p} + ${n}) / 2⌋ = ${mid}.`, { p, n, mid, kind: 'current' })

    const sama = x === A[mid - 1]
    push(3, `Baris 3: x == A[mid] → ${x} == A[${mid}] = ${A[mid - 1]} bernilai ${sama ? 'TRUE' : 'FALSE'}.`, { p, n, mid, kind: 'current' })
    if (sama) {
      push(4, `Baris 4: return mid. Bilangan ${x} ditemukan di indeks ${mid}.`, { p, n, mid, kind: 'found' })
      return steps
    }

    const lebih = x > A[mid - 1]
    push(
      5,
      `Baris 5: x > A[mid] → ${x} > ${A[mid - 1]} bernilai ${lebih ? 'TRUE, lanjut ke baris 6' : 'FALSE, lanjut ke baris 7'}.`,
      { p, n, mid, kind: 'current' },
    )
    if (lebih) {
      p = mid + 1
      push(6, `Baris 6: p = mid + 1 = ${p}. Indeks 1 sampai ${mid} dibuang dari pencarian.`, { p, n, mid })
    } else {
      n = mid - 1
      push(7, `Baris 7: n = mid - 1 = ${n}. Indeks ${mid} sampai ${A.length} dibuang dari pencarian.`, { p, n, mid })
    }
  }

  push(8, `Baris 8: return NIL. Bilangan ${x} tidak ditemukan di dalam array A.`, { p, n, mid: undefined })
  return steps
}

/**
 * @param {{ A: number[], x: number }} input  A sudah terurut naik
 * @returns {import('../traces.js').TraceStep[]}
 */
export function binarySearchRecTrace({ A, x }) {
  const steps = []
  const push = makePush(A, x, steps)
  const stack = []
  let calls = 0

  function search(p, n) {
    calls++
    const nomor = calls
    const depth = stack.length + 1
    stack.push(`BINARY-SEARCH(A, ${x}, ${p}, ${n})`)
    const where = `panggilan ke-${nomor}, kedalaman ${depth}`

    const habis = p > n
    push(
      1,
      `Baris 1 (${where}): p > n → ${p} > ${n} bernilai ${habis ? 'TRUE' : 'FALSE, lanjut ke baris 3'}.`,
      { p, n, stack },
    )
    if (habis) {
      push(2, `Baris 2 (${where}): return NIL. Rentang kosong, bilangan ${x} tidak ditemukan.`, { p, n, stack })
      stack.pop()
      return null
    }

    const mid = Math.floor((p + n) / 2)
    push(3, `Baris 3 (${where}): mid = ⌊(${p} + ${n}) / 2⌋ = ${mid}.`, { p, n, mid, kind: 'current', stack })

    const sama = x === A[mid - 1]
    push(4, `Baris 4 (${where}): x == A[mid] → ${x} == A[${mid}] = ${A[mid - 1]} bernilai ${sama ? 'TRUE' : 'FALSE'}.`, { p, n, mid, kind: 'current', stack })
    if (sama) {
      push(5, `Baris 5 (${where}): return mid. Bilangan ${x} ditemukan di indeks ${mid}.`, { p, n, mid, kind: 'found', stack })
      stack.pop()
      return mid
    }

    const lebih = x > A[mid - 1]
    push(
      6,
      `Baris 6 (${where}): x > A[mid] → ${x} > ${A[mid - 1]} bernilai ${lebih ? 'TRUE, lanjut ke baris 7' : 'FALSE, lanjut ke baris 8'}.`,
      { p, n, mid, kind: 'current', stack },
    )
    let hasil
    if (lebih) {
      push(7, `Baris 7 (${where}): return BINARY-SEARCH(A, x, mid + 1, n). Fungsi memanggil dirinya sendiri untuk bagian kanan, p = ${mid + 1}.`, { p, n, mid, stack })
      hasil = search(mid + 1, n)
    } else {
      push(8, `Baris 8 (${where}): return BINARY-SEARCH(A, x, p, mid - 1). Fungsi memanggil dirinya sendiri untuk bagian kiri, n = ${mid - 1}.`, { p, n, mid, stack })
      hasil = search(p, mid - 1)
    }
    stack.pop()
    return hasil
  }

  const hasil = search(1, A.length)
  const last = steps[steps.length - 1]
  last.note += ` Nilai ${hasil === null ? 'NIL' : hasil} diteruskan kepada semua pemanggil, jadi hasil akhirnya ${hasil === null ? 'NIL' : hasil}.`
  return steps
}
