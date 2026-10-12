import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LIMIT_SCAN_CAP, analyzeLimit, formatPolyN, limitRow, limitRows, limitVerdict, parseLimitArgs, parsePoly } from './limitCheck.js'
import { checkMarkdown } from './checkMarkdown.js'
import { splitContent } from './splitContent.js'

const show = (text) => {
  const r = parsePoly(text)
  return r.error ? null : formatPolyN(r.poly)
}

test('parsePoly: suku, pecahan, pangkat Unicode, spasi, dan suku yang digabung', () => {
  assert.equal(show('2n'), '2n')
  assert.equal(show('n^2'), 'n²')
  assert.equal(show('n²'), 'n²')
  assert.equal(show('n²/2'), 'n²/2')
  assert.equal(show('1/2n^2'), 'n²/2')
  assert.equal(show('3/4 n'), '3/4·n')
  assert.equal(show('3n^2 + 10n + 5'), '3n² + 10n + 5')
  assert.equal(show('3n^2+10n+5'), '3n² + 10n + 5')
  assert.equal(show('n^2 − 3n'), 'n² − 3n')
  assert.equal(show('n + n'), '2n')
  assert.equal(show('2n·n^2'), null)
  assert.equal(show('n³ + n'), 'n³ + n')
  assert.equal(show('0,5n'), 'n/2')
  assert.equal(show('7'), '7')
  assert.equal(show('n^1'), 'n')
  assert.equal(show('n^0'), '1')
})

test('parsePoly: penolakan', () => {
  for (const bad of ['', '   ', 'n^4', '2n+', '+', 'n^-2', '2 3n', 'x', 'n^2/0', '1/2/3', '2n n', '1234n', 'n^']) {
    assert.ok(parsePoly(bad).error, `harus ditolak: "${bad}"`)
  }
})

test('contoh materi 5: 2n = o(n²), n²/2 = ω(n), 2n² dan n²/2 pada n²', () => {
  const a = analyzeLimit({ f: '2n', g: 'n^2', c: '1/2' })
  assert.equal(a.kind, 'o')
  assert.equal(a.limitText, '0')
  assert.equal(a.o.n0, 5)
  for (const [c, n0] of [['4', 1], ['2', 2], ['1', 3], ['0,5', 5], ['0,1', 21]]) assert.equal(analyzeLimit({ f: '2n', g: 'n^2', c }).o.n0, n0, `c = ${c}`)
  const w = analyzeLimit({ f: 'n^2/2', g: 'n', c: '10' })
  assert.equal(w.kind, 'omega')
  assert.equal(w.limitText, 'tak hingga')
  for (const [c, n0] of [['0,5', 2], ['1', 3], ['10', 21], ['100', 201]]) assert.equal(analyzeLimit({ f: 'n^2/2', g: 'n', c }).omega.n0, n0, `c = ${c}`)
  const th = analyzeLimit({ f: '2n^2', g: 'n^2', c: '1' })
  assert.deepEqual([th.kind, th.limitText, th.o.status], ['theta', '2', 'never'])
})

test('soal challenge materi 5: derajat menentukan golongan', () => {
  // [0,1] vs [0,0,1]: n vs n²  → o ; [5,0,3] vs [0,0,7] → Θ ; [0,0,1] vs [0,1] → ω ; [7] vs [1] → Θ
  const kind = (f, g) => analyzeLimit({ f, g, c: '1' }).kind
  assert.equal(kind('n', 'n^2'), 'o')
  assert.equal(kind('3n^2 + 5', '7n^2'), 'theta')
  assert.equal(kind('n^2', 'n'), 'omega')
  assert.equal(kind('7', '1'), 'theta')
  assert.equal(kind('100', 'n'), 'o')
  assert.equal(kind('n^3', 'n^2 + n + 1'), 'omega')
})

// Pembanding independen: bilangan bulat murni (q·f < p·g), tanpa kode produksi.
function bruteN0(F, G, p, q, dir, limit = 5000) {
  const ev = (poly, n) => poly.reduce((acc, c, k) => acc + c * n ** k, 0)
  let lastBad = 0
  for (let n = 1; n <= limit; n++) {
    const f = ev(F, n)
    const g = ev(G, n)
    const ok = dir === 'o' ? f >= 0 && q * f < p * g : p * g >= 0 && p * g < q * f
    if (!ok) lastBad = n
  }
  return lastBad >= limit ? -1 : lastBad + 1
}

test('cocok dengan pembanding brute force pada 600 masukan acak (o dan ω)', () => {
  let seed = 4242
  const rnd = (m) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % m
  }
  const toText = (poly) =>
    poly
      .map((c, k) => (c === 0 ? null : { c, k }))
      .filter(Boolean)
      .reverse()
      .map(({ c, k }, i) => `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c)}${k === 0 ? '' : k === 1 ? 'n' : `n^${k}`}`)
      .join('')
  const mk = (deg) => {
    const poly = Array.from({ length: deg + 1 }, () => rnd(19) - 9)
    poly[deg] = rnd(9) + 1
    return poly
  }
  for (let i = 0; i < 600; i++) {
    const F = mk(rnd(4))
    const G = mk(rnd(4))
    const p = rnd(9) + 1
    const q = rnd(9) + 1
    const r = analyzeLimit({ f: toText(F), g: toText(G), c: `${p}/${q}` })
    assert.ok(!r.error, `${toText(F)} | ${toText(G)} | ${p}/${q}: ${r.error}`)
    for (const [dir, got] of [['o', r.o], ['omega', r.omega]]) {
      const want = bruteN0(F, G, p, q, dir)
      assert.equal(got.status === 'never' ? -1 : got.n0, want, `${dir}: ${toText(F)} | ${toText(G)} | c = ${p}/${q}`)
    }
    const kind = F.length < G.length ? 'o' : F.length > G.length ? 'omega' : 'theta'
    assert.equal(r.kind, kind)
  }
})

