import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { algoritma, kategori } from '../data/algoritma.js'
import { runTrace, traces } from '../algorithms/traces.js'
import { Chip, ErrorState, Icon, Select, Toggle } from '../ui/index.js'
import ArrayBars from '../viz/ArrayBars.jsx'
import { Legend } from '../viz/GraphStage.jsx'
import PlayerBar, { PlayerBarCompact } from '../viz/PlayerBar.jsx'
import { lineCaption } from '../viz/codeModel.js'
import { alignIndex, conclusion, statsById } from '../viz/compareModel.js'
import { usePlayer } from '../viz/usePlayer.js'
import { comparePairs, comparePresets, vizConfig } from '../viz/vizConfig.js'

/** Satu sisi perbandingan: judul, batang array, hitungan operasi, baris kode yang berjalan, dan legenda. */
function Side({ a, cfg, step, stats, detailLabel, faster, showLegend }) {
  const code = traces[cfg.trace].code.split('\n')
  const proc = cfg.procedures.find((p) => step.line >= p.from && step.line <= p.to)
  return (
    <section className="rounded-sm border border-line bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h2 text-heading">{a.judul}</h2>
        <Chip type="kode">{a.kompleksitas}</Chip>
        {faster && (
          <span className="text-body-strong ml-auto inline-flex items-center gap-1.5 text-accent">
            <span aria-hidden="true">★</span> lebih cepat
          </span>
        )}
      </div>
      <div className="mt-4">
        <ArrayBars array={step.array} />
      </div>
      <p className="text-body-strong mt-3 flex items-center gap-2 rounded-sm bg-panel px-4 py-3 text-ink">
        <Icon name="chart" size={18} />
        Perbandingan {stats.comparisons} · {detailLabel} {stats.detail}
      </p>
      <div role="region" aria-label={`Baris yang berjalan di ${a.judul}`} className="mt-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface px-4 py-3">
        <p className="text-code whitespace-pre-wrap text-ink">
          <span className="text-ink-soft">{step.line - (proc?.offset ?? 0)}</span>
          {'  '}
          {code[step.line - 1].trim()}
        </p>
        <p className="text-body mt-1 text-ink">▶ {step.note}</p>
      </div>
      {showLegend && (
        <div className="mt-3">
          <Legend legend={cfg.legend} />
        </div>
      )}
    </section>
  )
}

function Compare({ pair }) {
  const A = algoritma.find((x) => x.id === pair.a)
  const B = algoritma.find((x) => x.id === pair.b)
  const cfgA = vizConfig[pair.a]
  const cfgB = vizConfig[pair.b]
  const [presetIndex, setPresetIndex] = useState(0)
  const [showLegend, setShowLegend] = useState(true)
  const values = comparePresets[presetIndex].values
  const runs = useMemo(() => [runTrace(traces[cfgA.trace], values), runTrace(traces[cfgB.trace], values)], [cfgA.trace, cfgB.trace, values])
  const stepsA = useMemo(() => (runs[0].ok ? runs[0].steps : []), [runs])
  const stepsB = useMemo(() => (runs[1].ok ? runs[1].steps : []), [runs])
  const statsA = useMemo(() => statsById[pair.a].fn(stepsA), [pair.a, stepsA])
  const statsB = useMemo(() => statsById[pair.b].fn(stepsB), [pair.b, stepsB])
  const total = Math.max(stepsA.length, stepsB.length, 1)
  const player = usePlayer(total)
  const kat = kategori.find((k) => k.id === A.kategori)

  if (stepsA.length === 0 || stepsB.length === 0) {
    return <ErrorState judul="Perbandingan tidak bisa dijalankan" pesan={runs.find((r) => !r.ok)?.error ?? 'Masukan tidak valid.'} />
  }
  const ia = alignIndex(player.index, total, stepsA.length)
  const ib = alignIndex(player.index, total, stepsB.length)
  const sa = stepsA[ia]
  const sb = stepsB[ib]
  const done = ia === stepsA.length - 1 && ib === stepsB.length - 1
  const lines = conclusion(
    { name: A.judul, stats: statsA[ia], big: A.kompleksitas },
    { name: B.judul, stats: statsB[ib], big: B.kompleksitas },
    done,
  )
  const caption = `${A.judul}: ${lineCaption(cfgA.procedures, sa.line)} · ${B.judul}: ${lineCaption(cfgB.procedures, sb.line)}`
  const extras = (
    <>
      <Select label="Input" value={String(presetIndex)} onChange={(v) => { setPresetIndex(Number(v)); player.reset() }} options={comparePresets.map((p, i) => ({ value: String(i), label: p.label }))} />
      <div className="text-body ml-auto flex items-center gap-2 text-ink-soft">
        <Toggle checked={showLegend} onChange={setShowLegend} label="Legenda" />
        Legenda
      </div>
    </>
  )

  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pb-24 pt-5 md:px-8 md:pb-6 md:pt-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link to="/" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
          <Icon name="arrowL" size={18} />
          Semua algoritma
        </Link>
        <nav aria-label="Breadcrumb" className="text-caption hidden text-ink-soft md:block">
          Algoritma / {kat.title} / Bandingkan
        </nav>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-h1 text-heading">
          {A.judul} vs {B.judul}
        </h1>
        <Chip type="info">Data &amp; kecepatan sama</Chip>
        <Link to={`/algoritma/${pair.a}`} className="text-button ml-auto inline-flex items-center gap-1.5 rounded-sm text-link">
          <Icon name="x" size={18} />
          Tutup perbandingan
        </Link>
      </div>

      <div className="mt-4 hidden md:block">
        <PlayerBar player={player} caption={caption} extras={extras} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 md:hidden">
        <Select label="Input" value={String(presetIndex)} onChange={(v) => { setPresetIndex(Number(v)); player.reset() }} options={comparePresets.map((p, i) => ({ value: String(i), label: p.label }))} />
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <Side a={A} cfg={cfgA} step={sa} stats={statsA[ia]} detailLabel={statsById[pair.a].detail} faster={pair.faster === pair.a} showLegend={showLegend} />
        <Side a={B} cfg={cfgB} step={sb} stats={statsB[ib]} detailLabel={statsById[pair.b].detail} faster={pair.faster === pair.b} showLegend={showLegend} />
      </div>

      <section aria-label={done ? 'Kesimpulan' : 'Kesimpulan sementara'} className="mt-6 rounded-sm border-l-4 border-brand-blue bg-info-bg p-4">
        <p className="text-label flex items-center gap-2 text-control uppercase">
          <Icon name="info" size={18} />
          {done ? 'Kesimpulan' : 'Kesimpulan sementara'}
        </p>
        <ul className="text-body mt-2 space-y-1 text-ink">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      <PlayerBarCompact player={player} />
    </div>
  )
}

/** Halaman Bandingkan dua algoritma (Figma: Algoritma · Bandingkan). Satu pemutar menggerakkan kedua algoritma sampai selesai bersamaan. */
export default function Bandingkan() {
  const { a, b } = useParams()
  const pair = comparePairs.find((p) => p.a === a && p.b === b)
  if (!pair) {
    return (
      <div className="mx-auto max-w-[1344px] px-4 py-8 md:px-8">
        <ErrorState judul="Perbandingan ini belum tersedia" pesan="Saat ini baru Insertion Sort dan Merge Sort yang bisa dibandingkan." aksi={[{ label: 'Bandingkan Insertion Sort dan Merge Sort', onClick: () => { window.location.hash = '#/algoritma/bandingkan/insertion-sort/merge-sort' } }]} />
      </div>
    )
  }
  return <Compare key={`${a}-${b}`} pair={pair} />
}
