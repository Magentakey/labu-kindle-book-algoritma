import { useEffect, useId, useReducer, useState } from 'react'
import {
  C_VALUES,
  FUNCTIONS,
  FUNCTION_KEYS,
  N_MAX,
  N_MIN,
  boundAnalysis,
  boundRow,
  compareSummary,
  evalFn,
  formatRatio,
  littleAnalysis,
  littleThreshold,
} from '../../lib/asymptotic.js'
import { formatGrowth } from '../../lib/growth.js'
import { focusRing, secondaryButton } from '../Interactive/styles.js'
import PlotSvg, { LegendSwatch } from './PlotSvg.jsx'

const num = (v) => v.toLocaleString('id-ID', { maximumFractionDigits: 2 })

// Gaya tetap per fungsi, supaya kurva tidak berganti rupa saat pilihan diubah.
const FN_STYLE = {
  '1': { color: '#57534e', dash: '2 5', marker: 'plus' },
  'log n': { color: '#0f766e', dash: '6 4', marker: 'triangle' },
  n: { color: '#1d4ed8', dash: '14 4', marker: 'square' },
  'n log n': { color: '#7e22ce', dash: '10 3 2 3', marker: 'diamond' },
  'n^2': { color: '#c2410c', dash: '', marker: 'circle' },
  'n^3': { color: '#be123c', dash: '3 3', marker: 'cross' },
  '2^n': { color: '#1c1917', dash: '', marker: 'star', width: 3 },
}
const ALT_STYLE = { color: '#4b5563', dash: '2 3', marker: 'cross' } // dipakai bila A dan B fungsi yang sama

const NOTATION = { O: 'O', Omega: 'Ω', Theta: 'Θ' }

/* ---------- bagian kecil yang dipakai bersama ---------- */

