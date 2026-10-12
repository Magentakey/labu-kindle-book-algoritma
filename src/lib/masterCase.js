/**
 * Penentu kasus Metode Master (materi 7, penanda `::master`).
 *
 * T(n) = a·T(n/b) + f(n) dengan a ≥ 1 bilangan bulat, b > 1 (boleh pecahan, mis. 5/3 untuk T(3n/5)),
 * dan f(n) = k·n^p·(log n)^j: p bilangan rasional ≥ 0, j = 0 sampai 3, k koefisien positif (tidak memengaruhi hasil Θ).
 *
 * Perbandingan p dengan log_b a dilakukan eksak: log_b a < p ⇔ a < b^p ⇔ a^s < b^r untuk p = r/s,
 * dihitung dengan BigInt, jadi tidak ada galat pembulatan. Semuanya fungsi murni supaya bisa dites tanpa browser.
 * Hanya tiga kasus yang di buku (materi 7) yang dipakai: f(n) = n log n pada g(n) = n sengaja "tidak tercakup".
 */
import { fmtRat, mul, parseRational, rat, sign } from './boundCheck.js'

const MAX_J = 3
const SUP = { 2: '²', 3: '³' }
const HINT = 'Tulis f(n) seperti n, n^2, n^1,5, n^(3/2), √n, n/2, 1, n log n, atau 3n^2 log n.'

const gcdB = (a, b) => {
  while (b) [a, b] = [b, a % b]
  return a < 0n ? -a : a
}

/** Desimal berkoma untuk tampilan, mis. 2,32. Dipotong ke bawah (bukan dibulatkan) bila `floor`. */
export function fmtDec(x, digits = 2, floor = false) {
  const m = 10 ** digits
  const v = floor ? Math.floor(x * m + 1e-9) / m : Math.round(x * m) / m
  return String(v).replace('.', ',')
}

/** a, b, atau p berbentuk pecahan {n, d}: teks → bilangan rasional atau null. */
const parseNum = (t) => parseRational(String(t).trim())

/**
 * Teks f(n) → { coef, p, j } atau { error }.
 * Menerima: n, n^2, n², n^1,5, n^(3/2), √n, n/2, 3n^2, 1, 5, log n, n log n, n^2 log n, n log^2 n, n·log n.
 */
export function parseF(text) {
  let t = String(text)
    .replace(/[−–]/g, '-')
    .replace(/\blog₂/gi, 'log')
    .replace(/\blg\b/gi, 'log')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .trim()
  if (!t) return { error: HINT }
  // pisahkan faktor log: "log n", "log^2 n", "(log n)^2"
  let j = 0
  const logRe = /[*·]?\s*\(?\s*log\s*(?:\^\s*(\d))?\s*n\s*\)?(?:\^\s*(\d))?/i
  const lm = logRe.exec(t)
  if (lm) {
    j = Number(lm[1] ?? lm[2] ?? 1)
    t = (t.slice(0, lm.index) + t.slice(lm.index + lm[0].length)).trim()
    if (/log/i.test(t)) return { error: `Hanya satu faktor log yang boleh. ${HINT}` }
    if (j < 1 || j > MAX_J) return { error: `Pangkat log harus 1 sampai ${MAX_J}. ${HINT}` }
  }
  t = t.replace(/\s+/g, '').replace(/^[*·]|[*·]$/g, '')
  if (!t) {
    if (!lm) return { error: HINT }
    return { coef: rat(1n), p: rat(0n), j } // hanya log n
  }
  // √n dan n^(1/2) → bentuk n^p
  t = t.replace(/√n/g, 'n^(1/2)').replace(/√\(n\)/g, 'n^(1/2)')
  const m = /^(\d{1,3}(?:[.,]\d{1,2})?(?:\/\d{1,2})?)?[*·]?(?:(n)(?:\^(?:\(([^()]+)\)|(\d{1,3}(?:[.,]\d{1,2})?)))?)?(?:\/(\d{1,2}))?$/.exec(t)
  if (!m || (!m[1] && !m[2])) return { error: `"${text.trim()}" tidak dikenali. ${HINT}` }
  if (m[5] && m[1]?.includes('/')) return { error: `"${text.trim()}" tidak dikenali. ${HINT}` }
  if (m[5] && !m[2]) return { error: `"${text.trim()}" tidak dikenali. ${HINT}` }
  let coef = m[1] ? parseNum(m[1]) : rat(1n)
  if (!coef || sign(coef) <= 0) return { error: 'Koefisien f(n) harus bilangan positif.' }
  if (m[5]) {
    if (BigInt(m[5]) === 0n) return { error: 'Pembagi tidak boleh 0.' }
    coef = mul(coef, rat(1n, BigInt(m[5])))
  }
  let p = rat(0n)
  if (m[2]) {
    const raw = m[3] ?? m[4]
    p = raw === undefined ? rat(1n) : parseNum(raw)
    if (!p) return { error: `Pangkat n pada "${text.trim()}" tidak dikenali. Pakai bilangan bulat, pecahan (3/2), atau desimal (1,5).` }
    if (sign(p) < 0) return { error: 'Pangkat n harus ≥ 0 (f(n) adalah fungsi running time).' }
  }
  return { coef, p, j }
}

