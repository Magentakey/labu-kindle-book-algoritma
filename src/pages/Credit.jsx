import { useEffect } from 'react'
import CreditBar from '../credit/CreditBar.jsx'
import { creditTabs } from '../data/credit.js'
import { Glosarium, Sumber, Tentang, Tim } from '../credit/Konten.jsx'
import PetaBelajar from '../credit/PetaBelajar.jsx'
import { Hero, Progres } from '../credit/Progres.jsx'
import { useScrollSpy } from '../materi/scroll.js'

const IDS = creditTabs.map((t) => t.id)

/** Halaman Credit (Figma: Credit · konten penuh): progres belajar, glosarium, peta belajar, tim, sumber, dan tentang LABU. */
export default function Credit() {
  const { aktif } = useScrollSpy(IDS)
  useEffect(() => {
    document.title = 'Credit · LABU'
  }, [])
  const bagian = [Progres, Glosarium, PetaBelajar, Tim, Sumber, Tentang]
  return (
    <>
      <CreditBar aktif={aktif} />
      <div className="mx-auto w-full max-w-[1344px] px-4 pb-8 pt-6 md:px-8">
        <Hero />
        {bagian.map((Bagian, i) => (
          <section key={IDS[i]} id={`sec-${IDS[i]}`} aria-labelledby={`h-${IDS[i]}`} className="mt-12 scroll-mt-28">
            <Bagian />
          </section>
        ))}
      </div>
    </>
  )
}
