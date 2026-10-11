import { useId } from 'react'
import { placeLabels } from '../../lib/graphLabels.js'
import { GRAPH_NODE_R, GRAPH_VIEW_H, GRAPH_VIEW_W } from '../../algorithms/graphCommon.js'
import { GRAPH_EDGE_STATUS, GRAPH_NODE_STATUS } from './graphStatuses.js'

const SIDE_OFFSET = 7 // dua sisi berlawanan (u>v dan v>u) digeser ke samping supaya tidak menumpuk

/**
 * Geometri satu sisi dalam satuan viewBox: titik awal/akhir (dipotong di tepi simpul bila berarah),
 * dan posisi label. Sisi yang punya lawan arah digeser tegak lurus ke kanan arah geraknya.
 */
function geometry(a, b, { directed, hasReverse }) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const off = hasReverse ? SIDE_OFFSET : 0
  const ox = -uy * off
  const oy = ux * off
  const x1 = a.x + ox
  const y1 = a.y + oy
  let x2 = b.x + ox
  let y2 = b.y + oy
  if (directed) {
    x2 -= ux * (GRAPH_NODE_R + 3)
    y2 -= uy * (GRAPH_NODE_R + 3)
  }
  return { x1, y1, x2: directed ? x2 : b.x + ox, y2: directed ? y2 : b.y + oy }
}

const pct = (v, total) => `${(v / total) * 100}%`

/**
 * Menggambar graf: sisi dengan SVG, simpul dan label bobot sebagai elemen HTML (agar pola isian CSS bisa dipakai).
 * Seluruh kanvas diskalakan menurut lebar panel (viewBox 400 x 300). Selain gambar, ada daftar teks sebagai alternatif.
 * @param {Object} props
 * @param {import('../../algorithms/graphCommon.js').GraphViewNode[]} props.nodes
 * @param {import('../../algorithms/graphCommon.js').GraphViewEdge[]} props.edges
 * @param {boolean} props.directed
 * @param {boolean} props.weighted
 * @param {Record<string,string>} [props.labels]      keterangan status simpul khusus algoritma ini
 * @param {Record<string,string>} [props.edgeLabels]  keterangan status sisi khusus algoritma ini
 * @param {string[]} [props.legend]                   status simpul yang ditampilkan di keterangan
 * @param {string[]} [props.edgeLegend]               status sisi yang ditampilkan di keterangan
 * @param {string} [props.label]
 */
