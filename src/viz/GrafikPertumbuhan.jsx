import { useId } from 'react'
import { fungsi, fungsiById, gaya, jalurKurva, log10Nilai, PLOT, skalaY, tickX, xOf } from './growthModel.js'

/** Contoh garis kecil untuk legenda. */
export function Swatch({ id }) {
  const g = gaya[id]
  return (
    <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true" focusable="false" className="shrink-0">
      <line x1="1" y1="5" x2="29" y2="5" stroke={g.warna} strokeWidth="2.6" strokeDasharray={g.dash || undefined} strokeLinecap="butt" />
    </svg>
  )
}

/** Merapikan label di ujung kanan supaya tidak bertumpuk (jarak minimal 13 px). */
function rapikan(items) {
  const urut = [...items].sort((a, b) => a.y - b.y)
  for (let i = 1; i < urut.length; i++) if (urut[i].y - urut[i - 1].y < 13) urut[i].y = urut[i - 1].y + 13
  return urut
}

/**
 * Grafik pertumbuhan fungsi untuk n = 1..nMax. Linier: sumbu tegak 0..6·nMax (kurva yang melewatinya dipotong di tepi atas, ditandai ↑).
 * Logaritmik: sumbu tegak berupa pangkat sepuluh. `n` (opsional) menampilkan kursor dan titik nilai pada ukuran itu.
 *
 * @param {{ keys: string[], nMax: number, skala: 'linear' | 'log', n?: number, legenda?: boolean, className?: string }} props
 */
