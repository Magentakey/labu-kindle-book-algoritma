import { useEffect, useId, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { editorTheme } from './editorTheme.js'
import { createTabKeys } from './tabKeys.js'
import TestPanel from './TestPanel.jsx'
import { describeOutcome } from '../../lib/describeOutcome.js'
import { createDebouncedSaver } from '../../lib/debouncedSaver.js'
import { findSyntaxLine } from '../../lib/findSyntaxLine.js'
import { progress as defaultProgress } from '../../lib/storage.js'
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
 * @param {ReturnType<typeof import('../../lib/storage.js').createProgress>} [props.progress]  penyimpanan progres (diganti saat tes)
 */
export default function ChallengeIDE({ challenge, run = runInWorker, progress = defaultProgress }) {
  const uid = useId()
  const labelId = `${uid}-label`
  const helpId = `${uid}-help`
  // Kode terakhir dipulihkan sekali saat soal dibuka.
  const [saved] = useState(() => progress.loadCode(challenge.id))
  const restored = saved !== null && saved !== challenge.starterCode
  const [code, setCode] = useState(restored ? saved : challenge.starterCode)
  const [solved, setSolved] = useState(() => progress.isSolved(challenge.id))
  const [tabIndent, setTabIndent] = useState(false)
  const [message, setMessage] = useState('')
  const [persistent] = useState(() => progress.persistent())
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null) // { outcome, code, no } dari Jalankan terakhir
  const runId = useRef(0)
  const [tabKeys] = useState(createTabKeys)

  const changed = code !== challenge.starterCode

  // Simpan otomatis setelah berhenti mengetik, dan segera saat tab disembunyikan, ditutup, atau halaman diganti.
  const saver = useMemo(
    () =>
      createDebouncedSaver((value) => {
        if (value === challenge.starterCode) progress.clearCode(challenge.id)
        else progress.saveCode(challenge.id, value)
      }),
    [challenge.id, challenge.starterCode, progress],
  )
  useEffect(() => {
    saver.schedule(code)
  }, [saver, code])
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') saver.flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', saver.flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', saver.flush)
      saver.flush()
    }
  }, [saver])

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
    const line = outcome.status === 'error' && outcome.kind === 'syntax' ? findSyntaxLine(code) : null
    setRunning(false)
    setResult({ outcome, code, no: id })
    let text = describeOutcome(outcome, { line })
    if (outcome.status === 'done' && outcome.results.every((r) => r.pass)) {
      if (progress.markSolved(challenge.id)) text += ' Soal ini ditandai selesai.'
      setSolved(true)
    }
    setMessage(text)
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
      {solved && (
        <p className="mt-1 inline-block rounded-full bg-stone-900 px-3 py-0.5 text-sm font-semibold text-orange-50">
          <span aria-hidden="true">✓ </span>Soal ini sudah selesai
        </p>
      )}
      <p className="mt-1 max-w-3xl whitespace-pre-line">{challenge.description}</p>

      {restored && <p className="mt-3 text-sm">Kode terakhir Anda dipulihkan.</p>}
      {!persistent && (
        <p className="mt-3 max-w-3xl rounded-md border-2 border-stone-900 bg-orange-100 px-3 py-2 text-sm">
          Browser ini tidak mengizinkan penyimpanan. Kode dan progres Anda hanya tersimpan selama halaman ini terbuka.
        </p>
      )}

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

      {result?.outcome.status === 'done' && (
        <TestPanel results={result.outcome.results} runNo={result.no} stale={result.code !== code} />
      )}
    </div>
  )
}
