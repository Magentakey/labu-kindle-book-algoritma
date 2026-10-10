// Penyimpanan progres di browser (localStorage) yang tidak pernah membuat aplikasi error.
//
// - Kunci diawali "labu:v1:". GitHub Pages memakai satu origin untuk semua repo satu akun,
//   jadi awalan mencegah bentrok dengan situs lain, dan "v1" memudahkan migrasi format nanti.
// - Jika localStorage tidak ada atau ditolak (mode privat lama, diblokir, penuh), data tetap tersimpan
//   di memori selama halaman terbuka, dan persistent() melapor false agar UI bisa memberi tahu pengguna.

const PREFIX = 'labu:v1:'
export const MAX_CODE_CHARS = 20000

/** @param {() => Storage | undefined} [getStorage]  (diganti saat tes) */
export function createStore(getStorage = () => globalThis.localStorage) {
  const memory = new Map()
  let backend = null
  let persistent = false

  try {
    const s = getStorage()
    if (s) {
      s.setItem(`${PREFIX}probe`, '1') // beberapa browser baru menolak saat menulis, bukan saat mengakses
      s.removeItem(`${PREFIX}probe`)
      backend = s
      persistent = true
    }
  } catch {
    backend = null
  }

  return {
    persistent: () => persistent,
    get(key) {
      if (memory.has(key)) return memory.get(key)
      if (!backend) return null
      try {
        return backend.getItem(PREFIX + key)
      } catch {
        return null
      }
    },
    set(key, value) {
      memory.set(key, value) // salinan memori: tetap benar walau penulisan ke browser gagal
      if (!backend) return
      try {
        backend.setItem(PREFIX + key, value)
      } catch {
        persistent = false // kemungkinan penuh; sisa sesi memakai memori
      }
    },
    remove(key) {
      memory.delete(key)
      if (!backend) return
      try {
        backend.removeItem(PREFIX + key)
      } catch {
        persistent = false
      }
    },
  }
}

/** Progres belajar: kode terakhir per soal dan daftar soal yang sudah lulus. */
export function createProgress(store) {
  const codeKey = (id) => `code:${id}`

  function solvedIds() {
    try {
      const raw = store.get('solved')
      const list = raw ? JSON.parse(raw) : []
      return Array.isArray(list) ? [...new Set(list.filter((x) => typeof x === 'string'))] : []
    } catch {
      return [] // data rusak: anggap kosong, jangan error
    }
  }

  return {
    persistent: () => store.persistent(),
    /** @returns {string | null} kode tersimpan, atau null bila belum ada */
    loadCode(id) {
      const value = store.get(codeKey(id))
      return typeof value === 'string' ? value : null
    },
    saveCode(id, code) {
      if (code.length > MAX_CODE_CHARS) return false
      store.set(codeKey(id), code)
      return true
    },
    clearCode(id) {
      store.remove(codeKey(id))
    },
    solvedIds,
    isSolved: (id) => solvedIds().includes(id),
    /** @returns {boolean} true bila ini pertama kalinya soal ditandai selesai */
    markSolved(id) {
      const ids = solvedIds()
      if (ids.includes(id)) return false
      store.set('solved', JSON.stringify([...ids, id]))
      return true
    },
  }
}

export const progress = createProgress(createStore())
