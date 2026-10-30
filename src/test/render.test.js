import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { hitung, startSsr } from './ssr.js'
import { tim } from '../data/credit.js'
import { daftarKuis } from '../data/quiz.js'

let ssr
before(async () => {
  ssr = await startSsr()
})
after(async () => {
  await ssr?.close()
})

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")

test('Quiz: satu h1, kelompok Medium, kartu menaut ke /quiz/04 tanpa aria-label yang menimpa teks, status awal "Belum dicoba"', async () => {
  const Quiz = await ssr.load('/src/pages/Quiz.jsx')
  const html = ssr.render(ssr.createElement(Quiz), '/quiz')
  assert.equal(hitung(html, /<h1[ >]/g), 1)
  assert.match(html, /<h1[^>]*>Quiz<\/h1>/)
  assert.match(html, /MEDIUM|Medium/)
  assert.match(html, /<a [^>]*href="\/quiz\/04"/)
  assert.doesNotMatch(html.match(/<a [^>]*href="\/quiz\/04"[^>]*>/)[0], /aria-label/, 'nama tautan berasal dari isinya (WCAG 2.5.3)')
  assert.match(html, /Telusuri Insertion Sort/)
  assert.match(html, /Belum dicoba/)
  assert.match(html, new RegExp(`${daftarKuis.length} kuis`))
  // semua filter punya nama aksesibel
  assert.match(html, /aria-label="Filter status kuis"/)
  assert.match(html, /role="group"[^>]*aria-label="Jenis soal"/)
  assert.equal(hitung(html, /aria-pressed=/g), 4 + 5, 'segmented status (4) + jenis soal (5) adalah tombol aria-pressed')
})

test('KuisKartu: chip status mengikuti kemajuan (lulus, gagal, belum) dengan teks, bukan hanya warna', async () => {
  const Kartu = await ssr.load('/src/quiz/KuisKartu.jsx')
  const k = daftarKuis[0]
  const t = { id: 'medium', label: 'Medium', warna: 'kuning' }
  const el = (entry) => ssr.render(ssr.createElement(Kartu, { k, tingkat: t, entry }))
  assert.match(el(undefined), /Belum dicoba/)
  assert.match(el({ kuis: { attempts: 1, passed: true, best: { skor: 8, total: 8, persen: 100 } } }), /Terbaik 8\/8 · Lulus/)
  assert.match(el({ kuis: { attempts: 1, passed: false, best: { skor: 5, total: 8, persen: 63 } } }), /Terbaik 5\/8 · Belum lulus/)
})

test('Credit: satu h1, enam bagian berjudul, tab bagian, empat anggota tim dengan foto beralt, 24 modul di peta', async () => {
  const Credit = await ssr.load('/src/pages/Credit.jsx')
  const html = ssr.render(ssr.createElement(Credit), '/credit')
  assert.equal(hitung(html, /<h1[ >]/g), 1)
  assert.match(html, /Mulai menyusun blok labu pertamamu!/)
  for (const id of ['progres', 'glosarium', 'peta', 'tim', 'sumber', 'tentang']) {
    assert.match(html, new RegExp(`<section[^>]*id="sec-${id}"[^>]*aria-labelledby="h-${id}"`), `bagian ${id}`)
    assert.match(html, new RegExp(`<h2 id="h-${id}"`), `judul ${id}`)
  }
  assert.match(html, /aria-label="Bagian Credit"/)
  for (const a of tim) {
    assert.ok(decode(html).includes(`alt="Foto ${a.nama}"`), `foto ${a.nama} punya alt`)
    assert.ok(decode(html).includes(a.peran), a.peran)
  }
  assert.equal(hitung(html, /<img /g), tim.length)
  assert.ok(!/<img(?![^>]*alt=)/.test(html), 'semua gambar punya alt')
  // peta belajar + koleksi blok: tiap modul 01–24 muncul dengan status yang dibacakan
  for (let n = 1; n <= 24; n++) assert.match(html, new RegExp(`Modul ${String(n).padStart(2, '0')}, `), `blok ${n}`)
  assert.equal(hitung(html, /belum dimulai/g) >= 24, true)
})

