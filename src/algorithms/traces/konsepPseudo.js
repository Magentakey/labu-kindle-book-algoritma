// Empat peraga langkah untuk konsep yang dulu berupa "penjelajah": pohon recurrence (Modul 09), pemotongan batang bottom-up (Modul 10),
// penukaran uang dengan Greedy (Modul 13), dan penyusunan adjacency-list serta adjacency-matrix (Modul 16).
// Semuanya memakai peraga Tabel (TableStage). Nomor baris = nomor baris di panel Kode; tiap catatan diawali "Baris N".
// Tiap peraga menjalankan pseudocode apa adanya, satu langkah per pembacaan baris (perulangan for dicatat sekali tiap putaran
// ditambah sekali saat syaratnya tidak terpenuhi lagi, seperti LCS-LENGTH).

const dash = '–'
const idn = (x) => Number(x).toLocaleString('id-ID')
const sup = (n) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])

// ================================================================= RECURRENCE-TREE (Modul 09)
export const recurrenceTreeCode = [
  'n = b^L',
  'total = 0',
  'for i = 0 to L',
  '    simpul = a^i',
  '    ukuran = n / b^i',
  '    biayaSimpul = ukuran^k',
  '    biayaLevel = simpul * biayaSimpul',
  '    total = total + biayaLevel',
  'return total',
].join('\n')

export const RECURRENCE_LIMITS = { a: [1, 8], b: [2, 8], k: [0, 3], L: [1, 6] }

export function checkRecurrenceInput({ a, b, k, L }) {
  for (const [nama, v] of [['a', a], ['b', b], ['k', k], ['L', L]]) {
    const [lo, hi] = RECURRENCE_LIMITS[nama]
    if (v < lo || v > hi) return `${nama} harus di antara ${lo} dan ${hi} (Anda mengisi ${v}).`
  }
  return null
}

/** Jenis hasil menurut Teorema Master untuk T(n) = aT(n/b) + n^k: bandingkan a dengan b^k. */
export function recurrenceKind(a, b, k) {
  const bk = b ** k
  return a > bk ? 'daun' : a === bk ? 'rata' : 'akar'
}

