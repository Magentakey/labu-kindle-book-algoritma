import { useState } from 'react'
import { Button, Chip, chipTypes, Icon, IconButton, Logo, Mascot, ProgressBlocks, SearchField, StatusBlock, TabItem, ThemeToggle, Toggle } from '../ui/index.js'
import { iconNames } from '../ui/iconData.js'
import { mascotNames } from '../ui/brandArt.js'

const colorGroups = {
  Brand: ['brand-orange', 'brand-burnt', 'brand-rust', 'brand-yellow', 'brand-mint', 'brand-blue', 'brand-blue-strong', 'brand-stem', 'brand-dark-stem'],
  Latar: ['bg-page', 'bg-surface', 'bg-mint-soft', 'bg-panel', 'bg-card', 'bg-placeholder', 'bg-code'],
  Teks: ['text-primary', 'text-secondary', 'text-heading', 'text-accent', 'text-link', 'text-on-orange', 'text-on-burnt', 'text-on-blue', 'text-on-error'],
  'Garis dan status': ['border-default', 'border-strong', 'nav-active', 'neutral-muted', 'status-success', 'status-success-bg', 'status-error', 'status-error-bg', 'status-info', 'status-info-bg'],
  Visualisasi: ['viz-unvisited', 'viz-active', 'viz-done'],
}

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-h3 mb-3 text-heading">{title}</h2>
    {children}
  </section>
)

/** Halaman /ui: semua token dan komponen dasar di satu tempat, untuk dicocokkan dengan Figma di mode terang dan gelap. */
export default function UiKit() {
  const [q, setQ] = useState('')
  const [on, setOn] = useState(true)
  const [tab, setTab] = useState('Pseudocode')
  return (
    <div className="min-h-screen bg-page font-ui text-ink">
      <header className="flex items-center justify-between border-b border-line px-6 py-3">
        <Logo className="h-10" />
        <div className="flex items-center gap-2">
          <span className="text-caption text-ink-soft">Peninjauan komponen (hanya pengembangan)</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-h1 mb-8 text-heading">Style guide LABU</h1>

        <Section title="Warna">
          {Object.entries(colorGroups).map(([group, names]) => (
            <div key={group} className="mb-4">
              <p className="text-label mb-2 text-accent">{group}</p>
              <div className="flex flex-wrap gap-3">
                {names.map((n) => (
                  <div key={n} className="w-28">
                    <div className="h-10 rounded-sm border border-line" style={{ background: `var(--${n})` }} />
                    <p className="text-caption mt-1 break-words text-ink-soft">{n}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Tipografi">
          <div className="space-y-2">
            <p className="text-h1">H1 · Insertion Sort: menyisipkan kartu</p>
            <p className="text-h2">H2 · Insertion Sort: menyisipkan kartu</p>
            <p className="text-h3">H3 · Insertion Sort: menyisipkan kartu</p>
            <p className="text-body-l">Body L · Mencari nilai pada array terurut dengan membelah ruang pencarian menjadi dua.</p>
            <p className="text-body">Body · Mencari nilai pada array terurut dengan membelah ruang pencarian menjadi dua.</p>
            <p className="text-body-strong">Body tebal · Mencari nilai pada array terurut</p>
            <p className="text-caption">Caption · Modul 04 · 11 halaman</p>
            <p className="text-label text-accent">LABEL · PENCARIAN</p>
            <p className="text-code">Kode · while i &gt; 0 and A[i] &gt; key</p>
            <p className="text-pixel-l">04 · 24</p>
            <p className="text-pixel-s">PIXEL S</p>
          </div>
        </Section>

        <Section title="Bayangan dan fokus">
          <div className="flex flex-wrap gap-4">
            {['shadow-block', 'shadow-hover', 'shadow-popover', 'shadow-glow'].map((s) => (
              <div key={s} className={`rounded-sm bg-card px-4 py-6 text-caption ${s}`}>{s}</div>
            ))}
            <button className="rounded-sm bg-card px-4 py-6 text-caption">Tab ke sini untuk melihat cincin fokus</button>
          </div>
        </Section>

        <Section title="Logo dan maskot">
          <div className="flex flex-wrap items-end gap-8">
            <Logo className="h-14" />
            <Logo variant="mark" className="h-14" />
            {mascotNames.map((n) => (
              <figure key={n} className="text-center">
                <Mascot expression={n} size={96} />
                <figcaption className="text-caption text-ink-soft">{n}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title={`Ikon (${iconNames.length})`}>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {iconNames.map((n) => (
              <div key={n} className="flex flex-col items-center gap-1 rounded-sm border border-line bg-card p-2">
                <Icon name={n} size={24} />
                <span className="text-caption text-ink-soft">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tombol">
          <div className="space-y-3">
            {['primary', 'secondary', 'ghost'].map((v) => (
              <div key={v} className="flex flex-wrap items-center gap-3">
                <span className="text-caption w-20 text-ink-soft">{v}</span>
                <Button variant={v} icon="download">Tombol M</Button>
                <Button variant={v} size="s">Tombol S</Button>
                <Button variant={v} iconRight="arrowR">Lanjutkan</Button>
                <Button variant={v} disabled>Nonaktif</Button>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="text-caption w-20 text-ink-soft">ikon</span>
              <IconButton variant="primary" icon="play" label="Putar" />
              <IconButton variant="outline" icon="reset" label="Ulangi" />
              <IconButton variant="ghost" icon="menu" label="Menu" />
            </div>
          </div>
        </Section>

        <Section title="Chip">
          <div className="flex flex-wrap gap-2">
            {chipTypes.map((t) => <Chip key={t} type={t}>{t}</Chip>)}
          </div>
        </Section>

        <Section title="Input dan kontrol">
          <div className="flex flex-wrap items-center gap-6">
            <SearchField value={q} onChange={setQ} placeholder="Cari algoritma, mis. “dijk”…" className="w-72" />
            <Toggle checked={on} onChange={setOn} label="Babak" />
            <div className="flex gap-1 rounded-sm bg-panel p-1" role="tablist">
              {['Pseudocode', 'JavaScript'].map((t) => <TabItem key={t} active={tab === t} onClick={() => setTab(t)}>{t}</TabItem>)}
            </div>
          </div>
        </Section>

        <Section title="Progres dan status">
          <div className="space-y-3">
            {[0, 50, 100].map((v) => (
              <div key={v} className="flex items-center gap-3">
                <ProgressBlocks value={v} />
                <span className="text-caption text-ink-soft">{v}%</span>
              </div>
            ))}
            <div className="flex items-center gap-4">
              {['belum', 'sedang', 'selesai'].map((s) => (
                <span key={s} className="flex items-center gap-2 text-caption"><StatusBlock status={s} />{s}</span>
              ))}
            </div>
          </div>
        </Section>
      </main>
    </div>
  )
}
