// Bagian yang dipakai bersama oleh peraga MST-KRUSKAL dan MST-PRIM (materi 12).

export const MST_MAX_VERTICES = 9
export const MST_MAX_EDGES = 16
export const MST_MAX_WEIGHT = 99

export const NAME_RE = /^[A-Za-z0-9]{1,2}$/

/** Teks bobot: bobot bilangan bulat 0 sampai MST_MAX_WEIGHT, atau ∞ untuk Infinity. */
export const fmtKey = (k) => (k === Infinity ? '∞' : String(k))

/**
 * Memeriksa bahwa graf terhubung (syarat MST). Mengembalikan pesan kesalahan, atau null bila terhubung.
 * @param {string[]} names
 * @param {Array<[string, string]>} pairs  sisi sebagai pasangan nama simpul (tak berarah)
 */
export function checkConnected(names, pairs) {
  const adj = Object.fromEntries(names.map((x) => [x, []]))
  for (const [u, v] of pairs) {
    adj[u].push(v)
    adj[v].push(u)
  }
  const seen = new Set([names[0]])
  const stack = [names[0]]
  while (stack.length) {
    const u = stack.pop()
    for (const v of adj[u]) {
      if (!seen.has(v)) {
        seen.add(v)
        stack.push(v)
      }
    }
  }
  const lost = names.filter((x) => !seen.has(x))
  if (lost.length === 0) return null
  return `Graf harus terhubung agar punya pohon rentang. Simpul ${lost.join(', ')} tidak terjangkau dari simpul ${names[0]}. Tambahkan sisi yang menghubungkannya.`
}