test('Credit: modul yang tersedia bisa dibuka dari peta dan blok, modul lain bukan tautan', async () => {
  const Credit = await ssr.load('/src/pages/Credit.jsx')
  const html = ssr.render(ssr.createElement(Credit), '/credit')
  assert.ok(hitung(html, /href="\/materi\/04"/g) >= 3, 'blok, peta, dan tautan Lanjutkan ke Modul 04')
  assert.equal(hitung(html, /href="\/materi\/05"/g), 0)
})

test('QuizDetail: id tidak dikenal menampilkan pesan, id 04 menampilkan jejak halaman dan keadaan memuat', async () => {
  const QuizDetail = await ssr.load('/src/pages/QuizDetail.jsx')
  const salah = ssr.render(ssr.createElement(QuizDetail, { id: '99' }), '/quiz/99')
  assert.match(salah, /Kuis tidak ditemukan/)
  const ok = ssr.render(ssr.createElement(QuizDetail, { id: '04' }), '/quiz/04')
  assert.match(ok, /<nav aria-label="Jejak halaman"/)
  assert.match(ok, /aria-current="page"[^>]*>Telusuri Insertion Sort</)
  assert.equal(hitung(ok, /<h1[ >]/g), 1)
  assert.match(ok, /Baca Modul 04/)
})

test('StatCard: angka piksel disembunyikan dari pembaca layar dan diganti teks yang jelas', async () => {
  const StatCard = await ssr.load('/src/ui/StatCard.jsx')
  const html = ssr.render(ssr.createElement(StatCard, { icon: 'book', label: 'Modul selesai', value: '3 / 24', teksAngka: '3 dari 24', sub: '1 sedang dibaca' }))
  assert.match(html, /aria-hidden="true">3 \/ 24</)
  assert.match(html, /class="sr-only">3 dari 24</)
})

test('ConfirmDialog: <dialog> tertutup saat awal, bernama dan berdeskripsi, tombol utama bertanda data-utama', async () => {
  const ConfirmDialog = await ssr.load('/src/ui/ConfirmDialog.jsx')
  const html = ssr.render(ssr.createElement(ConfirmDialog, { open: false, judul: 'Buka materi versi lama?', labelLanjut: 'Lanjut', labelBatal: 'Tetap di sini', onLanjut() {}, onBatal() {} }, 'isi'))
  assert.match(html, /^<dialog /)
  assert.doesNotMatch(html.match(/^<dialog [^>]*>/)[0], / open/)
  const label = html.match(/aria-labelledby="([^"]+)"/)[1]
  const desc = html.match(/aria-describedby="([^"]+)"/)[1]
  assert.match(html, new RegExp(`<h2 id="${label.replace(/[:.]/g, '\\$&')}"`))
  assert.ok(html.includes(`id="${desc}"`))
  assert.match(html, /data-utama[^>]*>[^<]*Lanjut/)
  assert.match(html, /Tetap di sini/)
})

test('BlokLabu: 24 blok dalam 5 baris (4+5+6+5+4), status dibacakan sebagai teks', async () => {
  const BlokLabu = await ssr.load('/src/credit/BlokLabu.jsx')
  const ids = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'))
  const status = new Map(ids.map((id) => [id, id === '04' ? 'selesai' : id === '05' ? 'sedang' : 'belum']))
  const html = ssr.render(ssr.createElement(BlokLabu, { status }))
  assert.equal(hitung(html, /<ul /g), 5)
  assert.equal(hitung(html, /<li>/g), 24)
  assert.match(html, /Modul 04, Insertion Sort, selesai/)
  assert.match(html, /Modul 05, Pertumbuhan Fungsi, sedang dibaca/)
  assert.equal(hitung(html, /belum dimulai/g), 22)
})

test('ChallengeIDE tidak lagi memakai warna tetap (stone/orange/putih) yang tak ikut mode gelap', async () => {
  const { readFileSync } = await import('node:fs')
  for (const f of ['ChallengeIDE.jsx', 'SolutionPanel.jsx', 'TestPanel.jsx', 'editorTheme.js']) {
    const src = readFileSync(new URL(`../components/ChallengeIDE/${f}`, import.meta.url), 'utf8')
    assert.doesNotMatch(src, /\b(?:bg|text|border|outline|accent)-(?:stone|orange)-\d|\bbg-white\b|#[0-9a-fA-F]{6}/, `${f} memakai warna tetap`)
  }
})
