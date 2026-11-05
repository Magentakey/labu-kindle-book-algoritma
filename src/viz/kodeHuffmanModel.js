// Model hitung Modul 15 (Kode Huffman; berkas terpisah dari huffmanModel.js milik visualizer): membangun pohon dengan HUFFMAN (antrean prioritas), kode, encoding/decoding, ukuran berkas,
// pohon kode panjang tetap, dan pencarian biaya minimum dengan semua urutan penggabungan sebagai pembanding. Murni, tanpa React.
//
// Pemecah seri sama dengan program Python di modul: antrean diurut menurut (frekuensi, nomor urut), dengan nomor urut daun = urutan masukan
// dan simpul gabungan mendapat nomor berikutnya. Yang diambil pertama (terkecil) menjadi anak kiri (label 0), yang kedua anak kanan (label 1).

/** Contoh bahan kuliah: berkas 100.000 karakter, frekuensi dalam ribuan. */
export const frekuensiContoh = [['a', 45], ['b', 13], ['c', 12], ['d', 16], ['e', 9], ['f', 5]]
/** Kode panjang tetap (Tabel 1) dan kode panjang berubah dari bahan kuliah. */
export const kodeTetapContoh = { a: '000', b: '001', c: '010', d: '011', e: '100', f: '101' }
export const kodeBerubahContoh = { a: '0', b: '101', c: '100', d: '111', e: '1101', f: '1100' }

/**
 * HUFFMAN(C) menurut pseudocode modul. `langkah` berisi satu catatan per putaran: simpul x (kiri), y (kanan), z (baru), dan isi Q sesudahnya
 * (teks "c:12" untuk daun dan "[14]" untuk simpul gabungan, terurut menurut antrean).
 * @param {Array<[string, number]>} freq pasangan [karakter, frekuensi]
 */
export function huffman(freq) {
  let seq = 0
  let Q = freq.map(([ch, f]) => ({ ch, freq: f, seq: seq++ }))
  const urut = () => Q.sort((a, b) => a.freq - b.freq || a.seq - b.seq)
  const label = (x) => (x.ch !== undefined ? `${x.ch}:${x.freq}` : `[${x.freq}]`)
  urut()
  const awal = Q.map(label)
  const langkah = []
  for (let i = 1; i <= freq.length - 1; i++) {
    const x = Q.shift() // EXTRACT-MIN
    const y = Q.shift() // EXTRACT-MIN
    const z = { freq: x.freq + y.freq, kiri: x, kanan: y, seq: seq++ }
    Q.push(z) // INSERT
    urut()
    langkah.push({ loop: i, x: label(x), y: label(y), z: z.freq, Q: Q.map(label) })
  }
  return { akar: Q[0], awal, langkah }
}

/** Kode tiap daun: label 0 ke anak kiri, 1 ke anak kanan (kasus satu karakter: kode "0"). */
export function kodeDariPohon(akar) {
  const kode = {}
  const telusuri = (n, awalan) => {
    if (n.ch !== undefined) kode[n.ch] = awalan || '0'
    else {
      if (n.kiri) telusuri(n.kiri, awalan + '0')
      if (n.kanan) telusuri(n.kanan, awalan + '1')
    }
  }
  telusuri(akar, '')
  return kode
}

/** Total bit B(T) = Σ frekuensi × panjang kode (dalam satuan frekuensi, mis. ribuan bit). */
export const totalBit = (freq, kode) => freq.reduce((a, [ch, f]) => a + f * kode[ch].length, 0)

/** Bit minimum per karakter untuk kode panjang tetap pada k jenis karakter: ⌈lg k⌉ (k ≥ 2). */
export const bitTetap = (k) => { let b = 0; while (2 ** b < k) b++; return b }

export const encode = (teks, kode) => [...teks].map((c) => kode[c]).join('')

/** Decode kode prefiks: baca bit dari kiri, begitu cocok dengan suatu kode catat karakternya dan mulai lagi. Mengembalikan potongan dan hasil. */
export function decode(bit, kode) {
  const balik = Object.fromEntries(Object.entries(kode).map(([k, v]) => [v, k]))
  const potongan = []
  let buf = ''
  for (const b of bit) {
    buf += b
    if (buf in balik) { potongan.push({ bit: buf, ch: balik[buf] }); buf = '' }
  }
  return { potongan, hasil: potongan.map((p) => p.ch).join(''), sisa: buf }
}

/** Apakah himpunan kode adalah kode prefiks (tidak ada kode yang menjadi awalan kode lain). */
export const adalahPrefiks = (daftar) => daftar.every((a, i) => daftar.every((b, j) => i === j || !b.startsWith(a)))

/** Banyaknya cara membaca barisan bit sebagai barisan karakter menurut kode (untuk menunjukkan kode yang ambigu). */
export function cacahBacaan(bit, kode) {
  const dp = Array(bit.length + 1).fill(0)
  dp[0] = 1
  for (let i = 1; i <= bit.length; i++) for (const k of Object.values(kode)) if (i >= k.length && bit.slice(i - k.length, i) === k) dp[i] += dp[i - k.length]
  return dp[bit.length]
}

/**
 * Pohon dari himpunan kode (trie): tiap simpul membawa jumlah frekuensi daun di bawahnya. Dipakai untuk pohon kode panjang tetap (Gambar 1),
 * yang memiliki simpul dengan satu anak. @returns simpul { freq, ch?, kiri?, kanan? }
 */
export function pohonDariKode(kode, freq) {
  const f = Object.fromEntries(freq)
  const akar = {}
  for (const [ch, k] of Object.entries(kode)) {
    let n = akar
    for (const b of k) { const sisi = b === '0' ? 'kiri' : 'kanan'; n[sisi] ??= {}; n = n[sisi] }
    n.ch = ch
  }
  const isi = (n) => {
    n.freq = n.ch !== undefined ? f[n.ch] : (n.kiri ? isi(n.kiri) : 0) + (n.kanan ? isi(n.kanan) : 0)
    if (n.kiri && n.kiri.freq === undefined) isi(n.kiri)
    return n.freq
  }
  isi(akar)
  return akar
}

/** Banyaknya simpul dalam yang hanya punya satu anak (0 pada pohon penuh). */
export function simpulSatuAnak(n) {
  if (n.ch !== undefined) return 0
  return (!!n.kiri !== !!n.kanan ? 1 : 0) + (n.kiri ? simpulSatuAnak(n.kiri) : 0) + (n.kanan ? simpulSatuAnak(n.kanan) : 0)
}

/** Biaya minimum semua pohon penuh atas frekuensi ini lewat SEMUA urutan penggabungan (bukan hanya dua terkecil). Pembanding independen untuk n kecil. */
export function biayaMinimumBrute(frekuensi) {
  const memo = new Map()
  const f = (daftar) => {
    if (daftar.length === 1) return 0
    const kunci = [...daftar].sort((a, b) => a - b).join(',')
    if (memo.has(kunci)) return memo.get(kunci)
    let terbaik = Infinity
    for (let i = 0; i < daftar.length; i++) for (let j = i + 1; j < daftar.length; j++) {
      const sisa = daftar.filter((_, k) => k !== i && k !== j)
      terbaik = Math.min(terbaik, daftar[i] + daftar[j] + f([...sisa, daftar[i] + daftar[j]]))
    }
    memo.set(kunci, terbaik)
    return terbaik
  }
  return f(frekuensi)
}
