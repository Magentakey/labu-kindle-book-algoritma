import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeMaster, masterSteps, masterVerdict, parseA, parseB, parseF, parseMasterArgs, recurrenceText, fText } from './masterCase.js'

const run = (a, b, f) => analyzeMaster({ a: String(a), b: String(b), f })

/* ---------- pembanding independen ---------- */

const frac = (s) => (s.includes('/') ? Number(s.split('/')[0]) / Number(s.split('/')[1]) : Number(s))
const fStr = (p, j) => {
  const base = p === '0' ? '' : `n^(${p})`
  const lg = j === 0 ? '' : j === 1 ? 'log n' : `log^${j} n`
  return [base, lg].filter(Boolean).join(' ') || '1'
}

/**
 * T(n) = a·T(n/b) + n^p·ln(n)^j, T(1) = 1, n = b^k, dijumlah per level dan dihitung di ranah logaritma
 * (log-sum-exp) supaya tidak meluap. Mengembalikan ln( T / (n^P · k^J) ).
 */
function scaledLog(a, bNum, p, j, k, P, J) {
  const lnb = Math.log(bNum)
  const logs = []
  for (let i = 0; i < k; i++) {
    const size = k - i // ln(ukuran) = (k − i)·ln b
    logs.push(i * Math.log(a) + p * size * lnb + j * Math.log(size * lnb))
  }
  logs.push(k * Math.log(a)) // daun: a^k
  const m = Math.max(...logs)
  const logT = m + Math.log(logs.reduce((acc, x) => acc + Math.exp(x - m), 0))
  return logT - P * k * lnb - J * Math.log(k)
}
const driftOf = (a, bn, p, j, P, J) => Math.exp(scaledLog(a, bn, p, j, 4000, P, J) - scaledLog(a, bn, p, j, 2000, P, J))

test('materi 7: dokumen tiga contoh dan dua soal', () => {
  const x = [
    [2, 2, '√n', 1, 'Θ(n)'],
    [4, 2, 'n^2', 2, 'Θ(n² · log n)'],
    [1, '5/3', 'n', 3, 'Θ(n)'],
    [9, 3, 'n', 1, 'Θ(n²)'],
    [5, 2, 'n^3', 3, 'Θ(n³)'],
  ]
  for (const [a, b, f, kase, hasil] of x) {
    const r = run(a, b, f)
    assert.equal(r.error, undefined, `${a} ${b} ${f}`)
    assert.equal(r.kase, kase, `${a} ${b} ${f}`)
    assert.equal(r.result, hasil, `${a} ${b} ${f}`)
  }
})

test('rentang ε dan konstanta c sama dengan yang tertulis di teks materi', () => {
  assert.equal(run(2, 2, '√n').eps.text, '1/2') // 0 < ε ≤ 1/2
  assert.equal(run(9, 3, 'n').eps.text, '1') // 0 < ε ≤ 1
  assert.equal(run(1, '5/3', 'n').eps.text, '1') // Ω(n^(0 + ε)), 0 < ε ≤ 1
  const r = run(5, 2, 'n^3')
  assert.equal(r.eps.text, '0,67') // dokumen menulis 0,68, tetapi 0,679 melanggar
  assert.ok(r.eps.approx)
  assert.ok(Math.log2(5) + 0.679 > 3, 'ε = 0,679 memang melanggar')
  assert.ok(Math.log2(5) + 0.67 <= 3, 'ε = 0,67 memenuhi')
  const c = (a, b, f) => run(a, b, f).regularity.exact
  assert.deepEqual([c(1, '5/3', 'n').n, c(1, '5/3', 'n').d], [3n, 5n])
  assert.deepEqual([c(5, 2, 'n^3').n, c(5, 2, 'n^3').d], [5n, 8n])
  assert.deepEqual([c(1, 2, 'n').n, c(1, 2, 'n').d], [1n, 2n])
  assert.deepEqual([c(3, 2, 'n^2').n, c(3, 2, 'n^2').d], [3n, 4n])
  assert.deepEqual([c(2, 2, 'n^3').n, c(2, 2, 'n^3').d], [1n, 4n])
})

