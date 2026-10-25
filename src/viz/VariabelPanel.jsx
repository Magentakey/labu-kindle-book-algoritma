import { cx } from '../ui/cx.js'

const DASH = '–'
const BOX = {
  path: 'border-brand-yellow-strong bg-surface',
  current: 'border-brand-orange bg-orange-soft',
  source: 'border-brand-blue bg-info-bg',
  black: 'border-ok bg-ok-bg',
  gray: 'border-brand-yellow-strong bg-surface',
  unused: 'border-line bg-panel text-ink-soft',
  empty: 'border-line bg-card',
}
const ROW_TEXT = { path: 'text-ok-text', unused: 'text-ink-soft', current: 'text-heading font-semibold', source: 'text-control', empty: 'text-ink' }

/** Tabel utama langkah (nilai tiap simpul) sebagai deretan kotak, seperti "dist[]" di desain. */
function Boxes({ table }) {
  return (
    <div role="group" aria-label={table.caption} className="flex gap-2 overflow-x-auto pb-1">
      {table.rowHeaders.map((h, i) => {
        const cells = table.cells[i]
        const mark = cells[0].mark
        return (
          <div key={h} className={cx('flex min-w-14 shrink-0 flex-col items-center rounded-sm border px-2 py-1.5 text-center', BOX[mark] ?? BOX.empty)}>
            <span className="text-caption text-ink-soft">{h}</span>
            {cells.map((c, k) =>
              c.text === '' ? null : (
                <span key={k} className={cx(k === 0 ? 'text-code-bold text-ink' : 'text-caption text-ink-soft')} title={table.colHeaders[k]}>
                  {k === 0 ? c.text : `${table.colHeaders[k]} ${c.text}`}
                </span>
              ),
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Tabel tambahan (mis. hasil kondisi tiap sisi) sebagai daftar ringkas. */
function Rows({ table }) {
  return (
    <div>
      <p className="text-caption mb-1 text-ink-soft">{table.caption}</p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-0.5">
        {table.rowHeaders.map((h, i) => {
          const cells = table.cells[i]
          return (
            <li key={h} className={cx('text-code flex justify-between gap-2 text-[12px]', ROW_TEXT[cells[0].mark] ?? ROW_TEXT.empty)}>
              <span>{h}</span>
              <span>{cells.map((c) => c.text).filter(Boolean).join(' · ') || '·'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Panel Variabel (Figma: VARIABEL): nilai variabel di baris yang berjalan, tabel nilai simpul, dan himpunan seperti Q dan S.
 * Isinya langsung dari data langkah peraga.
 */
export default function VariabelPanel({ step, hideTables = false }) {
  const vars = step.vars.filter((v) => v.value !== DASH)
  const tables = hideTables ? [] : (step.tables ?? [])
  return (
    <div className="space-y-3 border-t border-line px-4 py-4">
      <p className="text-label text-ink-soft uppercase">Variabel</p>
      {vars.length > 0 && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1">
          {vars.map((v) => (
            <div key={v.name} className="text-code flex gap-2">
              <dt className="font-bold text-heading">{v.name}</dt>
              <dd className="text-ink">{v.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {tables[0] && <Boxes table={tables[0].table} />}
      {tables.slice(1).map((t) => (
        <Rows key={t.table.caption} table={t.table} />
      ))}
      {step.stack && step.stack.length > 0 && (
        <div className="text-code">
          <span className="font-bold text-heading">Tumpukan pemanggilan</span>
          <ol className="mt-1 space-y-0.5 text-[12px] text-ink">
            {step.stack.map((c, i) => (
              <li key={i} className={cx('pl-3', i === step.stack.length - 1 && 'border-l-4 border-brand-orange bg-surface font-semibold')}>
                {c}
              </li>
            ))}
          </ol>
        </div>
      )}
      {(step.lists ?? []).map((l) => (
        <div key={l.title} className="text-code">
          <span className="font-bold text-heading">{l.title}</span>
          <span className="ml-3 text-ink">{l.items.length ? `{ ${l.items.join(', ')} }` : <span className="text-ink-soft">{l.empty ?? 'kosong'}</span>}</span>
        </div>
      ))}
    </div>
  )
}