export default function GraphCanvas({
  nodes,
  edges,
  directed,
  weighted,
  labels = {},
  edgeLabels = {},
  legend = Object.keys(GRAPH_NODE_STATUS),
  edgeLegend = Object.keys(GRAPH_EDGE_STATUS),
  label = 'Graf',
}) {
  const uid = useId().replace(/:/g, '')
  const nodeLabel = (k) => labels[k] ?? GRAPH_NODE_STATUS[k]?.label ?? k
  const edgeLabel = (k) => edgeLabels[k] ?? GRAPH_EDGE_STATUS[k]?.label ?? k
  const nodeStatus = (k) => (GRAPH_NODE_STATUS[k] ? k : 'normal')
  const edgeStatus = (k) => (GRAPH_EDGE_STATUS[k] ? k : 'normal')
  const name = (e) => `${e.u}${directed ? '→' : '-'}${e.v}`

  const reverse = new Set(edges.map((e) => `${e.u},${e.v}`))
  const geoms = edges.map((e) => geometry(nodes[e.u], nodes[e.v], { directed, hasReverse: directed && reverse.has(`${e.v},${e.u}`) }))
  // Ukuran label dalam satuan viewBox dihitung untuk lebar kanvas tersempit (300 px), supaya aman di layar kecil.
  const spots = placeLabels(geoms, nodes, { nodeHalf: GRAPH_NODE_R + 3, chipW: weighted ? 54 : 30, chipH: 28, width: GRAPH_VIEW_W, height: GRAPH_VIEW_H })
  const drawn = edges.map((e, i) => ({ e, g: { ...geoms[i], lx: spots[i].x, ly: spots[i].y } }))

  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <div
        // Kanvas yang lebih sempit dari lebar minimumnya bisa digeser, jadi areanya harus bisa difokus keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="group"
        aria-label={`${label}, area yang bisa digeser`}
        className="overflow-x-auto focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <div
          role="img"
          aria-label={`${label}: ${nodes.length} simpul dan ${edges.length} sisi${directed ? ', berarah' : ''}. Rincian ada di daftar di bawah gambar.`}
          className="relative mx-auto w-full"
          style={{ aspectRatio: `${GRAPH_VIEW_W} / ${GRAPH_VIEW_H}`, minWidth: 300, maxWidth: 560 }}
        >
          <svg viewBox={`0 0 ${GRAPH_VIEW_W} ${GRAPH_VIEW_H}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
            {directed && (
              <defs>
                {Object.entries(GRAPH_EDGE_STATUS).map(([k, s]) => (
                  <marker
                    key={k}
                    id={`${uid}-arrow-${k}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="13"
                    markerHeight="13"
                    markerUnits="userSpaceOnUse"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill={s.stroke} />
                  </marker>
                ))}
              </defs>
            )}
            {drawn.map(({ e, g }) => {
              const s = GRAPH_EDGE_STATUS[edgeStatus(e.mark)]
              return (
                <line
                  key={e.id}
                  x1={g.x1}
                  y1={g.y1}
                  x2={g.x2}
                  y2={g.y2}
                  stroke={s.stroke}
                  strokeWidth={s.width}
                  strokeDasharray={s.dash || undefined}
                  strokeLinecap="round"
                  markerEnd={directed ? `url(#${uid}-arrow-${edgeStatus(e.mark)})` : undefined}
                />
              )
            })}
          </svg>

          {/* Label bobot dan simbol status sisi */}
          {drawn.map(({ e, g }) => {
            const s = GRAPH_EDGE_STATUS[edgeStatus(e.mark)]
            if (!weighted && !s.glyph) return null
            return (
              <span
                key={`w-${e.id}`}
                aria-hidden="true"
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-stone-800 bg-white px-1 text-[11px] font-bold leading-4"
                style={{ left: pct(g.lx, GRAPH_VIEW_W), top: pct(g.ly, GRAPH_VIEW_H) }}
              >
                {weighted ? e.w : ''}
                {s.glyph && <span className={weighted ? 'ml-1' : ''}>{s.glyph}</span>}
              </span>
            )
          })}

          {nodes.map((n) => {
            const k = nodeStatus(n.mark)
            const s = GRAPH_NODE_STATUS[k]
            return (
              <div
                key={n.id}
                aria-hidden="true"
                className="absolute z-20 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-stone-800"
                style={{ left: pct(n.x, GRAPH_VIEW_W), top: pct(n.y, GRAPH_VIEW_H), width: `${(GRAPH_NODE_R * 2 * 100) / GRAPH_VIEW_W}%`, background: s.fill }}
              >
                {/* Teks diberi alas putih agar tetap terbaca di atas pola */}
                <span className="rounded bg-white px-1 text-xs font-bold leading-4 sm:text-sm sm:leading-5">{n.label}</span>
                {s.glyph && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-stone-800 bg-white px-0.5 text-[11px] font-bold">
                    {s.glyph}
                  </span>
                )}
                {n.sub && (
                  <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1 text-xs font-semibold leading-4 text-stone-800">
                    {n.sub}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-300 pt-3 text-sm">
        {legend
          .filter((k) => GRAPH_NODE_STATUS[k])
          .map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 rounded-full border-2 border-stone-800" style={{ background: GRAPH_NODE_STATUS[k].fill }} />
              {GRAPH_NODE_STATUS[k].glyph && (
                <span aria-hidden="true" className="font-bold">
                  {GRAPH_NODE_STATUS[k].glyph}
                </span>
              )}
              <span>{nodeLabel(k)}</span>
            </li>
          ))}
      </ul>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {edgeLegend
          .filter((k) => GRAPH_EDGE_STATUS[k])
          .map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <svg width="28" height="10" aria-hidden="true" className="shrink-0">
                <line
                  x1="2"
                  y1="5"
                  x2="26"
                  y2="5"
                  stroke={GRAPH_EDGE_STATUS[k].stroke}
                  strokeWidth={GRAPH_EDGE_STATUS[k].width}
                  strokeDasharray={GRAPH_EDGE_STATUS[k].dash || undefined}
                  strokeLinecap="round"
                />
              </svg>
              {GRAPH_EDGE_STATUS[k].glyph && (
                <span aria-hidden="true" className="font-bold">
                  {GRAPH_EDGE_STATUS[k].glyph}
                </span>
              )}
              <span>{edgeLabel(k)}</span>
            </li>
          ))}
      </ul>

      <details className="mt-3 border-t border-stone-300 pt-3">
        <summary className="cursor-pointer font-semibold">Lihat graf sebagai daftar</summary>
        <div className="mt-2 text-sm">
          <p className="font-semibold">Simpul</p>
          <ul className="ml-5 list-disc space-y-1">
            {nodes.map((n) => (
              <li key={n.id}>
                Simpul {n.label}
                {n.sub ? ` (${n.sub})` : ''}, {nodeLabel(nodeStatus(n.mark))}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-semibold">Sisi</p>
          {edges.length === 0 ? (
            <p>Tidak ada sisi.</p>
          ) : (
            <ul className="ml-5 list-disc space-y-1">
              {edges.map((e) => (
                <li key={e.id}>
                  Sisi {name(e)}
                  {weighted ? `, bobot ${e.w}` : ''}, {edgeLabel(edgeStatus(e.mark))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  )
}