function Slider({ id, label, value, min, max, step = 1, onChange, valueText }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="font-medium">
        {label}: <span className="font-semibold tabular-nums">{valueText ?? value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${label} ${valueText ?? value}`}
        className={`mt-1 block h-8 w-full accent-stone-900 ${focusRing}`}
      />
    </div>
  )
}

function Select({ id, label, value, options, onChange }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-12 w-full rounded-xl border-2 border-stone-900 bg-white px-3 text-base"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Segmented({ legend, name, value, options, onChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="font-medium">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value
          return (
            <label
              key={o.value}
              className={
                'inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-xl border-2 border-stone-900 px-4 font-semibold ' +
                'has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-900 ' +
                (on ? 'bg-stone-900 text-orange-50' : 'bg-white hover:bg-orange-100')
              }
            >
              <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
              {on && <span aria-hidden="true">✓</span>}
              {o.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Tabel nilai pada n yang disorot. Selalu ada, jadi seluruh isi grafik tersedia juga sebagai teks. */
function ValueTable({ caption, headers, rows }) {
  return (
    <div
      // Tabel yang lebar bisa digeser, jadi areanya harus bisa difokus keyboard (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="group"
      aria-label={`${caption}, bisa digeser ke samping`}
      className={`mt-3 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white ${focusRing}`}
    >
      <table className={`w-full border-collapse text-left text-sm ${headers.length > 2 ? 'min-w-[28rem]' : ''}`}>
        <caption className="p-3 text-left font-semibold">{caption}</caption>
        <thead>
          <tr className="border-y-2 border-stone-900 bg-orange-100">
            {headers.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-stone-300">
              {r.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-3 py-2 font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="px-3 py-2 tabular-nums">
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

function Legend({ items }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda kurva">
      {items.map((s) => (
        <li key={s.id} className="flex items-center gap-2 text-sm font-medium">
          <LegendSwatch s={s} />
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Kontrol di kiri dan grafik di kanan (menempel saat digulir) pada layar lebar, supaya hasil terlihat saat slider digeser.
 * Di layar sempit grafik tampil lebih dulu, lalu kontrol, lalu tabel.
 */
function Layout({ intro, controls, output, table }) {
  return (
    <>
      {intro && <p className="mb-3 text-sm text-stone-700">{intro}</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start">
        <div className="order-2 min-w-0 space-y-4 lg:order-1">{controls}</div>
        <div className="order-1 min-w-0 lg:sticky lg:top-4 lg:order-2">{output}</div>
      </div>
      {table}
    </>
  )
}

function Verdict({ ok, children }) {
  return (
    <div
      // Kesimpulan hanya berubah saat konstanta atau fungsi diubah, bukan saat n digeser atau diputar.
      role="status"
      aria-atomic="true"
      className={`rounded-xl border-2 border-stone-900 p-3 ${ok === false ? 'bg-white' : 'bg-orange-100'}`}
    >
      <p>
        <span className="font-semibold">{ok === true ? '✓ ' : ok === false ? '✗ ' : ''}</span>
        {children}
      </p>
    </div>
  )
}

/* ---------- keadaan tampilan: n yang disorot, rentang n, skala, dan pemutar ---------- */

function viewReducer(state, action) {
  switch (action.type) {
    case 'n':
      return { ...state, n: Math.min(state.xMax, Math.max(N_MIN, action.n)), playing: false }
    case 'xMax':
      return { ...state, xMax: action.xMax, n: Math.min(state.n, action.xMax) }
    case 'scale':
      return { ...state, scale: action.scale }
    case 'toggle':
      return state.playing ? { ...state, playing: false } : { ...state, playing: true, n: state.n >= state.xMax ? N_MIN : state.n }
    case 'tick': {
      if (state.n >= state.xMax) return { ...state, playing: false }
      const n = state.n + 1
      return { ...state, n, playing: n < state.xMax }
    }
    default:
      return state
  }
}

function ViewControls({ uid, view, dispatch }) {
  return (
    <div className="grid gap-4 border-t border-stone-300 pt-4">
      <Slider id={`${uid}-n`} label="n yang disorot" value={view.n} min={N_MIN} max={view.xMax} onChange={(n) => dispatch({ type: 'n', n })} />
      <Slider id={`${uid}-xmax`} label="Rentang n pada grafik" value={view.xMax} min={10} max={N_MAX} onChange={(xMax) => dispatch({ type: 'xMax', xMax })} valueText={`1 sampai ${view.xMax}`} />
      <Segmented
        legend="Skala sumbu y"
        name={`${uid}-scale`}
        value={view.scale}
        options={[
          { value: 'log', label: 'Logaritmik' },
          { value: 'linear', label: 'Linear' },
        ]}
        onChange={(scale) => dispatch({ type: 'scale', scale })}
      />
      <div>
        <p className="font-medium">Putar n dari awal</p>
        <button type="button" onClick={() => dispatch({ type: 'toggle' })} className={`mt-1 ${secondaryButton}`}>
          <span aria-hidden="true">{view.playing ? '⏸\uFE0E' : '▶\uFE0E'}&nbsp;</span>
          {view.playing ? 'Jeda' : 'Putar n'}
        </button>
      </div>
    </div>
  )
}

/* ---------- mode 1: membandingkan laju pertumbuhan (materi 3) ---------- */

function CompareView({ uid, input, setInput, view, dispatch }) {
  const { a, b, mult, extras } = input
  const fnOptions = FUNCTION_KEYS.map((k) => ({ value: k, label: FUNCTIONS[k].label }))
  const summary = compareSummary(a, b, view.xMax, mult)

  const styleOf = (key, role) => (role === 'B' && a === b ? ALT_STYLE : FN_STYLE[key])
  const series = [
    { id: 'A', ...styleOf(a, 'A'), label: `A: ${mult === 1 ? '' : `${mult}·`}${FUNCTIONS[a].label}`, fn: (n) => mult * evalFn(a, n) },
    { id: 'B', ...styleOf(b, 'B'), label: `B: ${FUNCTIONS[b].label}`, fn: (n) => evalFn(b, n) },
    ...extras
      .filter((k) => k !== a && k !== b)
      .map((k) => ({ id: `x-${k}`, ...FN_STYLE[k], label: FUNCTIONS[k].label, fn: (n) => evalFn(k, n) })),
  ]
  const toggleExtra = (k) => setInput({ ...input, extras: extras.includes(k) ? extras.filter((x) => x !== k) : [...extras, k] })

  // Semua persilangan digaris, tetapi hanya yang terakhir diberi label supaya label tidak bertumpuk.
  const crossLines = summary.cross.slice(-4).map((n, i, all) => ({ n, label: i === all.length - 1 ? `n = ${n}` : '' }))
  const rows = series.map((s) => [s.label, formatGrowth(s.fn(view.n))])

  return (
    <Layout
      controls={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Select id={`${uid}-a`} label="Fungsi A" value={a} options={fnOptions} onChange={(v) => setInput({ ...input, a: v })} />
            <Select id={`${uid}-b`} label="Fungsi B" value={b} options={fnOptions} onChange={(v) => setInput({ ...input, b: v })} />
          </div>
          <Slider id={`${uid}-mult`} label="Pengali c pada A" value={mult} min={1} max={100} onChange={(v) => setInput({ ...input, mult: v })} valueText={`${mult} (kurva A = c · fungsi A)`} />
          <fieldset>
            <legend className="font-medium">Kurva pembanding lain</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {FUNCTION_KEYS.filter((k) => k !== a && k !== b).map((k) => {
                const on = extras.includes(k)
                return (
                  <label
                    key={k}
                    className={
                      'inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-xl border-2 border-stone-900 px-4 font-semibold ' +
                      'has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-900 ' +
                      (on ? 'bg-stone-900 text-orange-50' : 'bg-white hover:bg-orange-100')
                    }
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleExtra(k)} className="sr-only" />
                    {on && <span aria-hidden="true">✓</span>}
                    {FUNCTIONS[k].label}
                  </label>
                )
              })}
            </div>
          </fieldset>
          <ViewControls uid={uid} view={view} dispatch={dispatch} />
        </>
      }
      output={
        <>
          <Verdict ok={summary.kind === 'cross' || summary.kind === 'dominant' ? true : undefined}>{summary.text}</Verdict>
          <figure className="mt-3">
            <PlotSvg
              series={series}
              xMax={view.xMax}
              cursorN={view.n}
              scale={view.scale}
              vlines={crossLines}
              ariaLabel={`Grafik nilai ${series.map((s) => s.label).join(', ')} untuk n dari 1 sampai ${view.xMax}. ${summary.text} Nilai pada n yang disorot ada di tabel di bawah grafik.`}
            />
            <figcaption className="sr-only">Grafik laju pertumbuhan fungsi</figcaption>
            <Legend items={series} />
          </figure>
          {view.scale === 'linear' && (
            <p className="mt-2 text-sm text-stone-700">
              Pada skala linear, kurva yang melonjak jauh melampaui yang lain dipotong di tepi atas dan ditandai ↑ supaya kurva lain tetap terbaca.
            </p>
          )}
        </>
      }
      table={<ValueTable caption={`Nilai kurva saat n = ${view.n}`} headers={['Kurva', 'Nilai']} rows={rows} />}
    />
  )
}

/* ---------- mode 2: batas atas, bawah, dan ketat (materi 4) ---------- */

const polyText = ({ a, b, c }) => [`${a === 1 ? '' : a}n²`, b ? `${b === 1 ? '' : b}n` : null, c ? `${c}` : null].filter(Boolean).join(' + ')

function boundVerdict(p, r, xMax) {
  const sym = NOTATION[p.notation]
  const cond = {
    O: `f(n) ≤ ${p.c2}·n²`,
    Omega: `f(n) ≥ ${p.c1}·n²`,
    Theta: `${p.c1}·n² ≤ f(n) ≤ ${p.c2}·n²`,
  }[p.notation]
  if (p.notation === 'Theta' && p.c1 > p.c2) {
    return { ok: false, text: `c1 = ${p.c1} lebih besar dari c2 = ${p.c2}, padahal ${p.c1}·n² ≤ f(n) ≤ ${p.c2}·n² mustahil bila c1 > c2. Pilih c1 ≤ c2.` }
  }
  if (r.holds) {
    let text = `f(n) = ${sym}(n²) terbukti: ${cond} berlaku untuk semua n ≥ ${r.n0}, jadi n₀ = ${r.n0}.`
    if (p.notation === 'Theta') text += ` Batas atas mulai berlaku di n = ${r.n0Upper} dan batas bawah di n = ${r.n0Lower}; n₀ diambil yang terbesar.`
    return { ok: true, text }
  }
  if (r.eventually) {
    return { ok: undefined, text: `Syarat ${cond} belum stabil sampai n = ${xMax}, tetapi pasti berlaku untuk n yang lebih besar. Perbesar rentang n pada grafik.` }
  }
  const reasons = []
  if (p.notation !== 'Omega' && !r.upperEventually) {
    reasons.push(
      p.a > p.c2
        ? `koefisien n² pada f (a = ${p.a}) lebih besar dari c2 = ${p.c2}, jadi f akhirnya melewati c2·n²`
        : `a = c2 = ${p.a} sedangkan suku ${p.b ? `${p.b}n` : ''}${p.b && p.c ? ' + ' : ''}${p.c || ''} masih positif, jadi f selalu sedikit di atas c2·n²`,
    )
  }
  if (p.notation !== 'O' && !r.lowerEventually) {
    reasons.push(`c1 = ${p.c1} lebih besar dari a = ${p.a}, jadi f akhirnya jatuh di bawah c1·n²`)
  }
  return { ok: false, text: `f(n) = ${sym}(n²) tidak terbukti dengan konstanta ini: ${reasons.join('; dan ')}. Tidak ada n₀ yang memenuhi.` }
}

function BoundView({ uid, input, setInput, view, dispatch }) {
  const p = input
  const r = boundAnalysis(p, view.xMax)
  const verdict = boundVerdict(p, r, view.xMax)
  const set = (key) => (v) => setInput({ ...p, [key]: v })
  const useUpper = p.notation !== 'Omega'
  const useLower = p.notation !== 'O'

  const series = [
    { id: 'f', label: `f(n) = ${polyText(p)}`, color: '#1c1917', dash: '', marker: 'circle', width: 3, fn: r.f },
    ...(useUpper ? [{ id: 'up', label: `c2·n² = ${p.c2}n² (batas atas)`, color: '#c2410c', dash: '9 4', marker: 'square', fn: (n) => p.c2 * n * n }] : []),
    ...(useLower ? [{ id: 'lo', label: `c1·n² = ${p.c1}n² (batas bawah)`, color: '#0f766e', dash: '2 4', marker: 'triangle', fn: (n) => p.c1 * n * n }] : []),
  ]
  const band = p.notation === 'Theta' && p.c1 <= p.c2 ? { lower: (n) => p.c1 * n * n, upper: (n) => p.c2 * n * n } : null

  const row = boundRow(p, view.n)
  const okU = row.f <= row.upper
  const okL = row.f >= row.lower
  const status = (ok) => (ok ? '✓ terpenuhi' : '✗ belum')
  const rows = [
    ...(useLower ? [[`c1·n² (batas bawah)`, num(row.lower), `f(n) ≥ c1·n²: ${status(okL)}`]] : []),
    ['f(n)', num(row.f), ''],
    ...(useUpper ? [[`c2·n² (batas atas)`, num(row.upper), `f(n) ≤ c2·n²: ${status(okU)}`]] : []),
  ]

  return (
    <Layout
      intro="f(n) = a·n² + b·n + c dibandingkan dengan g(n) = n². Atur konstanta lalu lihat apakah f terjepit di antara c1·n² dan c2·n² mulai suatu n₀."
      controls={
        <>
          <Segmented
            legend="Notasi yang dibuktikan"
            name={`${uid}-not`}
            value={p.notation}
            options={[
              { value: 'O', label: 'O (atas)' },
              { value: 'Omega', label: 'Ω (bawah)' },
              { value: 'Theta', label: 'Θ (ketat)' },
            ]}
            onChange={set('notation')}
          />
          <Slider id={`${uid}-a`} label="a (koefisien n²)" value={p.a} min={1} max={9} onChange={set('a')} />
          <Slider id={`${uid}-b`} label="b (koefisien n)" value={p.b} min={0} max={20} onChange={set('b')} />
          <Slider id={`${uid}-c`} label="c (konstanta)" value={p.c} min={0} max={50} onChange={set('c')} />
          {useLower && <Slider id={`${uid}-c1`} label="c1 (pengali batas bawah)" value={p.c1} min={0} max={10} onChange={set('c1')} />}
          {useUpper && <Slider id={`${uid}-c2`} label="c2 (pengali batas atas)" value={p.c2} min={1} max={12} onChange={set('c2')} />}
          <ViewControls uid={uid} view={view} dispatch={dispatch} />
        </>
      }
      output={
        <>
          <Verdict ok={verdict.ok}>{verdict.text}</Verdict>
          <figure className="mt-3">
            <PlotSvg
              series={series}
              xMax={view.xMax}
              cursorN={view.n}
              scale={view.scale}
              band={band}
              vlines={r.holds ? [{ n: r.n0, label: `n₀ = ${r.n0}` }] : []}
              shadeFrom={r.holds ? r.n0 : null}
              shadeLabel={r.holds ? 'berlaku untuk n ≥ n₀' : ''}
              ariaLabel={`Grafik f(n) = ${polyText(p)} terhadap ${[useLower && `${p.c1}n²`, useUpper && `${p.c2}n²`].filter(Boolean).join(' dan ')}, n dari 1 sampai ${view.xMax}. ${verdict.text} Nilai pada n yang disorot ada di tabel di bawah grafik.`}
            />
            <figcaption className="sr-only">Grafik batas asimtotik</figcaption>
            <Legend items={series} />
          </figure>
          {band && <p className="mt-2 text-sm text-stone-700">Area berarsir garis miring adalah daerah jepitan di antara c1·n² dan c2·n². Area bertitik adalah n ≥ n₀.</p>}
        </>
      }
      table={<ValueTable caption={`Nilai saat n = ${view.n}`} headers={['Bagian', 'Nilai', 'Syarat']} rows={rows} />}
    />
  )
}

/* ---------- mode 3: little-o dan little-omega lewat rasio f/g (materi 5) ---------- */

function littleVerdict(input, analysis, th, xMax) {
  const { f, g } = input
  const c = C_VALUES[input.ci]
  const lf = FUNCTIONS[f].label
  const lg = FUNCTIONS[g].label
  const rel = th.direction === 'omega' ? '>' : '<'
  const cond = `f(n) ${rel} ${num(c)}·g(n)`
  let detail
  if (th.n0 !== -1) {
    detail = `Untuk c = ${num(c)}, ${cond} berlaku mulai n₀ = ${th.n0}.`
    if (analysis.kind === 'theta') {
      detail += ` Tetapi definisi o menuntut SEMUA c > 0. Coba c ≤ 1: syaratnya gagal, jadi f bukan o(g).`
    } else {
      detail += ` Definisi ${analysis.kind === 'o' ? 'o' : 'ω'} menuntut hal ini berlaku untuk setiap c > 0; c yang lebih kecil hanya menggeser n₀ makin ke kanan.`
    }
  } else if (th.eventually) {
    detail = `Untuk c = ${num(c)}, ${cond} belum terpenuhi sampai n = ${xMax}, tetapi pasti terpenuhi untuk n yang cukup besar karena ${lf} tumbuh ${analysis.kind === 'o' ? 'pasti lebih lambat' : 'pasti lebih cepat'} daripada ${lg}. Kurva yang naik atau turun pelan bisa butuh n sangat besar.`
  } else {
    detail = `Untuk c = ${num(c)}, ${cond} tidak pernah terpenuhi: rasio f/g mendatar di 1, tidak turun di bawah c.`
  }
  return `${analysis.text} ${detail}`
}

function LittleView({ uid, input, setInput, view, dispatch }) {
  const { f, g } = input
  const c = C_VALUES[input.ci]
  const fnOptions = FUNCTION_KEYS.map((k) => ({ value: k, label: FUNCTIONS[k].label }))
  const analysis = littleAnalysis(f, g, view.xMax)
  const th = littleThreshold(f, g, c, view.xMax)
  const text = littleVerdict(input, analysis, th, view.xMax)
  const ratio = (n) => evalFn(f, n) / evalFn(g, n)

  const series = [{ id: 'ratio', label: `f(n) / g(n) = ${FUNCTIONS[f].label} / ${FUNCTIONS[g].label}`, color: '#1c1917', dash: '', marker: 'circle', width: 3, fn: ratio }]
  const n = view.n
  const rows = [
    [`f(n) = ${FUNCTIONS[f].label}`, formatGrowth(evalFn(f, n)), ''],
    [`g(n) = ${FUNCTIONS[g].label}`, formatGrowth(evalFn(g, n)), ''],
    ['f(n) / g(n)', formatRatio(ratio(n)), ''],
    [`c·g(n), c = ${num(c)}`, formatGrowth(c * evalFn(g, n)), `${th.direction === 'omega' ? 'f > c·g' : 'f < c·g'}: ${(th.direction === 'omega' ? evalFn(f, n) > c * evalFn(g, n) : evalFn(f, n) < c * evalFn(g, n)) ? '✓ terpenuhi' : '✗ belum'}`],
  ]

  return (
    <Layout
      intro="Rasio f(n)/g(n) menjawab semuanya: menuju 0 berarti f = o(g), tumbuh tanpa batas berarti f = ω(g), mendatar berarti Θ. Garis putus-putus adalah c yang Anda pilih."
      controls={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Select id={`${uid}-f`} label="Fungsi f(n)" value={f} options={fnOptions} onChange={(v) => setInput({ ...input, f: v })} />
            <Select id={`${uid}-g`} label="Fungsi g(n)" value={g} options={fnOptions} onChange={(v) => setInput({ ...input, g: v })} />
          </div>
          <Slider id={`${uid}-ci`} label="Konstanta c" value={input.ci} min={0} max={C_VALUES.length - 1} onChange={(v) => setInput({ ...input, ci: v })} valueText={num(c)} />
          <ViewControls uid={uid} view={view} dispatch={dispatch} />
        </>
      }
      output={
        <>
          <Verdict ok={analysis.kind === 'theta' ? false : true}>{text}</Verdict>
          <figure className="mt-3">
            <PlotSvg
              series={series}
              xMax={view.xMax}
              cursorN={view.n}
              scale={view.scale}
              hlines={[{ value: c, label: `c = ${num(c)}` }]}
              vlines={th.n0 > 0 ? [{ n: th.n0, label: `n₀ = ${th.n0}` }] : []}
              shadeFrom={th.n0 > 0 ? th.n0 : null}
              shadeLabel={th.n0 > 0 ? `${th.direction === 'omega' ? 'f > c·g' : 'f < c·g'} untuk n ≥ n₀` : ''}
              ariaLabel={`Grafik rasio ${FUNCTIONS[f].label} dibagi ${FUNCTIONS[g].label} untuk n dari 1 sampai ${view.xMax}, dengan garis c = ${num(c)}. ${analysis.text} Nilai pada n yang disorot ada di tabel di bawah grafik.`}
            />
            <figcaption className="sr-only">Grafik rasio f(n) per g(n)</figcaption>
            <Legend items={[...series, { id: 'c', label: `c = ${num(c)}`, color: '#9a3412', dash: '7 4', marker: 'diamond' }]} />
          </figure>
        </>
      }
      table={<ValueTable caption={`Nilai saat n = ${n}`} headers={['Besaran', 'Nilai', 'Syarat']} rows={rows} />}
    />
  )
}

/* ---------- cangkang ---------- */

const MODES = { compare: CompareView, bound: BoundView, little: LittleView }

/**
 * Grafik asimtotik interaktif untuk materi 3 sampai 5. Tiga mode:
 *  - compare: laju pertumbuhan beberapa fungsi dan titik saling menyalip
 *  - bound  : jepitan c1·n² ≤ f(n) ≤ c2·n² dan n₀ untuk O, Ω, Θ
 *  - little : rasio f/g untuk o dan ω
 *
 * @param {Object} props
 * @param {'compare' | 'bound' | 'little'} props.mode
 * @param {any} props.initialInput
 * @param {{ n: number, xMax: number, scale: 'log' | 'linear' }} props.initialView
 * @param {{ label: string, value: any }[]} [props.presets]
 */
export default function AsymptoticGraph({ mode, initialInput, initialView, presets = [] }) {
  const uid = useId()
  const [input, setInput] = useState(initialInput)
  const [view, dispatch] = useReducer(viewReducer, { ...initialView, playing: false })
  const Mode = MODES[mode]

  useEffect(() => {
    if (!view.playing) return undefined
    const id = setInterval(() => dispatch({ type: 'tick' }), 180)
    return () => clearInterval(id)
  }, [view.playing])

  if (!Mode) return null
  return (
    <div className="mt-2 rounded-2xl border-2 border-stone-900 bg-orange-50 p-4">
      <Mode uid={uid} input={input} setInput={setInput} view={view} dispatch={dispatch} />
      {presets.length > 0 && (
        <div role="group" aria-label="Contoh masukan" className="mt-4 border-t border-stone-300 pt-3">
          <p className="font-medium">Atau pilih contoh:</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {presets.map((pr) => (
              <button key={pr.label} type="button" onClick={() => setInput(pr.value)} className={secondaryButton}>
                {pr.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
