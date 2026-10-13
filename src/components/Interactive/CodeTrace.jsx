import { useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import { runTrace } from '../../algorithms/traces.js'
import DpTable from '../DpTable/DpTable.jsx'
import IndexedArray from './IndexedArray.jsx'
import TraceCostTable from './TraceCostTable.jsx'
import { focusRing, primaryButton, secondaryButton } from './styles.js'

/**
 * Peraga penelusuran pseudocode: pengguna mengisi masukan, lalu menjalankan algoritma baris demi baris
 * sambil melihat nilai variabel (dan array atau tumpukan panggilan bila ada).
 * Bentuk datanya ada di algorithms/traces.js, jadi peraga baru cukup menambah satu entri di sana.
 *
 * @param {{ def: import('../../algorithms/traces.js').TraceDef }} props
 */
export default function CodeTrace({ def }) {
  const uid = useId()
  const initial = useMemo(() => Object.fromEntries(def.inputs.map((i) => [i.key, i.value])), [def])
  const [texts, setTexts] = useState(initial)
  const [steps, setSteps] = useState(() => runTrace(def, initial).steps ?? [])
  const [no, setNo] = useState(0)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  const last = steps.length - 1
  const step = steps[Math.min(no, last)]
  const prev = no > 0 ? steps[no - 1] : null
  const atStart = no <= 0
  const atEnd = no >= last

  function apply(nextTexts, message) {
    const r = runTrace(def, nextTexts)
    if (!r.ok) {
      setError(r.error)
      setNote('')
      return
    }
    setError('')
    setSteps(r.steps)
    setNo(0)
    setNote(message)
  }

  const go = (n) => {
    setNote('')
    setNo(Math.min(Math.max(n, 0), last))
  }

  return (
    <section aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-white p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Peraga: <span className="font-mono text-base">{def.title}</span>
      </p>
      <p className="mt-1 text-sm">{def.intro}</p>

      <div role="group" aria-label="Masukan algoritma" className="mt-3 flex flex-wrap items-end gap-3">
        {def.inputs.map((input) => (
          <div key={input.key}>
            <label htmlFor={`${uid}-${input.key}`} className="block text-sm font-semibold">
              {input.label}
            </label>
            <input
              id={`${uid}-${input.key}`}
              type="text"
              inputMode="text"
              autoComplete="off"
              value={texts[input.key]}
              onChange={(e) => setTexts((t) => ({ ...t, [input.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') apply(texts, 'Dijalankan dengan masukan baru.')
              }}
              aria-describedby={error ? `${uid}-error` : undefined}
              className={`mt-1 min-h-12 rounded-xl border-2 border-stone-900 bg-white px-3 ${input.kind === 'array' ? 'w-56' : 'w-24'} ${focusRing}`}
            />
          </div>
        ))}
        <button type="button" onClick={() => apply(texts, 'Dijalankan dengan masukan baru.')} className={primaryButton}>
          Jalankan
        </button>
        <button
          type="button"
          onClick={() => {
            setTexts(initial)
            apply(initial, 'Masukan dikembalikan ke nilai contoh.')
          }}
          className={secondaryButton}
        >
          Nilai contoh
        </button>
      </div>
      {def.presets && (
        <div role="group" aria-label="Contoh masukan siap pakai" className="mt-3 flex flex-wrap gap-2">
          {def.presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                const next = { ...texts, ...p.values }
                setTexts(next)
                apply(next, `Dijalankan dengan contoh: ${p.label}.`)
              }}
              className={secondaryButton}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p id={`${uid}-error`} role="alert" className="mt-2 font-medium">
          {error}
        </p>
      )}

      {step && (
        <>
          <div role="group" aria-label="Kontrol langkah" className="mt-4 flex flex-wrap gap-3">
            <button type="button" aria-disabled={atStart} onClick={() => !atStart && go(no - 1)} className={secondaryButton}>
              Sebelumnya
            </button>
            <button type="button" aria-disabled={atEnd} onClick={() => !atEnd && go(no + 1)} className={primaryButton}>
              Berikutnya
            </button>
            <button type="button" aria-disabled={atStart} onClick={() => !atStart && go(0)} className={secondaryButton}>
              Ulangi
            </button>
          </div>

          <div role="status" aria-live="polite" className="mt-3 rounded-xl border-2 border-stone-900 bg-orange-100 p-3">
            <p className="font-semibold">
              Langkah {Math.min(no, last) + 1} dari {steps.length}
            </p>
            <p className="mt-1">{step.note}</p>
            {note && <p className="mt-1 text-sm">{note}</p>}
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <CodeBlock code={def.code} language="text" highlightLine={step.line} label={def.codeLabel} />
            </div>
            <div className="min-w-0 space-y-4">
              {step.array && (
                <IndexedArray
                  title={step.array.title}
                  values={step.array.values}
                  marks={step.array.marks}
                  indexBase={step.array.indexBase}
                  legend={def.legend}
                />
              )}

              <table className="w-full border-collapse text-left text-sm">
                <caption className="mb-1 text-left font-semibold">Nilai variabel</caption>
                <thead>
                  <tr className="border-b-2 border-stone-900">
                    <th scope="col" className="px-2 py-1">Variabel</th>
                    <th scope="col" className="px-2 py-1">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {step.vars.map((v, i) => {
                    const changed = prev && prev.vars[i]?.value !== v.value
                    return (
                      <tr key={v.name} className={'border-b border-stone-300 ' + (changed ? 'bg-orange-100 font-bold' : '')}>
                        <th scope="row" className="px-2 py-1 font-mono font-semibold">{v.name}</th>
                        <td className="px-2 py-1 tabular-nums">
                          {v.value}
                          {changed && <span className="sr-only"> (berubah)</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {step.stack && (
                <div>
                  <p className="font-semibold">Tumpukan panggilan</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-6 font-mono text-sm">
                    {step.stack.map((s, i) => (
                      <li key={i} className={i === step.stack.length - 1 ? 'font-bold' : ''}>
                        {s}
                        {i === step.stack.length - 1 && <span className="sr-only"> (panggilan yang sedang berjalan)</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {step.tables && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {step.tables.map((t) => (
                <div key={t.table.caption} className="min-w-0">
                  <DpTable table={t.table} labels={t.labels} legend={t.legend} />
                </div>
              ))}
            </div>
          )}

          {def.cost && step.counts && (
            <div className="mt-4">
              <TraceCostTable code={def.code} cost={def.cost} counts={step.counts} activeLine={step.line} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