test('o dan ω berlaku untuk sembarang c: n₀ selalu ada bila limitnya 0 atau tak hingga', () => {
  for (const c of ['1/99', '1/10', '1', '10', '99', '999']) {
    assert.equal(analyzeLimit({ f: '2n', g: 'n^2', c }).o.status, 'ok', `o, c = ${c}`)
    assert.equal(analyzeLimit({ f: 'n^2/2', g: 'n', c }).omega.status, 'ok', `ω, c = ${c}`)
  }
  // Pada Θ selalu ada c yang gagal.
  assert.equal(analyzeLimit({ f: '3n^2 + 5', g: '7n^2', c: '1/10' }).o.status, 'never')
  assert.equal(analyzeLimit({ f: '3n^2 + 5', g: '7n^2', c: '1' }).omega.status, 'never')
})

test('batas pindai: n₀ terlalu besar dilaporkan sebagai lebih dari batas, bukan ditebak', () => {
  const a = analyzeLimit({ f: 'n', g: 'n^2', c: '1/99' }) // n > 99
  assert.equal(a.o.n0, 100)
  const big = analyzeLimit({ f: '999n', g: 'n^2', c: '1/99' }) // n > 98901
  assert.equal(big.o.n0, 98902)
  const huge = analyzeLimit({ f: 'n^3 + 999n^2', g: 'n^3', c: '1/99' }) // Θ, o gagal
  assert.equal(huge.o.status, 'never')
  const capped = analyzeLimit({ f: '99n^2 + 999n', g: 'n^3', c: '1/99' })
  assert.ok(['ok', 'capped'].includes(capped.o.status))
  assert.ok(LIMIT_SCAN_CAP >= 100000)
})

test('baris tabel dan kalimat kesimpulan', () => {
  const a = analyzeLimit({ f: '2n', g: 'n^2', c: '1/2' })
  const rows = limitRows(a)
  assert.equal(rows.length, 8)
  assert.deepEqual(
    rows.slice(0, 5).map((r) => [r.n, r.f, r.g, r.cg, r.oHolds]),
    [[1, '2', '1', '1/2', false], [2, '4', '4', '2', false], [3, '6', '9', '9/2', false], [4, '8', '16', '8', false], [5, '10', '25', '25/2', true]],
  )
  assert.equal(limitRow(a, 3).h, '2/3 (≈ 0,6667)')
  assert.match(limitVerdict(a), /f\(n\) = o\(g\(n\)\).*n ≥ 5/)
  const w = limitVerdict(analyzeLimit({ f: 'n^2/2', g: 'n', c: '10' }))
  assert.match(w, /ω\(g\(n\)\).*n ≥ 21/)
  const th = limitVerdict(analyzeLimit({ f: '3n^2 + 5', g: '7n^2', c: '1/2' }))
  assert.match(th, /Θ\(g\(n\)\).*bukan o dan bukan ω/)
  assert.match(th, /n ≥ 4/)
})

test('galat masukan menyebut bagian yang salah', () => {
  assert.match(analyzeLimit({ f: 'n^4', g: 'n', c: '1' }).error, /^f\(n\): Suku "n\^4"/)
  assert.match(analyzeLimit({ f: 'n', g: '2n+', c: '1' }).error, /^g\(n\)/)
  assert.match(analyzeLimit({ f: '-n', g: 'n', c: '1' }).error, /pangkat tertinggi harus positif/)
  assert.match(analyzeLimit({ f: 'n', g: '0', c: '1' }).error, /g\(n\).*positif/)
  assert.match(analyzeLimit({ f: 'n', g: 'n', c: '0' }).error, /c harus positif/)
  assert.match(analyzeLimit({ f: 'n', g: 'n', c: 'abc' }).error, /Isi c/)
})

test('penanda ::limit: penguraian argumen, pemeriksa teks, dan pemisah segmen', () => {
  assert.deepEqual(parseLimitArgs('2n ; n^2 ; 1/2'), { f: '2n', g: 'n^2', c: '1/2', bad: null })
  assert.match(parseLimitArgs('2n ; n^2').bad, /::limit f\(n\) ; g\(n\) ; c/)
  assert.match(parseLimitArgs('2n ; n^2 ; 0').bad, /c harus positif/)
  const doc = (line) => `## A. Uji\n\nTeks.\n\n${line}\n\nTeks lagi.\n`
  assert.deepEqual(checkMarkdown(doc('::limit 3n^2 + 5 ; 7n^2 ; 4')), [])
  const errs = checkMarkdown(doc('::limit n^4 ; n ; 1'))
  assert.equal(errs.length, 1)
  assert.equal(errs[0].rule, 'limit-args')
  assert.deepEqual(splitContent(doc('::limit n^2/2 ; n ; 10'), {}).map((s) => s.type), ['markdown', 'limit', 'markdown'])
})
