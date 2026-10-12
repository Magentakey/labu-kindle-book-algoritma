import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeBound, boundRow, boundRows, boundVerdict, formatPoly, parseBoundArgs, parseRational, BOUND_G_KEYS } from './boundCheck.js'
import { checkMarkdown } from './checkMarkdown.js'
import { splitContent } from './splitContent.js'

const fr = (text) => {
  const r = parseRational(text)
  return r ? Number(r.n) / Number(r.d) : null
}

// Pembanding independen dengan bilangan pecahan JavaScript (nilai kecil, tanpa pembulatan berbahaya).
function bruteN0(a, b, c, k, c1, c2, notation, limit = 3000) {
  const f = (n) => a * n * n + b * n + c
  const g = (n) => n ** k
  const ok = {
    Theta: (n) => c1 * g(n) <= f(n) && f(n) <= c2 * g(n),
    O: (n) => f(n) >= 0 && f(n) <= c1 * g(n),
    Omega: (n) => c1 * g(n) <= f(n),
  }[notation]
  let lastBad = 0
  for (let n = 1; n <= limit; n++) if (!ok(n)) lastBad = n
  return lastBad >= limit - 5 ? -1 : lastBad + 1
}

test('parseRational: bilangan bulat, pecahan, desimal, minus Unicode, dan penolakan', () => {
  assert.equal(fr('7'), 7)
  assert.equal(fr('-3'), -3)
  assert.equal(fr('−3'), -3)
  assert.equal(fr('3/4'), 0.75)
  assert.equal(fr('0,5'), 0.5)
  assert.equal(fr('0.25'), 0.25)
  for (const bad of ['', 'abc', '1/0', '1/', '1e3', '1234', '1,234', '2 3']) assert.equal(parseRational(bad), null, bad)
})

test('formatPoly menulis f(n) seperti di materi', () => {
  assert.equal(formatPoly([parseRational('1'), parseRational('-3'), parseRational('2')]), '2n² − 3n + 1')
  assert.equal(formatPoly([parseRational('0'), parseRational('-3'), parseRational('1/2')]), '1/2·n² − 3n')
  assert.equal(formatPoly([parseRational('-20'), parseRational('10'), parseRational('0')]), '10n − 20')
  assert.equal(formatPoly([parseRational('0'), parseRational('0'), parseRational('0')]), '0')
  assert.equal(formatPoly([parseRational('5'), parseRational('0'), parseRational('-1')]), '−n² + 5')
})

test('tiga contoh materi 4: n₀ = 2, 6, 3 dan nilai batas n → ∞', () => {
  const th = analyzeBound({ notation: 'Theta', coefs: ['2', '-3', '1'], g: 'n^2', consts: ['3/4', '2'] })
  assert.equal(th.n0, 2)
  assert.equal(th.limitText, '2')
  const o = analyzeBound({ notation: 'O', coefs: ['1/2', '-3', '0'], g: 'n^2', consts: ['1/2'] })
  assert.equal(o.n0, 6)
  assert.match(o.limitText, /^1\/2/)
  const om = analyzeBound({ notation: 'Omega', coefs: ['0', '10', '-20'], g: 'n', consts: ['10/3'] })
  assert.equal(om.n0, 3)
  assert.equal(om.limitText, '10')
})

test('soal challenge materi 4: f = 3n² + 10n + 5 dengan c₁ = 1, c₂ = 4 memberi n₀ = 11', () => {
  const r = analyzeBound({ notation: 'Theta', coefs: ['3', '10', '5'], g: 'n^2', consts: ['1', '4'] })
  assert.equal(r.n0, 11)
  assert.equal(analyzeBound({ notation: 'Theta', coefs: ['3', '10', '5'], g: 'n^2', consts: ['4', '5'] }).status, 'never')
  assert.equal(analyzeBound({ notation: 'Theta', coefs: ['3', '10', '5'], g: 'n^2', consts: ['1', '2'] }).status, 'never')
  assert.equal(analyzeBound({ notation: 'Theta', coefs: ['3', '0', '0'], g: 'n^2', consts: ['3', '3'] }).n0, 1)
  assert.equal(analyzeBound({ notation: 'Theta', coefs: ['3', '1', '0'], g: 'n^2', consts: ['3', '3'] }).status, 'never')
})

