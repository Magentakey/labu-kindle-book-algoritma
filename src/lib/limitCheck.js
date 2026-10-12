/**
 * Pemeriksa limit f(n)/g(n) untuk notasi o dan ω (materi 5, penanda `::limit`).
 *
 * f dan g adalah polinom berderajat paling tinggi 3 (boleh pecahan, mis. n²/2), dan c adalah konstanta positif.
 * Limit ditentukan dari derajat dan koefisien terdepan (eksak). n₀ untuk c tertentu dicari eksak dengan bilangan
 * rasional, memakai cara yang sama seperti `boundCheck.js`: di luar batas akar (Cauchy) tanda polinom ditentukan
 * koefisien terdepannya. Semuanya fungsi murni supaya bisa dites tanpa browser.
 */
import { BOUND_SCAN_CAP, ZERO, add, evalInts, fmtRat, formatRat, leadIndex, mul, parseRational, rat, sign, sub, toInts } from './boundCheck.js'

export { BOUND_SCAN_CAP as LIMIT_SCAN_CAP }

const SUP = { 2: '²', 3: '³' }
const HINT = 'Tulis fungsi seperti 2n, n^2, n²/2, atau 3n^2 + 10n + 5 (pangkat n paling tinggi 3).'

/** Satu suku, mis. "3n^2", "n²/2", "1/2n", "10". Mengembalikan { k, coef } atau null. */
function parseTerm(raw) {
  const t = raw.replace(/\s+/g, '').replace(/²/g, '^2').replace(/³/g, '^3')
  const m = /^(\d{1,3}(?:[.,]\d{1,2})?(?:\/\d{1,2})?)?[*·]?(n(?:\^(\d))?)?(?:\/(\d{1,2}))?$/.exec(t)
  if (!m || (!m[1] && !m[2])) return null
  if (m[4] && m[1]?.includes('/')) return null
  if (m[4] && !m[2]) return null
  const k = m[2] ? (m[3] === undefined ? 1 : Number(m[3])) : 0
  if (k > 3) return null
  let coef = m[1] ? parseRational(m[1]) : rat(1n)
  if (!coef) return null
  if (m[4]) {
    if (BigInt(m[4]) === 0n) return null
    coef = mul(coef, rat(1n, BigInt(m[4])))
  }
  return { k, coef }
}

/**
 * Teks → polinom [c0, c1, c2, c3] (pangkat naik), atau { error }.
 * @param {string} text
 */
export function parsePoly(text) {
  const t = String(text).replace(/[−–]/g, '-').trim()
  if (!t) return { error: HINT }
  if (/\d\s+\d/.test(t)) return { error: HINT }
  const compact = t.replace(/\s+/g, '')
  if (!/^[+-]?[^+-]+(?:[+-][^+-]+)*$/.test(compact)) return { error: HINT }
  const terms = compact.match(/[+-]?[^+-]+/g)
  const poly = [ZERO, ZERO, ZERO, ZERO]
  for (const raw of terms) {
    const neg = raw.trim().startsWith('-')
    const body = raw.trim().replace(/^[+-]\s*/, '')
    const term = parseTerm(body)
    if (!term) return { error: `Suku "${raw.trim()}" tidak dikenali. ${HINT}` }
    poly[term.k] = add(poly[term.k], neg ? sub(ZERO, term.coef) : term.coef)
  }
  return { poly }
}

/** Teks polinom hasil, mis. "n²/2 + 3n". */
export function formatPolyN(poly) {
  const parts = []
  for (let i = 3; i >= 0; i--) {
    const c = poly[i]
    if (sign(c) === 0) continue
    const neg = c.n < 0n
    const abs = rat(neg ? -c.n : c.n, c.d)
    const v = i === 0 ? '' : i === 1 ? 'n' : `n${SUP[i]}`
    let body
    if (i === 0) body = fmtRat(abs)
    else if (abs.n === 1n && abs.d === 1n) body = v
    else if (abs.d === 1n) body = `${abs.n}${v}`
    else if (abs.n === 1n) body = `${v}/${abs.d}`
    else body = `${fmtRat(abs)}·${v}`
    parts.push({ neg, body })
  }
  if (!parts.length) return '0'
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') + p.body : `${p.neg ? '−' : '+'} ${p.body}`)).join(' ')
}

const degree = (poly) => {
  for (let i = poly.length - 1; i >= 0; i--) if (sign(poly[i]) !== 0) return i
  return -1
}

/** Polinom nilai n (BigInt) → rasional. */
const evalRat = (poly, bn) => poly.reduce((acc, c, i) => add(acc, mul(c, rat(bn ** BigInt(i)))), ZERO)

/** n₀ untuk himpunan syarat {ints, strict}: semua harus terpenuhi untuk semua n ≥ n₀. */
function solveN0(conds) {
  for (const c of conds) {
    const m = leadIndex(c.ints)
    if (m < 0 ? c.strict : c.ints[m] < 0n) return { status: 'never', n0: -1 }
  }
  let bound = 1n
  for (const c of conds) {
    const m = leadIndex(c.ints)
    if (m <= 0) continue
    const lead = c.ints[m]
    for (let i = 0; i < m; i++) {
      const a = c.ints[i] < 0n ? -c.ints[i] : c.ints[i]
      const q = (a + lead - 1n) / lead
      if (q + 1n > bound) bound = q + 1n
    }
  }
  if (bound > BigInt(BOUND_SCAN_CAP)) return { status: 'capped', n0: -1 }
  let lastBad = 0
  for (let n = 1; n <= Number(bound); n++) {
    const bn = BigInt(n)
    if (conds.some((c) => (c.strict ? evalInts(c.ints, bn) <= 0n : evalInts(c.ints, bn) < 0n))) lastBad = n
  }
  return { status: 'ok', n0: lastBad + 1 }
}

