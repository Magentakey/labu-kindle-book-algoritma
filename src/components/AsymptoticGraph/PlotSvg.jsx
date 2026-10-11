import { useEffect, useId, useRef, useState } from 'react'
import { formatTick, unitY, yDomain } from '../../lib/asymptotic.js'

// Setiap kurva dibedakan oleh 3 hal sekaligus: pola garis, bentuk penanda, dan nama di legenda,
// sehingga warna bukan satu-satunya pembeda (WCAG 1.4.1). Semua warna ≥ 4,5:1 di atas putih.
// Bentuk penanda: circle, square, triangle, diamond, plus, cross, star.
function markerPath(shape, x, y, r) {
  switch (shape) {
    case 'circle':
      return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
    case 'square':
      return `M${x - r} ${y - r}h${2 * r}v${2 * r}h${-2 * r}z`
    case 'triangle':
      return `M${x} ${y - r - 1}L${x + r + 1} ${y + r}L${x - r - 1} ${y + r}z`
    case 'diamond':
      return `M${x} ${y - r - 1}L${x + r + 1} ${y}L${x} ${y + r + 1}L${x - r - 1} ${y}z`
    case 'plus':
      return `M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}`
    case 'cross':
      return `M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}`
    default: {
      // bintang lima sudut
      const pts = []
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r + 2 : (r + 2) * 0.45
        const ang = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push(`${(x + rr * Math.cos(ang)).toFixed(1)} ${(y + rr * Math.sin(ang)).toFixed(1)}`)
      }
      return `M${pts.join('L')}z`
    }
  }
}

const strokeOnly = (shape) => shape === 'plus' || shape === 'cross'

/** Penanda kecil berbentuk path; plus dan silang hanya garis. */
function Marker({ shape, x, y, r = 4, color, big = false }) {
  const rr = big ? r + 2 : r
  return (
    <path
      d={markerPath(shape, x, y, rr)}
      fill={strokeOnly(shape) ? 'none' : color}
      stroke={strokeOnly(shape) || big ? (big ? '#ffffff' : color) : 'none'}
      strokeWidth={strokeOnly(shape) && !big ? 2.2 : big ? 1.5 : 0}
      paintOrder="stroke"
    />
  )
}

/** Contoh garis + penanda untuk legenda (HTML), sama dengan yang digambar di grafik. */
export function LegendSwatch({ s }) {
  return (
    <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" className="shrink-0">
      <line x1="2" y1="8" x2="42" y2="8" stroke={s.color} strokeWidth={s.width ?? 2.5} strokeDasharray={s.dash || undefined} />
      <Marker shape={s.marker} x={22} y={8} color={s.color} />
    </svg>
  )
}

/** Lebar elemen (px), diperbarui saat ukuran berubah. Nilai awal dipakai sebelum pengukuran pertama. */
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

function niceStep(range, maxTicks) {
  const raw = range / maxTicks
  const pow = 10 ** Math.floor(Math.log10(raw))
  for (const k of [1, 2, 2.5, 5, 10]) if (k * pow >= raw) return k * pow
  return 10 * pow
}

function yTicks(domain, scale) {
  const [lo, hi] = domain
  if (scale === 'log') {
    const a = Math.round(Math.log10(lo))
    const b = Math.round(Math.log10(hi))
    const stride = Math.max(1, Math.ceil((b - a) / 6))
    const out = []
    for (let e = a; e <= b; e += stride) out.push(10 ** e)
    return out
  }
  const step = niceStep(hi - lo, 5)
  const out = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toPrecision(12)))
  return out
}

/**
 * Potongan kurva yang berada di dalam bingkai. Kurva yang keluar lewat atas dipotong di tepi
 * (bukan digepengkan di sepanjang tepi) dan ditandai dengan panah.
 */
function segments(points, domain, scale) {
  const segs = []
  let cur = []
  let exit = null
  for (const p of points) {
    const t = unitY(p.v, domain, scale)
    if (t > 1) {
      if (cur.length) {
        cur.push({ n: p.n, t: 1 })
        exit = p.n
      }
      break
    }
    cur.push({ n: p.n, t: Math.max(0, t) })
  }
  if (cur.length) segs.push(cur)
  return { segs, exit }
}

/**
 * Grafik garis fungsi terhadap n.
 *
 * @param {Object} props
 * @param {{ id: string, label: string, color: string, dash?: string, marker: string, width?: number, fn: (n: number) => number }[]} props.series
 * @param {number} props.xMax            n terbesar yang digambar (mulai dari 1)
 * @param {number} props.cursorN         n yang sedang disorot
 * @param {'linear' | 'log'} props.scale
 * @param {{ lower: (n: number) => number, upper: (n: number) => number } | null} [props.band]  daerah jepitan
 * @param {{ n: number, label?: string }[]} [props.vlines]
 * @param {{ value: number, label: string, color?: string, dash?: string }[]} [props.hlines]
 * @param {number | null} [props.shadeFrom]  n awal daerah "berlaku untuk semua n sesudahnya"
 * @param {string} [props.shadeLabel]
 * @param {string} props.ariaLabel
 */
