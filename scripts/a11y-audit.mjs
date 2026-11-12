// Audit aksesibilitas otomatis (axe-core, aturan WCAG 2.0 sampai 2.2 level A dan AA) di Chromium, mode terang dan gelap.
//
// Pemakaian:
//   npm run build && npx vite preview --port 4173      (terminal 1)
//   npm run audit:a11y                                  (terminal 2)
// Bila Chromium belum ada:  npx playwright-core install chromium
// Opsi lewat variabel lingkungan: AUDIT_URL (alamat dasar), AUDIT_ONLY (potongan nama rute), AUDIT_TEMA (light atau dark), CHROMIUM_PATH.
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
const TEMA = process.env.AUDIT_TEMA // 'light' atau 'dark' untuk memeriksa satu mode saja

const klik = (page, name) => page.getByRole('button', { name }).first().click()
/** Menjawab soal apa pun: banyak jawaban (pilih dua, lalu periksa) atau satu jawaban. */
const jawab = async (page) => {
  if (await page.getByRole('checkbox').count()) {
    const perlu = Number((await page.getByText(/^Pilih \d jawaban$/).first().textContent()).match(/\d/)[0])
    for (let i = 0; i < perlu; i++) await page.getByRole('checkbox').nth(i).click()
    await klik(page, /Periksa jawaban/)
  } else {
    await jawabSatu(page)
  }
}
/** Menjawab soal satu jawaban: memilih opsi pertama (langsung dikoreksi). */
const jawabSatu = (page) => page.getByRole('group').getByRole('button').first().click()