/**
 * T(n) = a·T(n/b) + n^k dengan T(1) = 1 dan n = b^L, dijumlahkan level demi level.
 * @param {{ a: number, b: number, k: number, L: number }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function recurrenceTreeTrace({ a, b, k, L }) {
  let n
  let total
  let i
  let simpul
  let ukuran
  let biayaSimpul
  let biayaLevel
  const rows = [] // { simpul, ukuran, biayaSimpul, biayaLevel } per level yang sudah selesai
  const steps = []
  const fText = k === 0 ? '1' : k === 1 ? 'n' : `n${sup(k)}`
  const rec = `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${fText}`

  function push(line, note, cur = {}) {
    const cells = []
    for (let r = 0; r <= L; r++) {
      const d = rows[r]
      const isCur = cur.row === r
      const mark = isCur ? 'current' : d ? 'filled' : 'empty'
      const part = (key) => ({ text: isCur ? (cur[key] !== undefined ? idn(cur[key]) : '') : d ? idn(d[key]) : '', mark })
      cells.push([part('simpul'), part('ukuran'), part('biayaSimpul'), part('biayaLevel')])
    }
    steps.push({
      line,
      note,
      vars: [
        { name: 'a', value: String(a) },
        { name: 'b', value: String(b) },
        { name: 'k', value: String(k) },
        { name: 'L', value: String(L) },
        { name: 'n', value: n === undefined ? dash : idn(n) },
        { name: 'i', value: i === undefined ? dash : String(i) },
        { name: 'simpul', value: simpul === undefined ? dash : idn(simpul) },
        { name: 'ukuran', value: ukuran === undefined ? dash : idn(ukuran) },
        { name: 'biayaSimpul', value: biayaSimpul === undefined ? dash : idn(biayaSimpul) },
        { name: 'biayaLevel', value: biayaLevel === undefined ? dash : idn(biayaLevel) },
        { name: 'total', value: total === undefined ? dash : idn(total) },
      ],
      tables: [
        {
          table: {
            caption: `Pohon rekursi ${rec}, T(1) = 1. Satu baris tabel = satu level pohon`,
            corner: 'Level',
            rowHeaders: Array.from({ length: L + 1 }, (_, r) => (r === L ? `i = ${r} (daun)` : `i = ${r}`)),
            colHeaders: ['Jumlah simpul (aⁱ)', 'Ukuran masalah (n/bⁱ)', 'Biaya per simpul', 'Biaya level'],
            cells,
          },
          labels: { current: 'level yang sedang dihitung' },
          legend: ['empty', 'filled', 'current'],
        },
      ],
    })
  }

  n = b ** L
  push(1, `Baris 1: n = b^L = ${b}^${L} = ${idn(n)}. Pohon rekursi untuk ${rec} punya ${L + 1} level (i = 0 sampai ${L}).`)
  total = 0
  push(2, 'Baris 2: total = 0. Biaya semua level akan ditambahkan ke sini.')
  for (i = 0; ; i++) {
    simpul = undefined
    ukuran = undefined
    biayaSimpul = undefined
    biayaLevel = undefined
    const masuk = i <= L
    push(3, masuk ? `Baris 3: i = ${i}, ${i} ≤ ${L} sehingga level ${i} dihitung.` : `Baris 3: i = ${i} lebih besar dari L = ${L}, jadi semua level sudah dijumlahkan dan algoritma lanjut ke baris 9.`, masuk ? { row: i } : {})
    if (!masuk) break
    simpul = a ** i
    push(4, `Baris 4: simpul = a^i = ${a}^${i} = ${idn(simpul)}. Level ${i} punya ${idn(simpul)} simpul${i === 0 ? ' (hanya akar)' : ''}.`, { row: i, simpul })
    ukuran = n / b ** i
    push(5, `Baris 5: ukuran = n / b^i = ${idn(n)} / ${b}^${i} = ${idn(ukuran)}. Setiap simpul di level ini menangani masalah berukuran ${idn(ukuran)}.`, { row: i, simpul, ukuran })
    biayaSimpul = ukuran ** k
    push(6, `Baris 6: biayaSimpul = ukuran^k = ${idn(ukuran)}^${k} = ${idn(biayaSimpul)}${i === L ? '. Ini daun: biayanya T(1) = 1.' : '.'}`, { row: i, simpul, ukuran, biayaSimpul })
    biayaLevel = simpul * biayaSimpul
    push(7, `Baris 7: biayaLevel = simpul × biayaSimpul = ${idn(simpul)} × ${idn(biayaSimpul)} = ${idn(biayaLevel)}.`, { row: i, simpul, ukuran, biayaSimpul, biayaLevel })
    const sebelum = total
    total += biayaLevel
    rows[i] = { simpul, ukuran, biayaSimpul, biayaLevel }
    push(8, `Baris 8: total = ${idn(sebelum)} + ${idn(biayaLevel)} = ${idn(total)}.`, { row: i, simpul, ukuran, biayaSimpul, biayaLevel })
  }
  i = undefined
  const jenis = recurrenceKind(a, b, k)
  const pola =
    jenis === 'daun'
      ? `a = ${a} lebih besar dari b^k = ${b ** k}, jadi biaya level membesar ke arah daun dan daun mendominasi: T(n) = Θ(n^(log_${b} ${a})) (kasus 1 Teorema Master).`
      : jenis === 'rata'
        ? `a = ${a} sama dengan b^k = ${b ** k}, jadi setiap level berbiaya sama (${idn(rows[0].biayaLevel)}) dan total = biaya level × (log_${b} n + 1): T(n) = Θ(n^k lg n) (kasus 2).`
        : `a = ${a} lebih kecil dari b^k = ${b ** k}, jadi biaya level mengecil ke arah daun dan akar mendominasi: T(n) = Θ(f(n)) = Θ(${fText}) (kasus 3).`
  push(9, `Baris 9: return total = ${idn(total)} = T(${idn(n)}). ${pola}`)
  return steps
}

export const recurrencePresets = [
  { label: 'Merge Sort: T(n) = 2T(n/2) + n', values: { a: '2', b: '2', k: '1', L: '4' } },
  { label: 'Daun dominan: T(n) = 4T(n/2) + n', values: { a: '4', b: '2', k: '1', L: '4' } },
  { label: 'Akar dominan: T(n) = 2T(n/2) + n²', values: { a: '2', b: '2', k: '2', L: '4' } },
  { label: 'Binary Search: T(n) = T(n/2) + 1', values: { a: '1', b: '2', k: '0', L: '5' } },
]

// ================================================================= BOTTOM-UP-CUT-ROD (Modul 10)
export const cutRodCode = [
  'let r[0..n] be a new array',
  'r[0] = 0',
  'for j = 1 to n',
  '    q = -∞',
  '    for i = 1 to j',
  '        q = max(q, p[i] + r[j-i])',
  '    r[j] = q',
  'return r[n]',
].join('\n')

export const CUT_ROD_LIMITS = { maxLength: 10, minValue: 0, maxValue: 99 }

/**
 * Mengisi r[0..n] dari bawah ke atas (n = banyaknya harga pada p). Tabel memuat satu baris r dan juga s (potongan pertama terbaik) di catatan akhir.
 * @param {{ p: number[] }} input  p[1..n] = harga batang sepanjang 1..n
 * @returns {import('../traces.js').TraceStep[]}
 */
