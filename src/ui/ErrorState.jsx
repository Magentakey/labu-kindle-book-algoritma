import Button from './Button.jsx'
import Mascot from './Mascot.jsx'

/**
 * Tampilan galat (Figma: State · Error): maskot kaget, judul, penjelasan, dan tombol tindakan.
 * @param {{ judul: string, pesan?: string, aksi?: Array<{ label: string, onClick: () => void, icon?: string, variant?: string }> }} props
 */
export default function ErrorState({ judul, pesan, aksi = [] }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center">
      <Mascot expression="kaget" size={120} />
      <h2 className="text-h3 mt-4 text-heading">{judul}</h2>
      {pesan && <p className="text-body mt-2 text-ink-soft">{pesan}</p>}
      {aksi.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {aksi.map((a, i) => (
            <Button key={a.label} variant={a.variant ?? (i === 0 ? 'navigasi' : 'netral')} icon={a.icon} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
