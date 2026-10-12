/**
 * Pemeriksa batas asimtotik (materi 4, penanda `::bound`).
 *
 * f(n) = p·n² + q·n + r dibandingkan dengan g(n) = nᵏ (k = 0 sampai 3) untuk notasi Θ, O, atau Ω.
 * Semua hitungan memakai bilangan rasional dengan BigInt, jadi tidak ada galat pembulatan.
 * n₀ dicari eksak: tiap syarat berbentuk polinom d(n) ≥ 0, dan di luar batas akar (Cauchy)
 * tanda d(n) ditentukan oleh koefisien terdepannya. Jadi cukup memeriksa n sampai batas itu.
 * Semuanya fungsi murni supaya bisa dites tanpa browser.
 */

export const BOUND_NOTATIONS = { Theta: 'Θ', O: 'O', Omega: 'Ω' }

/** g(n) yang boleh dipilih: k = pangkat n. */
export const BOUND_G = {
  '1': { k: 0, label: '1' },
  n: { k: 1, label: 'n' },
  'n^2': { k: 2, label: 'n²' },
  'n^3': { k: 3, label: 'n³' },
}
export const BOUND_G_KEYS = Object.keys(BOUND_G)

/** Batas pemindaian n. Bila batas akar lebih besar, hasilnya dilaporkan sebagai "lebih dari". */
export const BOUND_SCAN_CAP = 100000


/* ---------- bilangan rasional {n, d} dengan d > 0 ---------- */

const gcd = (a, b) => {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a
}
export const rat = (n, d = 1n) => {
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1n
  return { n: n / g, d: d / g }
}
export const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d)
export const mul = (a, b) => rat(a.n * b.n, a.d * b.d)
export const ZERO = rat(0n)
export const sign = (a) => (a.n > 0n ? 1 : a.n < 0n ? -1 : 0)

/**
 * Teks → bilangan rasional, atau null. Menerima 7, -3, 3/4, 0,5, 0.5, dan tanda minus Unicode.
 * Batas: bilangan bulat sampai 3 digit, penyebut sampai 2 digit, desimal sampai 2 angka di belakang koma.
 */
export function parseRational(text) {
  const t = String(text).replace(/[−–]/g, '-').trim()
  let m = /^([+-]?)(\d{1,3})\s*\/\s*(\d{1,2})$/.exec(t)
  if (m) {
    if (BigInt(m[3]) === 0n) return null
    return rat(BigInt(m[1] === '-' ? '-' + m[2] : m[2]), BigInt(m[3]))
  }
  m = /^([+-]?)(\d{1,3})(?:[.,](\d{1,2}))?$/.exec(t)
  if (!m) return null
  const frac = m[3] ?? ''
  const num = BigInt(m[2] + frac)
  return rat(m[1] === '-' ? -num : num, 10n ** BigInt(frac.length))
}

export function fmtRat(r) {
  return (r.d === 1n ? String(r.n) : `${r.n}/${r.d}`).replace('-', '−')
}

/** Bentuk desimal dengan koma, paling banyak 4 angka di belakang koma. */
function fmtDecimal(r) {
  const v = Number(r.n) / Number(r.d)
  return String(Number(v.toFixed(4))).replace('.', ',').replace('-', '−')
}

/** Bilangan rasional untuk tampilan: 3/4 (≈ 0,75) bila bukan bilangan bulat. */
export function formatRat(r) {
  return r.d === 1n ? fmtRat(r) : `${fmtRat(r)} (≈ ${fmtDecimal(r)})`
}

/* ---------- polinom [c0, c1, c2, c3] ---------- */

const polySub = (a, b) => a.map((x, i) => sub(x, b[i]))
const polyScale = (a, c) => a.map((x) => mul(x, c))
const lcm = (a, b) => (a / gcd(a, b)) * b

/** Polinom rasional → bilangan bulat dengan penyebut bersama (tanda dipertahankan). */
export function toInts(poly) {
  const L = poly.reduce((acc, r) => lcm(acc, r.d), 1n)
  return poly.map((r) => r.n * (L / r.d))
}

export function evalInts(ints, n) {
  let v = 0n
  for (let i = ints.length - 1; i >= 0; i--) v = v * n + ints[i]
  return v
}