export function cutRodTrace({ p: harga }) {
  const n = harga.length
  const p = [null, ...harga]
  let created = false
  let j
  let i
  let q
  const r = []
  const s = []
  const steps = []

  function push(line, note, { cur, src, pi } = {}) {
    const cells = [[]]
    for (let k = 0; k <= n; k++) {
      const has = created && r[k] !== undefined
      let mark = has ? 'filled' : 'empty'
      if (created && cur === k) mark = 'current'
      if (created && src === k) mark = 'source'
      cells[0].push({ text: has ? String(r[k]) : '', mark })
    }
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'j', value: j === undefined ? dash : String(j) },
        { name: 'i', value: i === undefined ? dash : String(i) },
        { name: 'q', value: q === undefined ? dash : q === -Infinity ? '−∞' : String(q) },
        { name: 'p[i]', value: i !== undefined && i >= 1 && i <= n ? String(p[i]) : dash },
        { name: 'r[j-i]', value: i !== undefined && j !== undefined && i <= j && r[j - i] !== undefined ? String(r[j - i]) : dash },
      ],
      array: { title: 'Harga p[i] (batang sepanjang i)', values: harga, marks: harga.map((_, k) => (pi === k + 1 ? 'factor' : 'normal')), indexBase: 1 },
      tables: created
        ? [
            {
              table: { caption: 'Tabel r[j] = nilai terbaik untuk batang sepanjang j', corner: '', rowHeaders: ['r[j]'], colHeaders: Array.from({ length: n + 1 }, (_, k) => `j = ${k}`), cells },
              labels: { current: 'r[j] yang sedang dicari', source: 'sel r[j-i] yang dijumlahkan' },
              legend: ['empty', 'filled', 'current', 'source'],
            },
          ]
        : undefined,
    })
  }

  created = true
  push(1, `Baris 1: dibuat array r[0..${n}]. Semua sel belum berisi. Harga p[1..${n}] = ${harga.join(', ')}.`)
  r[0] = 0
  push(2, 'Baris 2: r[0] = 0. Batang sepanjang 0 tidak menghasilkan uang.', { cur: 0 })
  for (j = 1; ; j++) {
    i = undefined
    q = undefined
    const masuk = j <= n
    push(3, masuk ? `Baris 3: j = ${j}, ${j} ≤ ${n} sehingga r[${j}] dicari.` : `Baris 3: j = ${j} lebih besar dari n = ${n}, jadi semua r sudah terisi dan algoritma lanjut ke baris 8.`, masuk ? { cur: j } : {})
    if (!masuk) break
    q = -Infinity
    push(4, `Baris 4: q = −∞. Belum ada kandidat untuk r[${j}].`, { cur: j })
    let pilih = 0
    for (i = 1; ; i++) {
      const masukI = i <= j
      push(5, masukI ? `Baris 5: i = ${i}, ${i} ≤ ${j}. Coba potongan pertama sepanjang ${i}.` : `Baris 5: i = ${i} lebih besar dari j = ${j}, jadi semua potongan pertama sudah dicoba dan algoritma lanjut ke baris 7.`, masukI ? { cur: j, pi: i } : { cur: j })
      if (!masukI) break
      const kandidat = p[i] + r[j - i]
      const lama = q
      if (kandidat > q) {
        q = kandidat
        pilih = i
      }
      push(
        6,
        `Baris 6: q = max(${lama === -Infinity ? '−∞' : lama}, p[${i}] + r[${j - i}]) = max(${lama === -Infinity ? '−∞' : lama}, ${p[i]} + ${r[j - i]}) = ${q}.${kandidat > lama ? '' : ' Kandidat ini tidak lebih baik, q tetap.'}`,
        { cur: j, src: j - i, pi: i },
      )
    }
    i = undefined
    r[j] = q
    s[j] = pilih
    push(7, `Baris 7: r[${j}] = q = ${q}. Potongan pertama terbaik untuk batang sepanjang ${j} adalah ${pilih}.`, { cur: j })
  }
  j = undefined
  const potongan = []
  for (let k = n; k > 0; k -= s[k]) potongan.push(s[k])
  push(8, `Baris 8: return r[${n}] = ${r[n]}. Susunan potongan optimal (dari tabel s): ${potongan.join(' + ')}.`, { cur: n })
  return steps
}