test('kasus dan hasil cocok dengan pembanding desimal dan perhitungan numerik T(n) pada ratusan recurrence', () => {
  const As = [1, 2, 3, 4, 5, 8, 9]
  const Bs = ['2', '3', '4', '5/3', '3/2', '9/4']
  const Ps = ['0', '1/2', '1', '3/2', '2', '5/2', '3']
  let checked = 0
  let flat = 0
  for (const a of As) {
    for (const b of Bs) {
      for (const p of Ps) {
        for (const j of [0, 1, 2]) {
          const r = run(a, b, fStr(p, j))
          assert.equal(r.error, undefined, `${a} ${b} ${fStr(p, j)}: ${r.error}`)
          const bn = frac(b)
          const crit = Math.log(a) / Math.log(bn)
          const pn = frac(p)
          const tie = Math.abs(crit - pn) < 1e-9
          const expectedCmp = tie ? 'sama' : pn < crit ? 'lebih kecil' : 'lebih besar'
          assert.equal(r.cmp, expectedCmp, `${a} ${b} ${fStr(p, j)}`)
          const expectedCase = tie ? (j === 0 ? 2 : null) : pn < crit ? 1 : 3
          assert.equal(r.kase, expectedCase, `${a} ${b} ${fStr(p, j)}`)
          checked++
          if (r.kase === null) {
            assert.equal(r.result, null)
            continue
          }
          // kandidat benar: n^P · (log n)^J
          const [P, J] = r.kase === 1 ? [crit, 0] : r.kase === 2 ? [crit, 1] : [pn, j]
          const drift = driftOf(a, bn, pn, j, P, J)
          assert.ok(Math.abs(drift - 1) < 0.06, `${a} ${b} ${fStr(p, j)}: rasio berubah ${drift}`)
          // tiga kandidat lain harus tidak mendatar
          const wrong = [[crit, 0], [crit, 1], [pn, 0], [pn, j]].filter(([x, y]) => !(Math.abs(x - P) < 1e-9 && y === J))
          for (const [x, y] of wrong) {
            const d = driftOf(a, bn, pn, j, x, y)
            // kandidat yang berbeda dari jawaban hanya pada faktor log yang sama-sama 0 tidak ada: semua berbeda P atau J
            assert.ok(Math.abs(d - 1) > 0.15, `${a} ${b} ${fStr(p, j)}: kandidat salah n^${x.toFixed(2)}·log^${y} ikut mendatar (${d})`)
          }
          flat++
        }
      }
    }
  }
  assert.ok(checked > 700 && flat > 500, `diperiksa ${checked}, dengan hasil ${flat}`)
})

test('perbandingan eksak: kasus sama terdeteksi tepat, termasuk log tak bulat dan b pecahan', () => {
  assert.equal(run(2, 4, '√n').kase, 2) // log₄ 2 = 1/2
  assert.equal(run(3, 9, 'n^(1/2)').kase, 2)
  assert.equal(run(8, 2, 'n^3').kase, 2)
  assert.equal(run(1, '5/3', '1').kase, 2) // T(3n/5) + 1 → Θ(log n)
  assert.equal(run(9, '3/2', 'n^2').kase, 1) // log₁,₅ 9 ≈ 5,42 > 2: f lebih kecil
  assert.equal(run(1, 2, '1').result, 'Θ(log n)')
  assert.equal(run(2, 4, '√n').result, 'Θ(√n · log n)')
  assert.equal(run(4, 2, 'n log n').kase, 1) // g = n², f = n log n lebih kecil dengan selisih n^ε
  assert.equal(run(2, 2, 'n log n').kase, null)
  assert.equal(run(2, 2, 'n log^2 n').kase, null)
  assert.equal(run(2, 2, 'n² log n').kase, 3)
  assert.equal(run(2, 2, 'n² log n').result, 'Θ(n² log n)')
  // log tak bulat tidak pernah dianggap sama: 2^p bandingkan dengan 3 untuk p di dekat log₂ 3
  assert.equal(run(3, 2, 'n^1,58').kase, 1) // 2^1,58 ≈ 2,9897 < 3
  assert.equal(run(3, 2, 'n^1,59').kase, 3) // 2^1,59 ≈ 3,0105 > 3
})

