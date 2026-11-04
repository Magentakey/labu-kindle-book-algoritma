import { cx } from '../ui/cx.js'
import { PANAH, lcsLength, printLcs } from './lcsModel.js'

const NAMA_PANAH = { [PANAH.diagonal]: 'diagonal kiri atas', [PANAH.atas]: 'atas', [PANAH.kiri]: 'kiri' }

/**
 * Tabel c dan b hasil LCS-LENGTH sebagai tabel HTML sungguhan. Sel jalur PRINT-LCS diberi bingkai hijau dan huruf tebal; sel "↖" pada jalur
 * (huruf yang dicetak) diberi bingkai biru dan tanda ●. Pembeda bukan hanya warna: bingkai, tebal, tanda ●, dan teks untuk pembaca layar.
 * @param {{ X: string, Y: string, utamakanAtas?: boolean, className?: string }} props
 */
export default function TabelLcs({ X, Y, utamakanAtas = true, className }) {
  const { c, b } = lcsLength(X, Y, utamakanAtas)
  const { jalur, cetak, lcs } = printLcs(b, X, X.length, Y.length)
  const dijalur = new Set(jalur.map(([i, j]) => `${i},${j}`))
  const dicetak = new Set(cetak.map(({ i }) => i))
  const diCetak = (i, j) => b[i][j] === PANAH.diagonal && dijalur.has(`${i},${j}`) && dicetak.has(i)
  return (
    <div className={cx('relative overflow-x-auto', className)}>
      <table className="border-separate border-spacing-1 text-center">
        <caption className="sr-only">
          Tabel c dan b untuk X = {X} dan Y = {Y}. Panjang LCS {c[X.length][Y.length]}; jalur PRINT-LCS menghasilkan {lcs}.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="text-caption px-2 font-normal text-ink-soft">i \ j</th>
            <th scope="col" className="text-caption px-2 font-normal text-ink-soft">
              <span className="sr-only">huruf x</span>
            </th>
            {[...'·' + Y].map((h, j) => (
              <th key={j} scope="col" className="text-code-bold px-2 text-heading">
                <span className="text-ink-soft block text-[10px] leading-none">{j}</span>
                {j === 0 ? <span className="sr-only">baris dan kolom kosong</span> : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.map((baris, i) => (
            <tr key={i}>
              <th scope="row" className="text-code-bold px-2 text-left whitespace-nowrap text-heading">{i}</th>
              <th scope="row" className="text-code-bold px-2 text-heading">{i === 0 ? <span className="sr-only">kosong</span> : X[i - 1]}</th>
              {baris.map((nilai, j) => {
                const arah = i > 0 && j > 0 ? b[i][j] : ''
                const jalurIni = dijalur.has(`${i},${j}`)
                const huruf = i > 0 && j > 0 && diCetak(i, j)
                return (
                  <td
                    key={j}
                    className={cx(
                      'h-10 min-w-14 rounded-sm border px-1.5 align-middle',
                      huruf ? 'border-brand-blue bg-info-bg font-semibold text-ink' : jalurIni ? 'border-ok bg-ok-bg font-semibold text-ink' : 'border-line bg-card text-ink',
                    )}
                  >
                    <span className="text-code block leading-tight">
                      {nilai}
                      {arah && <span aria-hidden="true"> {arah}</span>}
                      {huruf && <span aria-hidden="true"> ●</span>}
                    </span>
                    {arah && <span className="sr-only">, panah {NAMA_PANAH[arah]}</span>}
                    {jalurIni && <span className="sr-only"> (jalur PRINT-LCS)</span>}
                    {huruf && <span className="sr-only"> (huruf {X[i - 1]} masuk LCS)</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
