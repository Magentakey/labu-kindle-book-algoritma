import { focusRing } from './styles.js'

/**
 * Isi yang bisa dibuka dan ditutup (memakai <details> bawaan browser, jadi keyboard dan pembaca layar langsung bekerja).
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
export default function Reveal({ title, children }) {
  return (
    <details className="my-6 rounded-xl border-2 border-stone-900 bg-white">
      <summary className={`min-h-12 cursor-pointer px-4 py-3 font-semibold hover:bg-orange-100 ${focusRing}`}>{title}</summary>
      <div className="border-t-2 border-stone-300 px-4 pb-2">{children}</div>
    </details>
  )
}
