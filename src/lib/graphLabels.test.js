import test from 'node:test'
import assert from 'node:assert/strict'
import { placeLabels } from './graphLabels.js'
import { layoutCircle, GRAPH_NODE_R, GRAPH_VIEW_H, GRAPH_VIEW_W, randomGraph } from '../algorithms/graphCommon.js'
import { seeded } from './seededRandom.js'

const size = { nodeHalf: GRAPH_NODE_R + 3, chipW: 54, chipH: 28, width: GRAPH_VIEW_W, height: GRAPH_VIEW_H }
const segs = (n, edges) => {
  const pos = layoutCircle(n)
  return { pos, segments: edges.map(([u, v]) => ({ x1: pos[u].x, y1: pos[u].y, x2: pos[v].x, y2: pos[v].y })) }
}

test('placeLabels: label dekat sisinya, di dalam kanvas, dan hasilnya deterministik', () => {
  const { pos, segments } = segs(5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]])
  const a = placeLabels(segments, pos, size)
  assert.deepEqual(a, placeLabels(segments, pos, size))
  a.forEach((p, i) => {
    assert.ok(p.t >= 0.2 && p.t <= 0.8)
    const s = segments[i]
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
    const dist = Math.abs((s.x2 - s.x1) * (s.y1 - p.y) - (s.x1 - p.x) * (s.y2 - s.y1)) / len // jarak tegak lurus dari garis
    assert.ok(Math.abs(dist - Math.abs(p.off)) < 1e-6, `label ${i}: jarak dari garis ${dist} ≠ ${p.off}`)
  })
})

test('placeLabels: lebih sedikit tumpang tindih daripada selalu menaruh label di tengah (graf acak padat)', () => {
  const rng = seeded(3)
  const area = (a, b) => {
    const w = Math.min(a.x + a.w / 2, b.x + b.w / 2) - Math.max(a.x - a.w / 2, b.x - b.w / 2)
    const h = Math.min(a.y + a.h / 2, b.y + b.h / 2) - Math.max(a.y - a.h / 2, b.y - b.h / 2)
    return w > 0 && h > 0 ? w * h : 0
  }
  const score = (spots, pos) => {
    const chips = spots.map((p) => ({ x: p.x, y: p.y, w: size.chipW, h: size.chipH }))
    let s = 0
    for (const c of chips) for (const n of pos) s += area(c, { x: n.x, y: n.y, w: size.nodeHalf * 2, h: size.nodeHalf * 2 })
    for (let i = 0; i < chips.length; i++) for (let j = i + 1; j < chips.length; j++) s += area(chips[i], chips[j])
    return s
  }
  let placedTotal = 0
  let midTotal = 0
  for (let t = 0; t < 60; t++) {
    const g = randomGraph({ directed: false, weighted: true, needStart: false, maxWeight: 15 }, rng)
    const { pos, segments } = segs(g.n, g.edges)
    const mid = segments.map((s) => ({ x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 }))
    placedTotal += score(placeLabels(segments, pos, size), pos)
    midTotal += score(mid, pos)
  }
  assert.ok(placedTotal < midTotal * 0.6, `tumpang tindih total ${placedTotal.toFixed(0)} harus jauh di bawah label di tengah (${midTotal.toFixed(0)})`)
})
