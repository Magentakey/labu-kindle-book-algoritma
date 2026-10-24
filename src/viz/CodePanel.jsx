import { useEffect, useMemo, useRef } from 'react'
import { buildCodeSections } from './codeModel.js'
import { Icon, Segmented } from '../ui/index.js'
import { cx } from '../ui/cx.js'

const tabs = [
  { id: 'pseudocode', label: 'Pseudocode' },
  { id: 'javascript', label: 'JavaScript', disabled: true, title: 'Segera hadir' },
]

/**
 * Panel Kode (Figma: Kode): pseudocode dengan nomor baris per prosedur. Baris yang berjalan disorot kuning dengan penanda ▶,
 * titik pemanggilan prosedur (mis. baris RELAX di DIJKSTRA) ditandai abu-abu dengan ↳.
 */
export default function CodePanel({ code, procedures, line }) {
  const sections = useMemo(() => buildCodeSections(code, procedures, line), [code, procedures, line])
  const box = useRef(null)
  useEffect(() => {
    const el = box.current?.querySelector('[data-active="true"]')
    if (el) el.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [line])
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-h3 flex items-center gap-2 text-heading">
          <Icon name="code" size={20} />
          Kode
        </h2>
        <Segmented options={tabs} value="pseudocode" onChange={() => {}} label="Jenis kode" />
      </div>
      {/* area gulir harus bisa difokus keyboard agar kode panjang bisa digulir tanpa mouse */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={box} role="region" aria-label="Pseudocode" tabIndex={0} className="max-h-[420px] overflow-auto bg-code-bg py-3">
        {sections.map((s, i) => (
          <div key={s.title} className={cx(i > 0 && 'mt-4')}>
            <p className="text-code px-4 text-ink">{s.title}</p>
            {s.rows.map((r) => (
              <div
                key={r.global}
                data-active={r.state === 'active'}
                aria-current={r.state === 'active' ? 'step' : undefined}
                className={cx('text-code flex items-center border-l-4 pr-4', r.state === 'active' ? 'border-brand-orange bg-surface font-semibold text-ink' : r.state === 'caller' ? 'border-muted bg-panel text-ink' : 'border-transparent text-ink')}
              >
                <span className="w-6 shrink-0 pl-1.5 text-ink-soft" aria-hidden="true">
                  {r.state === 'active' ? '▶' : r.state === 'caller' ? '↳' : ''}
                </span>
                <span className="w-6 shrink-0 text-right text-ink-soft">{r.local}</span>
                <span className="whitespace-pre pl-3">{r.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
