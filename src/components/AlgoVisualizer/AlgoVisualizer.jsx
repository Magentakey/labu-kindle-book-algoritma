import { useEffect, useId, useMemo, useState } from 'react'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import BarChart from '../BarChart/BarChart.jsx'
import AuxRow from './AuxRow.jsx'
import ExecTable from './ExecTable.jsx'
import { buildCountRows, countLinesUpTo } from '../../lib/lineCounts.js'
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
 * @param {(arr: number[]) => Array<{ line: number, note: string }>} [props.buildExactSteps]  mode Tepat: satu langkah = satu eksekusi baris
 * @param {(step: any) => { values: number[], marks: string[], held?: number|null }} [props.toExactView]
 * @param {number[]} [props.exactLines]   nomor baris yang bisa dieksekusi (untuk tabel hitungan)
 * @param {string[]} [props.exactLegend]  legenda untuk mode Tepat (bawaan: legend)
 */
export default function AlgoVisualizer({
  code,
  codeLabel,
  chartLabel,
  initialArray,
  buildSteps,
  toView,
  legend,
  buildExactSteps,
  toExactView,
  exactLines,
  exactLegend,
}) {
  const uid = useId()
  const [array, setArray] = useState(initialArray)
  const [no, setNo] = useState(0)
  const [text, setText] = useState(initialArray.join(', '))
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const [pauseNote, setPauseNote] = useState('')

  const hasExact = Boolean(buildExactSteps && toExactView && exactLines)
  const [mode, setMode] = useState('summary') // 'summary' (Ringkas) | 'exact' (Tepat)
  const exact = hasExact && mode === 'exact'

  const steps = useMemo(() => (exact ? buildExactSteps(array) : buildSteps(array)), [exact, buildExactSteps, buildSteps, array])
  const last = steps.length - 1
  const step = steps[Math.min(no, last)]
  const view = (exact ? toExactView : toView)(step)
  const counts = useMemo(() => (exact ? countLinesUpTo(steps, Math.min(no, last)) : null), [exact, steps, no, last])
  const lineCounts = exact ? Object.fromEntries(exactLines.map((l) => [l, counts[l] ?? 0])) : null
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

  function changeMode(next) {
    const builder = next === 'exact' ? buildExactSteps : buildSteps
    setMode(next)
    setNo(0)
    setPlaying(false)
    setPauseNote(`Mode ${next === 'exact' ? 'Tepat (per baris kode)' : 'Ringkas (per bagian visual)'} aktif, ${builder(array).length} langkah.`)
  }

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
      {hasExact && (
        <fieldset className="mb-4">
          <legend className="font-semibold">Mode langkah</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {[
              { key: 'summary', title: 'Ringkas', desc: 'per bagian visual' },
              { key: 'exact', title: 'Tepat', desc: 'per baris kode, dengan hitungan eksekusi' },
            ].map((m) => (
              <label
                key={m.key}
                className={
                  'flex min-h-12 cursor-pointer flex-wrap items-center gap-x-2 rounded-xl border-2 border-stone-900 px-3 py-2 ' +
                  'has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stone-900 ' +
                  (mode === m.key ? 'bg-stone-900 text-orange-50' : 'bg-white hover:bg-orange-100')
                }
              >
                <input
                  type="radio"
                  name={`${uid}-mode`}
                  value={m.key}
                  checked={mode === m.key}
                  onChange={() => changeMode(m.key)}
                  className="size-5 shrink-0 accent-orange-500"
                />
                <span className="font-semibold">{m.title}</span>
                <span className="text-sm">{m.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

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
        {exact && (
          <p className="mt-1 text-sm">
            Baris {step.line} sudah dieksekusi {counts[step.line]} kali. Total {Math.min(no, last) + 1} dari {steps.length} eksekusi baris.
          </p>
        )}
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
            legend={exact ? (exactLegend ?? legend) : legend}
          />
          {view.aux && <AuxRow title={view.aux.title} values={view.aux.values} marks={view.aux.marks} />}
        </div>
        <div className="min-w-0 lg:order-1">
          <CodeBlock code={code} highlightLine={step.line} label={codeLabel} lineCounts={lineCounts} />
        </div>
      </div>

      {exact && (
        <ExecTable
          rows={buildCountRows(code, exactLines, counts)}
          activeLine={step.line}
          current={Math.min(no, last) + 1}
          total={steps.length}
        />
      )}

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