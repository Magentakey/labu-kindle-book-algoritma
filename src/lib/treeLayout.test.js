import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOutline, layoutForest, layoutPixels, nodeWidth, NODE_H, PAD } from './treeLayout.js'
import { buildBinaryTree } from './binaryTree.js'

const toNodes = (tokens) =>
  buildBinaryTree(tokens).nodes.map((n) => ({ id: n.id, parent: n.parent, side: n.side ?? undefined, label: String(n.value) }))

test('pohon pada gambar contoh (1,2,3,4,5): daun berurutan, induk di tengah anak', () => {
  const { pos, slots, maxDepth } = layoutForest(toNodes([1, 2, 3, 4, 5]))
  assert.equal(slots, 3)
  assert.equal(maxDepth, 2)
  assert.deepEqual(pos.n3, { x: 0.5, depth: 2 }) // 4
  assert.deepEqual(pos.n4, { x: 1.5, depth: 2 }) // 5
  assert.deepEqual(pos.n1, { x: 1, depth: 1 }) // 2 di tengah 4 dan 5
  assert.deepEqual(pos.n2, { x: 2.5, depth: 1 }) // 3 daun
  assert.equal(pos.n0.x, (1 + 2.5) / 2)
  assert.equal(pos.n0.depth, 0)
})

test('anak tunggal tetap di sisinya (kiri/kanan) dan tidak menabrak saudaranya', () => {
  // 1 -> kiri 2 (anak kiri 3), kanan 4 (anak kanan 5)
  const nodes = toNodes([1, 2, 4, 3, null, null, 5])
  const { pos } = layoutForest(nodes)
  const id = (v) => nodes.find((n) => n.label === String(v)).id
  assert.ok(pos[id(3)].x < pos[id(2)].x, 'anak kiri berada di kiri induknya')
  assert.ok(pos[id(5)].x > pos[id(4)].x, 'anak kanan berada di kanan induknya')
  // Tidak ada dua simpul di level yang sama dengan jarak < 1 slot.
  const byDepth = {}
  for (const [k, p] of Object.entries(pos)) (byDepth[p.depth] ??= []).push({ k, x: p.x })
  for (const list of Object.values(byDepth)) {
    list.sort((a, b) => a.x - b.x)
    for (let i = 1; i < list.length; i++) assert.ok(list[i].x - list[i - 1].x >= 1 - 1e-9, `${list[i - 1].k} dan ${list[i].k} bertabrakan`)
  }
})

test('hutan: akar-akar berdampingan dan tidak saling menimpa', () => {
  const nodes = [
    { id: 'a', parent: null, label: 'a' },
    { id: 'b', parent: null, label: 'b' },
    { id: 'm', parent: null, label: 'm' },
    { id: 'x', parent: 'm', label: 'x' },
    { id: 'y', parent: 'm', label: 'y' },
  ]
  const { pos, slots } = layoutForest(nodes)
  assert.ok(pos.a.x < pos.b.x && pos.b.x < pos.m.x)
  assert.ok(pos.m.x - pos.b.x >= 1)
  assert.ok(slots >= 4)
})

test('nodeWidth: label pendek lingkaran, label panjang kapsul', () => {
  assert.equal(nodeWidth('5'), NODE_H)
  assert.equal(nodeWidth('-99'), NODE_H)
  assert.ok(nodeWidth('6 3 8') > NODE_H)
  assert.ok(nodeWidth('99 99 99 99 99 99 99 99') <= 300)
})

test('layoutPixels: simpul hidden tidak digambar tetapi ukuran kanvas tetap, dan tidak ada yang keluar dari tepi', () => {
  const nodes = toNodes([1, 2, 3])
  const visible = layoutPixels(nodes)
  const hidden = layoutPixels(nodes.map((n, i) => (i === 2 ? { ...n, hidden: true } : n)))
  assert.equal(visible.items.length, 3)
  assert.equal(hidden.items.length, 2)
  assert.equal(visible.height, hidden.height)
  assert.equal(visible.width, hidden.width)
  for (const it of visible.items) {
    assert.ok(it.left >= PAD - 1e-9)
    assert.ok(it.left + it.width <= visible.width)
  }
  const wide = layoutPixels([{ id: 'r', parent: null, label: '99 99 99 99 99 99 99 99' }])
  assert.ok(wide.items[0].left >= PAD)
})

test('buildOutline: bersarang sesuai induk dan melewati simpul hidden', () => {
  const nodes = [
    { id: 'r', parent: null, label: 'r' },
    { id: 'a', parent: 'r', label: 'a' },
    { id: 'b', parent: 'r', label: 'b', hidden: true },
    { id: 'c', parent: 'a', label: 'c' },
  ]
  const out = buildOutline(nodes)
  assert.equal(out.length, 1)
  assert.equal(out[0].children.length, 1)
  assert.equal(out[0].children[0].node.id, 'a')
  assert.equal(out[0].children[0].children[0].node.id, 'c')
})
