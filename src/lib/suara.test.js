import test from 'node:test'
import assert from 'node:assert/strict'
import { NADA, SUARA_KUNCI, jadwalkan, langgananSuara, mainkan, simpanSuara, suaraAktif } from './suara.js'

const gudang = (awal = {}) => {
  const d = { ...awal }
  return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = String(v) }, d }
}

/** Konteks audio palsu yang mencatat nada yang dijadwalkan. */
const konteksPalsu = () => {
  const log = []
  return {
    log,
    currentTime: 0,
    destination: {},
    createOscillator: () => {
      const o = { frequency: {}, connect() {}, start: (t) => log.push({ f: o.frequency.value, tipe: o.type, mulai: t }), stop() {} }
      return o
    },
    createGain: () => ({ gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }),
  }
}

test('NADA: tiap kejadian punya nada pendek (< 1 detik) dengan frekuensi dan lama yang masuk akal', () => {
  assert.deepEqual(Object.keys(NADA).sort(), ['benar', 'gagal', 'lulus', 'pilih', 'salah'])
  for (const [nama, nada] of Object.entries(NADA)) {
    assert.ok(nada.length >= 1, nama)
    const akhir = Math.max(...nada.map((n) => n.t + n.d))
    assert.ok(akhir < 1, `${nama} berdurasi ${akhir}s (WCAG 1.4.2: jauh di bawah 3 detik)`)
    for (const n of nada) assert.ok(n.f >= 150 && n.f <= 2000 && n.d > 0 && n.t >= 0, nama)
  }
  assert.ok(NADA.benar.at(-1).f > NADA.benar[0].f, 'benar naik')
  assert.ok(NADA.salah.at(-1).f < NADA.salah[0].f, 'salah turun')
})

test('suaraAktif/simpanSuara: menyala secara bawaan, tersimpan, dan memberi tahu pendengar', () => {
  const g = gudang()
  assert.equal(suaraAktif(g), true)
  let n = 0
  const lepas = langgananSuara(() => n++)
  simpanSuara(g, false)
  assert.equal(g.d[SUARA_KUNCI], '0')
  assert.equal(suaraAktif(g), false)
  simpanSuara(g, true)
  assert.equal(suaraAktif(g), true)
  assert.equal(n, 2)
  lepas()
  simpanSuara(g, false)
  assert.equal(n, 2, 'setelah berhenti berlangganan tidak dipanggil lagi')
  assert.equal(suaraAktif(undefined), true)
  assert.equal(suaraAktif({ getItem() { throw new Error('x') } }), true, 'penyimpanan rusak tidak mematikan aplikasi')
  assert.doesNotThrow(() => simpanSuara({ setItem() { throw new Error('x') } }, true))
})

test('jadwalkan/mainkan: menjadwalkan semua nada, patuh pada pengaturan, aman tanpa Web Audio', () => {
  const ctx = konteksPalsu()
  assert.equal(jadwalkan(ctx, NADA.lulus, 1), 4)
  assert.deepEqual(ctx.log.map((x) => x.f), NADA.lulus.map((n) => n.f))
  assert.ok(Math.abs(ctx.log[1].mulai - 1.14) < 1e-9)

  const c2 = konteksPalsu()
  assert.equal(mainkan('benar', { storage: gudang(), ctx: c2 }), true)
  assert.equal(c2.log.length, 2)
  const c3 = konteksPalsu()
  assert.equal(mainkan('benar', { storage: gudang({ [SUARA_KUNCI]: '0' }), ctx: c3 }), false, 'dimatikan pengguna')
  assert.equal(c3.log.length, 0)
  assert.equal(mainkan('tidak-ada', { storage: gudang(), ctx: konteksPalsu() }), false)
  assert.equal(mainkan('benar', { storage: gudang() }), false, 'tanpa window/AudioContext tidak terjadi apa-apa')
  assert.equal(mainkan('benar', { storage: gudang(), ctx: { currentTime: 0, createOscillator() { throw new Error('x') } } }), false)
})
