// Tantangan kode di akhir materi (mirip Modul 04): kerangka berisi TODO, solusi lulus semua test case, kerangka tidak lulus.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { modulKonten } from './modul/index.js'

const IDS = ['02', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24']
const TANPA = ['01', '03', '19'] // konseptual: tidak ada tantangan kode
const baca = (nama) => readFileSync(new URL(`./modul/${nama}`, import.meta.url), 'utf8')
const jalankan = (kode, input) => new Function(`${kode}\nreturn solve`)()(...JSON.parse(JSON.stringify(input)))
const lulus = (kode, tc) => {
  try {
    assert.deepEqual(jalankan(kode, tc.input), tc.expected)
    return true
  } catch {
    return false
  }
}

test('modul yang punya tantangan terdaftar di index dan satu penanda {{tantangan}} di teksnya; modul konseptual tidak', () => {
  for (const id of IDS) {
    assert.equal(typeof modulKonten[id].tantangan, 'function', `Modul ${id} terdaftar`)
    assert.equal((baca(`${id}.md`).match(/^\{\{tantangan\}\}\s*$/gm) ?? []).length, 1, `Modul ${id}: satu penanda`)
  }
  for (const id of TANPA) {
    assert.equal(modulKonten[id].tantangan, undefined, `Modul ${id} tanpa tantangan`)
    assert.doesNotMatch(baca(`${id}.md`), /\{\{tantangan\}\}/)
  }
})

for (const id of IDS.filter((x) => x !== '04')) {
  test(`tantangan Modul ${id}: solusi lulus semua test case, kerangka punya TODO dan tidak lulus`, () => {
    const ch = JSON.parse(baca(`${id}.tantangan.json`))
    assert.ok(ch.id && ch.title && ch.description, 'metadata lengkap')
    assert.ok(ch.testCases.length >= 5, 'minimal 5 test case')
    assert.ok(ch.testCases.every((tc) => Array.isArray(tc.input) && 'expected' in tc))
    assert.doesNotMatch(JSON.stringify(ch.testCases), /null/)
    for (const tc of ch.testCases) assert.deepEqual(jalankan(ch.solution, tc.input), tc.expected, JSON.stringify(tc.input))
    assert.match(ch.starterCode, /\/\/ TODO: /)
    assert.doesNotMatch(ch.solution, /TODO/)
    assert.match(ch.starterCode, /^function solve\(/)
    const gagal = ch.testCases.filter((tc) => !lulus(ch.starterCode, tc)).length
    assert.ok(gagal >= 1, 'kerangka tanpa isian tidak boleh lulus semua test case')
    assert.notEqual(ch.starterCode, ch.solution)
    assert.ok(ch.solution.split('\n').length <= 26, 'jawaban contoh muat di panel (tinggi maksimum 44rem) tanpa gulir')
    assert.ok(ch.starterCode.split('\n').length <= 24, 'kerangka muat di editor (tinggi maksimum 40rem) tanpa gulir')
    // Editor tanpa pembungkus baris: baris panjang membuat area kode bisa digulir ke samping (melanggar a11y).
    for (const kode of [ch.starterCode, ch.solution]) for (const baris of kode.split('\n')) assert.ok(baris.length <= 62, `baris terlalu panjang (${baris.length}): ${baris}`)
  })
}
