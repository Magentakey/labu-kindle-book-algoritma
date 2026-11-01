// Gambar Modul 06 untuk penanda {{gambar:id}}: Gambar 1 (gambaran grafis tiga notasi). Kurva dihitung dari rumus sederhana (bukan jalur tangan)
// supaya urutan f, batas bawah, dan batas atas pasti benar di sebelah kanan n₀, dan gayanya sama dengan grafik penjelajah.
import { useId } from 'react'
import { SwatchBatas } from '../../viz/GrafikBatas.jsx'
import { gayaBatas } from '../../viz/boundModel.js'
import { GAMBAR_1 } from './06.hitung.js'

const W = 220
const H = 156
const X0 = 18
const X1 = 172
const Y0 = 10
const Y1 = 128
const { n0: T0, f, bawah, atas } = GAMBAR_1

const xOf = (t) => X0 + t * (X1 - X0)
const yOf = (v) => Y1 - (v / GAMBAR_1.maks) * (Y1 - Y0)
const jalur = (fn) => 'M' + Array.from({ length: GAMBAR_1.titik + 1 }, (_, i) => i / GAMBAR_1.titik).map((t) => `${xOf(t).toFixed(1)} ${yOf(fn(t)).toFixed(1)}`).join(' L')

const PANEL = {
  a: { judul: '(a) f(n) = Θ(g(n))', desc: 'Mulai dari n₀, kurva f(n) terjepit di antara c₁g(n) di bawah dan c₂g(n) di atas.', garis: ['bawah', 'atas'], label: { bawah: 'c₁g(n)', atas: 'c₂g(n)' } },
  b: { judul: '(b) f(n) = O(g(n))', desc: 'Mulai dari n₀, kurva f(n) berada di bawah cg(n).', garis: ['atas'], label: { atas: 'cg(n)' } },
  c: { judul: '(c) f(n) = Ω(g(n))', desc: 'Mulai dari n₀, kurva f(n) berada di atas cg(n).', garis: ['bawah'], label: { bawah: 'cg(n)' } },
}
const FN = { f, bawah, atas }

function Panel({ id }) {
  const uid = useId()
  const p = PANEL[id]
  return (
    <figure className="m-0 min-w-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${uid}-j ${uid}-d`} className="block h-auto w-full text-ink" focusable="false">
        <title id={`${uid}-j`}>{p.judul}</title>
        <desc id={`${uid}-d`}>{p.desc}</desc>
        <g stroke="var(--text-primary)" strokeWidth="1.5" fill="none">
          <path d={`M${X0} ${Y0} V${Y1} H${X1}`} />
        </g>
        <line x1={xOf(T0)} x2={xOf(T0)} y1={Y0} y2={Y1} stroke="var(--text-secondary)" strokeWidth="1.2" strokeDasharray="4 3" />
        <g fontSize="12" fill="var(--text-secondary)" textAnchor="middle">
          <text x={xOf(T0)} y={Y1 + 15}>n₀</text>
          <text x={X1 - 2} y={Y1 + 15}>n</text>
        </g>
        <g fill="none" strokeLinejoin="round">
          {p.garis.map((g) => (
            <path key={g} d={jalur(FN[g])} stroke={gayaBatas[g].warna} strokeWidth="2.4" strokeDasharray={gayaBatas[g].dash || undefined} />
          ))}
          <path d={jalur(f)} stroke={gayaBatas.f.warna} strokeWidth="2.8" />
        </g>
        <g fontSize="12" fontWeight="600">
          <text x={xOf(1) + 5} y={yOf(f(1)) + 4} fill={gayaBatas.f.warna}>f(n)</text>
          {p.garis.map((g) => (
            <text key={g} x={xOf(1) + 5} y={yOf(FN[g](1)) + 4} fill={gayaBatas[g].warna}>
              {p.label[g]}
            </text>
          ))}
        </g>
      </svg>
      <figcaption className="text-body-strong mt-1 text-center text-heading">{p.judul}</figcaption>
    </figure>
  )
}

/** Gambar 1: tiga panel (a) Θ, (b) O, (c) Ω. */
export function GambarBatas() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel id="a" />
        <Panel id="b" />
        <Panel id="c" />
      </div>
      <ul aria-label="Legenda gambar" className="text-caption mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-ink">
        <li className="flex items-center gap-2"><SwatchBatas id="f" />f(n)</li>
        <li className="flex items-center gap-2"><SwatchBatas id="bawah" />batas bawah</li>
        <li className="flex items-center gap-2"><SwatchBatas id="atas" />batas atas</li>
      </ul>
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Gambaran grafis ketiga notasi (diadaptasi dari gambaran di bahan kuliah). Garis putus-putus menandai n₀; hubungan antarkurva hanya disyaratkan berlaku di sebelah kanannya.
      </figcaption>
    </figure>
  )
}
