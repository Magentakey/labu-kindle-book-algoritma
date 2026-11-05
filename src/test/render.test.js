import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { hitung, startSsr } from './ssr.js'
import { tim } from '../data/credit.js'
import { daftarKuis, tipeSoal } from '../data/quiz.js'

let ssr
before(async () => {
  ssr = await startSsr()
})
after(async () => {
  await ssr?.close()
})

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")

test('Quiz: satu h1, kelompok Easy dan Medium, kartu menaut ke /quiz/NN tanpa aria-label yang menimpa teks, status awal "Belum dicoba"', async () => {
  const Quiz = await ssr.load('/src/pages/Quiz.jsx')
  const html = ssr.render(ssr.createElement(Quiz), '/quiz')
  assert.equal(hitung(html, /<h1[ >]/g), 1)
  assert.match(html, /<h1[^>]*>Quiz<\/h1>/)
  assert.match(html, /<h2 id="grup-easy"/)
  assert.match(html, /<h2 id="grup-medium"/)
  for (const k of daftarKuis) {
    const tag = html.match(new RegExp(`<a [^>]*href="/quiz/${k.id}"[^>]*>`))?.[0]
    assert.ok(tag, `kartu kuis ${k.id}`)
    assert.doesNotMatch(tag, /aria-label/, 'nama tautan berasal dari isinya (WCAG 2.5.3)')
    assert.ok(html.includes(k.judul), k.judul)
  }
  assert.match(html, /Belum dicoba/)
  assert.match(html, new RegExp(`${daftarKuis.length} kuis`))
  // semua filter punya nama aksesibel
  assert.match(html, /aria-label="Filter status kuis"/)
  assert.match(html, /role="group"[^>]*aria-label="Jenis soal"/)
  assert.equal(hitung(html, /aria-pressed=/g), 4 + tipeSoal.length, 'segmented status (4) + jenis soal adalah tombol aria-pressed')
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
  assert.ok(hitung(html, /href="\/materi\/04"/g) >= 3, 'Modul 04 bisa dibuka dari blok, peta, dan bagian lain')
  assert.ok(hitung(html, /href="\/materi\/06"/g) >= 1, 'Modul 06 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/07"/g) >= 1, 'Modul 07 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/08"/g) >= 1, 'Modul 08 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/09"/g) >= 1, 'Modul 09 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/10"/g) >= 1, 'Modul 10 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/11"/g) >= 1, 'Modul 11 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/12"/g) >= 1, 'Modul 12 sudah ditulis, jadi bisa dibuka dari peta')
  assert.ok(hitung(html, /href="\/materi\/13"/g) >= 1, 'Modul 13 sudah ditulis, jadi bisa dibuka dari peta')
  assert.equal(hitung(html, /href="\/materi\/14"/g), 0, 'modul yang belum ditulis bukan tautan')
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

test('Modul 01: blok gambar dan pseudocode terdaftar; flowchart punya nama dan deskripsi; pseudocode bernomor', async () => {
  const blok = await ssr.modul('/src/content/modul/01.blok.js')
  assert.deepEqual(Object.keys(blok.gambar).sort(), ['flowchart', 'io'])
  const fc = ssr.render(ssr.createElement(blok.gambar.flowchart))
  assert.match(fc, /<svg [^>]*role="img"[^>]*aria-labelledby="fc-judul fc-desc"/)
  assert.match(fc, /<title id="fc-judul">Flowchart/)
  assert.match(fc, /<desc id="fc-desc">Mulai\./)
  for (const t of ['Mulai', 'Baca bil1, bil2, bil3', 'maks = bil1', 'maks &lt; bil2 ?', 'maks = bil2', 'maks &lt; bil3 ?', 'maks = bil3', 'Tampilkan maks', 'Selesai']) assert.ok(fc.includes(`>${t}</text>`), t)
  assert.equal(hitung(fc, />Ya<\/text>/g), 2)
  assert.equal(hitung(fc, />Tidak<\/text>/g), 2)
  assert.match(fc, /Gambar 2\./)
  const io = ssr.render(ssr.createElement(blok.gambar.io))
  assert.match(io, /12, 10, 15, 7/)
  assert.match(io, /7, 10, 12, 15/)
  assert.match(io, /Gambar 1\./)
  const PseudoBlok = await ssr.load('/src/materi/blocks.jsx', 'PseudoBlok')
  const html = ssr.render(ssr.createElement(PseudoBlok, blok.pseudo.bilmax))
  assert.match(html, /role="region"[^>]*aria-label="Pseudocode BILANGAN_MAX"[^>]*tabindex="0"/)
  assert.match(html, /BILANGAN_MAX\(bil1, bil2, bil3\)/)
  assert.equal(hitung(html, /w-6 shrink-0 text-right/g), 6, 'enam baris bernomor')
  const tanpa = ssr.render(ssr.createElement(PseudoBlok, { ...blok.pseudo.finiteness, nomor: false }))
  assert.equal(hitung(tanpa, /w-6 shrink-0 text-right/g), 0)
})

