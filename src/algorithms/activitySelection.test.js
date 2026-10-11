import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TIMELINE_STATUS } from '../components/TimelineChart/timelineStatuses.js'
import { seeded } from '../lib/seededRandom.js'
import { visualizers } from './registry.js'
import {
  activitySelection,
  activitySelectionCode,
  activitySelectionSteps,
  AS_MAX_ACTIVITIES,
  AS_MAX_TIME,
  formatActivityInput,
  parseActivityInput,
  randomActivityInput,
} from './activitySelection.js'

const CLRS = { start: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], finish: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] }
const nameOf = (i) => `a${i + 1}`
const idx = (id) => Number(id.slice(1)) - 1

// ---------------------------------------------------------------- pembanding independen
/** Jumlah maksimum aktivitas tanpa tumpang tindih, dengan mencoba semua himpunan bagian (n kecil). */
function bruteMax(start, finish) {
  const n = start.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) picked.push(i)
    if (picked.length <= best) continue
    picked.sort((a, b) => start[a] - start[b] || finish[a] - finish[b])
    let ok = true
    for (let k = 1; k < picked.length && ok; k++) ok = start[picked[k]] >= finish[picked[k - 1]]
    if (ok) best = picked.length
  }
  return best
}
const disjoint = (chosen, start, finish) => {
  const sorted = chosen.slice().sort((a, b) => start[a] - start[b])
  return sorted.every((c, k) => k === 0 || start[c] >= finish[sorted[k - 1]])
}

/** Pemeriksaan umum untuk semua langkah. */
function checkSteps(steps, input, name) {
  const { start, finish } = input
  const n = start.length
  const lines = activitySelectionCode.trim().split('\n').length
  const ids = start.map((_, i) => nameOf(i)).sort()
  assert.ok(steps.length > 0, `${name}: tidak ada langkah`)
  let frontier = null
  for (const [s, step] of steps.entries()) {
    const where = `${name} langkah ${s + 1}`
    for (const l of [].concat(step.line)) assert.ok(Number.isInteger(l) && l >= 1 && l <= lines, `${where}: baris ${l} di luar kode`)
    assert.ok(typeof step.note === 'string' && step.note.length > 0, `${where}: catatan kosong`)
    const v = step.view
    assert.deepEqual(v.rows.map((r) => r.id).sort(), ids, `${where}: setiap aktivitas harus muncul tepat sekali`)
    assert.equal(v.axisMax, Math.max(...finish))
    for (const r of v.rows) {
      assert.ok(TIMELINE_STATUS[r.mark], `${where}: status tak dikenal ${r.mark}`)
      assert.equal(r.start, start[idx(r.id)])
      assert.equal(r.finish, finish[idx(r.id)])
    }
    assert.ok(v.rows.filter((r) => r.mark === 'current').length <= 1, `${where}: lebih dari satu baris current`)
    // Jadwal = persis aktivitas bertanda selected, dan tidak ada yang bentrok.
    const selected = v.rows.filter((r) => r.mark === 'selected').map((r) => r.id)
    assert.deepEqual(v.schedule.slice().sort(), selected.slice().sort(), `${where}: jadwal tidak sama dengan yang bertanda selected`)
    assert.ok(disjoint(v.schedule.map(idx), start, finish), `${where}: jadwal ada yang bentrok`)
    // Garis akhir = waktu selesai aktivitas terpilih terakhir, dan tidak pernah mundur.
    const last = v.schedule.length ? finish[idx(v.schedule[v.schedule.length - 1])] : null
    if (v.schedule.length) assert.ok(v.frontier === last || v.frontier === frontier, `${where}: garis akhir ${v.frontier}`)
    if (v.frontier !== null) assert.ok(frontier === null || v.frontier >= frontier, `${where}: garis akhir mundur`)
    frontier = v.frontier
    for (const p of v.panels) {
      if (p.type === 'list') assert.ok(Array.isArray(p.items))
      if (p.type === 'table') {
        assert.equal(p.rows.length, n)
        for (const r of p.rows) assert.equal(r.length, p.headers.length)
      }
    }
  }
}

// ---------------------------------------------------------------- kebenaran algoritma
test('activitySelection: contoh klasik memilih a1, a4, a8, a11 (4 aktivitas)', () => {
  assert.deepEqual(activitySelection(CLRS.start, CLRS.finish), [0, 3, 7, 10])
})