export const cutRodPresets = [
  { label: 'Harga dari modul (n = 8)', values: { p: '1, 5, 8, 9, 10, 17, 17, 20' } },
  { label: 'Harga sebanding panjang', values: { p: '1, 2, 3, 4, 5, 6, 7, 8' } },
  { label: 'Pendek lebih mahal per satuan', values: { p: '3, 5, 6, 7, 8, 9, 10, 11' } },
]

// ================================================================= GREEDY-COIN-CHANGE (Modul 13)
export const greedyCoinCode = [
  'sisa = x',
  'jumlah = 0',
  'for k = 1 to d.length',
  '    while sisa >= d[k]',
  '        sisa = sisa - d[k]',
  '        jumlah = jumlah + 1',
  'return jumlah',
].join('\n')

export const COIN_LIMITS = { maxLength: 8, minValue: 1, maxValue: 99 }

/** d harus terurut menurun tegas dan berakhir pada 1 (supaya setiap jumlah bisa dibayar); x antara 1 dan 99. */
export function checkCoinInput({ d, x }) {
  for (let k = 1; k < d.length; k++) if (d[k] >= d[k - 1]) return 'Pecahan d harus terurut dari besar ke kecil tanpa angka kembar, mis. 25, 10, 5, 1. Algoritma ini membaca d apa adanya, tidak mengurutkannya.'
  if (d[d.length - 1] !== 1) return 'Pecahan terkecil harus 1 agar setiap jumlah bisa dibayar.'
  if (d.length < 2) return 'Isi minimal dua pecahan, termasuk 1.'
  if (x < 1 || x > 99) return `Uang x harus di antara 1 dan 99 (Anda mengisi ${x}).`
  return null
}

/** Jumlah koin minimum (Dynamic Programming), hanya untuk dibandingkan di catatan akhir. */
function minimumKoin(d, x) {
  const t = [0]
  for (let v = 1; v <= x; v++) t[v] = Math.min(...d.filter((c) => c <= v).map((c) => t[v - c] + 1))
  return t[x]
}