export function leadIndex(ints) {
  for (let i = ints.length - 1; i >= 0; i--) if (ints[i] !== 0n) return i
  return -1
}

const gPoly = (k) => [0, 1, 2, 3].map((i) => (i === k ? rat(1n) : ZERO))

/** Teks f(n), misalnya "2n² − 3n + 1" atau "1/2·n² − 3n". */
export function formatPoly(coefs) {
  const parts = []
  const names = ['', 'n', 'n²']
  for (let i = 2; i >= 0; i--) {
    const c = coefs[i]
    if (sign(c) === 0) continue
    const neg = c.n < 0n
    const abs = rat(neg ? -c.n : c.n, c.d)
    let body
    if (i === 0) body = fmtRat(abs)
    else if (abs.n === 1n && abs.d === 1n) body = names[i]
    else if (abs.d === 1n) body = `${abs.n}${names[i]}`
    else body = `${fmtRat(abs)}·${names[i]}`
    parts.push({ neg, body })
  }
  if (!parts.length) return '0'
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') + p.body : `${p.neg ? '−' : '+'} ${p.body}`)).join(' ')
}

/* ---------- analisis ---------- */

/**
 * @param {{ notation: 'Theta'|'O'|'Omega', coefs: string[], g: string, consts: string[] }} input
 *   coefs = [p, q, r] untuk f(n) = p·n² + q·n + r; consts = [c₁, c₂] untuk Θ, atau [c] untuk O dan Ω.
 * @returns {{ error: string } | object}
 */
export function analyzeBound({ notation, coefs, g, consts }) {
  if (!BOUND_NOTATIONS[notation]) return { error: 'Notasi harus Theta, O, atau Omega.' }
  if (!BOUND_G[g]) return { error: `g(n) harus salah satu dari: ${BOUND_G_KEYS.join(', ')}.` }
  const names = ['koefisien n²', 'koefisien n', 'konstanta']
  const co = []
  for (let i = 0; i < 3; i++) {
    const r = parseRational(coefs[i] ?? '')
    if (!r) return { error: `Isi ${names[i]} dengan bilangan seperti 2, −3, 1/2, atau 0,5.` }
    co.push(r)
  }
  const need = notation === 'Theta' ? 2 : 1
  const cs = []
  for (let i = 0; i < need; i++) {
    const label = notation === 'Theta' ? `c${['₁', '₂'][i]}` : 'c'
    const r = parseRational(consts[i] ?? '')
    if (!r) return { error: `Isi ${label} dengan bilangan seperti 2, 3/4, atau 0,5.` }
    if (sign(r) <= 0) return { error: `${label} harus positif.` }
    cs.push(r)
  }

  const { k } = BOUND_G[g]
  const f = [co[2], co[1], co[0], ZERO]
  const gp = gPoly(k)
  // Tiap syarat: polinom d(n) yang harus ≥ 0.
  const conds =
    notation === 'Theta'
      ? [
          { label: 'c₁·g(n) ≤ f(n)', side: 'lower', poly: polySub(f, polyScale(gp, cs[0])) },
          { label: 'f(n) ≤ c₂·g(n)', side: 'upper', poly: polySub(polyScale(gp, cs[1]), f) },
        ]
      : notation === 'O'
        ? [
            { label: '0 ≤ f(n)', side: 'nonneg', poly: f },
            { label: 'f(n) ≤ c·g(n)', side: 'upper', poly: polySub(polyScale(gp, cs[0]), f) },
          ]
        : [{ label: 'c·g(n) ≤ f(n)', side: 'lower', poly: polySub(f, polyScale(gp, cs[0])) }]
  conds.forEach((c) => (c.ints = toInts(c.poly)))

  const failing = conds.find((c) => {
    const m = leadIndex(c.ints)
    return m >= 0 && c.ints[m] < 0n
  })

  let n0 = -1
  let status = 'ok'
  if (failing) {
    status = 'never'
  } else {
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
    if (bound > BigInt(BOUND_SCAN_CAP)) {
      status = 'capped'
    } else {
      let lastBad = 0
      for (let n = 1; n <= Number(bound); n++) {
        const bn = BigInt(n)
        if (conds.some((c) => evalInts(c.ints, bn) < 0n)) lastBad = n
      }
      n0 = lastBad + 1
    }
  }

  // Nilai f(n)/g(n) untuk n menuju tak hingga.
  const degF = co[0].n !== 0n ? 2 : co[1].n !== 0n ? 1 : co[2].n !== 0n ? 0 : -1
  const limit = degF < k ? { kind: 'zero', value: ZERO } : degF === k ? { kind: 'finite', value: f[k] } : { kind: 'inf', value: null }

  return {
    notation,
    g,
    k,
    gLabel: BOUND_G[g].label,
    f,
    fText: formatPoly([co[2], co[1], co[0]]),
    consts: cs,
    conds,
    status,
    n0,
    limit,
    limitText:
      limit.kind === 'inf' ? 'tak hingga (f(n) tumbuh lebih cepat dari g(n))' : limit.kind === 'zero' ? '0 (f(n) tumbuh lebih lambat dari g(n))' : formatRat(limit.value),
  }
}