test('activitySelection: jumlahnya sama dengan semua test case soal challenge', () => {
  const ch = JSON.parse(readFileSync(new URL('../content/challenges/greedy-activity-selection.json', import.meta.url), 'utf8'))
  assert.ok(ch.testCases.length >= 5)
  for (const { input: [start, finish], expected } of ch.testCases) {
    assert.equal(activitySelection(start, finish).length, expected, `start=${start} finish=${finish}`)
    if (start.length === 0) continue // masukan kosong ditolak parser visualizer; fungsinya tetap benar (0)
    const steps = activitySelectionSteps({ start, finish })
    checkSteps(steps, { start, finish }, 'challenge')
    assert.equal(steps.at(-1).view.schedule.length, expected, `langkah akhir: start=${start}`)
  }
})

test('activitySelection: jumlah sama dengan pembanding semua himpunan bagian pada 400 masukan acak, termasuk waktu selesai kembar', () => {
  for (let seed = 1; seed <= 400; seed++) {
    const rng = seeded(seed)
    const n = 1 + Math.floor(rng() * 9)
    const start = []
    const finish = []
    for (let i = 0; i < n; i++) {
      const s = Math.floor(rng() * 12)
      start.push(s)
      finish.push(s + 1 + Math.floor(rng() * 5))
    }
    const chosen = activitySelection(start, finish)
    assert.equal(chosen.length, bruteMax(start, finish), `seed ${seed}: start=${start} finish=${finish}`)
    assert.ok(disjoint(chosen, start, finish), `seed ${seed}: hasil bentrok`)
  }
})

// ---------------------------------------------------------------- langkah
test('langkah: contoh klasik 34 langkah dan hasil akhir a1, a4, a8, a11', () => {
  const steps = activitySelectionSteps(CLRS)
  // 1 pengantar + 1 urut + 1 awal + 2 per aktivitas + 2 tambahan per aktivitas terpilih + 1 akhir
  assert.equal(steps.length, 4 + 2 * 11 + 2 * 4)
  assert.equal(steps.length, 34)
  checkSteps(steps, CLRS, 'klasik')
  const end = steps.at(-1)
  assert.deepEqual(end.view.schedule, ['a1', 'a4', 'a8', 'a11'])
  assert.equal(end.line, 11)
  assert.ok(end.view.rows.every((r) => r.mark === 'selected' || r.mark === 'rejected'), 'tidak boleh ada yang tersisa current/normal')
  assert.equal(end.view.rows.filter((r) => r.mark === 'rejected').length, 7)
  assert.match(end.note, /4 aktivitas/)
})

test('langkah: semua langkah valid dan hasil akhir sama dengan algoritma untuk 300 masukan acak', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const input = randomActivityInput(seeded(seed))
    const steps = activitySelectionSteps(input)
    checkSteps(steps, input, `seed ${seed}`)
    const k = activitySelection(input.start, input.finish).length
    assert.deepEqual(steps.at(-1).view.schedule.map(idx), activitySelection(input.start, input.finish), `seed ${seed}`)
    assert.equal(steps.length, 4 + 2 * input.start.length + 2 * k, `seed ${seed}: jumlah langkah`)
  }
})

test('langkah: urutkan menurut waktu selesai, dan hanya data yang tidak terurut yang berubah urutannya', () => {
  const sorted = activitySelectionSteps(CLRS)
  assert.deepEqual(sorted[0].view.rows.map((r) => r.id), CLRS.start.map((_, i) => nameOf(i)))
  assert.deepEqual(sorted[1].view.rows.map((r) => r.id), sorted[0].view.rows.map((r) => r.id), 'data klasik sudah terurut')
  assert.match(sorted[1].note, /sudah terurut/)

  const input = { start: [12, 5, 8, 3, 0, 2, 6, 8, 3, 5, 1], finish: [16, 9, 12, 5, 6, 14, 10, 11, 9, 7, 4] }
  const steps = activitySelectionSteps(input)
  assert.deepEqual(steps[0].view.rows.map((r) => r.id), input.start.map((_, i) => nameOf(i)), 'langkah 1 memakai urutan masukan')
  const finishes = steps[1].view.rows.map((r) => r.finish)
  assert.deepEqual(finishes, finishes.slice().sort((a, b) => a - b), 'langkah 2 terurut menurut waktu selesai')
  assert.equal(steps[1].line, 2)
  assert.doesNotMatch(steps[1].note, /sudah terurut/)
  // Waktu selesai kembar: urutan semula dipertahankan dan itu disebut di catatan.
  const tie = activitySelectionSteps({ start: [5, 1, 2], finish: [9, 9, 4] })
  assert.deepEqual(tie[1].view.rows.map((r) => r.id), ['a3', 'a1', 'a2'])
  assert.match(tie[1].note, /urutan semula dipertahankan/)
})

