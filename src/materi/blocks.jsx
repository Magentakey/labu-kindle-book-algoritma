import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { traces } from '../algorithms/traces.js'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { insertionLoops } from '../lib/insertionLoops.js'
import { Button, Chip, Icon, IconButton, Segmented, Skeleton, useToast } from '../ui/index.js'
import { cx } from '../ui/cx.js'

const ChallengeIDE = lazy(() => import('../components/ChallengeIDE/ChallengeIDE.jsx'))

const Md = ({ text, inline }) => <MarkdownView variant="modul" text={text} inline={inline} />

// ------------------------------------------------------------------ catatan
/** Kotak catatan: "benar" (abu, penjelasan) dan "coba" (hero kuning putus-putus, bisa dibuka/tutup). */
export function Callout({ jenis, judul, text }) {
  const [open, setOpen] = useState(false)
  if (jenis === 'coba') {
    return (
      <div className="my-6 rounded-sm border-[1.5px] border-dashed border-brand-yellow-strong bg-surface">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left">
          <Icon name="bulb" size={20} className="shrink-0 text-ink" />
          <span className="min-w-0 flex-1">
            <span className="text-body-strong block text-heading">{judul}</span>
            <span className="text-caption block text-ink-soft">Instruksi</span>
          </span>
          <Icon name="down" size={18} className={cx('shrink-0 text-ink transition-transform duration-[250ms]', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="border-t border-brand-yellow-strong/50 px-4 pb-2">
            <Md text={text} />
          </div>
        )}
      </div>
    )
  }
  return (
    <aside className="my-6 border-y border-line border-l-4 border-l-muted bg-card px-4 py-3">
      <p className="text-label flex items-center gap-2 text-accent uppercase">
        <Icon name="bulb" size={16} />
        {judul}
      </p>
      <Md text={text} />
    </aside>
  )
}

// ------------------------------------------------------------------ pseudocode dan JavaScript
const PSEUDO_HEADER = 'INSERTION_SORT(A)   // A: array satu dimensi berisi n bilangan'
const JS_CODE = `function insertionSort(A) {
  for (let j = 1; j < A.length; j++) {
    const key = A[j]
    let i = j - 1
    while (i >= 0 && A[i] > key) {
      A[i + 1] = A[i]
      i = i - 1
    }
    A[i + 1] = key
  }
  return A
}`
const pseudoLines = () => traces['insertion-sort'].code.split('\n')

