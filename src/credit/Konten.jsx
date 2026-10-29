import { Link } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { glosarium, sumber, tentang, tim } from '../data/credit.js'
import { modulById } from '../data/modul.js'
import { Chip, Icon, Mascot } from '../ui/index.js'
import { JudulBagian } from './Progres.jsx'

const Md = ({ text }) => <MarkdownView variant="modul" text={text} inline />
const fotoUrl = (p) => `${import.meta.env.BASE_URL}${p}`

export function Glosarium() {
  return (
    <>
      <JudulBagian id="glosarium" eyebrow="Glosarium">
        Glosarium Istilah PAA
      </JudulBagian>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {glosarium.map((g) => (
          <li key={g.istilah} className="flex flex-col rounded-sm border border-line bg-card p-4 shadow-block">
            <h3 className="text-h3 text-heading">
              <Md text={g.istilah} />
            </h3>
            <p className="text-body mt-1 flex-1 text-ink">
              <Md text={g.arti} />
            </p>
            <p className="text-caption mt-2 text-ink-soft">
              {modulById(g.modul) ? (
                <Link to={`/materi/${g.modul}`} className="rounded-sm text-link underline underline-offset-2">
                  Modul {g.modul}
                </Link>
              ) : (
                `Modul ${g.modul}`
              )}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

/** Kartu anggota: foto bulat menonjol di atas blok kuning (meniru susunan di Canva), nama dan peran di bawahnya. */
function KartuAnggota({ a }) {
  return (
    <li className="flex pt-14">
      <div className="relative w-full rounded-sm bg-brand-yellow px-4 pb-5 pt-16 text-center text-on-orange shadow-block">
        <img src={fotoUrl(a.foto)} alt={`Foto ${a.nama}`} width={112} height={112} loading="lazy" className="absolute -top-14 left-1/2 size-28 -translate-x-1/2 rounded-full border-4 border-page bg-panel object-cover" />
        <h3 className="text-h3">{a.nama}</h3>
        <p className="text-body mt-1">{a.peran}</p>
      </div>
    </li>
  )
}

export function Tim() {
  return (
    <>
      <JudulBagian id="tim" eyebrow="Tim pengembang">
        Tim Pengembang
      </JudulBagian>
      <ul className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {tim.map((a) => (
          <KartuAnggota key={a.nama} a={a} />
        ))}
      </ul>
    </>
  )
}

export function Sumber() {
  return (
    <>
      <JudulBagian id="sumber" eyebrow="Sumber & referensi">
        Sumber &amp; Referensi
      </JudulBagian>
      <ul className="mt-4 space-y-3 rounded-sm border border-line bg-card p-4 md:p-5">
        {sumber.map((s) => (
          <li key={s} className="text-body flex gap-3 text-ink">
            <span className="mt-2 size-2 shrink-0 bg-muted" aria-hidden="true" />
            <span className="min-w-0">{s}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function Tentang() {
  return (
    <>
      <JudulBagian id="tentang" eyebrow="Tentang LABU">
        Tentang LABU
      </JudulBagian>
      <div className="mt-4 flex flex-wrap gap-6 rounded-sm border border-line bg-card p-5">
        <Mascot expression="netral" size={110} />
        <div className="min-w-0 flex-1 basis-72">
          <h3 className="text-h3 text-heading">Cerita maskot</h3>
          <p className="text-body mt-1 text-ink-soft">{tentang.cerita}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip type="kode">Versi {tentang.versi}</Chip>
            <Chip type="info">PWA · bisa dipasang &amp; offline</Chip>
          </div>
          <h3 className="text-body-strong mt-4 text-heading">Changelog</h3>
          <ul className="mt-2 space-y-1.5">
            {tentang.changelog.map((c) => (
              <li key={c.versi} className="text-caption flex gap-2 text-ink-soft">
                <Icon name="right" size={14} className="mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-ink">{c.versi}</span> — {c.teks}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
