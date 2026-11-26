import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { cx } from './cx.js'
import { base, buttonVariants, off, sizes } from './buttonStyles.js'

/**
 * Menu dropdown berpola "disclosure": tombol membuka daftar tautan. Ditutup dengan Esc (fokus kembali ke tombol), klik di luar,
 * atau saat fokus keluar dari menu. Dipakai untuk daftar pilihan pindah halaman, mis. pasangan algoritma di halaman Algoritma.
 * @param {{ label: string, icon?: string, variant?: keyof typeof buttonVariants, align?: 'kanan' | 'kiri', children: (tutup: () => void) => import('react').ReactNode, className?: string, panelClassName?: string }} props
 */
export default function DropdownMenu({ label, icon, variant = 'navigasiGaris', align = 'kanan', children, className, panelClassName }) {
  const [buka, setBuka] = useState(false)
  const akar = useRef(null)
  const tombol = useRef(null)
  const id = useId()
  const tutup = () => setBuka(false)

  useEffect(() => {
    if (!buka) return undefined
    const diLuar = (e) => {
      if (akar.current && !akar.current.contains(e.target)) setBuka(false)
    }
    document.addEventListener('pointerdown', diLuar)
    return () => document.removeEventListener('pointerdown', diLuar)
  }, [buka])

  return (
    <div
      ref={akar}
      role="presentation"
      className={cx('relative', className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && buka) {
          e.stopPropagation()
          setBuka(false)
          tombol.current?.focus()
        }
      }}
      onBlur={(e) => {
        if (buka && !e.currentTarget.contains(e.relatedTarget)) setBuka(false)
      }}
    >
      <button
        ref={tombol}
        type="button"
        aria-expanded={buka}
        aria-controls={id}
        onClick={() => setBuka((b) => !b)}
        className={cx(base, sizes.m, buttonVariants[variant], off)}
      >
        {icon && <Icon name={icon} size={18} />}
        {label}
        <Icon name="down" size={16} className={cx('transition-transform duration-200 motion-reduce:transition-none', buka && 'rotate-180')} />
      </button>
      <div id={id} hidden={!buka} className={cx('absolute top-full z-30 mt-2 min-w-full rounded-sm border border-line bg-card p-1.5 shadow-hover', align === 'kiri' ? 'left-0' : 'right-0', panelClassName)}>
        {buka && children(tutup)}
      </div>
    </div>
  )
}
