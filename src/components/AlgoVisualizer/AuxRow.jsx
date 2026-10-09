import { STATUS } from '../BarChart/statuses.js'

/**
 * Baris kecil untuk menampilkan array bantu (misalnya penampung hasil gabungan pada merge sort).
 * @param {Object} props
 * @param {string} props.title
 * @param {number[]} props.values
 * @param {string[]} [props.marks]  status tiap kotak (kunci pada STATUS)
 */
export default function AuxRow({ title, values, marks = [] }) {
  const statusOf = (idx) => (STATUS[marks[idx]] ? marks[idx] : 'normal')
  const description =
    `${title}: ` +
    (values.length === 0
      ? 'kosong.'
      : values
        .map((v, idx) => {
          const s = statusOf(idx)
          return `posisi ${idx} bernilai ${v}${s === 'normal' ? '' : `, ${STATUS[s].label}`}`
        })
        .join('; ') + '.')

  return (
    <div className="mt-3 rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <p className="text-sm font-semibold">{title}</p>
      <div role="img" aria-label={description} className="mt-2 flex min-h-12 flex-wrap items-center gap-2">
        {values.length === 0 ? (
          <span className="text-sm text-stone-700">kosong</span>
        ) : (
          values.map((v, idx) => {
            const s = statusOf(idx)
            return (
              <span
                key={idx}
                className="flex h-12 min-w-12 items-center justify-center rounded border-2 border-stone-800 px-1"
                style={{ background: STATUS[s].fill }}
              >
                {/* Angka diberi alas putih agar tetap terbaca di atas pola */}
                <span className="rounded bg-white px-1.5 font-bold">
                  {v}
                  {STATUS[s].glyph && <span className="ml-1 text-sm">{STATUS[s].glyph}</span>}
                </span>
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}