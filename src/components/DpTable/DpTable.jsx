import { useEffect, useRef } from 'react'
import { DP_STATUS } from './dpStatuses.js'

/**
 * Tabel DP berupa <table> sungguhan (judul kolom/baris terbaca pembaca layar). Tiap sel menampilkan isi,
 * teks kecil opsional, dan simbol status; status juga ditulis sebagai teks tersembunyi (sr-only) untuk pembaca layar.
 * @param {Object} props
 * @param {{ caption: string, corner: string, rowHeaders: string[], colHeaders: string[], cells: import('../../algorithms/dpCommon.js').DpCell[][] }} props.table
 * @param {Record<string, string>} [props.labels]  keterangan status khusus algoritma ini
 * @param {string[]} [props.legend]
 */
export default function DpTable({ table, labels = {}, legend = Object.keys(DP_STATUS) }) {
  const { caption, corner, rowHeaders, colHeaders, cells } = table
  const statusLabel = (key) => labels[key] ?? DP_STATUS[key]?.label ?? key

  // Pada layar sempit tabel bisa digeser: gulirkan ke sel yang sedang dihitung bila ia di luar layar.
  const scrollRef = useRef(null)
  useEffect(() => {
    const box = scrollRef.current
    const cell = box?.querySelector('[data-current="true"]')
    if (!box || !cell || box.scrollWidth <= box.clientWidth) return
    const boxRect = box.getBoundingClientRect()
    const cellRect = cell.getBoundingClientRect()
    const margin = 24
    if (cellRect.left < boxRect.left + margin || cellRect.right > boxRect.right - margin) {
      box.scrollLeft += cellRect.left + cellRect.width / 2 - (boxRect.left + boxRect.width / 2)
    }
  }, [table])

  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <div
        ref={scrollRef}
        // Tabel yang lebar bisa digeser, jadi areanya harus bisa difokus keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={`${caption}, area yang bisa digeser`}
        className="overflow-x-auto focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <table className="mx-auto border-separate border-spacing-1 text-center">
          <caption className="pb-2 text-left text-sm font-semibold">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="px-2 text-xs font-semibold text-stone-700">
                {corner}
              </th>
              {colHeaders.map((h, j) => (
                <th key={j} scope="col" className="min-w-12 whitespace-nowrap px-1 text-sm font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, i) => (
              <tr key={i}>
                <th scope="row" className="whitespace-nowrap px-2 text-left text-sm font-semibold">
                  {rowHeaders[i]}
                </th>
                {row.map((cell, j) => {
                  const key = DP_STATUS[cell.mark] ? cell.mark : 'empty'
                  const st = DP_STATUS[key]
                  const glyph = cell.glyph ?? st.glyph
                  return (
                    <td
                      key={j}
                      data-current={key === 'current' ? 'true' : undefined}
                      className="relative h-14 min-w-12 rounded border-2 border-stone-800 p-0.5"
                      style={{ background: st.fill }}
                    >
                      {cell.text !== '' && (
                        <span className="inline-block whitespace-nowrap rounded bg-white px-1.5 text-sm font-bold leading-5">
                          {cell.text}
                        </span>
                      )}
                      {cell.sub && (
                        <span className="block leading-4">
                          {/* Alas putih agar teks kecil tetap terbaca di atas pola isian */}
                          <span className="inline-block rounded bg-white px-1 text-xs font-medium">{cell.sub}</span>
                        </span>
                      )}
                      {glyph && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-stone-800 bg-white px-0.5 text-[11px] font-bold leading-none"
                        >
                          {glyph}
                        </span>
                      )}
                      <span className="sr-only">
                        {cell.text === '' ? 'kosong' : ''}
                        {cell.sub ? `, ${cell.sub}` : ''}, {statusLabel(key)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-300 pt-3 text-sm">
        {legend
          .filter((k) => DP_STATUS[k])
          .map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-5 w-5 shrink-0 rounded border-2 border-stone-800"
                style={{ background: DP_STATUS[k].fill }}
              />
              {DP_STATUS[k].glyph && (
                <span aria-hidden="true" className="font-bold">
                  {DP_STATUS[k].glyph}
                </span>
              )}
              <span>{statusLabel(k)}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}
