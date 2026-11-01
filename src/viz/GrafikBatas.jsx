import { useId } from 'react'
import { PLOT, angkaID, gayaBatas, jalurFungsi, labelG, nilaiF, nilaiG, skalaGrafik, teksF } from './boundModel.js'

/** Contoh garis kecil untuk legenda. */
export function SwatchBatas({ id }) {
  const g = gayaBatas[id]
  return (
    <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true" focusable="false" className="shrink-0">
      <line x1="1" y1="5" x2="29" y2="5" stroke={g.warna} strokeWidth={g.lebar} strokeDasharray={g.dash || undefined} />
    </svg>
  )
}

/** Merapikan label di ujung kanan supaya tidak bertumpuk (jarak minimal 14 px). */
function rapikan(items) {
  const urut = [...items].sort((a, b) => a.y - b.y)
  for (let i = 1; i < urut.length; i++) if (urut[i].y - urut[i - 1].y < 14) urut[i].y = urut[i - 1].y + 14
  return urut
}

/**
 * Grafik f(n) dengan batas-batasnya untuk n = 0..nMax. Daerah di kiri n₀ diarsir (tidak diperiksa), dan setiap n ≥ n₀ yang melanggar syarat
 * ditandai ✕. Kurva yang melewati tepi atas dipotong. Padanan teks grafik ada pada tabel di halaman penjelajah.
 *
 * @param {{ notasi: 'theta' | 'big' | 'omega', p: {a:number,b:number,c0:number}, k: number, konstanta: {c1:number,c2:number,c:number}, n0: number, nMax: number, gagal?: number[], className?: string }} props
 */