test('langkah: baris 6 = pemeriksaan, baris 7 dan 8 hanya saat tidak bentrok, dan penandanya sesuai', () => {
  for (const input of [CLRS, { start: [0, 1, 5, 8], finish: [10, 3, 7, 9] }, { start: [1, 2, 3], finish: [10, 10, 10] }]) {
    const steps = activitySelectionSteps(input)
    let akhir = -Infinity
    let i = 0
    while (i < steps.length) {
      if (steps[i].line !== 5) {
        i++
        continue
      }
      const cur = steps[i].view.rows.find((r) => r.mark === 'current')
      assert.ok(cur, `langkah ${i + 1}: baris 5 harus menandai satu aktivitas current`)
      const test6 = steps[i + 1]
      assert.equal(test6.line, 6)
      const free = cur.start >= akhir
      const after = test6.view.rows.find((r) => r.id === cur.id)
      assert.equal(after.mark, free ? 'current' : 'rejected', `${cur.id}: tanda pada pemeriksaan`)
      assert.match(test6.note, free ? /: ya\./ : /: tidak\./)
      if (free) {
        assert.equal(steps[i + 2].line, 7)
        assert.equal(steps[i + 2].view.rows.find((r) => r.id === cur.id).mark, 'selected')
        assert.equal(steps[i + 3].line, 8)
        assert.equal(steps[i + 3].view.frontier, cur.finish)
        akhir = cur.finish
        i += 4
      } else {
        assert.notEqual(steps[i + 2]?.line, 7, 'aktivitas yang bentrok tidak boleh dimasukkan')
        i += 2
      }
    }
  }
})

test('langkah: tidak ada garis akhir sebelum aktivitas pertama dipilih, dan isi panel sesuai', () => {
  const steps = activitySelectionSteps(CLRS)
  // Langkah 1-6: pengantar, urut, awal, giliran a1, pemeriksaan, memasukkan a1. Garis akhir baru muncul di langkah 7 (baris 8).
  for (const s of steps.slice(0, 6)) assert.equal(s.view.frontier, null)
  assert.equal(steps[6].line, 8)
  assert.equal(steps[6].view.frontier, 4)
  assert.deepEqual(steps[2].line, [3, 4])
  assert.deepEqual(steps[2].view.panels[0].items, ['akhir = −∞', 'i = –'])
  const pick = steps.find((s) => s.line === 8)
  assert.deepEqual(pick.view.panels[0].items, ['akhir = 4', 'i = 0 (a1)'])
  assert.deepEqual(pick.view.panels[1].items, ['a1'])
  const table = pick.view.panels[2]
  assert.equal(table.type, 'table')
  assert.equal(table.rows[table.activeRow][0], 'a1')
  assert.equal(table.rows[table.activeRow][3], 'dipilih')
})

test('langkah: penanda memakai simbol teks (bukan emoji) dan tiap status punya pola, simbol, dan keterangan', () => {
  assert.equal(TIMELINE_STATUS.current.glyph, '▶\uFE0E')
  for (const [key, st] of Object.entries(TIMELINE_STATUS)) {
    assert.ok(st.label, key)
    assert.ok(st.fill, key)
    if (key !== 'normal') assert.ok(st.glyph, `${key} butuh simbol`)
  }
  const fills = Object.values(TIMELINE_STATUS).map((s) => s.fill)
  assert.equal(new Set(fills).size, fills.length, 'pola tiap status harus berbeda')
})

