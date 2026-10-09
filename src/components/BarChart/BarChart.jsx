import { STATUS } from './statuses.js'

const MIN_PX = 16
const MAX_PX = 120

// Tinggi bar bersifat relatif (nilai terkecil = MIN_PX, terbesar = MAX_PX), bukan skala dari nol,
// agar angka 0 dan negatif tetap terlihat.
function barHeight(value, min, max) {
  if (max === min) return (MIN_PX + MAX_PX) / 2
  return MIN_PX + ((value - min) / (max - min)) * (MAX_PX - MIN_PX)
}

function Swatch({ status }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-5 w-5 shrink-0 rounded-sm border-2 border-stone-800"
      style={{ background: STATUS[status].fill }}
    />
  )
}

/**
 * @param {Object} props
 * @param {number[]} props.values            nilai tiap batang
 * @param {string[]} [props.marks]           status tiap batang (kunci pada STATUS), default semua 'normal'
 * @param {number|null} [props.held]         nilai key yang dipegang di luar array; `undefined` = tanpa slot key
 * @param {number} [props.min]               batas bawah skala (beri nilai tetap agar tinggi bar tidak melompat antar langkah)
 * @param {number} [props.max]               batas atas skala
 * @param {string} [props.label]             awalan deskripsi untuk pembaca layar
 * @param {string[]} [props.legend]          status yang ditampilkan di keterangan
 */
export default function BarChart({
  values,
  marks = [],
  held,
  min,
  max,
  label = 'Diagram batang',
  legend = Object.keys(STATUS),
}) {
  const all = held == null ? values : [...values, held]
  const lo = min ?? Math.min(...all)
  const hi = max ?? Math.max(...all)
  const statusOf = (idx) => (STATUS[marks[idx]] ? marks[idx] : 'normal')

  const description =
    `${label}, ${values.length} batang. ` +
    (values.length === 0 ? 'Array kosong. ' : '') +
    values
      .map((v, idx) => {
        const s = statusOf(idx)
        return `Indeks ${idx} bernilai ${v}${s === 'normal' ? '' : `, ${STATUS[s].label}`}.`
      })
      .join(' ') +
    (held == null ? '' : ` Key yang sedang dipegang bernilai ${held}.`)

  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <div role="img" aria-label={description} className="flex items-end">
        {held !== undefined && (
          <div className="mr-3 flex w-12 shrink-0 flex-col items-center border-r-2 border-dashed border-stone-500 pr-3">
            <div className="h-[168px] flex flex-col items-center justify-end">
              {held !== null && (
                <>
                  <span className="text-sm font-bold">{held}</span>
                  <div
                    className="w-full border-2 border-stone-800"
                    style={{ height: barHeight(held, lo, hi), background: STATUS.key.fill }}
                  />
                </>
              )}
            </div>
            <span className="mt-1 text-xs font-semibold">key</span>
            <span className="h-5 text-sm font-bold">{held !== null ? 'K' : ''}</span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-end gap-1 sm:gap-2">
          {values.map((v, idx) => {
            const s = statusOf(idx)
            return (
              <div key={idx} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex h-[168px] w-full flex-col items-center justify-end">
                  <span className="text-sm font-bold">{v}</span>
                  <div
                    className="w-full border-2 border-stone-800 transition-[height] duration-300 motion-reduce:transition-none"
                    style={{ height: barHeight(v, lo, hi), background: STATUS[s].fill }}
                  />
                </div>
                <span className="mt-1 text-xs text-stone-700">{idx}</span>
                <span className="h-5 text-sm font-bold">{STATUS[s].glyph}</span>
              </div>
            )
          })}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-300 pt-3 text-sm">
        {legend
          .filter((s) => STATUS[s])
          .map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <Swatch status={s} />
              {STATUS[s].glyph && <span aria-hidden="true" className="font-bold">{STATUS[s].glyph}</span>}
              <span>{STATUS[s].label}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}