/** Teks "a" → bilangan bulat ≥ 1 (1 sampai 99), atau { error }. */
export function parseA(text) {
  const t = String(text).trim()
  if (!/^\d{1,2}$/.test(t)) return { error: `a harus bilangan bulat 1 sampai 99 (Anda mengisi "${t}").` }
  const a = Number(t)
  if (a < 1) return { error: 'Metode Master butuh a ≥ 1.' }
  return { a }
}

/** Teks "b" → rasional > 1 (pecahan boleh, mis. 5/3), atau { error }. */
export function parseB(text) {
  const t = String(text).trim()
  const r = parseNum(t)
  if (!r) return { error: `b harus bilangan seperti 2, 3, 5/3, atau 1,5 (Anda mengisi "${t}").` }
  if (r.n <= r.d) return { error: 'Metode Master butuh b > 1. Untuk T(3n/5), tulis b = 5/3 sebab 3n/5 = n/(5/3).' }
  return { b: r }
}

/** a^s vs b^r dengan b = u/v: tanda dari (a^s·v^r − u^r). */
function cmpPow(a, b, p) {
  const r = p.n
  const s = p.d
  const left = BigInt(a) ** s * b.d ** r
  const right = b.n ** r
  return left < right ? -1 : left > right ? 1 : 0
}

/** Mencari log_b a rasional r/s (s ≤ 12) secara eksak, atau null. */
function exactLog(a, b) {
  if (a === 1) return rat(0n)
  const x = Math.log(a) / Math.log(Number(b.n) / Number(b.d))
  for (let s = 1; s <= 12; s++) {
    const r = Math.round(x * s)
    if (r < 0) continue
    if (cmpPow(a, b, rat(BigInt(r), BigInt(s))) === 0) return rat(BigInt(r), BigInt(s))
  }
  return null
}

/** p (rasional) → "n", "n²", "n^1,5", "1". */
export function powerText(p) {
  if (sign(p) === 0) return '1'
  if (p.d === 1n && p.n === 1n) return 'n'
  if (p.n === 1n && p.d === 2n) return '√n'
  if (p.d === 1n && SUP[Number(p.n)]) return `n${SUP[Number(p.n)]}`
  if (p.d === 1n) return `n^${p.n}`
  const dec = Number(p.n) / Number(p.d)
  return Number.isInteger(dec * 100) ? `n^${fmtDec(dec, 2)}` : `n^(${fmtRat(p)})`
}

/** Teks f(n) tanpa koefisien, mis. "n² log n". */
export function fText(p, j) {
  const base = sign(p) === 0 ? '' : powerText(p)
  const lg = j === 0 ? '' : j === 1 ? 'log n' : `log${SUP[j] ?? `^${j}`} n`
  return [base, lg].filter(Boolean).join(' ') || '1'
}

const bText = (b) => fmtRat(b)

/**
 * Menganalisis T(n) = a·T(n/b) + f(n).
 * @param {{ a: string, b: string, f: string }} input
 */