// ---------------------------------------------------------------- masukan
test('parseActivityInput: valid, batas, dan galat', () => {
  assert.deepEqual(parseActivityInput({ start: '1, 3, 5', finish: '3, 5, 7' }), { ok: true, value: { start: [1, 3, 5], finish: [3, 5, 7] } })
  assert.deepEqual(parseActivityInput({ start: '0 2;4', finish: ' 1 3 5 ' }).value, { start: [0, 2, 4], finish: [1, 3, 5] }, 'spasi dan titik koma boleh')
  assert.equal(parseActivityInput({ start: '0', finish: String(AS_MAX_TIME) }).ok, true)
  const twelve = Array.from({ length: AS_MAX_ACTIVITIES }, (_, i) => i)
  assert.equal(parseActivityInput({ start: twelve.join(), finish: twelve.map((v) => v + 1).join() }).ok, true)
  const bad = (fields, re) => {
    const r = parseActivityInput(fields)
    assert.equal(r.ok, false, JSON.stringify(fields))
    assert.match(r.error, re, JSON.stringify(fields))
  }
  bad({ start: '', finish: '1' }, /minimal satu angka/)
  bad({ start: '1', finish: '  ' }, /minimal satu angka/)
  bad({ start: '1, x', finish: '2, 3' }, /"x" pada waktu mulai/)
  bad({ start: '-1', finish: '2' }, /"-1"/)
  bad({ start: '1.5', finish: '3' }, /"1\.5"/)
  bad({ start: '1', finish: '31' }, /melebihi batas 30/)
  bad({ start: '1, 2', finish: '3' }, /harus sama/)
  bad({ start: '3', finish: '3' }, /Aktivitas ke-1 mulai pada 3 tetapi selesai pada 3/)
  bad({ start: '1, 5', finish: '3, 4' }, /Aktivitas ke-2/)
  bad({ start: twelve.concat(12).join(), finish: twelve.concat(12).map((v) => v + 1).join() }, /Maksimal 12/)
  assert.deepEqual(parseActivityInput(formatActivityInput(CLRS)), { ok: true, value: CLRS })
})

test('randomActivityInput: selalu lolos parser, ada bentrokan, dan beragam', () => {
  const seen = new Set()
  for (let seed = 1; seed <= 300; seed++) {
    const v = randomActivityInput(seeded(seed))
    assert.deepEqual(parseActivityInput(formatActivityInput(v)), { ok: true, value: v }, `seed ${seed}`)
    const k = activitySelection(v.start, v.finish).length
    assert.ok(k >= 3 && v.start.length - k >= 2, `seed ${seed}: k=${k}, n=${v.start.length}`)
    seen.add(JSON.stringify(v))
  }
  assert.ok(seen.size > 250)
})

// ---------------------------------------------------------------- registry
test('registry: garis waktu lengkap, contoh dan nilai awal lolos parser, dan terhubung ke materi 10.1', () => {
  const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))
  const v = visualizers.activitySelection
  assert.equal(v.kind, 'timeline')
  for (const f of ['title', 'code', 'codeLabel', 'chartCaption', 'inputHint']) assert.equal(typeof v[f], 'string', f)
  for (const f of ['buildSteps', 'parseInput', 'formatInput', 'randomInput']) assert.equal(typeof v[f], 'function', f)
  assert.ok(v.legend.every((k) => TIMELINE_STATUS[k]))
  assert.deepEqual(v.fields.map((f) => f.key), ['start', 'finish'])
  assert.ok(v.presets.length >= 4)
  for (const input of [v.initialInput, ...v.presets.map((p) => p.value)]) {
    const fields = v.formatInput(input)
    assert.deepEqual(Object.keys(fields).sort(), v.fields.map((f) => f.key).sort())
    assert.deepEqual(v.parseInput(fields), { ok: true, value: input }, JSON.stringify(fields))
    checkSteps(v.buildSteps(input), input, JSON.stringify(fields))
  }
  assert.deepEqual(v.initialInput, CLRS)
  assert.equal(materials.find((m) => m.id === 'greedy-activity-selection').visualizer, 'activitySelection')
  // Kode yang ditampilkan mengembalikan hasil yang sama dengan fungsi yang dites (kode ini dieksekusi apa adanya).
  const run = new Function(`${v.code}\nreturn activitySelection`)()
  for (const input of [v.initialInput, ...v.presets.map((p) => p.value)]) {
    assert.deepEqual(run(input.start, input.finish), activitySelection(input.start, input.finish))
  }
})