test('faktor log: ε harus lebih kecil dari selisih pangkat, tanpa faktor log boleh sama', () => {
  assert.equal(run(9, 3, 'n').eps.strict, false)
  assert.equal(run(9, 3, 'n log n').eps.strict, true)
  assert.equal(run(1, 2, 'n log n').eps.strict, true) // kasus 3, Ω(n^(0+ε)) berlaku untuk ε < 1
  assert.equal(run(1, 2, 'n log n').kase, 3)
  assert.equal(run(1, 2, 'n log n').result, 'Θ(n log n)')
  // syarat tambahan dengan log: c eksak tidak ditampilkan sebagai "tepat", tetapi sebagai batas bawah c
  const s = masterSteps(run(1, 2, 'n log n')).map((x) => x.lines.join(' ')).join(' ')
  assert.match(s, /untuk n cukup besar/)
})

test('syarat tambahan kasus 3 selalu terpenuhi: c = a / b^p < 1 bila p > log_b a', () => {
  for (const a of [1, 2, 3, 5, 8]) {
    for (const b of ['2', '3', '5/3', '3/2']) {
      for (const p of ['1', '2', '3']) {
        const r = run(a, b, `n^${p}`)
        if (r.kase !== 3) continue
        const c = a / frac(b) ** Number(p)
        assert.ok(c < 1, `${a} ${b} n^${p}: c = ${c}`)
        assert.ok(Math.abs(Number(r.regularity.exact.n) / Number(r.regularity.exact.d) - c) < 1e-12)
        // a·f(n/b) = c·f(n) benar-benar berlaku untuk f(n) = n^p
        const n = 1000
        assert.ok(Math.abs(a * (n / frac(b)) ** Number(p) - c * n ** Number(p)) < 1e-6 * n ** Number(p))
      }
    }
  }
})

test('teks hasil: log tak bulat ditulis sebagai pangkat log dan perkiraan desimal', () => {
  assert.equal(run(3, 2, 'n').result, 'Θ(n^(log₂ 3)) ≈ Θ(n^1,58)')
  assert.equal(run(5, 2, 'n').result, 'Θ(n^(log₂ 5)) ≈ Θ(n^2,32)')
  assert.equal(run(2, 2, 'n').result, 'Θ(n · log n)')
  assert.equal(run(1, 3, 'n').result, 'Θ(n)')
  assert.equal(recurrenceText(run(1, '5/3', 'n')), 'T(n) = T(n/(5/3)) + n')
  assert.equal(recurrenceText(run(9, 3, 'n')), 'T(n) = 9T(n/3) + n')
  assert.equal(fText(...(({ p, j }) => [p, j])(parseF('n^2 log n'))), 'n² log n')
})

test('masukan: berbagai bentuk f(n), koefisien tidak mengubah hasil', () => {
  for (const f of ['n', 'n^1', '1n', '5n', 'n/2', '3n']) assert.equal(parseF(f).error, undefined, f)
  const g = (f) => parseF(f)
  assert.deepEqual([g('n^2').p.n, g('n²').p.n, g('n^(2)').p.n], [2n, 2n, 2n])
  assert.equal(g('n^1,5').p.n, 3n)
  assert.equal(g('n^1.5').p.d, 2n)
  assert.equal(g('√n').p.d, 2n)
  assert.equal(g('n^(3/2)').p.n, 3n)
  assert.equal(g('1').p.n, 0n)
  assert.equal(g('7').p.n, 0n)
  assert.equal(g('log n').j, 1)
  assert.equal(g('n log n').j, 1)
  assert.equal(g('n·log n').j, 1)
  assert.equal(g('n log² n').j, 2)
  assert.equal(g('n log^3 n').j, 3)
  assert.equal(g('n (log n)^2').j, 2)
  assert.equal(run(4, 2, '3n^2').result, run(4, 2, 'n^2').result)
  assert.equal(run(5, 2, 'n^3/2').result, 'Θ(n³)') // (n³)/2, bukan n^(3/2)
  assert.equal(g('n^3/2').p.n, 3n)
  assert.equal(g('n^3/2').p.d, 1n)
  assert.equal(g('n^(3/2)').p.d, 2n)
})

