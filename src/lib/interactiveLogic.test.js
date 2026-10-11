import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_GROWTH_KEYS, GROWTH, GROWTH_KEYS, barPercent, formatGrowth, growthValue } from './growth.js'
import { swipeDirection } from './swipe.js'
import { correctIndex, isCorrect, quizProblem, splitInlineCode } from './quiz.js'

test('growth: nilai fungsi untuk n = 10 dan n = 1', () => {
  assert.equal(growthValue('1', 10), 1)
  assert.ok(Math.abs(growthValue('log n', 8) - 3) < 1e-9)
  assert.equal(growthValue('n', 10), 10)
  assert.ok(Math.abs(growthValue('n log n', 8) - 24) < 1e-9)
  assert.equal(growthValue('n^2', 10), 100)
  assert.equal(growthValue('n^3', 10), 1000)
  assert.equal(growthValue('2^n', 10), 1024)
  assert.equal(growthValue('n!', 5), 120)
  assert.equal(growthValue('n!', 1), 1)
  assert.equal(growthValue('log n', 1), 0)
})

test('growth: untuk n besar urutan laju sesuai teori (n = 20)', () => {
  const values = DEFAULT_GROWTH_KEYS.map((k) => growthValue(k, 20))
  for (let i = 1; i < values.length; i++) assert.ok(values[i] > values[i - 1], `${DEFAULT_GROWTH_KEYS[i]} harus lebih besar dari ${DEFAULT_GROWTH_KEYS[i - 1]}`)
})

test('growth: n! sampai n = 30 tetap terhingga dan kunci bawaan semuanya terdaftar', () => {
  assert.ok(Number.isFinite(growthValue('n!', 30)))
  for (const k of DEFAULT_GROWTH_KEYS) assert.ok(GROWTH[k], k)
  assert.deepEqual([...GROWTH_KEYS].sort(), [...DEFAULT_GROWTH_KEYS].sort())
  for (const k of GROWTH_KEYS) assert.ok(GROWTH[k].notation && GROWTH[k].name && GROWTH[k].example, k)
})

test('formatGrowth: kecil, desimal, ribuan, dan sangat besar dengan pangkat', () => {
  assert.equal(formatGrowth(0), '0')
  assert.equal(formatGrowth(1024), '1.024')
  assert.equal(formatGrowth(33.219), '33,2')
  assert.equal(formatGrowth(1e9), '1 × 10⁹')
  assert.equal(formatGrowth(2.6525e32), '2,65 × 10³²')
  assert.equal(formatGrowth(Infinity), 'sangat besar')
})

test('barPercent: skala logaritma, minimal 2 persen, maksimum 100 persen', () => {
  assert.equal(barPercent(0, 1e6), 2)
  assert.equal(barPercent(1e6, 1e6), 100)
  assert.ok(barPercent(1000, 1e6) < barPercent(1e5, 1e6))
  assert.equal(barPercent(5, 0), 0)
})

test('swipeDirection: ambang, arah, dan geseran vertikal diabaikan', () => {
  assert.equal(swipeDirection(-80, 5), 1)
  assert.equal(swipeDirection(80, -5), -1)
  assert.equal(swipeDirection(30, 0), 0, 'terlalu pendek')
  assert.equal(swipeDirection(-80, 70), 0, 'lebih vertikal')
  assert.equal(swipeDirection(-80, 40), 1)
  assert.equal(swipeDirection(0, 0), 0)
})

test('quiz: isCorrect, correctIndex, dan quizProblem', () => {
  const q = { prompt: 'Apa?', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] }
  assert.equal(isCorrect(q, 1), true)
  assert.equal(isCorrect(q, 0), false)
  assert.equal(isCorrect(q, null), false)
  assert.equal(isCorrect(q, 9), false)
  assert.equal(correctIndex(q), 1)
  assert.equal(quizProblem(q), null)
  assert.match(quizProblem({ ...q, prompt: ' ' }), /tanpa teks/)
  assert.match(quizProblem({ prompt: 'x', options: [{ text: 'a', correct: true }] }), /minimal 2/)
  assert.match(quizProblem({ prompt: 'x', options: [{ text: 'a', correct: false }, { text: 'b', correct: false }] }), /belum ada jawaban benar/)
  assert.match(quizProblem({ prompt: 'x', options: [{ text: 'a', correct: true }, { text: 'b', correct: true }] }), /lebih dari satu/)
  assert.match(quizProblem({ prompt: 'x', options: [{ text: 'a', correct: true }, { text: ' ', correct: false }] }), /kosong/)
})

test('splitInlineCode: bagian biasa dan kode berselang-seling', () => {
  assert.deepEqual(splitInlineCode('tanpa kode'), [{ code: false, text: 'tanpa kode' }])
  assert.deepEqual(splitInlineCode('jika `max < bil2` maka `x`'), [
    { code: false, text: 'jika ' },
    { code: true, text: 'max < bil2' },
    { code: false, text: ' maka ' },
    { code: true, text: 'x' },
  ])
  assert.deepEqual(splitInlineCode('`a`'), [{ code: true, text: 'a' }])
})
