import { Link } from 'react-router-dom'
import { Mascot } from '../ui/index.js'

/** Halaman sementara untuk menu yang belum dibuat (Materi, Quiz, Credit). */
export default function Segera({ judul, catatan, tautan }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
      <Mascot expression="berpikir" size={140} />
      <h1 className="text-h2 mt-4 text-heading">{judul} sedang dikerjakan</h1>
      <p className="text-body mt-2 text-ink-soft">{catatan}</p>
      {tautan && (
        <Link to={tautan.to} className="text-button mt-5 rounded-sm text-link underline underline-offset-4">
          {tautan.label}
        </Link>
      )}
    </div>
  )
}