test('masukan yang salah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(parseA('0').error, /a ≥ 1|bilangan bulat/)
  assert.match(parseA('1,5').error, /bilangan bulat/)
  assert.match(parseA('100').error, /1 sampai 99/)
  assert.match(parseA('').error, /bilangan bulat/)
  assert.match(parseB('1').error, /b > 1/)
  assert.match(parseB('1/2').error, /b > 1/)
  assert.equal(parseB('5/3').b.n, 5n)
  assert.match(parseB('dua').error, /b harus/)
  assert.match(parseF('').error, /Tulis f\(n\)/)
  assert.ok(parseF('n^-1').error)
  assert.ok(parseF('log^4 n').error)
  assert.ok(parseF('n log n log n').error)
  assert.ok(parseF('abc').error)
  assert.ok(parseF('0').error, 'koefisien 0 ditolak')
  assert.ok(parseF('n + 1').error)
  assert.ok(parseF('2^n').error)
  assert.match(run(0, 2, 'n').error, /a/)
  assert.match(run(2, 1, 'n').error, /b > 1/)
})

test('parseMasterArgs: bentuk penanda di materi', () => {
  assert.deepEqual(parseMasterArgs('5 ; 2 ; n^3'), { a: '5', b: '2', f: 'n^3', bad: null })
  assert.deepEqual(parseMasterArgs('1 ; 5/3 ; n'), { a: '1', b: '5/3', f: 'n', bad: null })
  assert.match(parseMasterArgs('5 ; 2').bad, /::master a ; b ; f\(n\)/)
  assert.match(parseMasterArgs('5 ; 1 ; n').bad, /b > 1/)
  assert.match(parseMasterArgs('x ; 2 ; n').bad, /a harus/)
  assert.match(parseMasterArgs('2 ; 2 ; ??').bad, /tidak dikenali/)
})

test('langkah penyelesaian: jumlah dan urutan sesuai slide di materi', () => {
  // kasus 1 dan 2: 4 langkah; kasus 3: 5 langkah (ada pemeriksaan syarat tambahan); tanpa kasus: 4 langkah
  const titles = (a, b, f) => masterSteps(run(a, b, f)).map((s) => s.title)
  assert.deepEqual(titles(9, 3, 'n'), ['1. Tentukan a, b, dan f(n)', '2. Hitung g(n)', '3. Bandingkan f(n) dengan g(n)', '4. Simpulkan'])
  assert.equal(titles(4, 2, 'n^2').length, 4)
  assert.deepEqual(titles(5, 2, 'n^3').slice(3), ['4. Periksa syarat tambahan', '5. Simpulkan'])
  const none = masterSteps(run(2, 2, 'n log n'))
  assert.equal(none.length, 4)
  assert.match(none.at(-1).lines[0], /tidak bisa dipakai/)
  // isi langkah soal 2 dokumen
  const s = masterSteps(run(5, 2, 'n^3'))
  assert.match(s[1].lines[0], /g\(n\) = n\^\(log₂ 5\) ≈ n\^2,32/)
  assert.match(s[2].lines.join(' '), /0 < ε ≤ 0,67/)
  assert.match(s[3].lines.join(' '), /c = 5\/8/)
  assert.match(s[4].lines.join(' '), /Θ\(n³\)/)
  // soal 1
  const t = masterSteps(run(9, 3, 'n'))
  assert.match(t[1].lines[0], /g\(n\) = n\^\(log₃ 9\) = n\^2 = n²/)
  assert.match(masterVerdict(run(9, 3, 'n')), /kasus 1, Θ\(n²\)/)
})