/**
 * @param {{ f: string, g: string, c: string }} input
 * @returns {{ error: string } | object}
 */
export function analyzeLimit({ f, g, c }) {
  const pf = parsePoly(f)
  if (pf.error) return { error: `f(n): ${pf.error}` }
  const pg = parsePoly(g)
  if (pg.error) return { error: `g(n): ${pg.error}` }
  const F = pf.poly
  const G = pg.poly
  const df = degree(F)
  const dg = degree(G)
  if (df < 0 || F[df].n < 0n) return { error: 'f(n): suku dengan pangkat tertinggi harus positif (fungsi running time).' }
  if (dg < 0 || G[dg].n < 0n) return { error: 'g(n): suku dengan pangkat tertinggi harus positif (fungsi running time).' }
  const cr = parseRational(c)
  if (!cr) return { error: 'Isi c dengan bilangan seperti 2, 3/4, atau 0,5.' }
  if (sign(cr) <= 0) return { error: 'c harus positif.' }

  const cg = G.map((x) => mul(x, cr))
  // o:  0 ≤ f(n) < c·g(n)     ω:  0 ≤ c·g(n) < f(n)
  const o = solveN0([
    { ints: toInts(F), strict: false },
    { ints: toInts(cg.map((x, i) => sub(x, F[i]))), strict: true },
  ])
  const w = solveN0([
    { ints: toInts(cg), strict: false },
    { ints: toInts(F.map((x, i) => sub(x, cg[i]))), strict: true },
  ])

  const kind = df < dg ? 'o' : df > dg ? 'omega' : 'theta'
  const limit = kind === 'o' ? { kind: 'zero', value: ZERO } : kind === 'omega' ? { kind: 'inf', value: null } : { kind: 'finite', value: mul(F[df], rat(G[dg].d, G[dg].n)) }
  return {
    f: F,
    g: G,
    c: cr,
    fText: formatPolyN(F),
    gText: formatPolyN(G),
    kind,
    limit,
    limitText: limit.kind === 'zero' ? '0' : limit.kind === 'inf' ? 'tak hingga' : formatRat(limit.value),
    o,
    omega: w,
  }
}

/** Satu baris tabel untuk n tertentu. */
export function limitRow(a, n) {
  const bn = BigInt(n)
  const fv = evalRat(a.f, bn)
  const gv = evalRat(a.g, bn)
  const cg = mul(gv, a.c)
  const h = sign(gv) === 0 ? null : mul(fv, rat(gv.d, gv.n))
  const cmp = (x, y) => x.n * y.d - y.n * x.d
  return {
    n,
    f: fmtRat(fv),
    g: fmtRat(gv),
    h: h ? formatRat(h) : '–',
    cg: fmtRat(cg),
    oHolds: sign(fv) >= 0 && cmp(fv, cg) < 0,
    wHolds: sign(cg) >= 0 && cmp(cg, fv) < 0,
  }
}

/** Baris tabel: sampai sedikit di atas n₀ yang relevan (8 sampai 20 baris). */
export function limitRows(a) {
  const rel = a.kind === 'omega' ? a.omega : a.o
  const count = rel.status === 'ok' ? Math.min(20, Math.max(8, rel.n0 + 3)) : 10
  return Array.from({ length: count }, (_, i) => limitRow(a, i + 1))
}

const sayN0 = (r, text) =>
  r.status === 'ok' ? `${text} berlaku untuk semua n ≥ ${r.n0}` : r.status === 'capped' ? `${text} baru berlaku untuk n yang sangat besar (n₀ lebih dari ${BOUND_SCAN_CAP})` : `${text} akhirnya dilanggar untuk n yang besar`

/** Kalimat kesimpulan untuk pembaca. */
export function limitVerdict(a) {
  const cText = fmtRat(a.c)
  const ineqO = `f(n) < ${cText}·g(n)`
  const ineqW = `${cText}·g(n) < f(n)`
  if (a.kind === 'o') return `Limit f(n)/g(n) = 0, jadi f(n) = o(g(n)). Untuk c = ${cText}: ${sayN0(a.o, ineqO)}. Nilai n₀ makin besar bila c makin kecil, tetapi selalu ada.`
  if (a.kind === 'omega') return `Limit f(n)/g(n) = tak hingga, jadi f(n) = ω(g(n)). Untuk c = ${cText}: ${sayN0(a.omega, ineqW)}. Nilai n₀ makin besar bila c makin besar, tetapi selalu ada.`
  return (
    `Limit f(n)/g(n) = ${a.limitText}, bilangan positif tertentu, jadi f(n) = Θ(g(n)): bukan o dan bukan ω. ` +
    `Untuk c = ${cText}: ${sayN0(a.o, ineqO)}; ${sayN0(a.omega, ineqW)}. ` +
    `Definisi o dan ω menuntut kedua pertaksamaan berlaku untuk semua c > 0, padahal di sini selalu ada c yang gagal.`
  )
}

/**
 * Argumen penanda: `f ; g ; c`. Contoh: `2n ; n^2 ; 1/2`.
 * @returns {{ f: string, g: string, c: string, bad: string | null }}
 */
export function parseLimitArgs(args) {
  const parts = args.split(';').map((s) => s.trim())
  const out = { f: parts[0] ?? '', g: parts[1] ?? '', c: parts[2] ?? '', bad: null }
  if (parts.length !== 3) {
    out.bad = 'Tulis: ::limit f(n) ; g(n) ; c (contoh: 2n ; n^2 ; 1/2).'
    return out
  }
  const r = analyzeLimit(out)
  if (r.error) out.bad = r.error
  return out
}
