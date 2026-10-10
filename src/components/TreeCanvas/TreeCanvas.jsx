import { useEffect, useMemo, useRef } from 'react'
import { buildOutline, layoutPixels, NODE_H } from '../../lib/treeLayout.js'
import { TREE_STATUS } from './treeStatuses.js'

// Simpul yang sedang "beraksi": kanvas menggulir agar simpul-simpul ini terlihat.
const FOCUS_MARKS = ['current', 'base', 'created', 'pickA', 'pickB']

function describe(node, statusLabel) {
  const parts = [node.label]
  if (node.sub) parts.push(`(${node.sub})`)
  let text = parts.join(' ')
  if (node.edge) text += `, sisi ${node.edge}`
  if (node.mark && node.mark !== 'normal') text += `, ${statusLabel(node.mark)}`
  return text
}

function Outline({ items, statusLabel }) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map(({ node, children }) => (
        <li key={node.id}>
          {describe(node, statusLabel)}
          {children.length > 0 && <Outline items={children} statusLabel={statusLabel} />}
        </li>
      ))}
    </ul>
  )
}

/**
 * Menggambar pohon/hutan. Simpul adalah elemen HTML (agar pola isian CSS dari TREE_STATUS bisa dipakai),
 * sisi digambar dengan SVG di bawahnya. Selain gambar, tersedia daftar bertingkat sebagai teks alternatif.
 * @param {Object} props
 * @param {import('../../lib/treeLayout.js').TreeNode[]} props.nodes
 * @param {Record<string, string>} [props.labels]   keterangan status khusus algoritma ini
 * @param {string[]} [props.legend]                 status yang ditampilkan di keterangan
 * @param {string} [props.label]                    nama gambar untuk pembaca layar
 */
export default function TreeCanvas({ nodes, labels = {}, legend = Object.keys(TREE_STATUS), label = 'Pohon' }) {
  const { items, width, height } = useMemo(() => layoutPixels(nodes), [nodes])
  const outline = useMemo(() => buildOutline(nodes), [nodes])
  const byId = useMemo(() => Object.fromEntries(items.map((n) => [n.id, n])), [items])
  const statusLabel = (key) => labels[key] ?? TREE_STATUS[key]?.label ?? key
  const statusOf = (key) => (TREE_STATUS[key] ? key : 'normal')

  const edges = items.filter((n) => n.parent && byId[n.parent])

  // Pohon yang lebih lebar dari panelnya digulir ke simpul yang sedang aktif (atau ke akar bila tidak ada),
  // supaya pengguna tidak melihat sisi kosong sementara aksinya di luar layar.
  const scrollRef = useRef(null)
  useEffect(() => {
    const box = scrollRef.current
    if (!box || items.length === 0 || box.scrollWidth <= box.clientWidth) return
    let focus = items.filter((n) => FOCUS_MARKS.includes(n.mark))
    if (focus.length === 0) focus = items.filter((n) => !n.parent)
    const cx = focus.reduce((sum, n) => sum + n.cx, 0) / focus.length
    const margin = 48
    if (cx < box.scrollLeft + margin || cx > box.scrollLeft + box.clientWidth - margin) {
      box.scrollLeft = Math.max(0, cx - box.clientWidth / 2)
    }
  }, [items])

  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <div
        ref={scrollRef}
        // Area gulir harus bisa difokus keyboard (WCAG 2.1.1), maka tabIndex sengaja dipakai.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={`${label}, area yang bisa digeser`}
        className="overflow-x-auto focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        {items.length === 0 ? (
          <p className="p-4 text-stone-700">Pohon kosong.</p>
        ) : (
          <div
            role="img"
            aria-label={`${label}: ${items.length} simpul tampil. Rincian setiap simpul ada di daftar bertingkat di bawah gambar.`}
            className="relative mx-auto"
            style={{ width, height }}
          >
            <svg width={width} height={height} aria-hidden="true" className="absolute inset-0">
              {edges.map((n) => {
                const p = byId[n.parent]
                return <line key={n.id} x1={p.cx} y1={p.top + NODE_H} x2={n.cx} y2={n.top} stroke="#44403c" strokeWidth="2" />
              })}
            </svg>

            {edges
              .filter((n) => n.edge)
              .map((n) => {
                const p = byId[n.parent]
                return (
                  <span
                    key={`e-${n.id}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone-800 bg-white px-1.5 text-xs font-bold leading-5"
                    style={{ left: (p.cx + n.cx) / 2, top: (p.top + NODE_H + n.top) / 2 }}
                  >
                    {n.edge}
                  </span>
                )
              })}

            {items.map((n) => {
              const s = statusOf(n.mark)
              const circle = n.width === NODE_H
              return (
                <div key={n.id}>
                  <div
                    className={
                      'absolute flex items-center justify-center border-2 border-stone-800 ' +
                      (circle ? 'rounded-full' : 'rounded-full px-2')
                    }
                    style={{ left: n.left, top: n.top, width: n.width, height: NODE_H, background: TREE_STATUS[s].fill }}
                  >
                    {/* Teks diberi alas putih agar tetap terbaca di atas pola */}
                    <span className="whitespace-nowrap rounded bg-white px-1.5 text-sm font-bold leading-5">{n.label}</span>
                    {TREE_STATUS[s].glyph && (
                      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-stone-800 bg-white px-1 text-xs font-bold">
                        {TREE_STATUS[s].glyph}
                      </span>
                    )}
                  </div>
                  {n.sub && (
                    <span
                      className="absolute -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1 text-xs font-medium leading-4 text-stone-800"
                      style={{ left: n.cx, top: n.top + NODE_H + 2 }}
                    >
                      {n.sub}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-300 pt-3 text-sm">
        {legend
          .filter((s) => TREE_STATUS[s])
          .map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-5 w-5 shrink-0 rounded-full border-2 border-stone-800"
                style={{ background: TREE_STATUS[s].fill }}
              />
              {TREE_STATUS[s].glyph && (
                <span aria-hidden="true" className="font-bold">
                  {TREE_STATUS[s].glyph}
                </span>
              )}
              <span>{statusLabel(s)}</span>
            </li>
          ))}
      </ul>

      <details className="mt-3 border-t border-stone-300 pt-3">
        <summary className="cursor-pointer font-semibold">Lihat pohon sebagai daftar bertingkat</summary>
        <div className="mt-2 text-sm">
          {outline.length === 0 ? <p>Pohon kosong.</p> : <Outline items={outline} statusLabel={statusLabel} />}
        </div>
      </details>
    </div>
  )
}
