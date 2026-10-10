import { useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import BarChart from '../BarChart/BarChart.jsx'
import { ListPanel } from '../StepPanels/StepPanels.jsx'
import StepControls, { buttonClass, secondaryButtonClass } from '../StepControls/StepControls.jsx'
import { useStepPlayer } from '../StepControls/useStepPlayer.js'

/**
 * Visualizer pencarian pada array terurut (binary search): kode + diagram batang + kontrol langkah.
 * Masukannya dua isian: array dan nilai yang dicari.
 * @param {Object} props
 * @param {string} props.code
 * @param {string} props.codeLabel
 * @param {string} props.chartLabel
 * @param {any} props.initialInput
 * @param {(arrayText: string, xText: string) => { ok: true, value: any } | { ok: false, error: string }} props.parseInput
 * @param {(value: any) => { array: string, x: string }} props.formatInput
 * @param {Array<{ label: string, value: any }>} [props.presets]
 * @param {() => any} [props.randomInput]
 * @param {(input: any) => Array<{ line: number, note: string, view: any }>} props.buildSteps
 * @param {string[]} [props.legend]
 * @param {string} props.inputHint
 */
export default function SearchVisualizer({
  code,
  codeLabel,
  chartLabel,
  initialInput,
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
  const [fields, setFields] = useState(() => formatInput(initialInput))
  const [error, setError] = useState('')

  const steps = useMemo(() => buildSteps(input), [buildSteps, input])
  const player = useStepPlayer(steps)
  const step = steps[player.index]
  const { values } = step.view
  const lo = Math.min(...values)
  const hi = Math.max(...values)

  function applyInput(value) {
    setInput(value)
    setFields(formatInput(value))
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
    const result = parseInput(fields.array, fields.x)
    if (!result.ok) {
      setError(result.error)
      return
    }
    applyInput(result.value)
  }

  const arrayId = `${uid}-array`
  const xId = `${uid}-x`
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 lg:order-2">
          <BarChart values={values} marks={step.view.marks} min={lo} max={hi} label={chartLabel} legend={legend} />
          {step.view.panels.map((p, i) => (
            <ListPanel key={i} {...p} />
          ))}
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
          <label htmlFor={arrayId} className="mt-2 block font-medium">
            Array (terurut naik)
          </label>
          <input
            id={arrayId}
            type="text"
            value={fields.array}
            onChange={(e) => setFields({ ...fields, array: e.target.value })}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className="mt-1 min-h-12 w-full rounded-lg border-2 border-stone-900 bg-white px-3 text-base"
          />
          <label htmlFor={xId} className="mt-3 block font-medium">
            Nilai yang dicari (x)
          </label>
          <input
            id={xId}
            type="text"
            inputMode="numeric"
            value={fields.x}
            onChange={(e) => setFields({ ...fields, x: e.target.value })}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className="mt-1 min-h-12 w-40 rounded-lg border-2 border-stone-900 bg-white px-3 text-base"
          />
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
