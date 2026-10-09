import { formatCall, formatValue } from '../../lib/formatValue.js'

const valueClass = 'mt-0.5 whitespace-pre-wrap break-words rounded-md bg-stone-100 px-2 py-1 font-mono text-sm'

function Row({ label, children }) {
  return (
    <div className="mt-2">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * Hasil per test case. Status selalu berupa teks "Lulus" / "Gagal" (bukan hanya warna atau ikon),
 * dan test yang gagal terbuka otomatis.
 *
 * @param {Object} props
 * @param {Array<{ index: number, pass: boolean, input: unknown[], expected: unknown, actual: unknown, error: string | null, logs: string[] }>} props.results
 * @param {number} props.runNo  nomor eksekusi, supaya panel dibuat ulang tiap Jalankan
 * @param {boolean} [props.stale]  kode sudah diubah sejak hasil ini
 */
export default function TestPanel({ results, runNo, stale = false }) {
  const lulus = results.filter((r) => r.pass).length

  return (
    <section aria-labelledby={`hasil-${runNo}`} className="mt-4 max-w-3xl">
      <h4 id={`hasil-${runNo}`} className="text-lg font-semibold">
        Hasil test case: {lulus} dari {results.length} lulus
      </h4>
      {stale && (
        <p className="mt-1 rounded-md border-2 border-stone-900 bg-orange-100 px-3 py-2 text-sm">
          Kode sudah diubah sejak hasil ini. Jalankan lagi untuk hasil terbaru.
        </p>
      )}
      <ol className="mt-2 space-y-2">
        {results.map((r) => (
          <li
            key={`${runNo}-${r.index}`}
            className={'rounded-xl border-2 border-stone-900 ' + (r.pass ? 'bg-white' : 'bg-orange-50')}
          >
            <details open={!r.pass}>
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 font-semibold focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-stone-900">
                <span aria-hidden="true" className="w-5 text-center">
                  {r.pass ? '✓' : '✗'}
                </span>
                <span>
                  Test case {r.index + 1}: {r.pass ? 'Lulus' : 'Gagal'}
                </span>
              </summary>
              <dl className="border-t-2 border-stone-300 px-3 pb-3">
                <Row label="Panggilan">
                  <p className={valueClass}>{formatCall(r.input)}</p>
                </Row>
                <Row label="Diharapkan">
                  <p className={valueClass}>{formatValue(r.expected)}</p>
                </Row>
                <Row label="Hasil kode Anda">
                  <p className={valueClass}>{r.error ? 'Tidak ada hasil karena terjadi kesalahan' : formatValue(r.actual)}</p>
                </Row>
                {r.error && (
                  <Row label="Kesalahan">
                    <p className={valueClass}>{r.error}</p>
                  </Row>
                )}
                {r.logs.length > 0 && (
                  <Row label="Keluaran console">
                    <p className={valueClass}>{r.logs.join('\n')}</p>
                  </Row>
                )}
              </dl>
            </details>
          </li>
        ))}
      </ol>
    </section>
  )
}
