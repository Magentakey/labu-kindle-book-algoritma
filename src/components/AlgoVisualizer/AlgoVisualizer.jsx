import { useEffect, useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import BarChart from '../BarChart/BarChart.jsx'
import AuxRow from './AuxRow.jsx'
import { parseArrayInput, randomArray, MAX_LENGTH, MIN_VALUE, MAX_VALUE } from '../../lib/parseArray.js'

// Tombol memakai aria-disabled (bukan disabled) agar fokus keyboard tidak hilang
// saat tombol mencapai ujung langkah.
const buttonClass =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl px-4 font-semibold ' +
  'bg-stone-900 text-orange-50 hover:bg-stone-700 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-stone-300 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-300 ' +
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

const secondaryButtonClass =
  'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-4 font-semibold ' +
  'hover:bg-orange-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

// Jeda antar langkah saat putar otomatis (milidetik).
const SPEEDS = [
  { key: 'slow', label: 'Lambat', ms: 1600 },
  { key: 'normal', label: 'Normal', ms: 900 },
  { key: 'fast', label: 'Cepat', ms: 400 },
]

/**
 * Visualizer algoritma generik: kode + diagram batang + kontrol langkah.
 * @param {Object} props
 * @param {string} props.code
 * @param {string} props.codeLabel
 * @param {string} props.chartLabel
 * @param {number[]} props.initialArray
 * @param {(arr: number[]) => Array<{ line: number, note: string }>} props.buildSteps
 * @param {(step: any) => { values: number[], marks: string[], held?: number|null }} props.toView
 * @param {string[]} [props.legend]
 */
export default function AlgoVisualizer({ code, codeLabel, chartLabel, initialArray, buildSteps, toView, legend }) {
  const uid = useId()
  const [array, setArray] = useState(initialArray)
  const [no, setNo] = useState(0)
  const [text, setText] = useState(initialArray.join(', '))
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const [pauseNote, setPauseNote] = useState('')

  const steps = useMemo(() => buildSteps(array), [buildSteps, array])
  const last = steps.length - 1
  const step = steps[Math.min(no, last)]
  const view = toView(step)
  const lo = Math.min(...array)
  const hi = Math.max(...array)

  const go = (n) => setNo(Math.min(Math.max(n, 0), last))
  const atStart = no <= 0
  const atEnd = no >= last
  // `playing` = niat pengguna; `running` = benar-benar sedang berjalan (berhenti sendiri di langkah terakhir).
  const running = playing && !atEnd
  const delay = SPEEDS.find((x) => x.key === speed).ms

  useEffect(() => {
    if (!running) return
    const timer = setTimeout(() => setNo((n) => Math.min(n + 1, last)), delay)
    return () => clearTimeout(timer)
  }, [running, no, delay, last])

  // Navigasi manual selalu menghentikan putar otomatis.
  function jump(n) {
    setPlaying(false)
    setPauseNote('')
    go(n)
  }

  function togglePlay() {
    if (running) {
      setPlaying(false)
      setPauseNote(`Dijeda di langkah ${no + 1} dari ${steps.length}. ${step.note}`)
      return
    }
    if (atEnd) setNo(0)
    setPauseNote('')
    setPlaying(true)
  }

  let status = pauseNote
  if (running) status = 'Putar otomatis berjalan.'
  else if (playing && atEnd) status = 'Putar otomatis selesai di langkah terakhir.'

  function replaceArray(values) {
    setArray(values)
    setText(values.join(', '))
    setNo(0)
    setError('')
    setPlaying(false)
    setPauseNote('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = parseArrayInput(text)
    if (!result.ok) {
      setError(result.error)
      return
    }
    replaceArray(result.values)
  }

  const inputId = `${uid}-array`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`

  return (
    <div className="mt-2">
      <div role="group" aria-label="Kontrol langkah" className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-disabled={atStart}
          onClick={() => !atStart && jump(no - 1)}
          className={buttonClass}
        >
          ← Sebelumnya
        </button>
        <button
          type="button"
          aria-disabled={atEnd}
          onClick={() => !atEnd && jump(no + 1)}
          className={buttonClass}
        >
          Berikutnya →
        </button>
        <button type="button" onClick={() => jump(0)} className={secondaryButtonClass}>
          Ulangi dari awal
        </button>
        <button type="button" onClick={togglePlay} className={secondaryButtonClass}>
          {running ? (
            <>
              <span aria-hidden="true">⏸&nbsp;</span>Jeda
            </>
          ) : (
            <>
              <span aria-hidden="true">▶&nbsp;</span>Putar otomatis
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <label htmlFor={`${uid}-speed`} className="font-medium">
            Kecepatan
          </label>
          <select
            id={`${uid}-speed`}
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="min-h-12 rounded-xl border-2 border-stone-900 bg-white px-3 text-base"
          >
            {SPEEDS.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`${uid}-slider`} className="sr-only">
          Pilih langkah
        </label>
        <input
          id={`${uid}-slider`}
          type="range"
          min={0}
          max={last}
          value={Math.min(no, last)}
          aria-valuetext={`Langkah ${Math.min(no, last) + 1} dari ${steps.length}`}
          onChange={(e) => jump(Number(e.target.value))}
          className="h-8 w-full accent-stone-900"
        />
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>

      <div
        // Saat putar otomatis, penjelasan tiap langkah tidak diumumkan (terlalu cepat dan saling memotong).
        // Pembaca layar mendapat status singkat di atas; saat dijeda, status memuat nomor langkah dan penjelasannya.
        aria-live={running ? 'off' : 'polite'}
        aria-atomic="true"
        className="mt-2 rounded-xl border-2 border-stone-900 bg-orange-100 p-3"
      >
        <p className="font-semibold">
          Langkah {Math.min(no, last) + 1} dari {steps.length}
        </p>
        <p className="mt-1">{step.note}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="lg:order-2">
          <BarChart
            values={view.values}
            marks={view.marks}
            held={view.held}
            min={lo}
            max={hi}
            label={chartLabel}
            legend={legend}
          />
          {view.aux && <AuxRow title={view.aux.title} values={view.aux.values} marks={view.aux.marks} />}
        </div>
        <div className="min-w-0 lg:order-1">
          <CodeBlock code={code} highlightLine={step.line} label={codeLabel} />
        </div>
      </div>

      <details className="mt-4 rounded-xl border-2 border-stone-900 bg-white p-3">
        <summary className="cursor-pointer font-semibold">Ubah array awal</summary>
        <form onSubmit={handleSubmit} noValidate className="mt-3">
          <label htmlFor={inputId} className="block font-medium">
            Array awal
          </label>
          <p id={hintId} className="text-sm text-stone-700">
            Angka bulat dipisah koma, 1 sampai {MAX_LENGTH} angka, rentang {MIN_VALUE} sampai {MAX_VALUE}.
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
            <button type="button" onClick={() => replaceArray(randomArray())} className={secondaryButtonClass}>
              Acak
            </button>
          </div>
        </form>
      </details>
    </div>
  )
}