export default function GrafikPertumbuhan({ keys, nMax, skala, n, legenda = true, className }) {
  const uid = useId()
  const urutan = fungsi.map((f) => f.id).filter((id) => keys.includes(id))
  const sk = skalaY(skala, nMax, urutan)
  const x1 = PLOT.lebar - PLOT.kanan
  const y1 = PLOT.tinggi - PLOT.bawah
  const kurva = urutan.map((id) => ({ id, ...jalurKurva(id, nMax, sk) }))

  // label di ujung kanan untuk kurva yang tidak terpotong; kurva terpotong diberi label di tepi atas
  const labelKanan = rapikan(kurva.filter((k) => !k.terpotong && k.ujung).map((k) => ({ id: k.id, y: k.ujung.y + 4 })))
  const terpotong = kurva.filter((k) => k.terpotong && k.ujung)

  const peringkat = [...urutan].sort((a, b) => log10Nilai(a, nMax) - log10Nilai(b, nMax)).map((id) => fungsiById(id).label)
  const deskripsi =
    `Grafik garis ${urutan.length} fungsi untuk ukuran masukan n dari 1 sampai ${nMax}. ` +
    (skala === 'linear' ? `Sumbu tegak linier dari 0 sampai ${sk.yMax}; kurva yang melewatinya dipotong di tepi atas. ` : 'Sumbu tegak logaritmik (pangkat sepuluh). ') +
    `Pada n = ${nMax}, urutan dari paling kecil ke paling besar: ${peringkat.join(', ')}. Nilai pasti ada pada tabel di bawah grafik.`

  const kursor = n && n >= 1 && n <= nMax ? n : null

  return (
    <div className={className}>
      {/* Di layar sempit grafik tidak dikecilkan sampai teks sumbunya tak terbaca, tetapi bisa digeser; wadah yang bisa digulir harus bisa difokus keyboard. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah gulir perlu fokus agar grafik lebar terjangkau keyboard */}
      <div role="region" aria-label="Grafik, bisa digeser ke samping" tabIndex={0} className="overflow-x-auto">
      <svg viewBox={`0 0 ${PLOT.lebar} ${PLOT.tinggi}`} role="img" aria-labelledby={`${uid}-j ${uid}-d`} className="block h-auto w-full min-w-[540px] text-ink" focusable="false">
        <title id={`${uid}-j`}>Grafik pertumbuhan fungsi running time</title>
        <desc id={`${uid}-d`}>{deskripsi}</desc>
        {/* garis bantu dan angka sumbu tegak */}
        <g stroke="var(--border-default)" strokeWidth="1">
          {sk.tick.map((t) => (
            <line key={t.v} x1={PLOT.kiri} x2={x1} y1={sk.posisi(t.v)} y2={sk.posisi(t.v)} />
          ))}
        </g>
        <g fontSize="13" fill="var(--text-secondary)" textAnchor="end">
          {sk.tick.map((t) => (
            <text key={t.v} x={PLOT.kiri - 8} y={sk.posisi(t.v) + 4}>
              {t.label}
            </text>
          ))}
        </g>
        {/* sumbu */}
        <g stroke="var(--text-primary)" strokeWidth="1.5">
          <line x1={PLOT.kiri} x2={PLOT.kiri} y1={PLOT.atas} y2={y1} />
          <line x1={PLOT.kiri} x2={x1} y1={y1} y2={y1} />
        </g>
        <g fontSize="13" fill="var(--text-secondary)" textAnchor="middle">
          {tickX(nMax).map((t) => (
            <g key={t}>
              <line x1={xOf(t, nMax)} x2={xOf(t, nMax)} y1={y1} y2={y1 + 5} stroke="var(--text-primary)" strokeWidth="1.5" />
              <text x={xOf(t, nMax)} y={y1 + 20}>
                {t}
              </text>
            </g>
          ))}
          <text x={(PLOT.kiri + x1) / 2} y={PLOT.tinggi - 6} fontSize="14">
            ukuran masukan n
          </text>
        </g>
        <text transform={`translate(14 ${(PLOT.atas + y1) / 2}) rotate(-90)`} textAnchor="middle" fontSize="14" fill="var(--text-secondary)">
          {skala === 'linear' ? 'f(n)' : 'f(n), skala logaritmik'}
        </text>

        {/* kursor n */}
        {kursor && (
          <g>
            <line x1={xOf(kursor, nMax)} x2={xOf(kursor, nMax)} y1={PLOT.atas} y2={y1} stroke="var(--text-primary)" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={xOf(kursor, nMax)} y={PLOT.atas - 3} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-primary)">
              n = {kursor}
            </text>
          </g>
        )}

        {/* kurva */}
        {kurva.map((k) => (
          <path key={k.id} d={k.d} fill="none" stroke={gaya[k.id].warna} strokeWidth="2.6" strokeDasharray={gaya[k.id].dash || undefined} strokeLinejoin="round" />
        ))}

        {/* titik pada kursor */}
        {kursor &&
          kurva.map((k) => {
            const t = k.titik.find((p) => p.n === kursor)
            return t && t.y !== null ? <circle key={k.id} cx={t.x} cy={t.y} r="4.5" fill="var(--bg-card)" stroke={gaya[k.id].warna} strokeWidth="2.4" /> : null
          })}

        {/* label ujung */}
        <g fontSize="14" fontWeight="600">
          {labelKanan.map((l) => (
            <text key={l.id} x={x1 + 8} y={l.y} fill={gaya[l.id].warna}>
              {fungsiById(l.id).label}
            </text>
          ))}
          {terpotong.map((k) => (
            <text key={k.id} x={k.ujung.x + 5} y={PLOT.atas + 14} fill={gaya[k.id].warna}>
              ↑ {fungsiById(k.id).label}
            </text>
          ))}
        </g>
      </svg>
      </div>
      {legenda && (
        <ul aria-label="Legenda grafik" className="text-caption mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-ink">
          {urutan.map((id) => (
            <li key={id} className="flex items-center gap-2">
              <Swatch id={id} />
              {fungsiById(id).label}
              {skala === 'linear' && kurva.find((k) => k.id === id)?.terpotong && <span className="text-ink-soft">(keluar dari grafik)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
