import { useId, useMemo, useState } from 'react'
import { BOUND_G, BOUND_G_KEYS, BOUND_NOTATIONS, analyzeBound, boundRows, boundVerdict } from '../../lib/boundCheck.js'
import { focusRing, secondaryButton } from './styles.js'

const inputClass = `mt-1 min-h-12 w-24 rounded-xl border-2 border-stone-900 bg-white px-3 tabular-nums ${focusRing}`

/**
 * Pemeriksa batas asimtotik: isi f(n) = p·n² + q·n + r, pilih g(n) dan konstanta, lalu lihat nilai f(n)/g(n)
 * per n dan n₀ terkecil. Semua hasil berupa teks dan tabel, tidak bergantung pada warna.
 *
 * @param {{ notation: 'Theta'|'O'|'Omega', coefs: string[], g: string, consts: string[] }} props  isian awal
 */
export default function BoundChecker({ notation, coefs, g, consts }) {
  const uid = useId()
  const [co, setCo] = useState(coefs)
  const [gKey, setGKey] = useState(g)
  const [cs, setCs] = useState(consts)
  const sym = BOUND_NOTATIONS[notation]
  const theta = notation === 'Theta'

  const result = useMemo(() => analyzeBound({ notation, coefs: co, g: gKey, consts: cs }), [notation, co, gKey, cs])
  const rows = useMemo(() => (result.error ? [] : boundRows(result)), [result])
  const reset = () => {
    setCo(coefs)
    setGKey(g)
    setCs(consts)
  }
  const setAt = (arr, set) => (i) => (e) => set(arr.map((v, j) => (j === i ? e.target.value : v)))

  const field = (id, label, value, onChange, error) => (
    <div>
      <label htmlFor={`${uid}-${id}`} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={`${uid}-${id}`}
        type="text"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={onChange}
        aria-invalid={error}
        aria-describedby={`${uid}-status`}
        className={inputClass}
      />
    </div>
  )

  return (
    // role="group", bukan <section>: tiga pemeriksa di satu halaman akan membuat landmark kembar.
    <div role="group" aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Periksa batas {sym} sendiri
      </p>
      <p className="mt-1 text-sm">
        Isi f(n) = p·n² + q·n + r dan konstanta {theta ? 'c₁ dan c₂' : 'c'}. Bilangan boleh pecahan (3/4) atau desimal (0,5). Tabel menunjukkan
        f(n)/g(n) untuk tiap n, persis seperti langkah mencoba n = 1, 2, 3, … pada pembuktian.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {field('p', 'p (koefisien n²)', co[0], setAt(co, setCo)(0), Boolean(result.error))}
        {field('q', 'q (koefisien n)', co[1], setAt(co, setCo)(1), Boolean(result.error))}
        {field('r', 'r (konstanta)', co[2], setAt(co, setCo)(2), Boolean(result.error))}
        <div>
          <label htmlFor={`${uid}-g`} className="block text-sm font-semibold">
            g(n)
          </label>
          <select
            id={`${uid}-g`}
            value={gKey}
            onChange={(e) => setGKey(e.target.value)}
            className={`mt-1 min-h-12 rounded-xl border-2 border-stone-900 bg-white px-3 ${focusRing}`}
          >
            {BOUND_G_KEYS.map((k) => (
              <option key={k} value={k}>
                {BOUND_G[k].label}
              </option>
            ))}
          </select>
        </div>
        {theta ? (
          <>
            {field('c1', 'c₁', cs[0], setAt(cs, setCs)(0), Boolean(result.error))}
            {field('c2', 'c₂', cs[1], setAt(cs, setCs)(1), Boolean(result.error))}
          </>
        ) : (
          field('c', 'c', cs[0], setAt(cs, setCs)(0), Boolean(result.error))
        )}
        <button type="button" onClick={reset} className={secondaryButton}>
          Kembalikan contoh
        </button>
      </div>

      <p id={`${uid}-status`} role="status" className="mt-2 min-h-6 text-sm font-semibold">
        {result.error ? `Masukan belum sah: ${result.error}` : boundVerdict(result)}
      </p>

      {result.error ? null : (
        <>
          <p className="mt-1 text-sm">
            f(n) = {result.fText}, g(n) = {result.gLabel}. Untuk n menuju tak hingga, f(n)/g(n) mendekati {result.limitText}.
          </p>
          <div
            // Tabel lebar harus bisa digeser dengan keyboard (WCAG 2.1.1).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            role="group"
            aria-label={`Tabel nilai f(n)/g(n) untuk batas ${sym}, bisa digeser ke samping`}
            className={`mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white ${focusRing}`}
          >
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Nilai f(n), g(n), dan f(n)/g(n) untuk n = 1 sampai {rows.length}, beserta apakah syarat batas {sym} terpenuhi
              </caption>
              <thead>
                <tr className="border-b-2 border-stone-900 bg-orange-200">
                  <th scope="col" className="px-3 py-2">n</th>
                  <th scope="col" className="px-3 py-2">f(n)</th>
                  <th scope="col" className="px-3 py-2">g(n)</th>
                  <th scope="col" className="px-3 py-2">f(n) / g(n)</th>
                  <th scope="col" className="px-3 py-2">Syarat terpenuhi?</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n} className="border-t border-stone-400">
                    <th scope="row" className="px-3 py-2 tabular-nums">
                      {r.n}
                      {result.status === 'ok' && r.n === result.n0 ? <span className="ml-2 text-xs font-semibold">(n₀)</span> : null}
                    </th>
                    <td className="px-3 py-2 tabular-nums">{r.f}</td>
                    <td className="px-3 py-2 tabular-nums">{r.g}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.h}</td>
                    <td className="px-3 py-2 font-semibold">{r.holds ? '✓ Ya' : '✗ Tidak'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