test('cocok dengan pembanding brute force pada 600 masukan acak', () => {
  let seed = 12345
  const rnd = (m) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % m
  }
  const notations = ['Theta', 'O', 'Omega']
  let compared = 0
  for (let i = 0; i < 600; i++) {
    const notation = notations[rnd(3)]
    const g = BOUND_G_KEYS[rnd(4)]
    const k = { '1': 0, n: 1, 'n^2': 2, 'n^3': 3 }[g]
    const [a, b, c] = [rnd(7) - 1, rnd(31) - 10, rnd(41) - 15]
    const c1 = rnd(8) + 1
    const c2 = c1 + rnd(5)
    const consts = notation === 'Theta' ? [String(c1), String(c2)] : [String(c1)]
    const r = analyzeBound({ notation, coefs: [String(a), String(b), String(c)], g, consts })
    assert.ok(!r.error, r.error)
    const want = bruteN0(a, b, c, k, c1, c2, notation)
    const got = r.status === 'never' ? -1 : r.n0
    assert.equal(got, want, `${notation} ${a}n²+${b}n+${c} g=${g} c=${consts} → ${got} vs ${want}`)
    compared++
  }
  assert.equal(compared, 600)
})

test('batas akar terlalu besar dilaporkan sebagai lebih dari batas pindai, bukan ditebak', () => {
  // n − 999 ≥ (98/99)·n  ⇔  n/99 ≥ 999  ⇔  n ≥ 98901 (masih di bawah batas pindai)
  const ok = analyzeBound({ notation: 'Omega', coefs: ['0', '1', '-999'], g: 'n', consts: ['98/99'] })
  assert.equal(ok.status, 'ok')
  assert.equal(ok.n0, 98901)
  assert.match(boundVerdict(ok), /n ≥ 98901/)
  // n/98 − 999 ≥ n/99 baru berlaku untuk n ≥ 999 · 98 · 99 = 9.691.... : di atas batas pindai
  const capped = analyzeBound({ notation: 'Omega', coefs: ['0', '1/98', '-999'], g: 'n', consts: ['1/99'] })
  assert.equal(capped.status, 'capped')
  assert.match(boundVerdict(capped), /lebih dari 100000/)
})

test('baris tabel: nilai f(n)/g(n) eksak dan tanda syarat', () => {
  const r = analyzeBound({ notation: 'Theta', coefs: ['2', '-3', '1'], g: 'n^2', consts: ['3/4', '2'] })
  const rows = boundRows(r)
  assert.equal(rows[0].h, '0')
  assert.equal(rows[0].holds, false)
  assert.equal(rows[1].h, '3/4 (≈ 0,75)')
  assert.equal(rows[1].holds, true)
  assert.equal(boundRow(r, 3).h, '10/9 (≈ 1,1111)')
  assert.equal(rows.length, 8)
  assert.match(boundVerdict(r), /n ≥ 2/)
})

test('galat masukan: pesan menyebut bagian yang salah', () => {
  const base = { notation: 'Theta', coefs: ['2', '-3', '1'], g: 'n^2', consts: ['3/4', '2'] }
  assert.match(analyzeBound({ ...base, coefs: ['x', '-3', '1'] }).error, /koefisien n²/)
  assert.match(analyzeBound({ ...base, coefs: ['2', '', '1'] }).error, /koefisien n\b/)
  assert.match(analyzeBound({ ...base, consts: ['0', '2'] }).error, /c₁ harus positif/)
  assert.match(analyzeBound({ ...base, consts: ['3/4', '-2'] }).error, /c₂ harus positif/)
  assert.match(analyzeBound({ ...base, consts: ['3/4'] }).error, /c₂/)
  assert.match(analyzeBound({ ...base, g: 'n^4' }).error, /g\(n\)/)
  assert.match(analyzeBound({ ...base, notation: 'Foo' }).error, /Notasi/)
})

test('penanda ::bound: penguraian argumen, pemeriksa teks, dan pemisah segmen', () => {
  const p = parseBoundArgs('Omega ; 0, 10, -20 ; n ; 10/3')
  assert.deepEqual([p.notation, p.coefs, p.g, p.consts, p.bad], ['Omega', ['0', '10', '-20'], 'n', ['10/3'], null])
  assert.equal(parseBoundArgs('O ; 1, 2, 3 ; 4').g, 'n^2', 'g bawaan n^2 bila dihilangkan')
  assert.match(parseBoundArgs('Theta ; 1, 2 ; n ; 1, 2').bad, /tiga koefisien/)
  assert.match(parseBoundArgs('Theta').bad, /::bound Notasi/)
  assert.match(parseBoundArgs('Theta ; 1, 2, 3 ; n ; 1').bad, /c₂/)
  const doc = (line) => `## A. Uji\n\nTeks.\n\n${line}\n\nTeks lagi.\n`
  assert.deepEqual(checkMarkdown(doc('::bound Theta ; 2, -3, 1 ; n^2 ; 3/4, 2')), [])
  const errs = checkMarkdown(doc('::bound Theta ; 2, -3 ; n^2 ; 3/4, 2'))
  assert.equal(errs.length, 1)
  assert.equal(errs[0].rule, 'bound-args')
  const segs = splitContent(doc('::bound Omega ; 0, 10, -20 ; n ; 10/3'), {})
  assert.deepEqual(segs.map((s) => s.type), ['markdown', 'bound', 'markdown'])
})