test('Modul 01: seluruh teks dirender (7 tabel, 2 blok kode, rumus) tanpa galat', async () => {
  const { readFileSync } = await import('node:fs')
  const { parseModul } = await import('../lib/modulContent.js')
  const Md = await ssr.load('/src/components/MarkdownView/MarkdownView.jsx')
  const bagian = parseModul(readFileSync(new URL('../content/modul/01.md', import.meta.url), 'utf8'))
  const html = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'md' || b.type === 'callout')).map((b) => ssr.render(ssr.createElement(Md, { variant: 'modul', text: b.text }))).join('\n')
  assert.equal(hitung(html, /<table/g), 7)
  assert.equal(hitung(html, /<figure[^>]*>\s*<figcaption[^>]*>(?:Python|Keluaran)/g), 2)
  assert.ok(hitung(html, /class="katex|<mjx-container|<math/g) > 5, 'rumus dirender')
  assert.doesNotMatch(html, /\{\{|@@/, 'tidak ada penanda yang tersisa')
})

test('ModulCard: Modul 01 tanpa prasyarat menulis "Tanpa prasyarat", Modul 04 menyebut Modul 03', async () => {
  const ModulCard = await ssr.load('/src/materi/ModulCard.jsx')
  const { modulById } = await ssr.modul('/src/data/modul.js')
  const kartu = (id) => ssr.render(ssr.createElement(ModulCard, { m: modulById(id), status: 'belum', persen: 0, offline: false }))
  assert.match(kartu('01'), /Tanpa prasyarat/)
  assert.doesNotMatch(kartu('01'), /Prasyarat:\s*</)
  assert.match(kartu('04'), /Prasyarat: Modul 03/)
})

test('Modul 02: gambar tumpukan dan rentang dirender dengan status yang dibacakan; pseudocode terdaftar; teks dirender', async () => {
  const blok = await ssr.modul('/src/content/modul/02.blok.js')
  assert.deepEqual(Object.keys(blok.gambar).sort(), ['rentang', 'tumpukan'])
  assert.deepEqual(Object.keys(blok.pseudo).sort(), ['bsiter', 'bsrek', 'jumlahrek', 'rantai12'])
  const tumpukan = ssr.render(ssr.createElement(blok.gambar.tumpukan))
  assert.equal(hitung(tumpukan, /<li /g), 4, 'empat lapisan tumpukan')
  assert.match(tumpukan, /aria-label="Tumpukan pemanggilan JUMLAH_REKURSIF\(A, 3\)/)
  assert.match(tumpukan, /55 \+ 15 = 70/)
  assert.match(tumpukan, /kasus dasar tercapai/)
  assert.match(tumpukan, /Gambar 1\./)
  const rentang = ssr.render(ssr.createElement(blok.gambar.rentang))
  assert.equal(hitung(rentang, /Putaran \d/g), 3)
  assert.equal(hitung(rentang, /\(elemen tengah\)/g), 3, 'satu elemen tengah per putaran')
  assert.equal(hitung(rentang, /\(dalam rentang\)/g), 5 + 2 + 0, 'rentang 6, 3, 1 elemen dikurangi elemen tengah')
  assert.equal(hitung(rentang, /\(di luar rentang\)/g), 0 + 3 + 5)
  assert.match(rentang, /Gambar 2\./)
  const { readFileSync } = await import('node:fs')
  const { parseModul } = await import('../lib/modulContent.js')
  const Md = await ssr.load('/src/components/MarkdownView/MarkdownView.jsx')
  const bagian = parseModul(readFileSync(new URL('../content/modul/02.md', import.meta.url), 'utf8'))
  const html = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'md' || b.type === 'callout')).map((b) => ssr.render(ssr.createElement(Md, { variant: 'modul', text: b.text }))).join('\n')
  assert.equal(hitung(html, /<table/g), 5)
  assert.doesNotMatch(html, /\{\{|@@/)
  const kuis = await ssr.modul('/src/content/modul/02.kuis.js')
  const soal6 = ssr.render(ssr.createElement(Md, { variant: 'modul', text: kuis.kuis02.soal[5].teks }))
  assert.match(soal6, /Pseudocode/, 'blok pseudocode di dalam soal dirender dengan keterangan')
  assert.match(soal6, /FAKTORIAL\(n - 1\)/)
})

test('Modul 03: pseudocode terdaftar dan teks dirender (4 tabel, rumus, blok kode); soal 3, 5, dan 6 dirender', async () => {
  const blok = await ssr.modul('/src/content/modul/03.blok.js')
  assert.deepEqual(Object.keys(blok.pseudo).sort(), ['caribilk', 'jumlah', 'pasangan'])
  const PseudoBlok = await ssr.load('/src/materi/blocks.jsx', 'PseudoBlok')
  const html1 = ssr.render(ssr.createElement(PseudoBlok, blok.pseudo.pasangan))
  assert.equal(hitung(html1, /w-6 shrink-0 text-right/g), 6)
  assert.match(html1, /HITUNG_PASANGAN_SAMA\(A\)/)
  const { readFileSync } = await import('node:fs')
  const { parseModul } = await import('../lib/modulContent.js')
  const Md = await ssr.load('/src/components/MarkdownView/MarkdownView.jsx')
  const bagian = parseModul(readFileSync(new URL('../content/modul/03.md', import.meta.url), 'utf8'))
  const html = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'md' || b.type === 'callout')).map((b) => ssr.render(ssr.createElement(Md, { variant: 'modul', text: b.text }))).join('\n')
  assert.equal(hitung(html, /<table/g), 4)
  assert.equal(hitung(html, /<figure[^>]*>\s*<figcaption[^>]*>(?:Python|Keluaran)/g), 2)
  assert.ok(hitung(html, /class="katex|<mjx-container|<math/g) > 20, 'banyak rumus dirender')
  assert.doesNotMatch(html, /\{\{|@@/)
  const kuis = (await ssr.modul('/src/content/modul/03.kuis.js')).kuis03
  for (const no of [3, 5]) {
    const soal = ssr.render(ssr.createElement(Md, { variant: 'modul', text: kuis.soal[no - 1].teks }))
    assert.match(soal, /Pseudocode/, `soal ${no}`)
  }
})

test('Modul 05: gambar grafik dirender dengan nama dan deskripsi; seluruh teks dirender (3 tabel, 2 blok kode, rumus)', async () => {
  const blok = await ssr.modul('/src/content/modul/05.blok.js')
  assert.deepEqual(Object.keys(blok.gambar), ['grafik'])
  const g = ssr.render(ssr.createElement(blok.gambar.grafik))
  assert.match(g, /<svg [^>]*role="img"[^>]*aria-labelledby="[^"]+ [^"]+"/)
  assert.match(g, /<title[^>]*>Grafik pertumbuhan fungsi running time<\/title>/)
  assert.match(g, /<desc[^>]*>Grafik garis 5 fungsi untuk ukuran masukan n dari 1 sampai 20\. Sumbu tegak linier dari 0 sampai 120/)
  assert.equal(hitung(g, /<path d="M/g), 5, 'lima kurva')
  assert.equal(hitung(g, /↑ /g), 2, 'dua kurva terpotong ditandai ↑')
  assert.match(g, /aria-label="Legenda grafik"/)
  assert.match(g, /Gambar 1\./)
  const { readFileSync } = await import('node:fs')
  const { parseModul } = await import('../lib/modulContent.js')
  const Md = await ssr.load('/src/components/MarkdownView/MarkdownView.jsx')
  const bagian = parseModul(readFileSync(new URL('../content/modul/05.md', import.meta.url), 'utf8'))
  const html = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'md' || b.type === 'callout')).map((b) => ssr.render(ssr.createElement(Md, { variant: 'modul', text: b.text }))).join('\n')
  assert.equal(hitung(html, /<table/g), 3)
  assert.equal(hitung(html, /<figure[^>]*>\s*<figcaption[^>]*>(?:Python|Keluaran)/g), 2)
  assert.ok(hitung(html, /class="katex|<mjx-container|<math/g) > 60, 'banyak rumus dirender')
  assert.doesNotMatch(html, /\{\{|@@/)
})

test('Penjelajah Pertumbuhan Fungsi: kepala halaman, kontrol berlabel, grafik bernama, tabel nilai dan rasio, studi kasus, titik potong', async () => {
  const Penjelajah = await ssr.load('/src/viz/PenjelajahPertumbuhan.jsx')
  const { algoritma } = await ssr.modul('/src/data/algoritma.js')
  const a = algoritma.find((x) => x.id === 'pertumbuhan-fungsi')
  const html = ssr.render(ssr.createElement(Penjelajah, { a }), '/algoritma/pertumbuhan-fungsi')
  assert.equal(hitung(html, /<h1[ >]/g), 2, 'satu h1 untuk HP dan satu untuk desktop (salah satunya disembunyikan CSS)')
  assert.equal(hitung(html, /<h2 /g), 4, 'empat panel')
  assert.match(html, /Baca materi · Modul 05/)
  assert.match(html, /href="\/materi\/05"/)
  // kontrol
  assert.equal(hitung(html, /aria-pressed=/g), 8 + 2, 'delapan tombol fungsi + dua pilihan skala')
  assert.equal(hitung(html, /type="range"/g), 2)
  assert.match(html, /aria-label="Batas ukuran masukan pada grafik"/)
  assert.match(html, /aria-label="Ukuran masukan n untuk tabel nilai"/)
  assert.match(html, /aria-label="Skala sumbu tegak"/)
  // grafik dan padanan teks
  assert.match(html, /<svg [^>]*role="img"/)
  assert.match(html, /<caption[^>]*>Nilai fungsi pada n = 10<\/caption>/)
  assert.match(html, /<caption[^>]*>\s*Rasio pertumbuhan dari n = 5 menjadi n = 25/)
  assert.equal(hitung(html, /role="region" aria-label="Tabel/g), 2, 'dua tabel lebar bisa digulir dan bisa difokus')
  // isi awal sama dengan Tabel 2 dan studi kasus bahan kuliah
  for (const t of ['1.048.576', '1,29 × 10²³', '1.280 T', '65.536 T', '3.276,8 T', '51,2×', 'Mulai n = 190']) assert.ok(html.includes(t), t)
  assert.equal(hitung(html, /<input /g), 2 + (2 + 3 + 2), 'dua penggeser + isian n₁ n₂; n₀ n k; dua konstanta')
  assert.equal(hitung(html, /<input [^>]*inputMode=/g), 7, 'tujuh isian bilangan')
  assert.equal(hitung(html, /<label /g) >= 7, true, 'setiap isian punya label')
  assert.equal(hitung(html, /role="status"/g), 2, 'kesimpulan studi kasus dan titik potong diumumkan')
})
