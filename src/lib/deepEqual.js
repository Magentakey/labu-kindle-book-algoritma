/**
 * Perbandingan nilai untuk test case: angka, teks, boolean, null, array, dan objek biasa.
 * NaN dianggap sama dengan NaN. Urutan kunci objek tidak berpengaruh.
 * @param {unknown} a
 * @param {unknown} b
 */
export function deepEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]))
  }
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
}
