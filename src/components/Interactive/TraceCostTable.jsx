import { useId } from 'react'

/**
 * Tabel "cost dan jumlah operasi" untuk peraga pseudocode, seperti tabel analisis running time di materi:
 * rumus jumlah operasi tiap baris, dan berapa kali baris itu sudah terbaca sampai langkah ini.
 *
 * @param {Object} props
 * @param {string} props.code  pseudocode yang sama dengan yang tampil di CodeBlock
 * @param {{ formulaLabel: string, note: string, rows: Array<{ line: number, cost: string, formula: string }> }} props.cost
 * @param {Record<number, number>} props.counts  hitungan per baris sampai langkah ini
 * @param {number} props.activeLine  baris yang baru dibaca
 */
export default function TraceCostTable({ code, cost, counts, activeLine }) {
  const titleId = `${useId()}-judul`
  const lines = code.split('\n')
  const total = cost.rows.reduce((sum, r) => sum + (counts[r.line] ?? 0), 0)

  return (
    // role="group", bukan <section>: tiap peraga punya tabel ini, dan section bernama akan menjadi landmark kembar (axe landmark-unique).
    <div role="group" aria-labelledby={titleId} className="rounded-xl border-2 border-stone-900 bg-white p-3">
      <h3 id={titleId} className="font-semibold">
        Cost dan jumlah operasi tiap baris
      </h3>
      <p className="mt-1 text-sm">{cost.note}</p>
      <div
        // Area geser harus bisa difokus keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="group"
        aria-label="Tabel cost dan jumlah operasi (bisa digeser)"
        className="mt-2 overflow-x-auto focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <caption className="sr-only">
            Cost, rumus jumlah operasi, dan berapa kali setiap baris pseudocode sudah dibaca sampai langkah ini
          </caption>
          <thead>
            <tr className="border-b-2 border-stone-900 text-left">
              <th scope="col" className="px-2 py-1">Baris</th>
              <th scope="col" className="px-2 py-1">Pseudocode</th>
              <th scope="col" className="px-2 py-1">Cost</th>
              <th scope="col" className="px-2 py-1">{cost.formulaLabel}</th>
              <th scope="col" className="px-2 py-1 text-right">Terbaca sejauh ini</th>
            </tr>
          </thead>
          <tbody>
            {cost.rows.map((r) => {
              const active = r.line === activeLine
              return (
                <tr key={r.line} className={'border-b border-stone-300 ' + (active ? 'bg-orange-100 font-bold' : '')}>
                  <th scope="row" className="px-2 py-1 text-left font-semibold">
                    {r.line}
                    {active && <span className="sr-only"> (baris yang baru dibaca)</span>}
                  </th>
                  <td className="px-2 py-1">
                    <code className="whitespace-pre font-mono">{lines[r.line - 1]}</code>
                  </td>
                  <td className="px-2 py-1">{r.cost}</td>
                  <td className="px-2 py-1">{r.formula}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{counts[r.line] ?? 0} kali</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-900 font-semibold">
              <th scope="row" colSpan={4} className="px-2 py-1 text-left">
                Total pembacaan baris sampai langkah ini
              </th>
              <td className="px-2 py-1 text-right tabular-nums">{total} kali</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
