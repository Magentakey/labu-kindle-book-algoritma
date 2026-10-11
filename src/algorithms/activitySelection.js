// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
export const activitySelectionCode = `function activitySelection(start, finish) {
  const urut = start.map((_, i) => i).sort((a, b) => finish[a] - finish[b])
  const pilih = []
  let akhir = -Infinity
  for (const i of urut) {
    if (start[i] >= akhir) {
      pilih.push(i)
      akhir = finish[i]
    }
  }
  return pilih
}`

export const AS_MAX_ACTIVITIES = 12
export const AS_MAX_TIME = 30

/**
 * @typedef {{ start: number[], finish: number[] }} ActivityInput
 *
 * @typedef {Object} TimelineRow
 * @property {string} id      nama aktivitas, mis. "a4" (aktivitas ke-4 pada masukan)
 * @property {number} start
 * @property {number} finish
 * @property {string} mark    kunci pada TIMELINE_STATUS
 *
 * @typedef {Object} TimelineStep
 * @property {number|number[]|null} line
 * @property {string} note
 * @property {{ rows: TimelineRow[], frontier: number|null, schedule: string[], axisMax: number, panels: any[], labels?: Record<string,string> }} view
 */

const name = (i) => `a${i + 1}`

/** Tepat sama dengan solusi di soal challenge: urutkan menurut waktu selesai, ambil yang tidak bentrok. */
export function activitySelection(start, finish) {
  const order = start.map((_, i) => i).sort((a, b) => finish[a] - finish[b])
  const chosen = []
  let last = -Infinity
  for (const i of order) {
    if (start[i] >= last) {
      chosen.push(i)
      last = finish[i]
    }
  }
  return chosen
}

const parseList = (text, label) => {
  const parts = String(text ?? '').trim().split(/[\s,;]+/).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: `Isi minimal satu angka pada ${label}.` }
  const values = []
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return { ok: false, error: `"${p}" pada ${label} bukan bilangan bulat tak negatif. Pisahkan angka dengan koma.` }
    const v = Number(p)
    if (v > AS_MAX_TIME) return { ok: false, error: `Angka ${p} pada ${label} melebihi batas ${AS_MAX_TIME}.` }
    values.push(v)
  }
  return { ok: true, values }
}

/**
 * Membaca dua isian: waktu mulai dan waktu selesai. Aktivitas ke-i berjalan dari start[i] sampai finish[i].
 * Data tidak harus terurut (seperti pada soal challenge), tetapi tiap aktivitas harus berdurasi lebih dari 0.
 * @param {{ start: string, finish: string }} fields
 * @returns {{ ok: true, value: ActivityInput } | { ok: false, error: string }}
 */
export function parseActivityInput(fields) {
  const s = parseList(fields.start, 'waktu mulai (start)')
  if (!s.ok) return s
  const f = parseList(fields.finish, 'waktu selesai (finish)')
  if (!f.ok) return f
  if (s.values.length !== f.values.length) {
    return { ok: false, error: `Jumlah angka start (${s.values.length}) dan finish (${f.values.length}) harus sama, karena keduanya berpasangan.` }
  }
  if (s.values.length > AS_MAX_ACTIVITIES) return { ok: false, error: `Maksimal ${AS_MAX_ACTIVITIES} aktivitas (Anda mengisi ${s.values.length}).` }
  for (let i = 0; i < s.values.length; i++) {
    if (s.values[i] >= f.values[i]) {
      return { ok: false, error: `Aktivitas ke-${i + 1} mulai pada ${s.values[i]} tetapi selesai pada ${f.values[i]}. Waktu selesai harus lebih besar dari waktu mulai.` }
    }
  }
  return { ok: true, value: { start: s.values, finish: f.values } }
}

/** @param {ActivityInput} v */
export const formatActivityInput = (v) => ({ start: v.start.join(', '), finish: v.finish.join(', ') })

/**
 * Masukan acak: 6 sampai 10 aktivitas dalam urutan acak, dengan waktu 0 sampai 24. Hasil greedy minimal 3 aktivitas
 * dan minimal 2 aktivitas ditolak, supaya ada bentrokan yang bisa dilihat.
 * @param {() => number} [rng]
 * @returns {ActivityInput}
 */
export function randomActivityInput(rng = Math.random) {
  const pick = (n) => Math.floor(rng() * n)
  for (let attempt = 0; attempt < 200; attempt++) {
    const n = 6 + pick(5)
    const start = []
    const finish = []
    for (let i = 0; i < n; i++) {
      const s = pick(19)
      start.push(s)
      finish.push(s + 1 + pick(7))
    }
    const k = activitySelection(start, finish).length
    if (k >= 3 && n - k >= 2) return { start, finish }
  }
  return { start: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], finish: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] }
}

/**
 * Menjalankan algoritma greedy sekali dan merekam tiap langkah.
 * Aktivitas dinamai a1, a2, ... menurut urutan pada masukan; di kode, a1 adalah indeks 0.
 * @param {ActivityInput} input
 * @returns {TimelineStep[]}
 */