/** Blok kode dengan tab Pseudocode | JavaScript dan tombol Salin (Figma: Pseudocode 2.2). */
export function KodeBlok() {
  const [tab, setTab] = useState('pseudocode')
  const { show } = useToast()
  const pseudo = pseudoLines()
  const salin = async () => {
    const text = tab === 'pseudocode' ? [PSEUDO_HEADER, ...pseudo.map((l, i) => `${i + 1} ${l}`)].join('\n') : JS_CODE
    try {
      await navigator.clipboard.writeText(text)
      show({ kind: 'success', message: 'Kode disalin' })
    } catch {
      show({ kind: 'error', message: 'Kode tidak bisa disalin di perangkat ini' })
    }
  }
  return (
    <figure className="my-5 overflow-hidden rounded-sm border border-line bg-card">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="text-body-strong text-heading">{tab === 'pseudocode' ? 'Pseudocode 2.2' : 'Kode JavaScript'}</span>
        <span className="flex items-center gap-3">
          <Segmented label="Jenis kode" value={tab} onChange={setTab} options={[{ id: 'pseudocode', label: 'Pseudocode' }, { id: 'javascript', label: 'JavaScript' }]} />
          <Button variant="kontrol" size="s" onClick={salin}>
            Salin
          </Button>
        </span>
      </figcaption>
      {/* area gulir kode harus bisa difokus keyboard */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div role="region" aria-label={tab === 'pseudocode' ? 'Pseudocode INSERTION_SORT' : 'Kode JavaScript insertionSort'} tabIndex={0} className="overflow-x-auto bg-code-bg py-3">
        {tab === 'pseudocode' ? (
          <>
            <p className="text-code px-4 whitespace-pre text-ink">{PSEUDO_HEADER}</p>
            {pseudo.map((l, i) => (
              <p key={i} className="text-code flex px-4 text-ink">
                <span className="w-6 shrink-0 text-right text-ink-soft">{i + 1}</span>
                <span className="whitespace-pre pl-3">{l}</span>
              </p>
            ))}
          </>
        ) : (
          JS_CODE.split('\n').map((l, i) => (
            <p key={i} className="text-code flex px-4 text-ink">
              <span className="w-6 shrink-0 text-right text-ink-soft">{i + 1}</span>
              <span className="whitespace-pre pl-3">{l}</span>
            </p>
          ))
        )}
      </div>
    </figure>
  )
}

// ------------------------------------------------------------------ penelusuran interaktif
/**
 * Penelusuran Insertion Sort per putaran pada 12, 10, 15, 7 (Figma: Langkah x / N). Kotak oranye = key yang sudah diletakkan,
 * dan baris terakhir di kotak bawah menunjukkan penempatan key. Isi dihitung dari algoritma, bukan diketik.
 */
export function LoopStepper({ data = [12, 10, 15, 7], visualizerHref }) {
  const { awal, putaran } = useMemo(() => insertionLoops(data), [data])
  const states = useMemo(
    () => [
      { label: 'Keadaan awal', array: awal, keyIndex: null, lines: [] },
      ...putaran.map((p, i) => ({ label: `Loop ${i + 1} (j = ${p.j})  ·  key = A[${p.j}] = ${p.key}`, array: p.sesudah, keyIndex: p.posisiKey, lines: p.pemeriksaan })),
    ],
    [awal, putaran],
  )
  const [k, setK] = useState(0)
  const s = states[k]
  const last = states.length - 1
  return (
    <div className="my-6 rounded-sm border border-line bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-body-strong text-heading">
          Langkah {k + 1} / {states.length}
        </span>
        <span className="flex gap-1" aria-hidden="true">
          {states.map((_, i) => (
            <span key={i} className={cx('h-2 w-5 rounded-[1px]', i <= k ? 'border border-ok bg-brand-mint' : 'bg-placeholder')} />
          ))}
        </span>
        <span className="text-code text-ink">{s.label}</span>
        {k === last && <Chip type="sukses">Terurut</Chip>}
      </div>
      <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label={`Isi array: ${s.array.join(', ')}`}>
        {s.array.map((v, i) => {
          const isKey = s.keyIndex === i + 1
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={cx('text-caption h-4 text-ink-soft', !isKey && 'invisible')}>key</span>
              <span className={cx('text-pixel-l flex size-16 items-center justify-center rounded-sm border', isKey ? 'border-brand-burnt bg-brand-orange text-on-orange shadow-glow' : 'border-line bg-card text-ink')}>{v}</span>
              <span className="text-caption text-ink-soft">A[{i + 1}]</span>
            </div>
          )
        })}
      </div>
      {s.lines.length > 0 && (
        <div className="mt-4 rounded-sm bg-code-bg py-2">
          {s.lines.map((l, i) => {
            const end = i === s.lines.length - 1
            return (
              <p key={i} className={cx('text-code flex items-center border-l-4 px-3 whitespace-pre-wrap', end ? 'border-brand-orange bg-surface font-semibold text-ink' : 'border-transparent text-ink')}>
                <span className="w-5 shrink-0 text-ink-soft" aria-hidden="true">{end ? '▶' : ''}</span>
                {l}
              </p>
            )
          })}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2">
        <IconButton variant="kontrol" icon="left" label="Langkah sebelumnya" disabled={k === 0} onClick={() => setK(k - 1)} />
        <IconButton variant="kontrol" icon="right" label="Langkah berikutnya" disabled={k === last} onClick={() => setK(k + 1)} />
        {visualizerHref && (
          <Button as={Link} to={visualizerHref} variant="navigasiGaris" size="s" icon="play" className="ml-auto">
            Lihat di Visualizer
          </Button>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ ringkasan kasus
/** Dua kartu ringkasan: kasus terbaik (linier) dan terburuk (kuadrat). */
export function KasusCards() {
  const cards = [
    { judul: 'Kasus terbaik · data terurut', rumus: '$t_j = 1 \\;\\to\\; T(n) = an + b$', chip: ['sukses', 'Linier'] },
    { judul: 'Kasus terburuk · terurut terbalik', rumus: '$t_j = j \\;\\to\\; T(n) = an^2 + bn + c$', chip: ['gagal', 'Kuadrat'] },
  ]
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <div key={c.judul} className="rounded-sm border border-line bg-card p-4">
          <p className="text-body-strong text-heading">{c.judul}</p>
          <div className="my-1">
            <Md text={c.rumus} />
          </div>
          <Chip type={c.chip[0]}>{c.chip[1]}</Chip>
        </div>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ tantangan kode
/** Tantangan kode (Figma: Tantangan kode). Memakai editor yang sudah ada; gayanya menyusul. */
export function Tantangan({ muat }) {
  const [challenge, setChallenge] = useState(null)
  const [gagal, setGagal] = useState(false)
  useEffect(() => {
    let batal = false
    muat().then((c) => !batal && setChallenge(c), () => !batal && setGagal(true))
    return () => {
      batal = true
    }
  }, [muat])
  return (
    <section aria-label="Tantangan kode" className="my-8 rounded-sm border border-line bg-card p-4 md:p-5">
      <p className="text-label flex items-center gap-2 text-accent uppercase">
        <Icon name="code" size={16} />
        Tantangan kode
        <span className="text-caption ml-auto font-normal normal-case text-ink-soft">JavaScript</span>
      </p>
      <h3 className="text-h3 mt-2 text-heading">{challenge?.title ?? 'Lengkapi baris pergeseran pada insertionSort(A)'}</h3>
      <div className="mt-3">
        {gagal && <p role="alert" className="text-body text-bad-text">Tantangan tidak bisa dimuat.</p>}
        {!gagal && !challenge && <Skeleton className="h-48 w-full" />}
        {challenge && (
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ChallengeIDE key={challenge.id} challenge={challenge} />
          </Suspense>
        )}
      </div>
    </section>
  )
}
