import { splitInlineCode } from '../../lib/quiz.js'

/** Teks pendek dengan `kode` di antara backtick (tanpa Markdown lain). */
export default function InlineText({ text }) {
  return splitInlineCode(text).map((part, i) =>
    part.code ? (
      <code key={i} className="rounded bg-orange-200 px-1.5 py-0.5 font-mono text-[0.9em] break-words">
        {part.text}
      </code>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  )
}