export default function GrafikBatas({ notasi, p, k, konstanta, n0, nMax, gagal = [], className }) {
  const uid = useId()
  const { c1, c2, c } = konstanta
  const kBawah = notasi === 'theta' ? c1 : notasi === 'omega' ? c : null
  const kAtas = notasi === 'theta' ? c2 : notasi === 'big' ? c : null
  const fN = (n) => nilaiF(p, n)
  const bawahFn = kBawah === null ? null : (n) => kBawah * nilaiG(k, n)
  const atasFn = kAtas === null ? null : (n) => kAtas * nilaiG(k, n)

  const ns = Array.from({ length: nMax + 1 }, (_, i) => i)
  const nilaiF_ = ns.map(fN)
  const maksF = Math.max(1, ...nilaiF_)
  const potong = 3 * maksF
  const semua = [...nilaiF_, ...(bawahFn ? ns.map((n) => Math.min(bawahFn(n), potong)) : []), ...(atasFn ? ns.map((n) => Math.min(atasFn(n), potong)) : [])]
  const sk = skalaGrafik(nMax, semua)
  const x0 = PLOT.kiri
  const x1 = PLOT.lebar - PLOT.kanan
  const y0 = PLOT.atas
  const y1 = PLOT.tinggi - PLOT.bawah
  const n0Tampil = n0 <= nMax ? n0 : null

  const lblAkhir = (fn) => {
    const v = fn(nMax)
    return { y: sk.yOf(Math.max(sk.lo, Math.min(sk.hi, v))) + 4, keluar: v > sk.hi }
  }
  const label = rapikan([
    { id: 'f', teks: 'f(n)', ...lblAkhir(fN) },
    ...(bawahFn ? [{ id: 'bawah', teks: notasi === 'theta' ? 'c₁g(n)' : 'c·g(n)', ...lblAkhir(bawahFn) }] : []),
    ...(atasFn ? [{ id: 'atas', teks: notasi === 'theta' ? 'c₂g(n)' : 'c·g(n)', ...lblAkhir(atasFn) }] : []),
  ])

  const tickN = ns.filter((n) => n % (nMax <= 12 ? 1 : nMax <= 30 ? 5 : 10) === 0)
  const deskripsi =
    `Grafik f(n) = ${teksF(p)} dan g(n) = ${labelG(k)} untuk n dari 0 sampai ${nMax}. ` +
    (notasi === 'theta' ? `Batas bawah ${angkaID(c1)}·g(n) dan batas atas ${angkaID(c2)}·g(n). ` : `Batas ${notasi === 'big' ? 'atas' : 'bawah'} ${angkaID(c)}·g(n). `) +
    `Daerah di kiri n₀ = ${n0} diarsir dan tidak diperiksa. ` +
    (gagal.length === 0 ? 'Semua n yang diperiksa memenuhi syarat.' : `Syarat dilanggar pada n = ${gagal.slice(0, 8).join(', ')}${gagal.length > 8 ? ', dan seterusnya' : ''}.`) +
    ' Nilai pasti ada pada tabel di bawah grafik.'

  return (
    <div className={className}>
      {/* Wadah gulir perlu fokus keyboard agar grafik lebar terjangkau di layar sempit. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah gulir perlu fokus agar grafik lebar terjangkau keyboard */}
      <div role="region" aria-label="Grafik, bisa digeser ke samping" tabIndex={0} className="overflow-x-auto">
        <svg viewBox={`0 0 ${PLOT.lebar} ${PLOT.tinggi}`} role="img" aria-labelledby={`${uid}-j ${uid}-d`} className="block h-auto w-full min-w-[540px] text-ink" focusable="false">
          <title id={`${uid}-j`}>Grafik f(n) dengan batas asimtotiknya</title>
          <desc id={`${uid}-d`}>{deskripsi}</desc>
          <defs>
            <clipPath id={`${uid}-klip`}>
              <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
            </clipPath>
            <pattern id={`${uid}-arsir`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--neutral-muted)" strokeWidth="1.5" opacity="0.55" />
            </pattern>
          </defs>

          {/* garis bantu dan angka sumbu tegak */}
          <g stroke="var(--border-default)" strokeWidth="1">
            {sk.tick.map((t) => (
              <line key={t} x1={x0} x2={x1} y1={sk.yOf(t)} y2={sk.yOf(t)} />
            ))}
          </g>
          <g fontSize="13" fill="var(--text-secondary)" textAnchor="end">
            {sk.tick.map((t) => (
              <text key={t} x={x0 - 8} y={sk.yOf(t) + 4}>
                {angkaID(t)}
              </text>
            ))}
          </g>

          {/* daerah sebelum n₀: tidak diperiksa */}
          {n0Tampil !== null && n0Tampil > 0 && <rect x={x0} y={y0} width={sk.xOf(n0Tampil) - x0} height={y1 - y0} fill={`url(#${uid}-arsir)`} />}

          {/* sumbu */}
          <g stroke="var(--text-primary)" strokeWidth="1.5">
            <line x1={x0} x2={x0} y1={y0} y2={y1} />
            <line x1={x0} x2={x1} y1={sk.yOf(0)} y2={sk.yOf(0)} />
          </g>
          <g fontSize="13" fill="var(--text-secondary)" textAnchor="middle">
            {tickN.map((n) => (
              <g key={n}>
                <line x1={sk.xOf(n)} x2={sk.xOf(n)} y1={sk.yOf(0)} y2={sk.yOf(0) + 5} stroke="var(--text-primary)" strokeWidth="1.5" />
                <text x={sk.xOf(n)} y={y1 + 20}>
                  {n}
                </text>
              </g>
            ))}
            <text x={(x0 + x1) / 2} y={PLOT.tinggi - 6} fontSize="14">
              ukuran masukan n
            </text>
          </g>

          {/* garis n₀ */}
          {n0Tampil !== null && (
            <g>
              <line x1={sk.xOf(n0Tampil)} x2={sk.xOf(n0Tampil)} y1={y0} y2={y1} stroke="var(--text-primary)" strokeWidth="1.4" strokeDasharray="4 3" />
              <text x={sk.xOf(n0Tampil)} y={y0 - 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-primary)">
                n₀ = {n0Tampil}
              </text>
            </g>
          )}

          {/* kurva */}
          <g clipPath={`url(#${uid}-klip)`} fill="none" strokeLinejoin="round">
            {bawahFn && <path d={jalurFungsi(bawahFn, nMax, sk)} stroke={gayaBatas.bawah.warna} strokeWidth={gayaBatas.bawah.lebar} strokeDasharray={gayaBatas.bawah.dash} />}
            {atasFn && <path d={jalurFungsi(atasFn, nMax, sk)} stroke={gayaBatas.atas.warna} strokeWidth={gayaBatas.atas.lebar} strokeDasharray={gayaBatas.atas.dash} />}
            <path d={jalurFungsi(fN, nMax, sk)} stroke={gayaBatas.f.warna} strokeWidth={gayaBatas.f.lebar} />
          </g>

          {/* titik f(n) pada bilangan bulat, dan ✕ di n yang melanggar */}
          {nMax <= 30 &&
            ns.map((n) => (
              <circle key={n} cx={sk.xOf(n)} cy={sk.yOf(fN(n))} r="3" fill="var(--bg-card)" stroke={gayaBatas.f.warna} strokeWidth="1.8" />
            ))}
          {gagal.filter((n) => n <= nMax).map((n) => (
            <g key={n} stroke="var(--status-error)" strokeWidth="3" strokeLinecap="round">
              <line x1={sk.xOf(n) - 6} y1={sk.yOf(fN(n)) - 6} x2={sk.xOf(n) + 6} y2={sk.yOf(fN(n)) + 6} />
              <line x1={sk.xOf(n) - 6} y1={sk.yOf(fN(n)) + 6} x2={sk.xOf(n) + 6} y2={sk.yOf(fN(n)) - 6} />
            </g>
          ))}

          {/* label ujung */}
          <g fontSize="14" fontWeight="600">
            {label.map((l) => (
              <text key={l.id} x={x1 + 8} y={l.y} fill={gayaBatas[l.id].warna}>
                {l.keluar ? '↑ ' : ''}
                {l.teks}
              </text>
            ))}
          </g>
        </svg>
      </div>
      <ul aria-label="Legenda grafik" className="text-caption mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-ink">
        <li className="flex items-center gap-2">
          <SwatchBatas id="f" />f(n)
        </li>
        {notasi !== 'big' && (
          <li className="flex items-center gap-2">
            <SwatchBatas id="bawah" />
            {notasi === 'theta' ? 'c₁·g(n), batas bawah' : 'c·g(n), batas bawah'}
          </li>
        )}
        {notasi !== 'omega' && (
          <li className="flex items-center gap-2">
            <SwatchBatas id="atas" />
            {notasi === 'theta' ? 'c₂·g(n), batas atas' : 'c·g(n), batas atas'}
          </li>
        )}
        <li className="flex items-center gap-2">
          <svg width="30" height="12" viewBox="0 0 30 12" aria-hidden="true" focusable="false" className="shrink-0">
            <rect x="1" y="1" width="28" height="10" fill="none" stroke="var(--neutral-muted)" strokeDasharray="3 2" />
            <path d="M4 11 L12 1 M10 11 L18 1 M16 11 L24 1" stroke="var(--neutral-muted)" strokeWidth="1.3" />
          </svg>
          n &lt; n₀ (tidak diperiksa)
        </li>
        {gagal.length > 0 && (
          <li className="flex items-center gap-2 text-bad-text">
            <span aria-hidden="true" className="font-bold">✕</span>
            syarat dilanggar
          </li>
        )}
      </ul>
    </div>
  )
}