/**
 * Menukar x dengan koin menurut pecahan d (terurut menurun): ambil koin terbesar yang masih muat, ulangi.
 * @param {{ d: number[], x: number }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function greedyCoinTrace({ d, x }) {
  let sisa
  let jumlah
  let k
  const pakai = Array(d.length).fill(undefined) // banyak koin per pecahan; undefined = belum dikerjakan
  const sisaBaris = Array(d.length).fill(undefined)
  const diambil = []
  const steps = []

  function push(line, note) {
    const cells = d.map((_, r) => {
      const aktif = k !== undefined && k === r + 1
      const mark = aktif ? 'current' : pakai[r] !== undefined ? 'filled' : 'empty'
      return [
        { text: aktif ? String(pakai[r] ?? 0) : pakai[r] !== undefined ? String(pakai[r]) : '', mark },
        { text: aktif ? String(sisa) : sisaBaris[r] !== undefined ? String(sisaBaris[r]) : '', mark },
      ]
    })
    steps.push({
      line,
      note,
      vars: [
        { name: 'x', value: String(x) },
        { name: 'sisa', value: sisa === undefined ? dash : String(sisa) },
        { name: 'jumlah', value: jumlah === undefined ? dash : String(jumlah) },
        { name: 'k', value: k === undefined ? dash : String(k) },
        { name: 'd[k]', value: k !== undefined && k >= 1 && k <= d.length ? String(d[k - 1]) : dash },
      ],
      array: { title: 'Pecahan d[k] (urut besar ke kecil)', values: d, marks: d.map((_, r) => (k === r + 1 ? 'factor' : 'normal')), indexBase: 1 },
      tables: [
        {
          table: { caption: `Menukar ${x} dengan koin`, corner: 'Pecahan', rowHeaders: d.map((v, r) => `d[${r + 1}] = ${v}`), colHeaders: ['Koin diambil', 'Sisa uang'], cells },
          labels: { current: 'pecahan yang sedang diproses' },
          legend: ['empty', 'filled', 'current'],
        },
      ],
    })
  }

  sisa = x
  push(1, `Baris 1: sisa = x = ${x}. Uang yang belum ditukar.`)
  jumlah = 0
  push(2, 'Baris 2: jumlah = 0. Belum ada koin yang diambil.')
  for (k = 1; ; k++) {
    const masuk = k <= d.length
    if (masuk) pakai[k - 1] = 0
    push(3, masuk ? `Baris 3: k = ${k}, ${k} ≤ ${d.length}. Sekarang pecahan d[${k}] = ${d[k - 1]} dicoba.` : `Baris 3: k = ${k} lebih besar dari d.length = ${d.length}, jadi semua pecahan sudah dicoba dan algoritma lanjut ke baris 7.`)
    if (!masuk) break
    for (;;) {
      const muat = sisa >= d[k - 1]
      push(4, `Baris 4: sisa >= d[${k}] → ${sisa} >= ${d[k - 1]} bernilai ${muat ? 'TRUE' : 'FALSE'}${muat ? `, jadi satu koin ${d[k - 1]} diambil.` : `, jadi pecahan ${d[k - 1]} selesai dan k dinaikkan.`}`)
      if (!muat) break
      const lama = sisa
      sisa -= d[k - 1]
      push(5, `Baris 5: sisa = ${lama} − ${d[k - 1]} = ${sisa}.`)
      jumlah += 1
      pakai[k - 1] += 1
      diambil.push(d[k - 1])
      push(6, `Baris 6: jumlah = ${jumlah}. Koin yang diambil sejauh ini: ${diambil.join(' + ')}.`)
    }
    sisaBaris[k - 1] = sisa
  }
  k = undefined
  const optimal = minimumKoin(d, x)
  const banding =
    jumlah === optimal
      ? `Pemeriksaan dengan Dynamic Programming: jumlah koin minimum juga ${optimal}, jadi Greedy memberi hasil optimal untuk pecahan dan uang ini.`
      : `Pemeriksaan dengan Dynamic Programming: jumlah koin minimum hanya ${optimal}, jadi Greedy TIDAK optimal untuk pecahan dan uang ini (contoh penyangkal).`
  push(7, `Baris 7: return jumlah = ${jumlah} koin (${diambil.join(' + ')}). ${banding}`)
  return steps
}

export const greedyCoinPresets = [
  { label: 'Pecahan Amerika: 25, 10, 5, 1 → 63', values: { d: '25, 10, 5, 1', x: '63' } },
  { label: 'Greedy gagal: 4, 3, 1 → 6', values: { d: '4, 3, 1', x: '6' } },
  { label: 'Soal kuis: 10, 6, 1 → 12', values: { d: '10, 6, 1', x: '12' } },
]

// ================================================================= BUILD-REPRESENTATIONS (Modul 16)
export const graphRepCode = [
  'let Adj[1..n] be an array of empty lists',
  'let A[1..n, 1..n] be a matrix of zeros',
  'for each edge (u, v) in E',
  '    add v to Adj[u]',
  '    A[u, v] = 1',
  '    if graph is undirected and u ≠ v',
  '        add u to Adj[v]',
  '        A[v, u] = 1',
  'return Adj and A',
].join('\n')

export const GRAPH_REP_LIMITS = { maxN: 8, maxE: 20 }

/** Membaca busur "1-2, 2-3" (tak berarah) atau "1>2, 2>3" (berarah); semua busur harus memakai tanda yang sama. */
export function parseEdges(text, n) {
  const parts = String(text).split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: 'Isi minimal satu busur, mis. 1-2, 2-3.' }
  const edges = []
  let directed = null
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*([->])\s*(\d+)$/)
    if (!m) return { ok: false, error: `"${part}" bukan busur. Tulis 1-2 untuk graf tak berarah atau 1>2 untuk graf berarah.` }
    const dir = m[2] === '>'
    if (directed === null) directed = dir
    else if (directed !== dir) return { ok: false, error: 'Semua busur harus memakai tanda yang sama: semuanya "-" (tak berarah) atau semuanya ">" (berarah).' }
    const u = Number(m[1])
    const v = Number(m[3])
    if (u < 1 || v < 1 || u > n || v > n) return { ok: false, error: `Nomor simpul harus antara 1 dan ${n} (busur ${u}${m[2]}${v}).` }
    if (!dir && u === v) return { ok: false, error: 'Graf tak berarah di sini tanpa self-loop. Pakai tanda ">" untuk busur ke diri sendiri.' }
    if (edges.some(([a, b]) => (a === u && b === v) || (!dir && a === v && b === u))) return { ok: false, error: `Busur ${u}${m[2]}${v} muncul dua kali (tanpa busur ganda).` }
    edges.push([u, v])
  }
  if (edges.length > GRAPH_REP_LIMITS.maxE) return { ok: false, error: `Paling banyak ${GRAPH_REP_LIMITS.maxE} busur (Anda mengisi ${edges.length}).` }
  return { ok: true, edges, directed }
}

