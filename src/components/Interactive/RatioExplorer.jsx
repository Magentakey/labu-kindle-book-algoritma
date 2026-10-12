import { useId, useState } from 'react'
import { DEFAULT_GROWTH_KEYS } from '../../lib/growth.js'
import { DEFAULT_RATIO_N1, DEFAULT_RATIO_N2, RATIO_N_MAX, ratioRows, ratioSummary, validateRatioInput } from '../../lib/ratio.js'
import { focusRing, secondaryButton } from './styles.js'

const inputClass = `mt-1 min-h-12 w-28 rounded-xl border-2 border-stone-900 bg-white px-3 tabular-nums ${focusRing}`

/** Teks isian → bilangan bulat, atau NaN bila kosong / bukan bilangan bulat. */
const toInt = (text) => (/^\s*\d+\s*$/.test(text) ? Number(text) : NaN)

/**
 * Penghitung rasio kenaikan: isi n awal dan n akhir, lalu lihat f(n akhir) / f(n awal) untuk tiap kelas fungsi.
 * Semua hasil ada di tabel (teks), jadi tidak bergantung pada warna atau gambar.
 *
 * @param {{ keys?: string[] | null, n1?: number, n2?: number }} props
 *   keys = kunci kelas (lihat lib/growth.js), kosong = semua kelas; n1 dan n2 = isian awal.
 */
export default function RatioExplorer({ keys = null, n1 = DEFAULT_RATIO_N1, n2 = DEFAULT_RATIO_N2 }) {
  const uid = useId()
  const [text1, setText1] = useState(String(n1))
  const [text2, setText2] = useState(String(n2))
  const shown = keys?.length ? keys : DEFAULT_GROWTH_KEYS

  const a = toInt(text1)
  const b = toInt(text2)
  const error = validateRatioInput(a, b)
  const rows = error ? [] : ratioRows(shown, a, b)
  const summary = error ? '' : ratioSummary(rows, a, b)
  const reset = () => {
    setText1(String(n1))
    setText2(String(n2))
  }

  return (
    // role="group", bukan <section>: bila dua penghitung ada di satu halaman, landmark kembar dilaporkan axe.
    <div role="group" aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Hitung rasio kenaikan
      </p>
      <p className="mt-1 text-sm">
        Rasio = f(n akhir) / f(n awal). Konstanta c habis dibagi, jadi rasio hanya bergantung pada bentuk fungsinya.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor={`${uid}-n1`} className="block text-sm font-semibold">
            n awal
          </label>
          <input
            id={`${uid}-n1`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`${uid}-status`}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-n2`} className="block text-sm font-semibold">
            n akhir
          </label>
          <input
            id={`${uid}-n2`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`${uid}-status`}
            className={inputClass}
          />
        </div>
        <button type="button" onClick={reset} className={secondaryButton}>
          Kembalikan contoh
        </button>
      </div>

      <p id={`${uid}-status`} role="status" className="mt-2 min-h-6 text-sm font-semibold">
        {error ? `Masukan belum sah: ${error}` : `Menghitung dari n = ${a} menjadi n = ${b} (n bulat 1 sampai ${RATIO_N_MAX}).`}
      </p>

      {error ? null : (
        <>
          <div
            // Tabel lebar harus bisa digeser dengan keyboard (WCAG 2.1.1).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            role="group"
            aria-label="Tabel rasio kenaikan, bisa digeser ke samping"
            className={`mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white ${focusRing}`}
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Rasio kenaikan tiap kelas fungsi dari n = {a} menjadi n = {b}
              </caption>
              <thead>
                <tr className="border-b-2 border-stone-900 bg-orange-200">
                  <th scope="col" className="px-3 py-2">Fungsi</th>
                  <th scope="col" className="px-3 py-2">Rasio</th>
                  <th scope="col" className="px-3 py-2">Penurunan rasio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-t border-stone-400 align-top">
                    <th scope="row" className="whitespace-nowrap px-3 py-2 font-semibold">
                      {r.label}
                      <span className="block text-xs font-normal">{r.name}</span>
                    </th>
                    <td className="px-3 py-2 font-semibold tabular-nums">{r.text}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs sm:text-sm">{r.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary ? <p className="mt-2 text-sm">{summary}</p> : null}
          <p className="mt-2 text-sm">Semakin kecil rasionya, semakin lambat fungsi itu naik, yaitu semakin cepat running time algoritmanya.</p>
        </>
      )}
    </div>
  )
}
