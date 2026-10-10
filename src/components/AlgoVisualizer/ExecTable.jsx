import { useId } from 'react'

/**
 * Tabel hitungan eksekusi tiap baris (mode Tepat). Angka bertambah seiring langkah maju.
 *
 * @param {Object} props
 * @param {Array<{ line: number, text: string, count: number }>} props.rows
 * @param {number} props.activeLine  baris yang baru dieksekusi
 * @param {number} props.current     jumlah eksekusi sampai langkah ini
 * @param {number} props.total       jumlah eksekusi seluruh jalannya algoritma
 */
export default function ExecTable({ rows, activeLine, current, total }) {
  const titleId = `${useId()}-judul`
  return (
    <section aria-labelledby={titleId} className="mt-4 rounded-xl border-2 border-stone-900 bg-white p-3">
      <h3 id={titleId} className="font-semibold">
        Hitungan eksekusi tiap baris
      </h3>
      <p className="mt-1 text-sm">
        Satu langkah sama dengan satu kali sebuah baris dieksekusi. Baris perulangan dihitung setiap kali kondisinya
        diperiksa, termasuk pemeriksaan terakhir yang gagal. Angka di bawah ini bertambah saat Anda melangkah.
      </p>
      <div
        // Area geser harus bisa difokus keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label="Tabel hitungan eksekusi (bisa digeser)"
        className="mt-2 overflow-x-auto focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <caption className="sr-only">Berapa kali setiap baris kode sudah dieksekusi sampai langkah ini</caption>
          <thead>
            <tr className="border-b-2 border-stone-900 text-left">
              <th scope="col" className="px-2 py-1">Baris</th>
              <th scope="col" className="px-2 py-1">Kode</th>
              <th scope="col" className="px-2 py-1 text-right">Dieksekusi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = r.line === activeLine
              return (
                <tr key={r.line} className={'border-b border-stone-300 ' + (active ? 'bg-orange-100 font-bold' : '')}>
                  <th scope="row" className="px-2 py-1 text-left font-semibold">
                    {r.line}
                    {active && <span className="sr-only"> (baris yang baru dieksekusi)</span>}
                  </th>
                  <td className="px-2 py-1">
                    <code className="whitespace-pre font-mono">{r.text}</code>
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">{r.count} kali</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-900 font-semibold">
              <th scope="row" colSpan={2} className="px-2 py-1 text-left">
                Total eksekusi baris sampai langkah ini
              </th>
              <td className="px-2 py-1 text-right tabular-nums">{current} kali</td>
            </tr>
            <tr className="font-semibold">
              <th scope="row" colSpan={2} className="px-2 py-1 text-left">
                Total seluruh langkah (running time jika tiap baris berbiaya 1)
              </th>
              <td className="px-2 py-1 text-right tabular-nums">{total} kali</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
