// Suara kuis: nada pendek yang dibuat langsung dengan Web Audio (tanpa berkas audio, jadi tetap jalan offline dan tidak menambah ukuran aplikasi).
// Suara hanya pelengkap: setiap hasil benar atau salah juga selalu ditulis sebagai teks dan ikon. Suara tidak pernah diputar otomatis saat halaman
// dibuka, hanya sebagai tanggapan atas tindakan pengguna, tiap nada kurang dari satu detik, dan pengguna bisa mematikannya (tersimpan di perangkat).

export const SUARA_KUNCI = 'labu-suara'

/** Nada per kejadian: frekuensi (Hz), waktu mulai (detik), lama (detik), jenis gelombang. Volume kecil. */
export const NADA = {
  pilih: [{ f: 660, t: 0, d: 0.06, tipe: 'sine' }],
  ragu: [{ f: 392, t: 0, d: 0.07, tipe: 'triangle' }, { f: 349, t: 0.08, d: 0.09, tipe: 'triangle' }],
  benar: [{ f: 659, t: 0, d: 0.12, tipe: 'sine' }, { f: 880, t: 0.12, d: 0.24, tipe: 'sine' }],
  salah: [{ f: 233, t: 0, d: 0.16, tipe: 'triangle' }, { f: 175, t: 0.17, d: 0.28, tipe: 'triangle' }],
  lulus: [{ f: 523, t: 0, d: 0.14, tipe: 'sine' }, { f: 659, t: 0.14, d: 0.14, tipe: 'sine' }, { f: 784, t: 0.28, d: 0.14, tipe: 'sine' }, { f: 1047, t: 0.42, d: 0.4, tipe: 'sine' }],
  gagal: [{ f: 392, t: 0, d: 0.18, tipe: 'triangle' }, { f: 330, t: 0.19, d: 0.18, tipe: 'triangle' }, { f: 262, t: 0.38, d: 0.34, tipe: 'triangle' }],
}

const PUNCAK = 0.12 // volume tertinggi (0 sampai 1)

/** Suara menyala bila belum pernah dimatikan. */
export function suaraAktif(storage) {
  try {
    return storage?.getItem(SUARA_KUNCI) !== '0'
  } catch {
    return true
  }
}

export function simpanSuara(storage, aktif) {
  try {
    storage?.setItem(SUARA_KUNCI, aktif ? '1' : '0')
  } catch {
    // penyimpanan tidak tersedia: pilihan hanya berlaku selama halaman terbuka
  }
  for (const f of pendengar) f()
}

const pendengar = new Set()
/** Untuk useSyncExternalStore: dipanggil ulang setiap kali pilihan suara berubah. */
export function langgananSuara(fn) {
  pendengar.add(fn)
  return () => pendengar.delete(fn)
}

/** Menjadwalkan nada pada konteks audio `ctx` (mulai dari `mulai`, detik). Mengembalikan jumlah nada yang dijadwalkan. */
export function jadwalkan(ctx, nada, mulai = ctx.currentTime) {
  for (const n of nada) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = n.tipe
    osc.frequency.value = n.f
    const awal = mulai + n.t
    gain.gain.setValueAtTime(0.0001, awal)
    gain.gain.exponentialRampToValueAtTime(PUNCAK, awal + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, awal + n.d)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(awal)
    osc.stop(awal + n.d + 0.02)
  }
  return nada.length
}

let konteksBersama = null
function konteks() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? window.webkitAudioContext
  if (!AC) return null
  try {
    konteksBersama ??= new AC()
    if (konteksBersama.state === 'suspended') konteksBersama.resume?.()?.catch?.(() => {})
    return konteksBersama
  } catch {
    return null
  }
}

/**
 * Memainkan satu nada bernama bila suara menyala. Aman dipanggil di mana saja: tanpa Web Audio atau saat dimatikan tidak terjadi apa-apa.
 * @param {keyof typeof NADA} nama
 * @param {{ storage?: Storage, ctx?: any }} [dep] untuk tes
 * @returns {boolean} true bila nada dijadwalkan
 */
export function mainkan(nama, { storage = typeof window !== 'undefined' ? window.localStorage : undefined, ctx } = {}) {
  const nada = NADA[nama]
  if (!nada || !suaraAktif(storage)) return false
  const c = ctx ?? konteks()
  if (!c) return false
  try {
    jadwalkan(c, nada)
    return true
  } catch {
    return false
  }
}
