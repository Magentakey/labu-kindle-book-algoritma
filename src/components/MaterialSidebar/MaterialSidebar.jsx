import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { progress } from '../../lib/storage.js'
import { jumpToSection } from './jumpToSection.js'

export const SIDEBAR_ID = 'sidebar-materi'

const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}

const ICON_BACK = 'M19 12H5m6-7-7 7 7 7'
const ICON_HIDE = 'm15 18-6-6 6-6'
const ICON_LIST = 'M4 6h16M4 12h16M4 18h10'

/** Bilah tipis di atas isi halaman: tombol membuka sidebar, dan nama bagian yang sedang dibaca. */
export function SidebarTopBar({ open, onOpen, openerRef, sectionLabel }) {
  return (
    <div className={`sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b-2 border-stone-900 bg-orange-50 px-4 print:hidden ${open ? 'lg:hidden' : ''}`}>
      <button
        ref={openerRef}
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        aria-controls={SIDEBAR_ID}
        className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-stone-900 bg-white px-3 font-semibold hover:bg-orange-200 ${focusRing}`}
      >
        <Icon d={ICON_LIST} />
        Daftar isi
      </button>
      {/* Saat sidebar disembunyikan di layar lebar, jalan keluar ke daftar materi tetap ada. */}
      <Link to="/" className={`hidden min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-medium underline hover:bg-orange-200 lg:inline-flex ${focusRing}`}>
        <Icon d={ICON_BACK} />
        Daftar materi
      </Link>
      {sectionLabel && <p className="min-w-0 flex-1 truncate text-right text-sm">{sectionLabel}</p>}
    </div>
  )
}

function TocLink({ item, active, solved, onJump }) {
  const nested = item.level === 3
  return (
    <li className={nested ? 'ml-3 border-l-2 border-stone-500 pl-2' : ''}>
      {/* Tombol, bukan tautan: aplikasi memakai HashRouter, jadi href="#id" akan dibaca sebagai rute. */}
      <button
        type="button"
        onClick={() => onJump(item.id)}
        aria-current={active ? 'location' : undefined}
        className={
          'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left leading-snug ' +
          (nested ? 'text-sm ' : '') +
          (active ? 'bg-stone-900 font-semibold text-orange-50 ' : 'hover:bg-orange-200 ') +
          focusRing
        }
      >
        <span className="min-w-0 break-words">{item.text}</span>
        {solved && (
          <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-stone-900">
            <span aria-hidden="true">✓ </span>Selesai
          </span>
        )}
      </button>
    </li>
  )
}

/**
 * Sidebar kiri halaman materi: tombol kembali, identitas materi, dan daftar isi materi ini saja.
 * Di layar lebar menempel di kiri; di layar sempit menjadi laci yang menutupi halaman.
 */
export default function MaterialSidebar({ material, items, loading, activeId, open, desktop, onClose, openerRef }) {
  const closeRef = useRef(null)
  const navRef = useRef(null)

  // Laci (layar sempit): Escape menutup, halaman di belakangnya tidak ikut tergulir, fokus pindah ke dalam laci.
  useEffect(() => {
    if (!open || desktop) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      onClose()
      openerRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, desktop, onClose, openerRef])

  // Menjaga bagian aktif tetap terlihat saat daftar isi sendiri bisa digulir.
  useEffect(() => {
    const nav = navRef.current
    const el = nav?.querySelector('[aria-current="location"]')
    if (!nav || !el) return
    const margin = 8
    if (el.offsetTop < nav.scrollTop + margin) nav.scrollTop = el.offsetTop - margin
    else if (el.offsetTop + el.offsetHeight > nav.scrollTop + nav.clientHeight - margin) {
      nav.scrollTop = el.offsetTop + el.offsetHeight - nav.clientHeight + margin
    }
  }, [activeId, open])

  if (!open) return null

  const activeIndex = items.findIndex((i) => i.id === activeId)
  const solved = material.challenge ? progress.isSolved(material.challenge) : false

  const jump = (id) => {
    if (!desktop) onClose()
    jumpToSection(id)
  }

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup daftar isi"
        onClick={() => {
          onClose()
          openerRef.current?.focus()
        }}
        className="fixed inset-0 z-30 bg-stone-900/50 lg:hidden print:hidden"
      />
      <aside
        id={SIDEBAR_ID}
        aria-label="Panel samping materi"
        className="sidebar-drawer fixed inset-y-0 left-0 z-40 flex w-[88vw] max-w-sm flex-col border-r-2 border-stone-900 bg-orange-100 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:w-80 lg:max-w-none lg:shrink-0 lg:self-start print:hidden"
      >
        <div className="border-b-2 border-stone-900 p-4">
          <Link
            to="/"
            className={`group flex min-h-12 items-center gap-3 rounded-xl border-2 border-stone-900 bg-white p-2 pr-3 font-semibold hover:bg-orange-200 ${focusRing}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-orange-50 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none">
              <Icon d={ICON_BACK} />
            </span>
            Kembali ke daftar materi
          </Link>
          <p className="mt-4 text-sm font-medium">Materi {material.no}</p>
          <p className="font-semibold leading-snug">{material.title}</p>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          <h2 className="font-semibold">Daftar isi</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => {
              onClose()
              openerRef.current?.focus()
            }}
            className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium underline hover:bg-orange-200 ${focusRing}`}
          >
            <Icon d={ICON_HIDE} />
            Sembunyikan
          </button>
        </div>

        <nav ref={navRef} aria-label="Daftar isi materi" className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {loading ? (
            <p role="status" className="px-1 py-2 text-sm">
              Memuat daftar isi…
            </p>
          ) : items.length === 0 ? (
            <p className="px-1 py-2 text-sm">Belum ada bagian untuk ditampilkan.</p>
          ) : (
            <>
              {activeIndex >= 0 && (
                <p className="px-1 pb-2 text-sm">
                  Bagian {activeIndex + 1} dari {items.length}
                </p>
              )}
              <ol className="space-y-1">
                {items.map((item) => (
                  <TocLink key={item.id} item={item} active={item.id === activeId} solved={item.kind === 'challenge' && solved} onJump={jump} />
                ))}
              </ol>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
