import { useId, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { editorTheme } from './editorTheme.js'
import { createTabKeys } from './tabKeys.js'
import { describeOutcome } from '../../lib/describeOutcome.js'
import { runInWorker } from '../../lib/runnerClient.js'

const buttonClass =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl px-4 font-semibold ' +
  'bg-stone-900 text-orange-50 hover:bg-stone-700 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-stone-300 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-300 ' +
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

const secondaryButtonClass =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-4 font-semibold ' +
  'hover:bg-orange-100 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:border-stone-400 aria-disabled:bg-stone-100 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-100 ' +
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

// Tanpa bawaan CodeMirror yang bising untuk pembaca layar (autocompletion) atau tidak dipakai (lipat kode).
const basicSetup = {
  foldGutter: false,
  autocompletion: false,
  highlightActiveLine: true,
  highlightActiveLineGutter: true,
}

/**
 * Editor soal challenge: CodeMirror yang aksesibel + tombol Jalankan dan Kembalikan.
 *
 * @param {Object} props
 * @param {{ id: string, title: string, description: string, starterCode: string, testCases: Array<{ input: unknown[], expected: unknown }> }} props.challenge
 * @param {typeof runInWorker} [props.run]  pelaksana kode (bawaan: Web Worker; diganti saat tes)
 */
export default function ChallengeIDE({ challenge, run = runInWorker }) {
  const uid = useId()
  const labelId = `${uid}-label`
  const helpId = `${uid}-help`
  const [code, setCode] = useState(challenge.starterCode)
  const [tabIndent, setTabIndent] = useState(false)
  const [message, setMessage] = useState('')
  const [running, setRunning] = useState(false)
  const runId = useRef(0)
  const [tabKeys] = useState(createTabKeys)

  const changed = code !== challenge.starterCode

  const extensions = useMemo(
    () => [
      javascript(),
      ...editorTheme,
      EditorView.lineWrapping, // teks tidak meluber di HP atau zoom 200% (WCAG 1.4.10)
      EditorView.contentAttributes.of({ 'aria-labelledby': labelId, 'aria-describedby': helpId }),
      ...(tabIndent ? [tabKeys.extension] : []),
    ],
    [labelId, helpId, tabIndent, tabKeys],
  )

  async function handleRun() {
    if (running) return // aria-disabled: tombol tetap bisa difokus, tetapi tidak berbuat apa-apa
    const id = ++runId.current
    setRunning(true)
    setMessage('Menjalankan kode…')
    const outcome = await run(code, challenge.testCases)
    if (id !== runId.current) return
    setRunning(false)
    setMessage(describeOutcome(outcome))
  }

  function reset() {
    if (!changed) return // aria-disabled: tombol tetap bisa difokus, tetapi tidak berbuat apa-apa
    if (!window.confirm('Kembalikan kode awal? Kode yang sudah Anda tulis akan hilang.')) return
    setCode(challenge.starterCode)
    setMessage('Kode dikembalikan ke kode awal.')
  }

  return (
    <div className="mt-2">
      <h3 className="text-lg font-semibold">{challenge.title}</h3>
      <p className="mt-1 max-w-3xl whitespace-pre-line">{challenge.description}</p>

      <p id={labelId} className="mt-4 font-semibold">
        Kode Anda (JavaScript)
      </p>
      <div className="mt-1 overflow-hidden rounded-xl border-2 border-stone-900 bg-white">
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={extensions}
          theme="none"
          basicSetup={basicSetup}
          indentWithTab={false}
          minHeight="14rem"
          maxHeight="28rem"
        />
      </div>

      <p id={helpId} className="mt-2 max-w-3xl text-sm">
        Tombol Tab memindahkan fokus keluar dari editor. Geser indentasi baris dengan Ctrl+] (ke kanan) dan Ctrl+[ (ke
        kiri); di Mac pakai Cmd.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleRun} aria-disabled={running} className={buttonClass}>
          {running ? 'Menjalankan…' : 'Jalankan kode'}
        </button>
        <button type="button" onClick={reset} aria-disabled={!changed} className={secondaryButtonClass}>
          Kembalikan kode awal
        </button>
      </div>

      <label className="mt-4 flex min-h-6 max-w-3xl items-start gap-3">
        <input
          type="checkbox"
          checked={tabIndent}
          onChange={(e) => setTabIndent(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-stone-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        />
        <span>
          Tab untuk indentasi
          <span className="block text-sm">Jika aktif, tekan Esc lalu Tab untuk keluar dari editor.</span>
        </span>
      </label>

      <p role="status" className="mt-3 min-h-6">
        {message}
      </p>
    </div>
  )
}
