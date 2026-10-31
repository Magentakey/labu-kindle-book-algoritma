// Audit aksesibilitas otomatis (axe-core, aturan WCAG 2.0 sampai 2.2 level A dan AA) di Chromium, mode terang dan gelap.
//
// Pemakaian:
//   npm run build && npx vite preview --port 4173      (terminal 1)
//   npm run audit:a11y                                  (terminal 2)
// Bila Chromium belum ada:  npx playwright-core install chromium
// Opsi lewat variabel lingkungan: AUDIT_URL (alamat dasar), AUDIT_ONLY (potongan nama rute), CHROMIUM_PATH.
// Jalankan juga sekali terhadap server dev (AUDIT_URL=http://127.0.0.1:5173/labu-kindle-book-algoritma/): di sana React StrictMode
// menjalankan efek dua kali, dan pemeriksaan "terbuka di atas" menangkap efek yang diam-diam menggulir atau memindah fokus saat halaman dibuka.
//
// Keluar dengan kode 1 bila ada pelanggaran. axe tidak menangkap semuanya (mis. urutan fokus, kualitas teks alternatif),
// jadi hasil bersih bukan pengganti uji manual dengan pembaca layar.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright-core'

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = (process.env.AUDIT_URL ?? 'http://127.0.0.1:4173/labu-kindle-book-algoritma/').replace(/#.*$/, '')
const ONLY = process.env.AUDIT_ONLY

const klik = (page, name) => page.getByRole('button', { name }).first().click()

/** Rute yang diperiksa. `siapkan` membawa halaman ke keadaan yang ingin diperiksa. */
const rute = [
  { nama: 'algoritma-galeri', path: '/' },
  {
    nama: 'algoritma-dialog-materi-lama',
    path: '/',
    siapkan: async (p) => {
      await p.locator('a', { hasText: 'Pertumbuhan Fungsi' }).first().click()
      await p.waitForSelector('dialog[open]')
    },
  },
  { nama: 'algoritma-insertion-sort', path: '/algoritma/insertion-sort' },
  { nama: 'algoritma-dijkstra', path: '/algoritma/dijkstra' },
  { nama: 'algoritma-bandingkan', path: '/algoritma/bandingkan/insertion-sort/merge-sort' },
  { nama: 'materi-daftar', path: '/materi' },
  { nama: 'materi-01', path: '/materi/01' },
  {
    nama: 'materi-01-flowchart',
    path: '/materi/01',
    siapkan: async (p) => {
      await p.locator('svg[aria-labelledby="fc-judul fc-desc"]').scrollIntoViewIfNeeded()
    },
  },
  { nama: 'materi-02', path: '/materi/02' },
  { nama: 'materi-04', path: '/materi/04' },
  {
    nama: 'materi-04-tantangan',
    path: '/materi/04',
    siapkan: async (p) => {
      await p.locator('section[aria-label="Tantangan kode"]').scrollIntoViewIfNeeded()
      await p.waitForSelector('text=Kode Anda (JavaScript)')
      await klik(p, /Lihat jawaban contoh/)
      await klik(p, /Salin ke editor/) // kode awal sengaja berputar tanpa henti, jadi jalankan jawaban contoh
      await klik(p, /Jalankan kode/)
      await p.waitForSelector('text=Hasil test case', { timeout: 15000 })
    },
  },
  { nama: 'quiz-daftar', path: '/quiz' },
  { nama: 'quiz-intro', path: '/quiz/04' },
  { nama: 'quiz-01-intro', path: '/quiz/01' },
  { nama: 'quiz-02-intro', path: '/quiz/02' },
  {
    nama: 'quiz-berjalan',
    path: '/quiz/04',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      await klik(p, /Berikutnya/)
    },
  },
  {
    nama: 'quiz-hasil',
    path: '/quiz/04',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      for (let i = 0; i < 7; i++) await klik(p, /Berikutnya/)
      await klik(p, /Selesai dan lihat hasil/)
      await p.getByRole('button', { name: /Lihat pembahasan/ }).nth(1).click()
    },
  },
  { nama: 'credit', path: '/credit' },
  { nama: 'materi-lama-insertion-sort', path: '/materi/insertion-sort' },
]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
let total = 0
for (const tema of ['light', 'dark']) {
  for (const r of rute) {
    if (ONLY && !r.nama.includes(ONLY)) continue
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', colorScheme: tema })
    await ctx.addInitScript((t) => localStorage.setItem('labu-theme', t), tema)
    const page = await ctx.newPage()
    try {
      await page.goto(`${BASE}#${r.path}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(600)
      // Halaman yang baru dibuka harus berada di atas. Fokus boleh tetap di <body> atau dipindah ke judul <h1> (praktik umum saat pindah halaman);
      // fokus yang pindah ke elemen lain (mis. wadah kuis di tengah halaman) biasanya ikut menggulir halaman dan dianggap masalah.
      const awal = await page.evaluate(() => ({ y: Math.round(scrollY), fokus: document.activeElement?.tagName }))
      const masalahAwal = awal.y > 5 ? [`halaman terbuka tergulir ${awal.y}px, seharusnya di atas`] : !['BODY', 'H1'].includes(awal.fokus) ? [`fokus pindah sendiri ke <${awal.fokus}> saat halaman dibuka`] : []
      if (masalahAwal.length && !r.siapkan) {
        total++
        console.log(`GAGAL ${tema.padEnd(5)} ${r.nama}\n   - [posisi awal] ${masalahAwal[0]}`)
        await ctx.close()
        continue
      }
      await r.siapkan?.(page)
      await page.waitForTimeout(300)
      await page.evaluate(axeSource)
      const hasil = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
      const v = hasil.violations
      total += v.reduce((n, x) => n + x.nodes.length, 0)
      console.log(`${v.length === 0 ? 'OK  ' : 'GAGAL'} ${tema.padEnd(5)} ${r.nama}`)
      for (const x of v) {
        console.log(`   - [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length} elemen)`)
        for (const n of x.nodes.slice(0, 4)) console.log(`       ${n.target.join(' ')}  ${(n.any[0]?.message ?? n.failureSummary ?? '').split('\n')[0]}`)
      }
    } catch (e) {
      total++
      console.log(`GALAT ${tema.padEnd(5)} ${r.nama}: ${String(e.message).split('\n')[0]}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(total === 0 ? '\nTidak ada pelanggaran.' : `\n${total} masalah ditemukan.`)
process.exit(total === 0 ? 0 : 1)
