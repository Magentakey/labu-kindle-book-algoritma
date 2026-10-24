// Menyusun baris kode pseudocode untuk panel Kode: beberapa prosedur dalam satu blok, tiap prosedur bernomor sendiri,
// baris yang sedang berjalan disorot, dan titik pemanggilan prosedur (mis. baris RELAX di DIJKSTRA) ditandai abu-abu.

/**
 * @param {string} code seluruh kode (baris dipisah \n), bernomor global 1..N
 * @param {Array<{ title: string, from: number, to: number, offset?: number, callSite?: number | number[] }>} procedures
 * @param {number|null} activeLine nomor global baris yang sedang berjalan
 * @returns {Array<{ title: string, rows: Array<{ global: number, local: number, text: string, state: 'active'|'caller'|null }> }>}
 */
export function buildCodeSections(code, procedures, activeLine) {
  const lines = code.split('\n')
  const active = procedures.find((p) => activeLine !== null && activeLine >= p.from && activeLine <= p.to)
  // callSite boleh satu nomor atau beberapa (mis. DFS-VISIT dipanggil dari baris 7 dan baris 14)
  const callers = [].concat(active?.callSite ?? [])
  return procedures.map((p) => ({
    title: p.title,
    rows: lines.slice(p.from - 1, p.to).map((text, k) => {
      const global = p.from + k
      return { global, local: global - (p.offset ?? 0), text, state: global === activeLine ? 'active' : callers.includes(global) ? 'caller' : null }
    }),
  }))
}

/** Nama prosedur dan nomor baris lokal untuk keterangan langkah, mis. "RELAX · baris 2". */
export function lineCaption(procedures, line) {
  const p = procedures.find((x) => line >= x.from && line <= x.to)
  if (!p) return `Baris ${line}`
  return `${p.title.split('(')[0]} · baris ${line - (p.offset ?? 0)}`
}
