import test from 'node:test'
import assert from 'node:assert/strict'
import { MODES, SPEED_STOPS, clampIndex, compactStatus, delayFor, speedLabel } from './playerLogic.js'
import { buildCodeSections, lineCaption } from './codeModel.js'

test('pemutar: lima kecepatan 0,25× sampai 4×, makin cepat jedanya makin singkat', () => {
  assert.deepEqual(SPEED_STOPS, [0.25, 0.5, 1, 2, 4])
  assert.deepEqual(SPEED_STOPS.map(delayFor), [3200, 1600, 800, 400, 200])
  assert.deepEqual(SPEED_STOPS.map(speedLabel), ['0,25×', '0,5×', '1×', '2×', '4×'])
  assert.deepEqual(MODES.map((m) => m.id), ['otomatis', 'frame'])
})

test('pemutar: clampIndex dan teks status HP seperti desain ("23 / 41 · 1× · Otomatis")', () => {
  assert.equal(clampIndex(-3, 10), 0)
  assert.equal(clampIndex(99, 10), 9)
  assert.equal(clampIndex(4, 0), 0)
  assert.equal(compactStatus({ index: 22, total: 41, speed: 1, mode: 'otomatis' }), '23 / 41 · 1× · Otomatis')
  assert.equal(compactStatus({ index: 0, total: 5, speed: 0.5, mode: 'frame' }), '1 / 5 · 0,5× · Frame-by-frame')
})

const code = ['MAIN(a)', '    CALL(a)', 'return', 'x = 1', '    y = 2'].join('\n')
const procs = [
  { title: 'MAIN(a)', from: 1, to: 3 },
  { title: 'CALL(a, b)', from: 4, to: 5, offset: 3, callSite: 2 },
]

test('buildCodeSections: nomor lokal per prosedur, baris aktif, dan titik pemanggilan', () => {
  const s = buildCodeSections(code, procs, 5)
  assert.deepEqual(s.map((x) => x.title), ['MAIN(a)', 'CALL(a, b)'])
  assert.deepEqual(s[1].rows.map((r) => [r.local, r.state]), [[1, null], [2, 'active']])
  assert.deepEqual(s[0].rows.map((r) => [r.local, r.state]), [[1, null], [2, 'caller'], [3, null]])
  assert.equal(s[1].rows[1].text, '    y = 2', 'indentasi dipertahankan')
  const a = buildCodeSections(code, procs, 2)
  assert.deepEqual(a[0].rows.map((r) => r.state), [null, 'active', null])
  assert.ok(a[1].rows.every((r) => r.state === null), 'pemanggil hanya ditandai bila baris aktif ada di prosedur yang dipanggil')
  assert.ok(buildCodeSections(code, procs, null).flatMap((x) => x.rows).every((r) => r.state === null))
})

test('lineCaption: nama prosedur dan nomor baris lokal', () => {
  assert.equal(lineCaption(procs, 5), 'CALL · baris 2')
  assert.equal(lineCaption(procs, 1), 'MAIN · baris 1')
  assert.equal(lineCaption(procs, 99), 'Baris 99')
})

test('buildCodeSections: titik pemanggilan boleh lebih dari satu baris', () => {
  const s = buildCodeSections(code, [{ title: 'MAIN(a)', from: 1, to: 3 }, { title: 'CALL(a)', from: 4, to: 5, offset: 3, callSite: [1, 2] }], 4)
  assert.deepEqual(s[0].rows.map((r) => r.state), ['caller', 'caller', null])
})
