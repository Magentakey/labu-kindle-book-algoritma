import { useId } from 'react'
import { PLOT, bentukById, formatLog, labelTick, logRasio, skalaLog, titikN } from './limitModel.js'

const sup10 = (e) => `10${String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`

/**
 * Grafik rasio cf·f(n) / cg·g(n) dengan sumbu mendatar (n) dan tegak (rasio) berskala logaritmik. Garis putus-putus pada rasio 1 menandai
 * "sama besar": kurva yang turun jauh di bawahnya menuju 0 (little-o), yang mendatar menuju konstanta (Θ), yang naik menuju ∞ (little-ω).
 * Nilai pasti ada pada tabel di halaman penjelajah.
 *
 * @param {{ idF: string, idG: string, cf: number, cg: number, dekade: number, className?: string }} props
 */
export default function GrafikRasio({ idF, idG, cf, cg, dekade, className }) {
  const uid = useId()
  const ns = titikN(dekade)
  const ls = ns.map((n) => logRasio(idF, idG, cf, cg, n))
  const sk = skalaLog(ls)
  const x0 = PLOT.kiri
  const x1 = PLOT.lebar - PLOT.kanan
  const y1 = PLOT.tinggi - PLOT.bawah
  const xOf = (e) => x0 + ((e - 1) / dekade) * (x1 - x0) // e = log10 n, dari 1
  const d = 'M' + ns.map((n, i) => `${xOf(Math.log10(n)).toFixed(1)} ${sk.yOf(ls[i]).toFixed(1)}`).join(' L')
  const lf = bentukById(idF).label
  const lg = bentukById(idG).label
  const akhir = ls[ls.length - 1]
  const arah = akhir - ls[ls.length - 9] < -0.05 ? 'menurun' : akhir - ls[ls.length - 9] > 0.05 ? 'menaik' : 'mendatar'
  const deskripsi =
    `Grafik rasio f(n)/g(n) dengan f(n) = ${lf} dan g(n) = ${lg}, untuk n dari 10 sampai ${sup10(dekade + 1)}, kedua sumbu berskala logaritmik. ` +
    `Rasio pada n = 10 adalah ${formatLog(ls[0])} dan pada n = ${sup10(dekade + 1)} adalah ${formatLog(akhir)}; kurva ${arah}. ` +
    'Garis putus-putus menandai rasio 1. Nilai pasti ada pada tabel di bawah grafik.'
  return (
    <div className={className}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah gulir perlu fokus agar grafik lebar terjangkau keyboard */}
      <div role="region" aria-label="Grafik rasio, bisa digeser ke samping" tabIndex={0} className="overflow-x-auto">
        <svg viewBox={`0 0 ${PLOT.lebar} ${PLOT.tinggi}`} role="img" aria-labelledby={`${uid}-j ${uid}-d`} className="block h-auto w-full min-w-[540px] text-ink" focusable="false">
          <title id={`${uid}-j`}>Grafik rasio f(n)/g(n)</title>
          <desc id={`${uid}-d`}>{deskripsi}</desc>
          <g stroke="var(--border-default)" strokeWidth="1">
            {sk.tick.map((t) => (
              <line key={t} x1={x0} x2={x1} y1={sk.yOf(t)} y2={sk.yOf(t)} />
            ))}
          </g>
          <g fontSize="13" fill="var(--text-secondary)" textAnchor="end">
            {sk.tick.map((t) => (
              <text key={t} x={x0 - 8} y={sk.yOf(t) + 4}>
                {labelTick(t)}
              </text>
            ))}
          </g>
          <g stroke="var(--text-primary)" strokeWidth="1.5">
            <line x1={x0} x2={x0} y1={PLOT.atas} y2={y1} />
            <line x1={x0} x2={x1} y1={y1} y2={y1} />
          </g>
          <g fontSize="13" fill="var(--text-secondary)" textAnchor="middle">
            {Array.from({ length: dekade + 1 }, (_, i) => i + 1).map((e) => (
              <g key={e}>
                <line x1={xOf(e)} x2={xOf(e)} y1={y1} y2={y1 + 5} stroke="var(--text-primary)" strokeWidth="1.5" />
                <text x={xOf(e)} y={y1 + 20}>{sup10(e)}</text>
              </g>
            ))}
            <text x={(x0 + x1) / 2} y={PLOT.tinggi - 6} fontSize="14">ukuran masukan n (skala logaritmik)</text>
          </g>
          <text transform={`translate(16 ${(PLOT.atas + y1) / 2}) rotate(-90)`} textAnchor="middle" fontSize="14" fill="var(--text-secondary)">rasio f(n)/g(n)</text>
          <line x1={x0} x2={x1} y1={sk.yOf(0)} y2={sk.yOf(0)} stroke="var(--text-primary)" strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={x1 - 4} y={sk.yOf(0) - 6} textAnchor="end" fontSize="12" fill="var(--text-primary)">rasio = 1</text>
          <path d={d} fill="none" stroke="var(--syn-builtin)" strokeWidth="3" strokeLinejoin="round" />
          {[1, 2, 3].filter((e) => e <= dekade).map((e) => {
            const l = logRasio(idF, idG, cf, cg, 10 ** e)
            return <circle key={e} cx={xOf(e)} cy={sk.yOf(l)} r="4.5" fill="var(--bg-card)" stroke="var(--syn-builtin)" strokeWidth="2.4" />
          })}
        </svg>
      </div>
      <p className="text-caption mt-2 text-ink-soft">Lingkaran menandai n = 10, 100, dan 1.000 (nilainya ada di tabel).</p>
    </div>
  )
}
