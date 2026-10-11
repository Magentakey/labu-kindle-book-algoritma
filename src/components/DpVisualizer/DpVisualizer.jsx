import { useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import DpTable from '../DpTable/DpTable.jsx'
import { ListPanel, TablePanel } from '../StepPanels/StepPanels.jsx'
import StepControls, { buttonClass, secondaryButtonClass } from '../StepControls/StepControls.jsx'
import { useStepPlayer } from '../StepControls/useStepPlayer.js'

/**
 * Visualizer tabel Dynamic Programming: kode + tabel + kontrol langkah.
 * Masukannya satu atau lebih isian teks (`fields`), mis. dua string untuk LCS.
 * @param {Object} props
 * @param {string} props.code
 * @param {string} props.codeLabel
 * @param {any} props.initialInput
 * @param {Array<{ key: string, label: string }>} props.fields
 * @param {(fields: Record<string,string>) => { ok: true, value: any } | { ok: false, error: string }} props.parseInput
 * @param {(value: any) => Record<string,string>} props.formatInput
 * @param {Array<{ label: string, value: any }>} [props.presets]
 * @param {() => any} [props.randomInput]
 * @param {(input: any) => Array<{ line: number|null, note: string, view: any }>} props.buildSteps
 * @param {string[]} [props.legend]
 * @param {string} props.inputHint
 */
export default function DpVisualizer({
  code,
  codeLabel,
  initialInput,
  fields,
  parseInput,
  formatInput,
  presets = [],
  randomInput,
  buildSteps,
  legend,
  inputHint,
}) {
  const uid = useId()
  const [input, setInput] = useState(initialInput)
  const [values, setValues] = useState(() => formatInput(initialInput))
  const [error, setError] = useState('')

  const steps = useMemo(() => buildSteps(input), [buildSteps, input])
  const player = useStepPlayer(steps)
  const step = steps[player.index]

  function applyInput(value) {
    setInput(value)
    setValues(formatInput(value))
    setError('')
    player.reset(`Masukan baru diterapkan, ${buildSteps(value).length} langkah.`)
  }

  function applyRandom() {
    let value = randomInput()
    const same = (v) => JSON.stringify(v) === JSON.stringify(input)
    for (let i = 0; i < 5 && same(value); i++) value = randomInput()
    applyInput(value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = parseInput(values)
    if (!result.ok) {
      setError(result.error)
      return
    }
    applyInput(result.value)
  }

  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`
  const describedBy = error ? `${hintId} ${errorId}` : hintId

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
          <DpTable table={step.view.table} labels={step.view.labels} legend={legend} />
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
          <p id={hintId} className="text-sm text-stone-700">
            {inputHint}
          </p>
          {fields.map((f) => (
            <div key={f.key} className="mt-3">
              <label htmlFor={`${uid}-${f.key}`} className="block font-medium">
                {f.label}
              </label>
              <input
                id={`${uid}-${f.key}`}
                type="text"
                value={values[f.key] ?? ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                className="mt-1 min-h-12 w-full rounded-lg border-2 border-stone-900 bg-white px-3 text-base"
              />
            </div>
          ))}
          {error && (
            <p id={errorId} role="alert" className="mt-2 font-medium text-red-800">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className={buttonClass}>
              Terapkan
            </button>
            {randomInput && (
              <button type="button" onClick={applyRandom} className={secondaryButtonClass}>
                Acak
              </button>
            )}
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
