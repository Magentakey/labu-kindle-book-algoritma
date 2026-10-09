/**
 * Ringkasan hasil Jalankan dalam teks biasa (dibacakan pembaca layar lewat role="status").
 * @param {{ status: string, results?: Array<{ pass: boolean }>, kind?: string, message?: string, timeoutMs?: number }} outcome
 */
export function describeOutcome(outcome) {
  if (outcome.status === 'timeout') {
    const detik = outcome.timeoutMs / 1000
    return `Kode melebihi batas waktu ${detik} detik dan dihentikan. Periksa apakah ada perulangan yang tidak berhenti.`
  }
  if (outcome.status === 'error') {
    if (outcome.kind === 'syntax') return `Kode tidak bisa dijalankan karena kesalahan sintaks. ${outcome.message}`
    return outcome.message
  }
  const total = outcome.results.length
  const lulus = outcome.results.filter((r) => r.pass).length
  return lulus === total ? `Semua test case lulus (${lulus} dari ${total}).` : `Lulus ${lulus} dari ${total} test case.`
}