export function analyzeMaster({ a: aT, b: bT, f: fT }) {
  const A = parseA(aT)
  if (A.error) return { error: A.error }
  const B = parseB(bT)
  if (B.error) return { error: B.error }
  const F = parseF(fT)
  if (F.error) return { error: F.error }
  const a = A.a
  const b = B.b
  const { p, j } = F
  const bNum = Number(b.n) / Number(b.d)
  const critNum = Math.log(a) / Math.log(bNum)
  const exact = exactLog(a, b) // rasional atau null
  const cmp = cmpPow(a, b, p) // f dibanding g: tanda dari (a^s·v^r − u^r) adalah (log_b a) vs p
  // cmpPow = -1: a < b^p ⇒ log_b a < p ⇒ f lebih besar (kasus 3)
  // cmpPow = +1: a > b^p ⇒ log_b a > p ⇒ f lebih kecil (kasus 1)
  const rel = cmp > 0 ? 'lebih kecil' : cmp < 0 ? 'lebih besar' : 'sama'
  const pNum = Number(p.n) / Number(p.d)

  // Kasus 2 hanya bila f(n) = Θ(g(n)); pangkat n yang sama dengan faktor log tambahan tidak masuk tiga kasus.
  const kase = rel === 'lebih kecil' ? 1 : rel === 'sama' ? (j === 0 ? 2 : null) : 3

  // ε: selisih pangkat. Dengan faktor log, ε harus lebih kecil dari selisih (tidak boleh sama).
  let eps = null
  if (kase === 1 || kase === 3) {
    const strict = j > 0
    if (exact) {
      const d = kase === 1 ? rat(exact.n * p.d - p.n * exact.d, exact.d * p.d) : rat(p.n * exact.d - exact.n * p.d, exact.d * p.d)
      eps = { exact: d, text: fmtRat(d), strict }
    } else {
      const d = Math.abs(critNum - pNum)
      eps = { exact: null, text: fmtDec(d, 2, true), strict, approx: true }
    }
  }

  // Syarat tambahan kasus 3: a·f(n/b) = (a / b^p)·f(n) ≤ c·f(n). Eksak hanya bila p bilangan bulat dan j = 0.
  let regularity = null
  if (kase === 3) {
    const cNum = a / bNum ** pNum
    if (p.d === 1n) {
      const e = p.n
      const num = BigInt(a) * b.d ** e
      const den = b.n ** e
      const g = gcdB(num, den) || 1n
      regularity = { exact: rat(num / g, den / g), value: cNum, j, holds: true }
    } else {
      regularity = { exact: null, value: cNum, j, holds: true }
    }
  }

  const gText = exact ? `n^${fmtRat(exact)}`.replace(/^n\^0$/, '1') : `n^(log${sub(bText(b))} ${a})`
  const gShort = exact ? powerText(exact) : null
  const critDec = fmtDec(critNum, 2)

  let result
  if (kase === 1) result = exact ? `Θ(${powerText(exact)})` : `Θ(n^(log${sub(bText(b))} ${a})) ≈ Θ(n^${critDec})`
  else if (kase === 2) result = exact ? `Θ(${[powerText(exact), 'log n'].filter((x) => x !== '1').join(' · ')})` : `Θ(n^(log${sub(bText(b))} ${a}) · log n)`
  else if (kase === 3) result = `Θ(${fText(p, j)})`
  else result = null

  return {
    a,
    b,
    bText: bText(b),
    p,
    j,
    fText: fText(p, j),
    coef: F.coef,
    crit: { exact, value: critNum, text: exact ? fmtRat(exact) : `≈ ${critDec}` },
    gText,
    gShort,
    cmp: rel,
    kase,
    eps,
    regularity,
    result,
  }
}

/** Indeks bawah sederhana untuk dasar logaritma: 2 → "₂", 5/3 → "(5/3)". */
function sub(t) {
  const map = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }
  return /^\d+$/.test(t) ? [...t].map((c) => map[c]).join('') : `_(${t})`
}
export const logBase = sub

/** Teks "T(n) = aT(n/b) + f(n)". */
export function recurrenceText(r) {
  const bt = r.b.d === 1n ? `${r.b.n}` : `(${r.bText})`
  return `T(n) = ${r.a === 1 ? '' : r.a}T(n/${bt}) + ${r.fText}`
}

/**
 * Langkah-langkah penyelesaian seperti 4 slide di materi: tiap langkah punya judul dan beberapa baris teks.
 * @returns {{ title: string, lines: string[] }[]}
 */