/** Satu baris tabel untuk n tertentu. */
export function boundRow(analysis, n) {
  const bn = BigInt(n)
  const fv = analysis.f.reduce((acc, c, i) => add(acc, mul(c, rat(bn ** BigInt(i)))), ZERO)
  const gv = bn ** BigInt(analysis.k)
  const h = rat(fv.n, fv.d * gv)
  const holds = analysis.conds.every((c) => evalInts(c.ints, bn) >= 0n)
  return { n, f: fmtRat(fv), g: String(gv), h: formatRat(h), holds }
}

/** Baris tabel: dari n = 1 sampai sedikit di atas n₀ (8 sampai 20 baris). */
export function boundRows(analysis) {
  const count = analysis.status === 'ok' ? Math.min(20, Math.max(8, analysis.n0 + 3)) : 10
  return Array.from({ length: count }, (_, i) => boundRow(analysis, i + 1))
}

/** Kalimat kesimpulan untuk pembaca. */
export function boundVerdict(a) {
  const sym = BOUND_NOTATIONS[a.notation]
  const cond = a.conds.map((c) => c.label).join(' dan ')
  if (a.status === 'never') {
    const bad = a.conds.find((c) => {
      const m = leadIndex(c.ints)
      return m >= 0 && c.ints[m] < 0n
    })
    return `Tidak ada n₀. Syarat ${bad.label} akhirnya dilanggar untuk n yang besar, jadi f(n) = ${sym}(${a.gLabel}) tidak bisa dibuktikan dengan konstanta ini.`
  }
  if (a.status === 'capped') return `n₀ lebih dari ${BOUND_SCAN_CAP}. Pilih konstanta yang lebih longgar supaya n₀ bisa ditampilkan.`
  return `Terpenuhi: ${cond} berlaku untuk semua n ≥ ${a.n0}, dan n₀ = ${a.n0} adalah yang terkecil. Jadi f(n) = ${sym}(${a.gLabel}).`
}

/**
 * Argumen penanda: `Notasi ; p, q, r ; g ; c₁, c₂` (g opsional, bawaannya n^2).
 * Contoh: `Theta ; 2, -3, 1 ; n^2 ; 3/4, 2` atau `Omega ; 0, 10, -20 ; n ; 10/3`.
 * @returns {{ notation: string, coefs: string[], g: string, consts: string[], bad: string | null }}
 */
export function parseBoundArgs(args) {
  const parts = args.split(';').map((s) => s.trim())
  const out = { notation: parts[0] ?? '', coefs: [], g: 'n^2', consts: [], bad: null }
  if (parts.length < 3) {
    out.bad = 'Tulis: ::bound Notasi ; p, q, r ; g ; konstanta (contoh: Theta ; 2, -3, 1 ; n^2 ; 3/4, 2).'
    return out
  }
  out.coefs = parts[1].split(',').map((s) => s.trim())
  if (parts.length === 3) {
    out.consts = parts[2].split(',').map((s) => s.trim())
  } else {
    out.g = parts[2] || 'n^2'
    out.consts = parts[3].split(',').map((s) => s.trim())
  }
  if (out.coefs.length !== 3) {
    out.bad = 'Isi tiga koefisien f(n) dipisah koma: p, q, r untuk p·n² + q·n + r.'
    return out
  }
  const result = analyzeBound(out)
  if (result.error) out.bad = result.error
  return out
}
