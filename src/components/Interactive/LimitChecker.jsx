import { useId, useMemo, useState } from 'react'
import { analyzeLimit, limitRows, limitVerdict } from '../../lib/limitCheck.js'
import { focusRing, secondaryButton } from './styles.js'

const inputClass = `mt-1 min-h-12 w-44 max-w-full rounded-xl border-2 border-stone-900 bg-white px-3 tabular-nums ${focusRing}`

/**
 * Pemeriksa limit f(n)/g(n) untuk notasi o dan ω: isi f(n), g(n), dan c, lalu lihat nilai limitnya,
 * tabel f(n) dibanding c·g(n) per n, dan n₀ terkecil. Semua hasil berupa teks dan tabel, tidak bergantung pada warna.
 *
 * @param {{ f: string, g: string, c: string }} props  isian awal
 */
export default function LimitChecker({ f, g, c }) {
  const uid = useId()
  const [ft, setFt] = useState(f)
  const [gt, setGt] = useState(g)
  const [ct, setCt] = useState(c)

  const result = useMemo(() => analyzeLimit({ f: ft, g: gt, c: ct }), [ft, gt, ct])
  const rows = useMemo(() => (result.error ? [] : limitRows(result)), [result])
  const reset = () => {
    setFt(f)
    setGt(g)
    setCt(c)
  }
  const invalid = Boolean(result.error)

  const field = (id, label, value, set, hint) => (
    <div>
      <label htmlFor={`${uid}-${id}`} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={`${uid}-${id}`}
        type="text"
        autoComplete="off"
        spellCheck="false"
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={`${uid}-status ${uid}-${id}-hint`}
        className={inputClass}
      />
      <span id={`${uid}-${id}-hint`} className="sr-only">
        {hint}
      </span>
    </div>
  )

  return (
    // role="group", bukan <section>: dua pemeriksa atau lebih di satu halaman akan membuat landmark kembar.
    <div role="group" aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Periksa limit f(n)/g(n) sendiri
      </p>
      <p className="mt-1 text-sm">
        Tulis f(n) dan g(n) sebagai polinom, misalnya <span className="font-mono">2n</span>, <span className="font-mono">n^2</span>,{' '}
        <span className="font-mono">n²/2</span>, atau <span className="font-mono">3n^2 + 5</span>, lalu pilih c. Bilangan boleh pecahan
        (3/4) atau desimal (0,5).
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {field('f', 'f(n)', ft, setFt, 'Polinom berpangkat paling tinggi 3, misalnya 2n atau 3n^2 + 5.')}
        {field('g', 'g(n)', gt, setGt, 'Polinom berpangkat paling tinggi 3, misalnya n^2.')}
        {field('c', 'c (konstanta positif)', ct, setCt, 'Bilangan positif, misalnya 1/2 atau 0,5.')}
        <button type="button" onClick={reset} className={secondaryButton}>
          Kembalikan contoh
        </button>
      </div>

      <p id={`${uid}-status`} role="status" className="mt-2 min-h-6 text-sm font-semibold">
        {invalid ? `Masukan belum sah: ${result.error}` : limitVerdict(result)}
      </p>

      {invalid ? null : (
        <>
          <p className="mt-1 text-sm">
            f(n) = {result.fText}, g(n) = {result.gText}, c = {ct.trim()}.
          </p>
          <div
            // Tabel lebar harus bisa digeser dengan keyboard (WCAG 2.1.1).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            role="group"
            aria-label="Tabel perbandingan f(n) dengan c kali g(n), bisa digeser ke samping"
            className={`mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white ${focusRing}`}
          >
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Nilai f(n), g(n), f(n)/g(n), dan c·g(n) untuk n = 1 sampai {rows.length}, beserta apakah f(n) &lt; c·g(n) dan c·g(n) &lt; f(n) terpenuhi
              </caption>
              <thead>
                <tr className="border-b-2 border-stone-900 bg-orange-200">
                  <th scope="col" className="px-3 py-2">n</th>
                  <th scope="col" className="px-3 py-2">f(n)</th>
                  <th scope="col" className="px-3 py-2">g(n)</th>
                  <th scope="col" className="px-3 py-2">f(n) / g(n)</th>
                  <th scope="col" className="px-3 py-2">c · g(n)</th>
                  <th scope="col" className="px-3 py-2">f &lt; c·g? (o)</th>
                  <th scope="col" className="px-3 py-2">c·g &lt; f? (ω)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rel = result.kind === 'omega' ? result.omega : result.o
                  return (
                    <tr key={r.n} className="border-t border-stone-400">
                      <th scope="row" className="px-3 py-2 tabular-nums">
                        {r.n}
                        {rel.status === 'ok' && r.n === rel.n0 ? <span className="ml-2 text-xs font-semibold">(n₀)</span> : null}
                      </th>
                      <td className="px-3 py-2 tabular-nums">{r.f}</td>
                      <td className="px-3 py-2 tabular-nums">{r.g}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.h}</td>
                      <td className="px-3 py-2 tabular-nums">{r.cg}</td>
                      <td className="px-3 py-2 font-semibold">{r.oHolds ? '✓ Ya' : '✗ Tidak'}</td>
                      <td className="px-3 py-2 font-semibold">{r.wHolds ? '✓ Ya' : '✗ Tidak'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