/** Rute yang diperiksa. `siapkan` membawa halaman ke keadaan yang ingin diperiksa. */
const rute = [
  { nama: 'algoritma-galeri', path: '/' },
  { nama: 'algoritma-insertion-sort', path: '/algoritma/insertion-sort' },
  { nama: 'algoritma-dijkstra', path: '/algoritma/dijkstra' },
  { nama: 'algoritma-pohon-recurrence', path: '/algoritma/pohon-recurrence' },
  { nama: 'algoritma-konsep-dp', path: '/algoritma/konsep-dp' },
  { nama: 'algoritma-konsep-greedy', path: '/algoritma/konsep-greedy' },
  { nama: 'algoritma-representasi-graf', path: '/algoritma/representasi-graf' },
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
  { nama: 'materi-03', path: '/materi/03' },
  { nama: 'materi-05', path: '/materi/05' },
  { nama: 'materi-06', path: '/materi/06' },
  { nama: 'materi-07', path: '/materi/07' },
  { nama: 'materi-08', path: '/materi/08' },
  { nama: 'materi-09', path: '/materi/09' },
  { nama: 'materi-10', path: '/materi/10' },
  { nama: 'materi-11', path: '/materi/11' },
  { nama: 'materi-12', path: '/materi/12' },
  { nama: 'materi-13', path: '/materi/13' },
  { nama: 'materi-14', path: '/materi/14' },
  { nama: 'materi-15', path: '/materi/15' },
  { nama: 'materi-16', path: '/materi/16' },
  { nama: 'materi-17', path: '/materi/17' },
  { nama: 'materi-18', path: '/materi/18' },
  { nama: 'materi-19', path: '/materi/19' },
  { nama: 'materi-20', path: '/materi/20' },
  { nama: 'materi-21', path: '/materi/21' },
  { nama: 'materi-22', path: '/materi/22' },
  { nama: 'materi-23', path: '/materi/23' },
  { nama: 'materi-24', path: '/materi/24' },
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
  { nama: 'quiz-03-intro', path: '/quiz/03' },
  { nama: 'quiz-05-intro', path: '/quiz/05' },
  { nama: 'quiz-06-intro', path: '/quiz/06' },
  { nama: 'quiz-07-intro', path: '/quiz/07' },
  { nama: 'quiz-08-intro', path: '/quiz/08' },
  { nama: 'quiz-09-intro', path: '/quiz/09' },
  { nama: 'quiz-10-intro', path: '/quiz/10' },
  { nama: 'quiz-11-intro', path: '/quiz/11' },
  { nama: 'quiz-12-intro', path: '/quiz/12' },
  { nama: 'quiz-13-intro', path: '/quiz/13' },
  { nama: 'quiz-14-intro', path: '/quiz/14' },
  { nama: 'quiz-15-intro', path: '/quiz/15' },
  { nama: 'quiz-16-intro', path: '/quiz/16' },
  { nama: 'quiz-17-intro', path: '/quiz/17' },
  { nama: 'quiz-18-intro', path: '/quiz/18' },
  { nama: 'quiz-19-intro', path: '/quiz/19' },
  { nama: 'quiz-20-intro', path: '/quiz/20' },
  { nama: 'quiz-21-intro', path: '/quiz/21' },
  { nama: 'quiz-22-intro', path: '/quiz/22' },
  { nama: 'quiz-23-intro', path: '/quiz/23' },
  { nama: 'quiz-24-intro', path: '/quiz/24' },
  {
    nama: 'quiz-berjalan',
    path: '/quiz/04',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      await jawab(p)
      await klik(p, /Berikutnya/)
    },
  },
  {
    nama: 'quiz-hasil',
    path: '/quiz/04',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      for (let i = 0; i < 7; i++) {
        await jawab(p)
        await klik(p, /Berikutnya/)
      }
      await jawab(p)
      await klik(p, /Selesai dan lihat hasil/)
      await p.getByRole('button', { name: /Lihat pembahasan/ }).nth(1).click()
    },
  },
  {
    nama: 'quiz-01-satu-jawaban-koreksi',
    path: '/quiz/01',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      await jawabSatu(p) // soal 1: satu jawaban, langsung dikoreksi
    },
  },
  {
    nama: 'quiz-01-banyak-jawaban',
    path: '/quiz/01',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      await jawabSatu(p)
      await klik(p, /Berikutnya/) // soal 2: pilih dua jawaban
      await p.getByRole('checkbox').nth(0).click()
      await p.getByRole('checkbox').nth(2).click()
    },
  },
  {
    nama: 'quiz-01-banyak-jawaban-koreksi',
    path: '/quiz/01',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      await jawabSatu(p)
      await klik(p, /Berikutnya/)
      await p.getByRole('checkbox').nth(0).click()
      await p.getByRole('checkbox').nth(1).click()
      await klik(p, /Periksa jawaban/)
    },
  },
  {
    nama: 'quiz-01-hasil',
    path: '/quiz/01',
    siapkan: async (p) => {
      await klik(p, /Mulai kuis/)
      for (let i = 0; i < 8; i++) {
        await jawab(p)
        await klik(p, i === 7 ? /Selesai dan lihat hasil/ : /Berikutnya/)
      }
      await p.getByRole('button', { name: /Lihat pembahasan/ }).nth(1).click()
    },
  },
  { nama: 'credit', path: '/credit' },
  { nama: 'materi-lama-insertion-sort', path: '/materi/insertion-sort' },
]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
let total = 0
for (const tema of ['light', 'dark'].filter((x) => !TEMA || x === TEMA)) {
  for (const r of rute) {
    if (ONLY && !r.nama.includes(ONLY)) continue
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', colorScheme: tema })
    await ctx.addInitScript((t) => localStorage.setItem('labu-theme', t), tema)
    const page = await ctx.newPage()
    try {
      await page.goto(`${BASE}#${r.path}`)
      await page.waitForLoadState('networkidle')
      // Rumus dimuat malas ("Memuat rumus…"): tunggu sampai semuanya tampil, supaya reflow dan kontras diperiksa pada isi akhir, bukan penampung sementara.
      await page.waitForFunction(() => !document.body.textContent.includes('Memuat rumus'), null, { timeout: 60000 }).catch(() => {})
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
      // Di layar HP (390px) halaman tidak boleh melebar ke samping (WCAG 1.4.10 Reflow): rumus, tabel, dan kode harus menggulir di dalam wadahnya.
      if (!r.siapkan) {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.waitForTimeout(300)
        const lebar = await page.evaluate(() => ({ isi: document.documentElement.scrollWidth, layar: innerWidth }))
        await page.setViewportSize({ width: 1280, height: 900 })
        if (lebar.isi > lebar.layar + 1) {
          total++
          console.log(`GAGAL ${tema.padEnd(5)} ${r.nama}\n   - [reflow] di layar 390px halaman melebar jadi ${lebar.isi}px`)
        }
      }
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
