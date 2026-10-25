import { cx } from '../ui/cx.js'

const CELL = {
  filled: 'bg-card text-ink',
  empty: 'bg-panel text-ink-soft',
  current: 'border-brand-orange bg-orange-soft text-ink font-semibold',
  source: 'border-brand-blue bg-info-bg text-ink',
  path: 'border-ok bg-ok-bg text-ink font-semibold',
  unused: 'bg-panel text-ink-soft',
}
const CELL_TEXT = { current: 'sedang dihitung', source: 'sel sumber', path: 'jalur terbaik', unused: 'tidak dipilih' }

/**
 * Tabel DP (Matrix-Chain dan LCS): sel terisi, sel yang sedang dihitung (oranye), sel sumber (biru), dan jalur terbaik (mint).
 * Barisan masukan (mis. p pada Matrix-Chain) ditampilkan sebagai deretan kotak di atas tabel.
 */
export default function TableStage({ step }) {
  const tables = step.tables ?? []
  return (
    <div className="space-y-4">
      {step.array && (
        <div>
          <p className="text-caption mb-1 text-ink-soft">{step.array.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {step.array.values.map((v, i) => (
              <span key={i} className={cx('text-code rounded-sm border px-2 py-0.5', step.array.marks[i] === 'factor' ? 'border-brand-yellow-strong bg-surface font-bold text-ink' : 'border-line bg-card text-ink')}>
                <span className="text-ink-soft mr-1 text-[11px]">{i + step.array.indexBase}</span>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
      {tables.length === 0 && <p className="text-body rounded-sm border border-dashed border-line bg-panel p-4 text-ink-soft">Tabel belum dibuat pada langkah ini.</p>}
      {tables.map(({ table }) => (
        <div key={table.caption} className="overflow-x-auto">
          <table className="border-separate border-spacing-1 text-center">
            <caption className="text-caption pb-2 text-left text-ink-soft">{table.caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-caption px-2 font-normal text-ink-soft">{table.corner}</th>
                {table.colHeaders.map((h) => (
                  <th key={h} scope="col" className="text-code-bold px-2 text-heading">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rowHeaders.map((rh, i) => (
                <tr key={rh}>
                  <th scope="row" className="text-code-bold px-2 text-left whitespace-nowrap text-heading">{rh}</th>
                  {table.cells[i].map((c, j) => (
                    <td key={j} className={cx('h-11 min-w-12 rounded-sm border border-line px-1.5 align-middle', CELL[c.mark] ?? CELL.empty)}>
                      <span className="text-code block leading-tight">{c.text}</span>
                      {c.sub && <span className="text-ink-soft block text-[10px] leading-none">{c.sub}</span>}
                      {CELL_TEXT[c.mark] && <span className="sr-only"> ({CELL_TEXT[c.mark]})</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
