import { MAX_FREQ, MAX_SYMBOLS, parseHuffmanInput } from '../huffmanTree.js'

// Pseudocode HUFFMAN(C) dari materi 10.2 (Cormen). Nomor baris sama dengan nomor langkah di materi.
// EXTRACT-MIN dan INSERT ditampilkan sebagai satu langkah. Isi dalamnya (antrean terurut) terlihat di daftar Q.
export const huffmanPseudoCode = [
  'n = |C|',
  'Q = C',
  'for i = 1 to n - 1',
  '    allocate a new node z',
  '    z.left = x = EXTRACT-MIN(Q)',
  '    z.right = y = EXTRACT-MIN(Q)',
  '    z.freq = x.freq + y.freq',
  '    INSERT(Q, z)',
  'return EXTRACT-MIN(Q)    // return the root of the tree',
].join('\n')

/** Memeriksa isian simbol:frekuensi. Batasnya sama dengan visualizer: 2 sampai 8 simbol, frekuensi 1 sampai 99. */
export function checkHuffmanInput({ C }) {
  const r = parseHuffmanInput(C)
  return r.ok ? null : `Isian C: ${r.error}`
}

const dash = '–'

/**
 * Menjalankan HUFFMAN(C) satu langkah per pembacaan satu baris.
 * Antrean Q selalu terurut naik menurut frekuensi. Jika frekuensi sama, simpul yang lebih dulu dibuat didahulukan
 * (aturan yang sama dengan visualizer). Header perulangan (baris 3) dicatat tiap putaran, termasuk pemeriksaan terakhir.
 * Banyak langkah: 2 + 6(n - 1) + 1 + 1 = 6n - 2.
 *
 * Nama simpul: daun ditulis `simbol:frekuensi` (f:5), simpul gabungan `zk:frekuensi` (z1:14, dibuat pada putaran k).
 *
 * @param {{ C: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function huffmanPseudoTrace({ C }) {
  const parsed = parseHuffmanInput(C)
  const items = parsed.value // validasi sudah dilakukan checkHuffmanInput
  const n = items.length
  let seq = 0
  const name = (nd) => (nd.sym ? `${nd.sym}:${nd.freq}` : `${nd.label}:${nd.freq}`)
  const byFreq = (a, b) => a.freq - b.freq || a.seq - b.seq

  const Q = items.map((x) => ({ sym: x.sym, freq: x.freq, seq: seq++, left: null, right: null }))
  /** simpul gabungan yang sudah dibuat, menurut urutan pembuatan */
  const made = []
  let i
  let x = null
  let y = null
  let z = null
  let newInQ = null
  const steps = []

  // Q baru ada setelah baris 2, jadi di baris 1 daftarnya masih kosong.
  const view = (line) => (line === 1 ? [] : Q)
  const qMarks = (line) => view(line).map((nd) => (nd === newInQ ? 'newNode' : 'normal'))

  function push(line, note, { extra = [], codes = null } = {}) {
    const taken = []
    const takenMarks = []
    if (x && line >= 5 && line <= 7) { taken.push(x.freq); takenMarks.push('childLeft') }
    if (y && line >= 6 && line <= 7) { taken.push(y.freq); takenMarks.push('childRight') }
    const arrays = [{ title: 'Antrean Q (frekuensi, terkecil di kiri)', values: view(line).map((nd) => nd.freq), marks: qMarks(line), indexBase: 1 }]
    if (taken.length) arrays.push({ title: 'Dikeluarkan dari Q (x lalu y)', values: taken, marks: takenMarks, indexBase: 1 })
    const lists = [
      { title: 'Isi Q (nama simpul)', items: view(line).map(name), empty: 'kosong' },
      {
        title: 'Simpul gabungan yang sudah dibuat',
        items: made.filter((m) => !(m === z && line < 7)).map((m) => `${name(m)} = ${name(m.left)} (kiri, 0) + ${name(m.right)} (kanan, 1)`),
        empty: 'belum ada',
      },
      ...extra,
    ]
    if (codes) lists.push({ title: 'Kode Huffman (kiri = 0, kanan = 1)', items: codes, empty: 'belum ada' })
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: line >= 1 ? String(n) : dash },
        { name: 'i', value: i === undefined ? dash : String(i) },
        { name: 'x', value: x && line >= 5 ? name(x) : dash },
        { name: 'y', value: y && line >= 6 ? name(y) : dash },
        { name: 'z.freq', value: z && line >= 7 ? String(z.freq) : dash },
      ],
      arrays,
      lists,
    })
  }

  push(1, `Baris 1: n = |C| = ${n}, banyaknya jenis karakter.`)
  Q.sort(byFreq)
  push(2, `Baris 2: Q = C, tersusun naik menurut frekuensi: ${Q.map(name).join(', ')}.`)

  for (i = 1; ; i++) {
    const masuk = i <= n - 1
    x = null
    y = null
    z = null
    newInQ = null
    push(
      3,
      masuk
        ? `Baris 3: i = ${i}, ${i} ≤ n - 1 = ${n - 1} sehingga baris 4 sampai 8 dijalankan.`
        : `Baris 3: i = ${i} lebih besar dari n - 1 = ${n - 1}, jadi perulangan selesai dan algoritma lanjut ke baris 9. Q hanya berisi satu simpul.`,
    )
    if (!masuk) break

    z = { label: `z${i}`, freq: 0, seq: -1, left: null, right: null }
    made.push(z)
    push(4, `Baris 4: dibuat simpul baru z (disebut z${i}). Anak-anaknya diisi di baris 5 dan 6.`)

    x = Q.shift()
    z.left = x
    push(5, `Baris 5: EXTRACT-MIN(Q) mengeluarkan ${name(x)}, frekuensi terkecil di Q. Simpul ini menjadi anak kiri z${i} dan disimpan di x.`)

    y = Q.shift()
    z.right = y
    push(6, `Baris 6: EXTRACT-MIN(Q) mengeluarkan ${name(y)}, frekuensi terkecil berikutnya. Simpul ini menjadi anak kanan z${i} dan disimpan di y.`)

    z.freq = x.freq + y.freq
    push(7, `Baris 7: z.freq = x.freq + y.freq = ${x.freq} + ${y.freq} = ${z.freq}.`)

    z.seq = seq++
    Q.push(z)
    Q.sort(byFreq)
    newInQ = z
    const pos = Q.indexOf(z) + 1
    push(8, `Baris 8: INSERT(Q, z) memasukkan ${name(z)} ke Q pada urutan yang sesuai, yaitu urutan ke-${pos}. Q sekarang berisi ${Q.length} simpul.`)
    x = null
    y = null
  }

  const root = Q.shift()
  newInQ = null
  const codes = {}
  const walk = (nd, bits) => {
    if (nd.sym) codes[nd.sym] = bits || '0'
    else {
      walk(nd.left, `${bits}0`)
      walk(nd.right, `${bits}1`)
    }
  }
  walk(root, '')
  const cost = items.reduce((s, it) => s + it.freq * codes[it.sym].length, 0)
  push(
    9,
    `Baris 9: EXTRACT-MIN(Q) mengeluarkan satu-satunya simpul di Q, yaitu akar ${name(root)}, lalu mengembalikannya. Biaya kode = jumlah (frekuensi × panjang kode) = ${cost}, sama dengan jumlah semua z.freq.`,
    { codes: items.map((it) => `${it.sym} = ${codes[it.sym]}`) },
  )
  return steps
}

export const HUFFMAN_PSEUDO_LIMITS = { maxSymbols: MAX_SYMBOLS, maxFreq: MAX_FREQ }
