/**
 * Menunda penyimpanan sampai pengguna berhenti mengetik, supaya tidak menulis di setiap ketukan.
 * flush() menyimpan sekarang juga (dipakai saat pindah halaman atau menutup tab).
 * @param {(value: string) => void} save
 * @param {number} [delay] milidetik
 */
export function createDebouncedSaver(save, delay = 400) {
  let timer = null
  let pending = null
  let has = false

  function run() {
    timer = null
    if (!has) return
    has = false
    save(pending)
  }

  return {
    schedule(value) {
      pending = value
      has = true
      clearTimeout(timer)
      timer = setTimeout(run, delay)
    },
    flush() {
      clearTimeout(timer)
      run()
    },
  }
}