export function activitySelectionSteps({ start, finish }) {
  const n = start.length
  const axisMax = Math.max(...finish)
  const original = start.map((_, i) => i)
  const sorted = original.slice().sort((a, b) => finish[a] - finish[b])

  /** @type {string[]} */
  const mark = start.map(() => 'normal')
  /** @type {number[]} */
  const chosen = []
  let order = original
  let last = -Infinity
  /** @type {TimelineStep[]} */
  const steps = []

  const verdict = { normal: '–', current: 'sedang diperiksa', selected: 'dipilih', rejected: 'ditolak (bentrok)' }
  const lastName = () => name(chosen[chosen.length - 1])

  const push = (line, note, i = null, final = false) => {
    const rows = order.map((k) => ({ id: name(k), start: start[k], finish: finish[k], mark: mark[k] }))
    const panels = [
      {
        type: 'list',
        title: 'Variabel',
        items: [`akhir = ${last === -Infinity ? '−∞' : last}`, `i = ${i === null ? '–' : `${i} (${name(i)})`}`],
        empty: '',
      },
      { type: 'list', title: 'pilih (aktivitas terpilih)', items: chosen.map(name), empty: 'belum ada yang dipilih' },
      {
        type: 'table',
        caption: final ? 'Keputusan untuk tiap aktivitas' : 'Aktivitas menurut urutan sekarang',
        headers: ['Aktivitas', 'Mulai', 'Selesai', 'Keputusan'],
        rows: order.map((k) => [name(k), String(start[k]), String(finish[k]), verdict[mark[k]]]),
        activeRow: i === null ? -1 : order.indexOf(i),
      },
    ]
    steps.push({
      line,
      note,
      view: { rows, frontier: last === -Infinity ? null : last, schedule: chosen.map(name), axisMax, panels },
    })
  }

  push(
    1,
    `Ada ${n} aktivitas, tiap aktivitas berjalan dari waktu mulai sampai waktu selesai. Tujuannya memilih sebanyak mungkin aktivitas yang tidak tumpang tindih. ` +
      'Dua aktivitas boleh bersentuhan, yaitu yang satu selesai tepat saat yang lain mulai. ' +
      'Strategi greedy: selalu ambil aktivitas yang selesai paling awal dan tidak bentrok dengan yang sudah dipilih.',
  )

  order = sorted
  const alreadySorted = sorted.every((k, p) => k === p)
  const hasTie = sorted.some((k, p) => p > 0 && finish[k] === finish[sorted[p - 1]])
  push(
    2,
    alreadySorted
      ? `Urutkan aktivitas menurut waktu selesai. Data ini sudah terurut, jadi urutannya tetap: ${sorted.map(name).join(', ')}.`
      : `Urutkan aktivitas menurut waktu selesai, dari yang paling awal. Urutan baru: ${sorted.map(name).join(', ')}.`,
  )
  if (hasTie) {
    steps[steps.length - 1].note += ' Bila ada waktu selesai yang sama, urutan semula dipertahankan.'
  }

  push([3, 4], 'pilih dimulai kosong dan akhir = −∞. Karena belum ada aktivitas terpilih, aktivitas pertama pasti tidak bentrok.')

  for (const i of sorted) {
    mark[i] = 'current'
    push(5, `Giliran ${name(i)}: mulai ${start[i]}, selesai ${finish[i]} (i = ${i}).`, i)

    const free = start[i] >= last
    const lastText = last === -Infinity ? '−∞' : String(last)
    if (free) {
      push(
        6,
        last === -Infinity
          ? `start[${i}] = ${start[i]} ≥ akhir = −∞: ya. Belum ada aktivitas terpilih, jadi ${name(i)} tidak mungkin bentrok.`
          : `start[${i}] = ${start[i]} ≥ akhir = ${lastText}: ya. ${name(i)} mulai pada atau sesudah ${lastName()} selesai, jadi tidak bentrok.`,
        i,
      )
      chosen.push(i)
      mark[i] = 'selected'
      push(7, `Masukkan ${name(i)} ke pilih. Sekarang ada ${chosen.length} aktivitas terpilih.`, i)
      last = finish[i]
      push(8, `akhir = finish[${i}] = ${last}. Aktivitas berikutnya harus mulai pada waktu ${last} atau sesudahnya.`, i)
    } else {
      mark[i] = 'rejected'
      push(
        6,
        `start[${i}] = ${start[i]} ≥ akhir = ${lastText}: tidak. ${name(i)} sudah mulai pada ${start[i]}, padahal ${lastName()} baru selesai pada ${lastText}. ` +
          `Keduanya tumpang tindih, jadi ${name(i)} dilewati.`,
        i,
      )
    }
  }

  push(
    11,
    `Semua aktivitas sudah diperiksa. pilih = [${chosen.map(name).join(', ')}], yaitu ${chosen.length} aktivitas yang saling tidak bentrok. ` +
      'Memilih yang selesai paling awal selalu menyisakan waktu terbanyak untuk aktivitas berikutnya, sehingga jumlah ini maksimum.',
    null,
    true,
  )
  return steps
}
