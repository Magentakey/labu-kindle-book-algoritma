import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { algoritma, kategori } from '../data/algoritma.js'
import { traces, runTrace } from '../algorithms/traces.js'
import { Button, Chip, ErrorState, Icon, Mascot, Select, Toggle } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import CodePanel from '../viz/CodePanel.jsx'
import GraphStage, { Legend } from '../viz/GraphStage.jsx'
import PlayerBar, { PlayerBarCompact } from '../viz/PlayerBar.jsx'
import VariabelPanel from '../viz/VariabelPanel.jsx'
import { lineCaption } from '../viz/codeModel.js'
import { buildGraph } from '../viz/graphModel.js'
import { deriveViews } from '../viz/graphViews.js'
import { usePlayer } from '../viz/usePlayer.js'
import { vizConfig } from '../viz/vizConfig.js'

const modulLabel = (n) => `Modul ${String(n).padStart(2, '0')}`

function Panel({ className, children }) {
  return <section className={cx('overflow-hidden rounded-sm border border-line bg-card', className)}>{children}</section>
}

/** Isian masukan sendiri: kolom teks sesuai peraga, divalidasi sebelum diterapkan. */
function InputPanel({ def, draft, setDraft, error, onApply, onCancel }) {
  return (
    <div className="mt-3 rounded-sm border border-line bg-card p-4">
      <p className="text-body-strong text-heading">Masukan sendiri</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {def.inputs.map((f) => (
          <label key={f.key} className={cx('flex flex-col gap-1', f.kind === 'free' && 'md:col-span-2')}>
            <span className="text-caption text-ink-soft">{f.label}</span>
            <input
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              className="text-code h-10 rounded-sm border border-line bg-card px-3 text-ink"
              aria-invalid={Boolean(error)}
            />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-body mt-3 flex items-start gap-2 text-bad-text">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button variant="konfirmasi" size="s" onClick={onApply}>
          Terapkan
        </Button>
        <Button variant="netral" size="s" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  )
}

function Viz({ a, cfg }) {
  const def = traces[cfg.trace]
  const [presetIndex, setPresetIndex] = useState(0)
  const [values, setValues] = useState(cfg.presets[0].values)
  const [positions, setPositions] = useState(cfg.presets[0].positions)
  const [custom, setCustom] = useState(false)
  const [openInput, setOpenInput] = useState(false)
  const [draft, setDraft] = useState(cfg.presets[0].values)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('visual')
  const [showWeights, setShowWeights] = useState(true)
  const [showArrows, setShowArrows] = useState(true)
  const [showLegend, setShowLegend] = useState(true)

  const result = useMemo(() => runTrace(def, values), [def, values])
  const steps = useMemo(() => (result.ok ? result.steps : []), [result])
  const graph = useMemo(() => buildGraph(cfg.kind, values), [cfg.kind, values])
  const views = useMemo(() => (graph && steps.length ? deriveViews(cfg.kind, steps, graph) : []), [cfg.kind, graph, steps])
  const player = usePlayer(steps.length)

  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])

  // Panah kiri/kanan = langkah mundur/maju (selama tidak sedang mengetik).
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      if (el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      if (e.key === 'ArrowRight') player.jump(player.index + 1)
      else if (e.key === 'ArrowLeft') player.jump(player.index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [player])

  const apply = (next, nextPositions, isCustom) => {
    const err = def.validate(next)
    if (err) {
      setError(err)
      return false
    }
    setValues(next)
    setPositions(nextPositions)
    setCustom(isCustom)
    setError(null)
    player.reset()
    return true
  }
  const choosePreset = (v) => {
    if (v === 'kustom') {
      setDraft(values)
      setOpenInput(true)
      return
    }
    const i = Number(v)
    setPresetIndex(i)
    setOpenInput(false)
    apply(cfg.presets[i].values, cfg.presets[i].positions, false)
  }

  const kat = kategori.find((k) => k.id === a.kategori)
  const siblings = algoritma.filter((x) => x.kategori === a.kategori)
  const at = siblings.findIndex((x) => x.id === a.id)
  const prev = siblings[at - 1]
  const next = siblings[at + 1]

  if (!graph || !result.ok || steps.length === 0) {
    return <ErrorState judul="Masukan tidak bisa dijalankan" pesan={result.error ?? 'Graf tidak valid.'} aksi={[{ label: 'Kembali ke Preset 1', icon: 'refresh', onClick: () => apply(cfg.presets[0].values, cfg.presets[0].positions, false) }]} />
  }

  const step = steps[player.index]
  const view = views[player.index]
  const caption = lineCaption(cfg.procedures, step.line)
  const presetOptions = [...cfg.presets.map((p, i) => ({ value: String(i), label: p.label })), { value: 'kustom', label: 'Masukan sendiri…' }]
  const extras = (
    <>
      <Select label="Input" value={custom ? 'kustom' : String(presetIndex)} onChange={choosePreset} options={presetOptions} />
      {cfg.source && <Select label="Sumber" value={values[cfg.source]} onChange={(v) => apply({ ...values, [cfg.source]: v }, positions, custom)} options={graph.names.map((n) => ({ value: n, label: n }))} />}
      <div className="ml-auto flex flex-wrap items-center gap-4">
        {graph.weighted && (
          <div className="text-body flex items-center gap-2 text-ink-soft">
            <Toggle checked={showWeights} onChange={setShowWeights} label="Bobot" />
            Bobot
          </div>
        )}
        {graph.directed && (
          <div className="text-body flex items-center gap-2 text-ink-soft">
            <Toggle checked={showArrows} onChange={setShowArrows} label="Berarah" />
            Berarah
          </div>
        )}
        <div className="text-body flex items-center gap-2 text-ink-soft">
          <Toggle checked={showLegend} onChange={setShowLegend} label="Legenda" />
          Legenda
        </div>
      </div>
    </>
  )

  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pb-24 pt-5 md:px-8 md:pb-6 md:pt-6">
      {/* HP: baris ringkas; tablet dan desktop: breadcrumb dan judul besar */}
      <div className="flex items-center gap-3 md:hidden">
        <Link to="/" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
          <Icon name="arrowL" size={18} />
          Semua
        </Link>
        <h1 className="text-h2 flex-1 text-heading">{a.judul}</h1>
        <Chip type="kode">{a.kompleksitas}</Chip>
      </div>
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Link to="/" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
            <Icon name="arrowL" size={18} />
            Semua algoritma
          </Link>
          <nav aria-label="Breadcrumb" className="text-caption text-ink-soft">
            Algoritma / {kat.title} / {a.judul}
          </nav>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-h1 text-heading">{a.judul}</h1>
          <Chip type="kode">{a.kompleksitas}</Chip>
          <Chip type="info">{a.paradigma}</Chip>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {prev && (
              <Link to={`/algoritma/${prev.id}`} className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
                <Icon name="arrowL" size={18} />
                {prev.judul}
              </Link>
            )}
            {next && (
              <Link to={`/algoritma/${next.id}`} className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
                {next.judul}
                <Icon name="arrowR" size={18} />
              </Link>
            )}
            <Button as={Link} to="/materi" variant="navigasiGaris" icon="book">
              Baca materi · {modulLabel(a.modul)}
            </Button>
          </div>
        </div>
      </div>

      {/* HP: tab Kode | Visual */}
      <div role="group" aria-label="Tampilan" className="mt-4 flex rounded-sm bg-placeholder p-1 md:hidden">
        {[['kode', 'Kode'], ['visual', 'Visual']].map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={cx('text-body flex-1 rounded-[3px] py-2.5 transition-colors', tab === id ? 'bg-card font-semibold text-control shadow-block' : 'text-ink-soft')}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 hidden md:block">
        <PlayerBar
          player={player}
          caption={caption}
          extras={extras}
          actions={
            <Button variant="navigasiGaris" icon="compare" disabled title="Segera hadir">
              Bandingkan
            </Button>
          }
        />
        {openInput && <InputPanel def={def} draft={draft} setDraft={setDraft} error={error} onApply={() => { if (apply(draft, null, true)) setOpenInput(false) }} onCancel={() => { setOpenInput(false); setError(null) }} />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 md:hidden">
        <Select label="Input" value={custom ? 'kustom' : String(presetIndex)} onChange={choosePreset} options={presetOptions} />
        {cfg.source && <Select label="Sumber" value={values[cfg.source]} onChange={(v) => apply({ ...values, [cfg.source]: v }, positions, custom)} options={graph.names.map((n) => ({ value: n, label: n }))} />}
      </div>
      <div className="md:hidden">{openInput && <InputPanel def={def} draft={draft} setDraft={setDraft} error={error} onApply={() => { if (apply(draft, null, true)) setOpenInput(false) }} onCancel={() => { setOpenInput(false); setError(null) }} />}</div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel className={cx('order-2 lg:order-1', tab !== 'kode' && 'max-md:hidden')}>
          <CodePanel code={def.code} procedures={cfg.procedures} line={step.line} />
          <VariabelPanel step={step} />
        </Panel>
        <Panel className={cx('order-1 lg:order-2', tab !== 'visual' && 'max-md:hidden')}>
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <h2 className="text-h3 flex items-center gap-2 text-heading">
              <Icon name="graph" size={20} />
              Visualisasi
            </h2>
            <Chip type="default">Graf · {graph.directed ? 'berarah' : 'tak berarah'}</Chip>
          </div>
          <div className="px-4 pt-4">
            <GraphStage view={view} graph={graph} positions={positions} showWeights={showWeights} showArrows={showArrows} label={`Graf ${graph.names.length} simpul dan ${graph.edges.length} sisi, ${graph.directed ? 'berarah' : 'tak berarah'}, langkah ${player.index + 1} dari ${player.total}`} />
            {showLegend && (
              <div className="mt-3 rounded-sm border border-line bg-card p-3">
                <Legend legend={cfg.legend} />
              </div>
            )}
          </div>
          <div role="region" aria-label="Penjelasan langkah" className="m-4 flex items-start gap-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface p-3">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
            <p className="text-body-strong text-ink">{step.note}</p>
          </div>
        </Panel>
      </div>
      <PlayerBarCompact player={player} />
    </div>
  )
}

/** Halaman visualizer satu algoritma (Figma: Algoritma · Visualizer). */
export default function AlgoritmaDetail() {
  const { id } = useParams()
  const a = algoritma.find((x) => x.id === id)
  const cfg = vizConfig[id]
  if (!a) {
    return (
      <div className="mx-auto max-w-[1344px] px-4 py-8 md:px-8">
        <ErrorState judul="Algoritma tidak ditemukan" pesan="Alamat ini tidak cocok dengan algoritma mana pun di galeri." aksi={[{ label: 'Ke galeri algoritma', onClick: () => { window.location.hash = '#/' } }]} />
      </div>
    )
  }
  if (!cfg) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        <Mascot expression="berpikir" size={140} />
        <h1 className="text-h2 mt-4 text-heading">Visualizer {a.judul} sedang disiapkan</h1>
        <p className="text-body mt-2 text-ink-soft">Tampilan baru untuk algoritma ini belum jadi. Versi lama masih bisa dibuka.</p>
        <Button as={Link} to={a.href} variant="navigasi" className="mt-5">
          Buka versi lama
        </Button>
      </div>
    )
  }
  return <Viz key={id} a={a} cfg={cfg} />
}