export function checkGraphRepInput({ n, E }) {
  if (n < 1 || n > GRAPH_REP_LIMITS.maxN) return `Jumlah simpul n harus di antara 1 dan ${GRAPH_REP_LIMITS.maxN} (Anda mengisi ${n}).`
  const r = parseEdges(E, n)
  return r.ok ? null : r.error
}

/**
 * Membangun Adj dan A dari daftar busur, persis seperti urutan pseudocode (isi tiap list mengikuti urutan busur dimasukkan).
 * @param {{ n: number, E: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function graphRepTrace({ n, E }) {
  const { edges, directed } = parseEdges(E, n)
  const Adj = Array.from({ length: n + 1 }, () => [])
  const A = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  let made = 0 // 0 = belum ada, 1 = Adj ada, 2 = Adj dan A ada
  let u
  let v
  let idx
  let cur = null // { adj: simpul list yang berubah, cells: [[baris, kolom], ...] }
  const steps = []
  const labels = Array.from({ length: n }, (_, k) => String(k + 1))
  const total = () => Adj.reduce((s, l) => s + l.length, 0)

  function push(line, note) {
    const tables = []
    if (made >= 1) {
      tables.push({
        table: {
          caption: 'Adjacency-list',
          corner: 'u',
          rowHeaders: labels,
          colHeaders: ['Adj[u] (tetangga menurut urutan busur)'],
          cells: labels.map((_, r) => [{ text: Adj[r + 1].length ? Adj[r + 1].join(', ') : '∅', mark: cur?.adj === r + 1 ? 'current' : Adj[r + 1].length ? 'filled' : 'empty' }]),
        },
        labels: { current: 'list yang baru berubah' },
        legend: ['empty', 'filled', 'current'],
      })
    }
    if (made >= 2) {
      tables.push({
        table: {
          caption: 'Adjacency-matrix (1 = ada busur u → v)',
          corner: 'u \\ v',
          rowHeaders: labels,
          colHeaders: labels,
          cells: labels.map((_, r) => labels.map((__, c) => ({ text: String(A[r + 1][c + 1]), mark: cur?.cells.some(([a, b]) => a === r + 1 && b === c + 1) ? 'current' : A[r + 1][c + 1] ? 'filled' : 'empty' }))),
        },
        labels: { current: 'sel yang baru diisi 1' },
        legend: ['empty', 'filled', 'current'],
      })
    }
    steps.push({
      line,
      note,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'jenis graf', value: directed ? 'berarah' : 'tak berarah' },
        { name: 'busur ke', value: idx === undefined ? dash : `${idx} dari ${edges.length}` },
        { name: 'u', value: u === undefined ? dash : String(u) },
        { name: 'v', value: v === undefined ? dash : String(v) },
        { name: 'isi semua list', value: String(total()) },
      ],
      tables: tables.length ? tables : undefined,
    })
  }

  made = 1
  push(1, `Baris 1: dibuat Adj[1..${n}], satu list kosong untuk tiap simpul (∅ = list kosong).`)
  made = 2
  push(2, `Baris 2: dibuat matriks A berukuran ${n} × ${n} yang semua selnya 0. Graf ini ${directed ? 'berarah' : 'tak berarah'} dengan ${edges.length} busur.`)
  for (idx = 1; ; idx++) {
    cur = null
    const masuk = idx <= edges.length
    if (masuk) [u, v] = edges[idx - 1]
    else {
      u = undefined
      v = undefined
    }
    push(3, masuk ? `Baris 3: busur ke-${idx} adalah (${u}, ${v}).` : `Baris 3: semua ${edges.length} busur sudah diproses, jadi algoritma lanjut ke baris 9.`)
    if (!masuk) break
    Adj[u].push(v)
    cur = { adj: u, cells: [] }
    push(4, `Baris 4: ${v} ditambahkan ke Adj[${u}], sehingga Adj[${u}] = ${Adj[u].join(', ')}.`)
    A[u][v] = 1
    cur = { adj: u, cells: [[u, v]] }
    push(5, `Baris 5: A[${u}, ${v}] = 1.`)
    const dua = !directed && u !== v
    push(6, `Baris 6: graf ${directed ? 'berarah' : 'tak berarah'} dan ${u} ≠ ${v} → ${dua ? 'TRUE, jadi busur juga dicatat dari arah sebaliknya.' : directed ? 'FALSE (graf berarah), jadi baris 7 dan 8 dilewati.' : 'FALSE (self-loop), jadi baris 7 dan 8 dilewati.'}`)
    if (dua) {
      Adj[v].push(u)
      cur = { adj: v, cells: [[u, v]] }
      push(7, `Baris 7: ${u} ditambahkan ke Adj[${v}], sehingga Adj[${v}] = ${Adj[v].join(', ')}.`)
      A[v][u] = 1
      cur = { adj: v, cells: [[v, u]] }
      push(8, `Baris 8: A[${v}, ${u}] = 1. Matriks graf tak berarah selalu simetris.`)
    }
  }
  cur = null
  idx = undefined
  const E_ = edges.length
  push(
    9,
    `Baris 9: return Adj dan A. Jumlah isi semua list = ${total()} (${directed ? '|E|' : '2|E|'}), jadi Adj memakai ${n} + ${total()} = ${n + total()} entri, sedangkan A memakai |V|² = ${n * n} sel untuk ${E_} busur.`,
  )
  return steps
}

export const graphRepPresets = [
  { label: 'Graf (a) modul: tak berarah, 5 simpul', values: { n: '5', E: '1-2, 1-5, 2-5, 2-3, 2-4, 3-4, 4-5' } },
  { label: 'Graf (b) modul: berarah, 6 simpul', values: { n: '6', E: '1>2, 1>4, 2>5, 3>6, 3>5, 4>2, 5>4, 6>6' } },
  { label: 'Graf jarang: 8 simpul, 3 busur', values: { n: '8', E: '1-2, 2-3, 5-8' } },
]
