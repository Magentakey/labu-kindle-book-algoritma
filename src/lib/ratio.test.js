import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GROWTH, GROWTH_KEYS, formatGrowth } from './growth.js'
import { parseRatioArgs, ratioFormula, ratioRows, ratioSummary, ratioValue, validateRatioInput } from './ratio.js'
import { checkMarkdown } from './checkMarkdown.js'
import { splitContent } from './splitContent.js'

const close = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${msg}: ${a} bukan ${b}`)

test('rasio n = 5 menjadi n = 25 sama dengan tabel di materi 3', () => {
  const expected = { '1': 1, 'log n': 2, n: 5, 'n log n': 10, 'n^2': 25, 'n^3': 125, '2^n': 2 ** 20 }
  for (const [key, want] of Object.entries(expected)) close(ratioValue(key, 5, 25), want, key)
  // 25 · 24 · … · 6, dihitung langsung
  let product = 1
  for (let k = 6; k <= 25; k++) product *= k
  close(ratioValue('n!', 5, 25), product, 'n!')
  assert.equal(formatGrowth(ratioValue('n!', 5, 25)), '1,29 × 10²³')
  assert.equal(formatGrowth(ratioValue('2^n', 5, 25)), '1.048.576')
})

test('rasio n = 4 menjadi n = 1024 sama dengan contoh soal materi 3', () => {
  close(ratioValue('n log n', 4, 1024), 1280, 'algoritma A')
  close(ratioValue('n^2', 4, 1024), 65536, 'algoritma B')
  // bagian b: komputer 20 kali lebih cepat
  close(65536 / 20, 3276.8, 'B di komputer cepat')
  assert.ok(3276.8 > 1280, 'A tetap lebih cepat')
  // dan seandainya hanya 2 kali lebih cepat, kesimpulannya sama
  assert.ok(65536 / 2 > 1280)
})

test('rasio cocok dengan f(n2)/f(n1) langsung untuk banyak pasangan n (pembanding independen)', () => {
  for (let n1 = 2; n1 <= 40; n1 += 3) {
    for (let n2 = n1 + 1; n2 <= 60; n2 += 7) {
      for (const key of GROWTH_KEYS) {
        const direct = GROWTH[key].f(n2) / GROWTH[key].f(n1)
        close(ratioValue(key, n1, n2), direct, `${key} ${n1}→${n2}`)
      }
    }
  }
})

test('2ⁿ tidak meluap untuk n akhir 1024, dan n! dibatasi sampai 170', () => {
  assert.ok(Number.isFinite(ratioValue('2^n', 4, 1024)))
  assert.ok(Number.isFinite(ratioValue('n!', 1, 170)))
  assert.equal(ratioValue('n!', 5, 171), null)
})

test('lg 1 = 0: rasio logaritma dan n lg n dari n awal 1 tidak terdefinisi, kelas lain tetap dihitung', () => {
  assert.equal(ratioValue('log n', 1, 8), null)
  assert.equal(ratioValue('n log n', 1, 8), null)
  assert.match(ratioFormula('log n', 1, 8), /tidak terdefinisi/)
  assert.equal(ratioValue('n', 1, 8), 8)
  const rows = ratioRows(['log n', 'n'], 1, 8)
  assert.equal(rows[0].text, '–')
  assert.equal(rows[1].text, '8')
})

test('rumus tertulis mengikuti penurunan di materi', () => {
  assert.equal(ratioFormula('1', 5, 25), 'f(25) / f(5) = c / c = 1')
  assert.equal(ratioFormula('log n', 5, 25), 'f(25) / f(5) = lg 25 / lg 5 = lg 5² / lg 5 = 2 lg 5 / lg 5 = 2')
  assert.equal(ratioFormula('n^2', 5, 25), 'f(25) / f(5) = 5² = 25')
  assert.equal(ratioFormula('n^3', 5, 25), 'f(25) / f(5) = 5³ = 125')
  assert.match(ratioFormula('n log n', 5, 25), /50 \/ 5$/)
  assert.equal(ratioFormula('2^n', 5, 25), 'f(25) / f(5) = 2^(25 − 5) = 2²⁰')
  assert.match(ratioFormula('n!', 5, 25), /25 · 24 · 23 · … · 6$/)
  assert.match(ratioFormula('n log n', 4, 1024), /1024 · 5 lg 4 \/ \(4 lg 4\)/)
  // rasio tak bulat: tidak ada pangkat dua yang dipaksakan
  assert.equal(ratioFormula('n^2', 4, 10), 'f(10) / f(4) = (10/4)²')
})

test('validasi masukan n awal dan n akhir', () => {
  assert.equal(validateRatioInput(5, 25), null)
  assert.equal(validateRatioInput(1, 1024), null)
  assert.match(validateRatioInput(NaN, 25), /bilangan bulat/)
  assert.match(validateRatioInput(2.5, 25), /bilangan bulat/)
  assert.match(validateRatioInput(0, 25), /minimal 1/)
  assert.match(validateRatioInput(5, 1025), /maksimal 1024/)
  assert.match(validateRatioInput(25, 25), /lebih besar/)
  assert.match(validateRatioInput(25, 5), /lebih besar/)
})

test('ringkasan menyebut rasio terkecil dan terbesar', () => {
  const rows = ratioRows(GROWTH_KEYS, 5, 25)
  const text = ratioSummary(rows, 5, 25)
  assert.match(text, /rasio terkecil dimiliki O\(1\) \(1\)/)
  assert.match(text, /terbesar dimiliki O\(n!\)/)
  assert.equal(ratioSummary(ratioRows(['n'], 5, 25), 5, 25), '')
})

test('argumen penanda: kunci dan n opsional, galat dilaporkan', () => {
  assert.deepEqual(parseRatioArgs(''), { keys: null, n1: 5, n2: 25, bad: null })
  assert.deepEqual(parseRatioArgs('n log n, n^2 ; 4, 1024'), { keys: ['n log n', 'n^2'], n1: 4, n2: 1024, bad: null })
  assert.deepEqual(parseRatioArgs('; 3, 9'), { keys: null, n1: 3, n2: 9, bad: null })
  assert.match(parseRatioArgs('n ; 4').bad, /dua bilangan bulat/)
  assert.match(parseRatioArgs('n ; a, b').bad, /dua bilangan bulat/)
  assert.match(parseRatioArgs('n ; 9, 3').bad, /lebih besar/)
})

test('::ratio diurai oleh splitContent dan diperiksa oleh checkMarkdown', () => {
  assert.deepEqual(splitContent('::ratio'), [{ type: 'ratio', keys: null, n1: 5, n2: 25 }])
  assert.deepEqual(splitContent('::ratio n, n^2 ; 4, 16'), [{ type: 'ratio', keys: ['n', 'n^2'], n1: 4, n2: 16 }])
  const inTabs = splitContent(':::tabs T\n::tab A\n::ratio\n::tab B\nb\n:::')
  assert.equal(inTabs[0].items[0].segments[0].type, 'ratio')

  const rules = (md) => checkMarkdown(md).filter((i) => i.severity === 'error').map((i) => i.rule)
  assert.deepEqual(rules('::ratio'), [])
  assert.deepEqual(rules('::ratio n, n^2 ; 4, 1024'), [])
  assert.ok(rules('::ratio n^9').includes('ratio-unknown'))
  assert.ok(rules('::ratio n ; 9, 3').includes('ratio-n'))
  assert.ok(rules('::ratio n ; 5').includes('ratio-n'))
})
