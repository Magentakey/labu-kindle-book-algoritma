import test from 'node:test'
import assert from 'node:assert/strict'
import { daftarKuis, kuisById, tingkat } from '../data/quiz.js'
import { hitungHasil, jenisSoal, labelSoal, nilaiSoal } from '../lib/kuis.js'

// Semua kuis modul memakai pilihan ganda: satu jawaban (kunci berupa id) dan banyak jawaban (kunci berupa larik id).
const IDS = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'))

const muat = async (id) => Object.values(await import(`./modul/${id}.kuis.js`))[0]
const kata = { 2: 'dua', 3: 'tiga', 4: 'empat' }
/** "A", "A dan C", "A, C, dan D" → ['A', 'C', 'D'] */
const daftarHuruf = (s) => s.match(/[A-E]/g)

for (const id of IDS) {
  test(`kuis Modul ${id}: hanya pilihan ganda, campuran satu dan banyak jawaban, kunci konsisten dengan opsi dan pembahasan`, async () => {
    const kuis = await muat(id)
    const meta = kuisById(id)
    assert.equal(kuis.modul, id)
    assert.equal(meta.soal, kuis.soal.length)
    assert.deepEqual(meta.tipe, ['pilihan'])
    assert.ok(tingkat.some((t) => t.id === meta.tingkat), `tingkat ${meta.tingkat}`)
    assert.deepEqual(kuis.soal.map((q) => q.no), kuis.soal.map((_, i) => i + 1))

    for (const q of kuis.soal) {
      const di = `Modul ${id} soal ${q.no}`
      assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, di)
      assert.ok(Array.isArray(q.opsi) && q.opsi.length >= 4 && q.opsi.length <= 5, `${di}: 4–5 opsi`)
      assert.deepEqual(q.opsi.map((o) => o.id), ['A', 'B', 'C', 'D', 'E'].slice(0, q.opsi.length), `${di}: id opsi berurutan`)
      assert.equal(new Set(q.opsi.map((o) => o.teks)).size, q.opsi.length, `${di}: teks opsi tidak boleh kembar`)
      assert.ok(q.opsi.every((o) => o.teks.trim().length > 0))
      assert.ok(!q.tipe && !q.mandiri && !q.isian && !q.kunciTeks, `${di}: tidak memakai format lama`)
      const kunci = [].concat(q.kunci)
      for (const k of kunci) assert.ok(q.opsi.some((o) => o.id === k), `${di}: kunci ${k} ada di opsi`)
      assert.equal(new Set(kunci).size, kunci.length, `${di}: kunci tidak kembar`)
      if (Array.isArray(q.kunci)) {
        assert.ok(q.kunci.length >= 2 && q.kunci.length < q.opsi.length, `${di}: banyak jawaban 2..${q.opsi.length - 1}`)
        assert.deepEqual(q.kunci, [...q.kunci].sort(), `${di}: kunci terurut`)
        assert.match(q.teks, new RegExp(`\\*\\*${kata[q.kunci.length]}\\*\\*`), `${di}: teks menyebut **${kata[q.kunci.length]}** jawaban`)
      } else {
        assert.doesNotMatch(q.teks, /\*\*(dua|tiga|empat)\*\* (jawaban|pernyataan|pasangan)/, `${di}: soal satu jawaban tidak menyebut jumlah`)
      }
      // pembahasan diawali "**Jawaban: ...**" dan huruf-hurufnya sama dengan kunci
      const m = /^\*\*Jawaban: ([A-E](?:(?:, | dan |, dan )[A-E])*)/.exec(q.pembahasan)
      assert.ok(m, `${di}: pembahasan harus diawali "**Jawaban: ...**"`)
      assert.deepEqual(daftarHuruf(m[1]), kunci, `${di}: pembahasan sesuai kunci`)
      assert.equal(labelSoal(q), `Pilih ${kunci.length} jawaban`)

      // penilaian: kunci benar, himpunan lain salah
      assert.equal(nilaiSoal(q, q.kunci).benar, true, `${di}: kunci dinilai benar`)
      if (kunci.length > 1) assert.equal(nilaiSoal(q, [...kunci].reverse()).benar, true, `${di}: urutan tidak berpengaruh`)
      assert.equal(nilaiSoal(q, undefined).benar, false)
      const lain = q.opsi.map((o) => o.id).find((x) => !kunci.includes(x))
      assert.equal(nilaiSoal(q, kunci.length === 1 ? lain : [...kunci.slice(0, -1), lain]).benar, false, `${di}: pilihan salah dinilai salah`)
      if (kunci.length > 1) assert.equal(nilaiSoal(q, kunci.slice(0, -1)).benar, false, `${di}: kurang satu pilihan salah`)
      if (kunci.length > 1) assert.equal(nilaiSoal(q, [...kunci, lain]).benar, false, `${di}: kelebihan pilihan salah`)
    }

    const jenis = new Set(kuis.soal.map((q) => jenisSoal(q)))
    assert.deepEqual([...jenis].sort(), ['banyak', 'satu'], `Modul ${id}: campuran satu dan banyak jawaban`)
    // sebaran huruf kunci: kunci tunggal tidak boleh semuanya satu huruf yang sama
    const tunggal = kuis.soal.filter((q) => !Array.isArray(q.kunci)).map((q) => q.kunci)
    assert.ok(new Set(tunggal).size >= Math.min(3, tunggal.length), `Modul ${id}: kunci tunggal bervariasi (${tunggal.join(',')})`)

    const semua = Object.fromEntries(kuis.soal.map((q) => [q.no, q.kunci]))
    const h = hitungHasil(kuis.soal, semua)
    assert.deepEqual([h.skor, h.total, h.lulus, h.belumDinilai], [kuis.soal.length, kuis.soal.length, true, []])
    assert.equal(hitungHasil(kuis.soal, {}).skor, 0)
  })
}

test('daftar kuis: ke-24 modul punya tingkat easy, medium, dan hard; jumlah soal sesuai daftar', () => {
  assert.equal(daftarKuis.length, 24)
  assert.deepEqual([...new Set(daftarKuis.map((k) => k.tingkat))].sort(), ['easy', 'hard', 'medium'])
  assert.ok(IDS.every((id) => kuisById(id)))
})