export default function PlotSvg({ series, xMax, cursorN, scale, band = null, vlines = [], hlines = [], shadeFrom = null, shadeLabel = '', ariaLabel }) {
  const uid = useId().replace(/[^\w-]/g, '')
  const [boxRef, width] = useWidth()
  const m = { l: 60, r: 14, t: 16, b: 42 }
  const H = width < 480 ? 290 : 350
  const pw = Math.max(60, width - m.l - m.r)
  const ph = H - m.t - m.b

  const samples = series.map((s) => ({ s, pts: Array.from({ length: xMax }, (_, i) => ({ n: i + 1, v: s.fn(i + 1) })) }))

  // Rentang y. Skala linear: bila satu kurva jauh melampaui yang lain (> 20×), tingkat atas mengikuti kurva
  // kedua supaya kurva yang lain tetap terbaca; kurva yang melonjak dipotong di tepi atas dan diberi panah.
  const all = [
    ...samples.flatMap(({ pts }) => pts.map((p) => p.v)),
    ...hlines.map((h) => h.value),
    ...(band ? Array.from({ length: xMax }, (_, i) => band.upper(i + 1)) : []),
  ]
  let domain = yDomain(all, scale)
  if (scale === 'linear') {
    const tops = samples.map(({ pts }) => Math.max(...pts.map((p) => p.v).filter(Number.isFinite))).filter((v) => v > 0).sort((a, b) => b - a)
    if (tops.length > 1 && tops[0] > tops[1] * 20) domain = [0, tops[1] * 1.15]
  }

  const X = (n) => m.l + ((n - 1) / Math.max(1, xMax - 1)) * pw
  const Y = (t) => m.t + (1 - t) * ph
  const tY = (v) => Math.min(1, Math.max(0, scale === 'log' && !(v > 0) ? 0 : unitY(v, domain, scale)))

  const xStep = niceStep(xMax - 1, 7)
  const xTicks = []
  for (let v = Math.max(xStep, 1); v <= xMax; v += xStep) xTicks.push(Math.round(v))
  if (!xTicks.includes(1) && xTicks[0] - 1 >= xStep * 0.6) xTicks.unshift(1)
  const ticks = yTicks(domain, scale)
  const every = Math.max(1, Math.ceil(xMax / 10)) // penanda tiap sekian n

  const labelStyle = { paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 3, strokeLinejoin: 'round' }

  return (
    <div ref={boxRef} className="w-full">
      <svg role="img" aria-label={ariaLabel} width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block max-w-full select-none">
        <defs>
          <clipPath id={`${uid}-clip`}>
            <rect x={m.l} y={m.t} width={pw} height={ph} />
          </clipPath>
          <pattern id={`${uid}-band`} patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M-1 9L9 -1" stroke="#0f766e" strokeWidth="1.2" opacity="0.55" />
          </pattern>
          <pattern id={`${uid}-shade`} patternUnits="userSpaceOnUse" width="7" height="7">
            <circle cx="2" cy="2" r="0.9" fill="#a16207" opacity="0.45" />
          </pattern>
        </defs>

        <rect x={m.l} y={m.t} width={pw} height={ph} fill="#ffffff" stroke="#1c1917" strokeWidth="2" />

        {/* garis bantu */}
        {ticks.map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={m.l + pw} y1={Y(tY(v))} y2={Y(tY(v))} stroke="#d6d3d1" strokeWidth="1" />
            <text x={m.l - 8} y={Y(tY(v)) + 4} textAnchor="end" fontSize="12" fill="#44403c">
              {formatTick(v)}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <g key={`x${v}`}>
            <line x1={X(v)} x2={X(v)} y1={m.t + ph} y2={m.t + ph + 5} stroke="#1c1917" strokeWidth="1.5" />
            <text x={X(v)} y={m.t + ph + 20} textAnchor="middle" fontSize="12" fill="#44403c">
              {v}
            </text>
          </g>
        ))}
        <text x={m.l + pw / 2} y={H - 6} textAnchor="middle" fontSize="13" fontWeight="600" fill="#1c1917">
          n (ukuran input)
        </text>

        <g clipPath={`url(#${uid}-clip)`}>
          {shadeFrom !== null && shadeFrom <= xMax && (
            <rect x={X(shadeFrom)} y={m.t} width={Math.max(0, m.l + pw - X(shadeFrom))} height={ph} fill="#fef3c7" opacity="0.7" />
          )}
          {shadeFrom !== null && shadeFrom <= xMax && (
            <rect x={X(shadeFrom)} y={m.t} width={Math.max(0, m.l + pw - X(shadeFrom))} height={ph} fill={`url(#${uid}-shade)`} />
          )}
          {band && (
            <path
              d={
                'M' +
                Array.from({ length: xMax }, (_, i) => `${X(i + 1)} ${Y(tY(band.upper(i + 1)))}`).join('L') +
                'L' +
                Array.from({ length: xMax }, (_, i) => `${X(xMax - i)} ${Y(tY(band.lower(xMax - i)))}`).join('L') +
                'z'
              }
              fill={`url(#${uid}-band)`}
              stroke="none"
            />
          )}
          {hlines.map((h) => (
            <line key={h.label} x1={m.l} x2={m.l + pw} y1={Y(tY(h.value))} y2={Y(tY(h.value))} stroke={h.color ?? '#9a3412'} strokeWidth="2" strokeDasharray={h.dash ?? '7 4'} />
          ))}
          {samples.map(({ s, pts }) => {
            const { segs } = segments(pts, domain, scale)
            return (
              <g key={s.id}>
                {segs.map((seg, i) => (
                  <polyline
                    key={i}
                    points={seg.map((p) => `${X(p.n).toFixed(1)},${Y(p.t).toFixed(1)}`).join(' ')}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.width ?? 2.5}
                    strokeDasharray={s.dash || undefined}
                    strokeLinejoin="round"
                  />
                ))}
                {pts
                  .filter((p) => (p.n - 1) % every === 0 && unitY(p.v, domain, scale) <= 1)
                  .map((p) => (
                    <Marker key={p.n} shape={s.marker} x={X(p.n)} y={Y(tY(p.v))} color={s.color} />
                  ))}
              </g>
            )
          })}
        </g>

        {/* panah untuk kurva yang melonjak keluar bingkai */}
        {samples.map(({ s, pts }) => {
          const { exit } = segments(pts, domain, scale)
          if (exit === null) return null
          return (
            <text key={`up-${s.id}`} x={Math.min(X(exit), m.l + pw - 6)} y={m.t + 12} textAnchor="middle" fontSize="14" fontWeight="700" fill={s.color} style={labelStyle}>
              ↑
            </text>
          )
        })}

        {vlines.map((v) => {
          if (v.n < 1 || v.n > xMax) return null
          // Perkiraan lebar teks (≈ 7 px per huruf) menentukan label ditaruh di kanan atau kiri garis agar tidak terpotong.
          const flip = X(v.n) + 5 + (v.label?.length ?? 0) * 7 > m.l + pw
          return (
            <g key={v.n}>
              <line x1={X(v.n)} x2={X(v.n)} y1={m.t} y2={m.t + ph} stroke="#1c1917" strokeWidth="1.5" strokeDasharray="3 3" />
              {v.label && (
                <text x={X(v.n) + (flip ? -5 : 5)} y={m.t + 34} textAnchor={flip ? 'end' : 'start'} fontSize="12" fontWeight="700" fill="#1c1917" style={labelStyle}>
                  {v.label}
                </text>
              )}
            </g>
          )
        })}
        {shadeFrom !== null && shadeFrom <= xMax && shadeLabel && (
          <text
            x={X(shadeFrom) + 6 + shadeLabel.length * 6.6 > m.l + pw ? m.l + pw - 4 : X(shadeFrom) + 6}
            y={m.t + 14}
            textAnchor={X(shadeFrom) + 6 + shadeLabel.length * 6.6 > m.l + pw ? 'end' : 'start'}
            fontSize="12"
            fontWeight="600"
            fill="#713f12"
            style={labelStyle}
          >
            {shadeLabel}
          </text>
        )}
        {hlines.map((h) => (
          <text key={`t-${h.label}`} x={m.l + pw - 4} y={Y(tY(h.value)) - 6} textAnchor="end" fontSize="12" fontWeight="700" fill={h.color ?? '#9a3412'} style={labelStyle}>
            {h.label}
          </text>
        ))}

        {/* penyorot n */}
        <line x1={X(cursorN)} x2={X(cursorN)} y1={m.t} y2={m.t + ph} stroke="#1c1917" strokeWidth="2" />
        {samples.map(({ s, pts }) => {
          const p = pts[cursorN - 1]
          if (!p || unitY(p.v, domain, scale) > 1) return null
          return <Marker key={`c-${s.id}`} shape={s.marker} x={X(cursorN)} y={Y(tY(p.v))} color={s.color} big />
        })}
      </svg>
    </div>
  )
}