export function masterSteps(r) {
  const lb = `log${sub(r.bText)} ${r.a}`
  const steps = []
  steps.push({
    title: '1. Tentukan a, b, dan f(n)',
    lines: [`a = ${r.a},  b = ${r.bText},  f(n) = ${r.fText}`, 'Bentuknya aT(n/b) + f(n) dengan a ≥ 1 dan b > 1, jadi memenuhi syarat Metode Master.'],
  })
  steps.push({
    title: '2. Hitung g(n)',
    lines: r.crit.exact
      ? [`g(n) = n^(${lb}) = n^${fmtRat(r.crit.exact)}${r.gShort && r.gShort !== `n^${fmtRat(r.crit.exact)}` ? ` = ${r.gShort}` : ''}`]
      : [`g(n) = n^(${lb}) ≈ n^${fmtDec(r.crit.value, 2)}`, `${lb} bukan bilangan sederhana, jadi dituliskan ≈ ${fmtDec(r.crit.value, 2)}.`],
  })
  const critTxt = r.crit.exact ? fmtRat(r.crit.exact) : `≈ ${fmtDec(r.crit.value, 2)}`
  const logTxt = r.j ? ` dan faktor ${r.j === 1 ? 'log n' : `log${SUP[r.j] ?? `^${r.j}`} n`}` : ''
  steps.push({
    title: '3. Bandingkan f(n) dengan g(n)',
    lines: [
      `Pangkat n pada f(n) adalah ${fmtRat(r.p)}${logTxt}. Pangkat n pada g(n) adalah ${critTxt}.`,
      `Jadi f(n) = ${r.fText} tumbuh ${r.cmp === 'sama' ? 'sama cepat dengan' : r.cmp === 'lebih kecil' ? 'lebih lambat dari' : 'lebih cepat dari'} g(n).`,
    ],
  })
  if (r.kase === 1) {
    steps[2].lines.push(`Syarat kasus 1 terpenuhi: f(n) = O(n^(${r.crit.exact ? fmtRat(r.crit.exact) : fmtDec(r.crit.value, 2)} − ε)) untuk 0 < ε ${r.eps.strict ? '<' : '≤'} ${r.eps.text}${r.eps.approx ? ' (dibulatkan ke bawah)' : ''}.`)
  } else if (r.kase === 3) {
    steps[2].lines.push(`Syarat pertama kasus 3 terpenuhi: f(n) = Ω(n^(${r.crit.exact ? fmtRat(r.crit.exact) : fmtDec(r.crit.value, 2)} + ε)) untuk 0 < ε ${r.eps.strict ? '<' : '≤'} ${r.eps.text}${r.eps.approx ? ' (dibulatkan ke bawah)' : ''}.`)
  } else if (r.kase === 2) {
    steps[2].lines.push('Syarat kasus 2 terpenuhi: f(n) = Θ(g(n)).')
  } else {
    steps[2].lines.push(`Pangkat n-nya sama, tetapi f(n) punya faktor log n tambahan, jadi f(n) bukan Θ(g(n)). f(n) juga tidak lebih besar dari g(n) sebesar n^ε untuk suatu ε > 0.`)
  }
  if (r.kase === 3) {
    const reg = r.regularity
    const lines = []
    const bp = r.b.d === 1n ? r.bText : `(${r.bText})`
    const cTxt = reg.exact ? fmtRat(reg.exact) : fmtDec(reg.value, 2)
    if (r.j === 0) {
      lines.push(`a·f(n/b) = ${r.a}·f(n/${bp}) = ${reg.exact ? '' : '≈ '}${cTxt}·f(n)`)
      lines.push(`Ambil c = ${cTxt}, sehingga a·f(n/b) ≤ c·f(n) dengan c < 1.`)
    } else {
      lines.push(`a·f(n/b) = ${r.a}·f(n/${bp}) ≈ ${cTxt}·f(n) untuk n yang besar, sebab log(n/b) / log n mendekati 1.`)
      lines.push(`Ambil c dengan ${cTxt} < c < 1, sehingga a·f(n/b) ≤ c·f(n) untuk n cukup besar. Syarat tambahan terpenuhi.`)
    }
    steps.push({ title: '4. Periksa syarat tambahan', lines })
  }
  steps.push({
    title: r.kase === 3 ? '5. Simpulkan' : '4. Simpulkan',
    lines: r.kase ? [`Berlaku kasus ${r.kase}, sehingga:`, `T(n) = ${r.result}`] : ['Tidak ada kasus yang berlaku, jadi Metode Master tidak bisa dipakai pada recurrence ini. Pakai metode lain, misalnya metode substitusi.'],
  })
  return steps
}

/** Kalimat kesimpulan satu baris untuk pembaca layar dan status. */
export function masterVerdict(r) {
  if (!r.kase) return `${recurrenceText(r)}: tidak masuk tiga kasus, Metode Master tidak bisa dipakai.`
  return `${recurrenceText(r)}: kasus ${r.kase}, ${r.result}.`
}

/**
 * Argumen penanda: `a ; b ; f(n)`. Contoh: `9 ; 3 ; n` atau `1 ; 5/3 ; n`.
 * @returns {{ a: string, b: string, f: string, bad: string | null }}
 */
export function parseMasterArgs(args) {
  const parts = args.split(';').map((s) => s.trim())
  const out = { a: parts[0] ?? '', b: parts[1] ?? '', f: parts[2] ?? '', bad: null }
  if (parts.length !== 3) {
    out.bad = 'Tulis: ::master a ; b ; f(n) (contoh: 9 ; 3 ; n).'
    return out
  }
  const r = analyzeMaster(out)
  if (r.error) out.bad = r.error
  return out
}
