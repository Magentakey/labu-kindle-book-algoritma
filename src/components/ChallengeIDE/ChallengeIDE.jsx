import { useEffect, useId, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { indentLess, indentMore } from '@codemirror/commands'
import { editorTheme } from './editorTheme.js'
import { createTabKeys } from './tabKeys.js'
import SolutionPanel from './SolutionPanel.jsx'
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

const smallButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-3 text-sm font-semibold ' +
  'hover:bg-orange-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

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
 * @param {{ id: string, title: string, description: string, starterCode: string, solution?: string, testCases: Array<{ input: unknown[], expected: unknown }> }} props.challenge
 * @param {typeof runInWorker} [props.run]  pelaksana kode (bawaan: Web Worker; diganti saat tes)
 * @param {ReturnType<typeof import('../../lib/storage.js').createProgress>} [props.progress]  penyimpanan progres (diganti saat tes)
 */
export default function ChallengeIDE({ challenge, run = runInWorker, progress = defaultProgress }) {
  const uid = useId()
  const labelId = `${uid}-label`
  const helpId = `${uid}-help`
  const solutionId = `${uid}-jawaban`
  const viewRef = useRef(null)
  const [showSolution, setShowSolution] = useState(false)
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
      // Tanpa pembungkus baris: baris panjang digeser ke samping supaya bentuk kode (indentasi) tetap utuh.
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

  // Tombol indentasi untuk layar sentuh (keyboard HP tidak punya Tab).
  function indent(more, event) {
    const view = viewRef.current
    if (!view) return
    ;(more ? indentMore : indentLess)(view)
    // Sentuhan: kembalikan fokus ke editor agar keyboard HP tetap terbuka.
    // Keyboard (detail 0): biarkan fokus di tombol agar pengguna tidak berpindah tempat.
    if (event.detail !== 0) view.focus()
  }

  function copySolution() {
    const ok = !changed || code === challenge.solution || window.confirm('Ganti kode di editor dengan jawaban contoh? Kode Anda saat ini akan hilang.')
    if (!ok) return
    setCode(challenge.solution)
    setMessage('Jawaban contoh disalin ke editor.')
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
      <div role="group" aria-label="Indentasi" className="mt-1 flex flex-wrap gap-2">
        {/* onMouseDown dicegah supaya sentuhan di tombol tidak menutup keyboard HP */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => indent(false, e)} className={smallButtonClass}>
          <span aria-hidden="true">← </span>Kurangi indentasi
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => indent(true, e)} className={smallButtonClass}>
          Tambah indentasi<span aria-hidden="true"> →</span>
        </button>
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border-2 border-stone-900 bg-white">
        <CodeMirror
          onCreateEditor={(view) => {
            viewRef.current = view
          }}
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
        Baris baru otomatis mengikuti indentasi baris sebelumnya. Di layar sentuh, pakai tombol Tambah dan Kurangi
        indentasi di atas editor. Di keyboard, Tab memindahkan fokus keluar dari editor; geser indentasi dengan Ctrl+] dan
        Ctrl+[ (di Mac pakai Cmd). Baris yang panjang tidak dipotong: geser editor ke samping untuk melihatnya.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleRun} aria-disabled={running} className={buttonClass}>
          {running ? 'Menjalankan…' : 'Jalankan kode'}
        </button>
        <button type="button" onClick={reset} aria-disabled={!changed} className={secondaryButtonClass}>
          Kembalikan kode awal
        </button>
        {challenge.solution && (
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            aria-expanded={showSolution}
            aria-controls={solutionId}
            className={secondaryButtonClass}
          >
            {showSolution ? 'Sembunyikan jawaban contoh' : 'Lihat jawaban contoh'}
          </button>
        )}
      </div>

      {showSolution && challenge.solution && <SolutionPanel id={solutionId} code={challenge.solution} onCopy={copySolution} />}

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
