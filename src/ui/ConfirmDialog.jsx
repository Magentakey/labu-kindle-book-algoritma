import { useEffect, useId, useRef } from 'react'
import Button from './Button.jsx'
import Mascot from './Mascot.jsx'

/**
 * Dialog konfirmasi modal singkat. Memakai elemen <dialog> bawaan browser: fokus terkunci di dalam dialog,
 * Esc menutup, dan fokus kembali ke elemen pemicu saat ditutup. Klik di luar kotak juga menutup (sama dengan batal).
 * Tombol utama (data-utama) mendapat fokus awal supaya Enter langsung melanjutkan.
 *
 * @param {{ open: boolean, judul: string, children: import('react').ReactNode, labelLanjut?: string, labelBatal?: string, onLanjut: () => void, onBatal: () => void }} props
 */
export default function ConfirmDialog({ open, judul, children, labelLanjut = 'Lanjut', labelBatal = 'Batal', onLanjut, onBatal }) {
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      d.querySelector('[data-utama]')?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])

  // Klik di area gelap (di luar kotak) = batal. Hanya kemudahan untuk mouse; pengguna keyboard punya Esc dan tombol Batal.
  const batalRef = useRef(onBatal)
  useEffect(() => {
    batalRef.current = onBatal
  })
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onClick = (e) => {
      if (e.target === d) batalRef.current()
    }
    d.addEventListener('click', onClick)
    return () => d.removeEventListener('click', onClick)
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-judul`}
      aria-describedby={`${id}-isi`}
      onCancel={(e) => {
        e.preventDefault() // Esc: biarkan state induk yang menutup
        onBatal()
      }}
      className="m-auto w-[min(92vw,30rem)] rounded-md border-[1.5px] border-brand-yellow-strong bg-card p-0 text-ink shadow-hover backdrop:bg-black/55"
    >
      <div className="flex gap-4 p-5">
        <Mascot expression="berpikir" size={64} className="hidden shrink-0 sm:block" />
        <div className="min-w-0">
          <h2 id={`${id}-judul`} className="text-h3 text-heading">
            {judul}
          </h2>
          <div id={`${id}-isi`} className="text-body mt-2 text-ink-soft">
            {children}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-panel px-5 py-3">
        <Button variant="kontrol" onClick={onBatal}>
          {labelBatal}
        </Button>
        <Button variant="navigasi" iconRight="arrowR" data-utama onClick={onLanjut}>
          {labelLanjut}
        </Button>
      </div>
    </dialog>
  )
}
