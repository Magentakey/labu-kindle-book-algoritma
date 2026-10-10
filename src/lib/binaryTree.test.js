import test from 'node:test'
import assert from 'node:assert/strict'
import { buildBinaryTree, formatTreeInput, parseTreeInput, MAX_TREE_NODES } from './binaryTree.js'

test('buildBinaryTree: pohon gambar contoh 1,2,3,4,5', () => {
  const { nodes } = buildBinaryTree([1, 2, 3, 4, 5])
  const byVal = Object.fromEntries(nodes.map((n) => [n.value, n]))
  assert.equal(nodes.length, 5)
  assert.equal(byVal[2].parent, 'n0')
  assert.equal(byVal[3].parent, 'n0')
  assert.equal(byVal[4].parent, 'n1')
  assert.equal(byVal[5].parent, 'n1')
  assert.equal(byVal[1].left, 'n1')
  assert.equal(byVal[1].right, 'n2')
  assert.equal(byVal[4].side, 'l')
  assert.equal(byVal[5].side, 'r')
})

test('buildBinaryTree: null melewati anak dan token berikutnya jadi anak simpul lain', () => {
  const { nodes, used } = buildBinaryTree([1, null, 2, 3])
  assert.equal(used, 4)
  const three = nodes.find((n) => n.value === 3)
  assert.equal(three.parent, 'n2') // anak kiri dari 2
  assert.equal(three.side, 'l')
  assert.equal(nodes.find((n) => n.value === 1).left, null)
})

test('buildBinaryTree: input kosong atau akar null menghasilkan pohon kosong', () => {
  assert.deepEqual(buildBinaryTree([]).nodes, [])
  assert.deepEqual(buildBinaryTree([null, 1]).nodes, [])
})

test('parseTreeInput: format valid, null, dan pemisah', () => {
  assert.deepEqual(parseTreeInput('1, 2, 3, 4, 5'), { ok: true, value: [1, 2, 3, 4, 5] })
  assert.deepEqual(parseTreeInput('1 2 null 3'), { ok: true, value: [1, 2, null, 3] })
  assert.deepEqual(parseTreeInput('8,3,10,-,-,6'), { ok: true, value: [8, 3, 10, null, null, 6] })
  assert.deepEqual(parseTreeInput('7'), { ok: true, value: [7] })
})

test('parseTreeInput: pesan galat untuk isian tidak valid', () => {
  for (const bad of ['', '   ', 'a, b', '1, 2.5', '100', '-100', 'null, 1', '1, null, null, 2']) {
    const r = parseTreeInput(bad)
    assert.equal(r.ok, false, `seharusnya ditolak: "${bad}"`)
    assert.ok(r.error.length > 0)
  }
  const tooMany = Array.from({ length: MAX_TREE_NODES + 1 }, (_, i) => i + 1).join(',')
  assert.equal(parseTreeInput(tooMany).ok, false)
  assert.equal(parseTreeInput(Array.from({ length: MAX_TREE_NODES }, (_, i) => i + 1).join(',')).ok, true)
})

test('formatTreeInput bolak-balik dengan parseTreeInput', () => {
  const tokens = [8, 3, 10, 1, 6, null, 14]
  assert.deepEqual(parseTreeInput(formatTreeInput(tokens)), { ok: true, value: tokens })
})
