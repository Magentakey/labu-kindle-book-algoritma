// Jawaban acuan untuk setiap soal di src/content/challenges/. Hanya dipakai oleh tes (content.test.js),
// TIDAK diimpor aplikasi, jadi tidak ikut bundle. Fungsinya membuktikan bahwa test case benar dan bisa dilulusi.
// Catatan: repo ini publik, jadi jawaban ini terlihat di GitHub.
export const referenceSolutions = {
  'algoritma-pemrograman': `function solve(arr) {
    let terbesar = arr[0]
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > terbesar) terbesar = arr[i]
    }
    return terbesar
  }`,

  'insertion-sort': `function solve(arr) {
    const a = [...arr]
    for (let i = 1; i < a.length; i++) {
      const key = a[i]
      let j = i - 1
      while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j-- }
      a[j + 1] = key
    }
    return a
  }`,

  'pertumbuhan-fungsi': `function solve(c) {
    let terakhirGagal = 0
    for (let n = 1; n <= 100; n++) {
      if (c * n * n >= 2 ** n) terakhirGagal = n
    }
    return terakhirGagal + 1
  }`,

  'merge-sort': `function solve(a, b) {
    const hasil = []
    let i = 0, j = 0
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) hasil.push(a[i++])
      else hasil.push(b[j++])
    }
    while (i < a.length) hasil.push(a[i++])
    while (j < b.length) hasil.push(b[j++])
    return hasil
  }`,

  'recurrence-master': `function solve(n) {
    if (n === 1) return 1
    return 2 * solve(n / 2) + n
  }`,

  'dp-rantai-matriks': `function solve(dims) {
    const n = dims.length - 1
    const m = Array.from({ length: n }, () => Array(n).fill(0))
    for (let panjang = 2; panjang <= n; panjang++) {
      for (let i = 0; i + panjang - 1 < n; i++) {
        const j = i + panjang - 1
        m[i][j] = Infinity
        for (let k = i; k < j; k++) {
          const biaya = m[i][k] + m[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
          if (biaya < m[i][j]) m[i][j] = biaya
        }
      }
    }
    return m[0][n - 1]
  }`,

  'dp-lcs': `function solve(x, y) {
    const t = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(0))
    for (let i = 1; i <= x.length; i++) {
      for (let j = 1; j <= y.length; j++) {
        t[i][j] = x[i - 1] === y[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1])
      }
    }
    return t[x.length][y.length]
  }`,

  'greedy-activity-selection': `function solve(start, finish) {
    const urut = start.map((s, i) => [s, finish[i]]).sort((p, q) => p[1] - q[1])
    let jumlah = 0
    let akhirTerakhir = -Infinity
    for (const [s, f] of urut) {
      if (s >= akhirTerakhir) { jumlah++; akhirTerakhir = f }
    }
    return jumlah
  }`,

  'greedy-huffman': `function solve(freq) {
    const f = [...freq].sort((a, b) => a - b)
    let total = 0
    while (f.length > 1) {
      const gabung = f.shift() + f.shift()
      total += gabung
      let i = 0
      while (i < f.length && f[i] < gabung) i++
      f.splice(i, 0, gabung)
    }
    return total
  }`,

  'graph-bfs': `function solve(n, edges, start) {
    const adj = Array.from({ length: n }, () => [])
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
    adj.forEach((a) => a.sort((p, q) => p - q))
    const dikunjungi = Array(n).fill(false)
    const antrean = [start]
    dikunjungi[start] = true
    const urutan = []
    while (antrean.length > 0) {
      const u = antrean.shift()
      urutan.push(u)
      for (const v of adj[u]) {
        if (!dikunjungi[v]) { dikunjungi[v] = true; antrean.push(v) }
      }
    }
    return urutan
  }`,

  'graph-dfs': `function solve(n, edges, start) {
    const adj = Array.from({ length: n }, () => [])
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
    adj.forEach((a) => a.sort((p, q) => p - q))
    const dikunjungi = Array(n).fill(false)
    const urutan = []
    function dfs(u) {
      dikunjungi[u] = true
      urutan.push(u)
      for (const v of adj[u]) {
        if (!dikunjungi[v]) dfs(v)
      }
    }
    dfs(start)
    return urutan
  }`,

  mst: `function solve(n, edges) {
    const induk = Array.from({ length: n }, (_, i) => i)
    const cari = (x) => (induk[x] === x ? x : (induk[x] = cari(induk[x])))
    let total = 0
    for (const [u, v, w] of [...edges].sort((p, q) => p[2] - q[2])) {
      const a = cari(u), b = cari(v)
      if (a !== b) { induk[a] = b; total += w }
    }
    return total
  }`,

  'shortest-path': `function solve(n, edges, source) {
    const jarak = Array(n).fill(Infinity)
    const selesai = Array(n).fill(false)
    jarak[source] = 0
    for (let k = 0; k < n; k++) {
      let u = -1
      for (let i = 0; i < n; i++) {
        if (!selesai[i] && (u === -1 || jarak[i] < jarak[u])) u = i
      }
      if (jarak[u] === Infinity) break
      selesai[u] = true
      for (const [a, b, w] of edges) {
        if (a === u && jarak[u] + w < jarak[b]) jarak[b] = jarak[u] + w
      }
    }
    return jarak.map((d) => (d === Infinity ? -1 : d))
  }`,
}
