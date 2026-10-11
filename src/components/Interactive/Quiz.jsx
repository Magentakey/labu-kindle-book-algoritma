import { useId, useState } from 'react'
import { isCorrect } from '../../lib/quiz.js'
import InlineText from './InlineText.jsx'
import { primaryButton } from './styles.js'

function Question({ q, number, total, onResult }) {
  const name = useId()
  const [choice, setChoice] = useState(null)
  const [checked, setChecked] = useState(false)
  const [hint, setHint] = useState('')
  const right = checked && isCorrect(q, choice)

  function check() {
    if (choice === null) {
      setHint('Pilih satu jawaban dulu.')
      return
    }
    setHint('')
    setChecked(true)
    onResult(number - 1, isCorrect(q, choice))
  }

  return (
    <fieldset className="rounded-xl border-2 border-stone-900 bg-white p-4">
      <legend className="px-1 font-semibold">
        Pertanyaan {number} dari {total}: <InlineText text={q.prompt} />
      </legend>
      <div className="mt-1 space-y-2">
        {q.options.map((o, i) => (
          <label
            key={i}
            className={
              'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2 ' +
              (choice === i ? 'border-stone-900 bg-orange-100' : 'border-stone-400 hover:bg-orange-50') +
              ' has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stone-900'
            }
          >
            <input
              type="radio"
              name={name}
              checked={choice === i}
              onChange={() => {
                setChoice(i)
                setChecked(false)
                setHint('')
                onResult(number - 1, null)
              }}
              className="size-5 shrink-0 accent-stone-900"
            />
            <span>
              <InlineText text={o.text} />
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3">
        <button type="button" onClick={check} className={primaryButton}>
          Periksa jawaban
        </button>
      </div>
      <div role="status" className="mt-3">
        {hint && <p className="font-medium">{hint}</p>}
        {checked && (
          <div className={'rounded-lg border-2 border-stone-900 p-3 ' + (right ? 'bg-emerald-100' : 'bg-orange-100')}>
            <p className="font-bold">
              <span aria-hidden="true">{right ? '✓ ' : '✗ '}</span>
              {right ? 'Benar.' : 'Belum tepat. Pilih jawaban lain, lalu periksa lagi.'}
            </p>
            {q.explanation && <div className="mt-1">{q.explanation}</div>}
          </div>
        )}
      </div>
    </fieldset>
  )
}

/**
 * Kuis pilihan ganda: periksa per pertanyaan, penjelasan muncul sesudahnya, dan ringkasan jumlah yang benar.
 * Status benar/salah selalu berupa teks dan simbol, tidak hanya warna.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {Array<{ prompt: string, options: Array<{ text: string, correct: boolean }>, explanation?: import('react').ReactNode }>} props.questions
 */
export default function Quiz({ title = 'Cek pemahaman', questions }) {
  const [results, setResults] = useState(() => questions.map(() => null))
  const answered = results.filter((r) => r !== null).length
  const correct = results.filter((r) => r === true).length

  function onResult(index, value) {
    setResults((prev) => prev.map((r, i) => (i === index ? value : r)))
  }

  return (
    <section aria-label={title} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p className="text-lg font-semibold">{title}</p>
      <div className="mt-3 space-y-4">
        {questions.map((q, i) => (
          <Question key={i} q={q} number={i + 1} total={questions.length} onResult={onResult} />
        ))}
      </div>
      <p role="status" className="mt-3 min-h-6 font-semibold">
        {answered > 0 ? `Terjawab benar: ${correct} dari ${questions.length} pertanyaan.` : ''}
      </p>
    </section>
  )
}
