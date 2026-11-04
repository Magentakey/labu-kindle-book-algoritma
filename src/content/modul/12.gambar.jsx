// Tabel 3 Modul 12 untuk penanda {{gambar:tabel3}}: tabel c dan b contoh bahan kuliah dengan jalur PRINT-LCS. Isinya dihitung dari LCS-LENGTH, bukan diketik.
import TabelLcs from '../../viz/TabelLcs.jsx'
import { contohX, contohY, lcsLength } from '../../viz/lcsModel.js'

export function GambarTabel3() {
  const { c } = lcsLength(contohX, contohY)
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <TabelLcs X={contohX} Y={contohY} />
      <ul className="text-caption mt-3 space-y-1 text-ink-soft">
        <li>Bingkai hijau dan huruf tebal: sel yang dilalui PRINT-LCS.</li>
        <li>Bingkai biru dengan tanda ●: sel ↖ pada jalur itu, yaitu huruf yang dicetak sebagai LCS.</li>
      </ul>
      <figcaption className="text-caption mt-3 text-ink-soft">
        Tabel 3. Tabel c dan b hasil LCS-LENGTH untuk X = ⟨A,B,C,B,D,A,B⟩ dan Y = ⟨B,D,C,A,B,A⟩. Panjang LCS adalah c[7,6] = {c[7][6]}.
      </figcaption>
    </figure>
  )
}
