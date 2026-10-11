import { useId, useState } from 'react'
import {
  DEFAULT_GROWTH_KEYS,
  GROWTH,
  MAX_N,
  MIN_N,
  barPercent,
  formatGrowth,
  growthValue,
} from '../../lib/growth.js'
import { focusRing } from './styles.js'

/**
 * Penjelajah laju pertumbuhan: geser ukuran input n dan lihat nilai tiap kelas kompleksitas.
 * Datanya ada di tabel (untuk semua pengguna); batang hanya pelengkap visual dan memakai skala logaritma.
 *
 * @param {{ keys?: string[] | null }} props  kunci kelas (lihat lib/growth.js); kosong = semua kelas bawaan
 */
export default function GrowthExplorer({ keys = null }) {
  const uid = useId()
  const [n, setN] = useState(10)
  const shown = (keys?.length ? keys : DEFAULT_GROWTH_KEYS).filter((k) => GROWTH[k])
  const rows = shown.map((k) => ({ key: k, ...GROWTH[k], value: growthValue(k, n) }))
  const max = Math.max(...rows.map((r) => r.value))

  return (
    <section aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Bandingkan laju pertumbuhan
      </p>
      <div className="mt-2">
        <label htmlFor={`${uid}-n`} className="font-semibold">
          Ukuran input n: <span className="tabular-nums">{n}</span>
        </label>
        <input
          id={`${uid}-n`}
          type="range"
          min={MIN_N}
          max={MAX_N}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          aria-valuetext={`n sama dengan ${n}`}
          className={`mt-1 block h-8 w-full max-w-md accent-stone-900 ${focusRing}`}
        />
      </div>

      <div
        // Tabel lebar harus bisa digeser dengan keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="group"
        aria-label="Tabel perbandingan, bisa digeser ke samping"
        className={`mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white ${focusRing}`}
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Nilai tiap kelas kompleksitas untuk n = {n}</caption>
          <thead>
            <tr className="border-b-2 border-stone-900 bg-orange-200">
              <th scope="col" className="px-3 py-2">Notasi</th>
              <th scope="col" className="px-3 py-2">Nama</th>
              <th scope="col" className="px-3 py-2">Contoh</th>
              <th scope="col" className="px-3 py-2">Nilai saat n = {n}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-stone-400 align-top">
                <th scope="row" className="whitespace-nowrap px-3 py-2 font-semibold">{r.notation}</th>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.example}</td>
                <td className="px-3 py-2">
                  <span className="font-semibold tabular-nums">{formatGrowth(r.value)}</span>
                  <span aria-hidden="true" className="mt-1 block h-3 w-40 rounded bg-stone-200">
                    <span className="block h-3 rounded bg-stone-900" style={{ width: `${barPercent(r.value, max)}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm">
        Panjang batang memakai skala logaritma agar semua kelas tetap terlihat. Angka di tabel adalah nilai sebenarnya.
        Semakin rendah kompleksitasnya, semakin efisien algoritma untuk input yang besar.
      </p>
    </section>
  )
}
