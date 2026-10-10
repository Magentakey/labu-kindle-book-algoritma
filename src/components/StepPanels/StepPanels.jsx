import { useId } from 'react'

export function ListPanel({ title, items, empty }) {
  const uid = useId()
  return (
    <section aria-labelledby={uid} className="mt-3 rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <p id={uid} className="text-sm font-semibold">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-stone-700">{empty || 'kosong'}</p>
      ) : (
        // Tailwind menghapus penanda daftar; role="list" menjaga semantik daftar di Safari/VoiceOver.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ol role="list" className="mt-2 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex min-h-10 min-w-10 items-center justify-center rounded border-2 border-stone-800 bg-orange-50 px-2 font-bold"
            >
              {item}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function TablePanel({ caption, headers, rows, activeRow }) {
  return (
    <div
      // Tabel yang lebar bisa digeser, jadi areanya harus bisa difokus keyboard (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white text-stone-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
    >
      <table className="w-full border-collapse text-sm">
        <caption className="p-3 text-left font-semibold">{caption}</caption>
        <thead>
          <tr className="border-y-2 border-stone-900 bg-orange-100">
            {headers.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={r}
              aria-current={r === activeRow ? 'true' : undefined}
              className={'border-b border-stone-300 ' + (r === activeRow ? 'bg-orange-100 font-semibold' : '')}
            >
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-3 py-2 text-left font-semibold">
                    {r === activeRow && <span aria-hidden="true">▶ </span>}
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="px-3 py-2">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
