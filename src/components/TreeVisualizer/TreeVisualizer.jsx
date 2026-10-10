import { useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import TreeCanvas from '../TreeCanvas/TreeCanvas.jsx'
import StepControls, { buttonClass, secondaryButtonClass } from '../StepControls/StepControls.jsx'
import { useStepPlayer } from '../StepControls/useStepPlayer.js'

function ListPanel({ title, items, empty }) {
  const uid = useId()
  return (
    <section aria-labelledby={uid} className="mt-3 rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <p id={uid} className="text-sm font-semibold">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-stone-700">{empty || 'kosong'}</p>
      ) : (
        // Tailwind menghapus penanda daftar; role="list" menjaga semantik daftar di Safari/VoiceOver.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ol role="list" className="mt-2 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex min-h-10 min-w-10 items-center justify-center rounded border-2 border-stone-800 bg-orange-50 px-2 font-bold"
            >
              {item}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function TablePanel({ caption, headers, rows, activeRow }) {
  return (
    <div
      // Tabel yang lebar bisa digeser, jadi areanya harus bisa difokus keyboard (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white text-stone-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
    >
      <table className="w-full border-collapse text-sm">
        <caption className="p-3 text-left font-semibold">{caption}</caption>
        <thead>
          <tr className="border-y-2 border-stone-900 bg-orange-100">
            {headers.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={r}
              aria-current={r === activeRow ? 'true' : undefined}
              className={'border-b border-stone-300 ' + (r === activeRow ? 'bg-orange-100 font-semibold' : '')}
            >
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-3 py-2 text-left font-semibold">
                    {r === activeRow && <span aria-hidden="true">▶ </span>}
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="px-3 py-2">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Visualizer algoritma berbentuk pohon: kode + gambar pohon + kontrol langkah.
 * Algoritma menyediakan `buildSteps(input)` yang mengembalikan langkah-langkah berisi
 * `{ line, note, view: { nodes, panels, labels } }`.
 * @param {Object} props
 * @param {string} props.code
 * @param {string} props.codeLabel
 * @param {string} props.canvasLabel
 * @param {any} props.initialInput
 * @param {(text: string) => { ok: true, value: any } | { ok: false, error: string }} props.parseInput
 * @param {(value: any) => string} props.formatInput
 * @param {Array<{ label: string, value: any }>} [props.presets]
 * @param {(input: any) => Array<{ line: number|null, note: string, view: any }>} props.buildSteps
 * @param {string[]} [props.legend]
 * @param {string} props.inputLabel
 * @param {string} props.inputHint
 */
export default function TreeVisualizer({
  code,
  codeLabel,
  canvasLabel,
  initialInput,
  parseInput,
  formatInput,
  presets = [],
  buildSteps,
  legend,
  inputLabel,
  inputHint,
}) {
  const uid = useId()
  const [input, setInput] = useState(initialInput)
  const [text, setText] = useState(() => formatInput(initialInput))
  const [error, setError] = useState('')

  const steps = useMemo(() => buildSteps(input), [buildSteps, input])
  const player = useStepPlayer(steps)
  const step = steps[player.index]

  function applyInput(value) {
    setInput(value)
    setText(formatInput(value))
    setError('')
    player.reset(`Masukan baru diterapkan, ${buildSteps(value).length} langkah.`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = parseInput(text)
    if (!result.ok) {
      setError(result.error)
      return
    }
    applyInput(result.value)
  }

  const inputId = `${uid}-input`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`

  return (
    <div className="mt-2">
      <StepControls player={player} />

      <div
        // Saat putar otomatis, penjelasan tiap langkah tidak diumumkan (terlalu cepat dan saling memotong).
        aria-live={player.running ? 'off' : 'polite'}
        aria-atomic="true"
        className="mt-2 rounded-xl border-2 border-stone-900 bg-orange-100 p-3"
      >
        <p className="font-semibold">
          Langkah {player.index + 1} dari {player.total}
        </p>
        <p className="mt-1">{step.note}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="min-w-0 lg:order-2">
          <TreeCanvas nodes={step.view.nodes} labels={step.view.labels} legend={legend} label={canvasLabel} />
          {step.view.panels.map((p, i) =>
            p.type === 'table' ? <TablePanel key={i} {...p} /> : <ListPanel key={i} {...p} />,
          )}
        </div>
        <div className="min-w-0 lg:order-1">
          <CodeBlock code={code} highlightLine={step.line} label={codeLabel} />
        </div>
      </div>

      <details className="mt-4 rounded-xl border-2 border-stone-900 bg-white p-3">
        <summary className="cursor-pointer font-semibold">Ubah masukan</summary>
        <form onSubmit={handleSubmit} noValidate className="mt-3">
          <label htmlFor={inputId} className="block font-medium">
            {inputLabel}
          </label>
          <p id={hintId} className="text-sm text-stone-700">
            {inputHint}
          </p>
          <input
            id={inputId}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            className="mt-1 min-h-12 w-full rounded-lg border-2 border-stone-900 bg-white px-3 text-base"
          />
          {error && (
            <p id={errorId} role="alert" className="mt-1 font-medium text-red-800">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className={buttonClass}>
              Terapkan
            </button>
          </div>
        </form>

        {presets.length > 0 && (
          <div role="group" aria-label="Contoh masukan" className="mt-4 border-t border-stone-300 pt-3">
            <p className="font-medium">Atau pilih contoh:</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {presets.map((p) => (
                <button key={p.label} type="button" onClick={() => applyInput(p.value)} className={secondaryButtonClass}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </details>
    </div>
  )
}
