import { STATUS } from '../BarChart/statuses.js'

/**
 * Array berindeks (indeks pertama bisa 1, seperti di materi) dengan status tiap sel.
 * Status ditandai dengan pola dan simbol, tidak hanya warna, dan dijelaskan ke pembaca layar.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {number[]} props.values
 * @param {string[]} props.marks  kunci STATUS per sel
 * @param {number} [props.indexBase]
 * @param {string[]} [props.legend]
 */
export default function IndexedArray({ title, values, marks, indexBase = 1, legend = [] }) {
  const description = values
    .map((v, i) => {
      const m = marks[i]
      return `indeks ${i + indexBase} bernilai ${v}${m && m !== 'normal' ? `, ${STATUS[m].label}` : ''}`
    })
    .join('; ')

  return (
    <div>
      <p className="font-semibold">{title}</p>
      <div role="img" aria-label={`${title}: ${description}`} className="mt-1 flex flex-wrap gap-1">
        {values.map((v, i) => {
          const st = STATUS[marks[i] ?? 'normal']
          return (
            <div key={i} aria-hidden="true" className="flex flex-col items-center">
              <span className="text-xs tabular-nums">{i + indexBase}</span>
              <span
                className="grid size-12 place-items-center rounded-md border-2 border-stone-900 font-bold tabular-nums"
                style={{ background: st.fill }}
              >
                <span className="rounded bg-white/90 px-1">{v}</span>
              </span>
              <span className="h-4 text-xs leading-4">{marks[i] && marks[i] !== 'normal' ? st.glyph : ''}</span>
            </div>
          )
        })}
      </div>
      {legend.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {legend.map((k) => (
            <li key={k} className="flex items-center gap-1">
              <span aria-hidden="true" className="inline-block size-4 rounded border border-stone-900" style={{ background: STATUS[k].fill }} />
              <span aria-hidden="true">{STATUS[k].glyph}</span>
              <span>{STATUS[k].label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
