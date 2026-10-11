/**
 * @typedef {{ text: string, correct: boolean }} QuizOption
 * @typedef {{ prompt: string, options: QuizOption[], explanation?: unknown }} QuizQuestion
 */

/** Apakah pilihan ke-`choice` benar? */
export function isCorrect(question, choice) {
  return choice !== null && choice !== undefined && Boolean(question.options[choice]?.correct)
}

/** Indeks jawaban benar (soal sah punya tepat satu), atau -1. */
export function correctIndex(question) {
  return question.options.findIndex((o) => o.correct)
}

/**
 * Kesalahan penulisan soal kuis, atau null bila sah: butuh teks, minimal 2 opsi, dan tepat satu opsi benar.
 * @param {QuizQuestion} q
 * @returns {string|null}
 */
export function quizProblem(q) {
  if (!q.prompt.trim()) return 'pertanyaan tanpa teks'
  if (q.options.length < 2) return 'minimal 2 pilihan jawaban'
  const correct = q.options.filter((o) => o.correct).length
  if (correct === 0) return 'belum ada jawaban benar (tandai satu dengan [x])'
  if (correct > 1) return 'jawaban benar lebih dari satu (hanya boleh satu [x])'
  if (q.options.some((o) => !o.text.trim())) return 'ada pilihan jawaban yang kosong'
  return null
}

/** Memecah teks pendek menjadi bagian biasa dan bagian `kode` (diapit backtick), untuk ditampilkan tanpa Markdown penuh. */
export function splitInlineCode(text) {
  const parts = []
  const re = /`([^`]+)`/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ code: false, text: text.slice(last, m.index) })
    parts.push({ code: true, text: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ code: false, text: text.slice(last) })
  return parts
}
