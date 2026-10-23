import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button, ErrorBoundary, Icon, InstallBanner, Logo, OfflineBanner, ThemeToggle, useInstallPrompt, useOnlineStatus } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { activeNavId, navItems, pageTitle } from './nav.js'

/** Navbar atas untuk tablet dan desktop (md ke atas). */
function TopNav({ active }) {
  const { canInstall, install } = useInstallPrompt()
  return (
    <header className="hidden border-b border-line bg-page md:block">
      <div className="mx-auto flex h-24 w-full max-w-[1344px] items-center gap-6 px-8 xl:h-28">
        <NavLink to="/" aria-label="LABU, ke beranda" className="shrink-0 rounded-sm">
          <Logo className="h-12 xl:h-[63px]" />
        </NavLink>
        <nav aria-label="Menu utama" className="flex flex-1 justify-around gap-4">
          {navItems.map((n) => (
            <NavLink
              key={n.id}
              to={n.to}
              end={n.to === '/'}
              aria-current={active === n.id ? 'page' : undefined}
              className={cx(
                'text-nav relative px-1 py-1 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-[3px] after:rounded-full',
                active === n.id ? 'font-medium text-heading after:bg-nav-active' : 'text-ink hover:text-heading hover:after:bg-brand-orange/40',
              )}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          {canInstall && (
            <Button variant="kontrol" size="s" icon="install" onClick={install}>
              Pasang
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

/** Bar atas HP: logo kecil, judul halaman, dan tombol tema. */
function PhoneBar({ title }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page px-4 md:hidden">
      <Logo variant="mark" className="h-8 shrink-0" />
      <p className="text-h2 flex-1 truncate text-heading">{title}</p>
      <ThemeToggle />
    </header>
  )
}

/** Menu bawah HP: ikon dan label, aktif ditandai latar, garis atas, dan label tebal. */
function BottomNav({ active }) {
  return (
    <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      {navItems.map((n) => {
        const on = active === n.id
        return (
          <NavLink
            key={n.id}
            to={n.to}
            end={n.to === '/'}
            aria-current={on ? 'page' : undefined}
            className={cx('relative flex flex-col items-center gap-1 px-1 pb-2.5 pt-3', on && 'bg-orange-soft before:absolute before:inset-x-5 before:top-0 before:h-[3px] before:bg-brand-orange')}
          >
            <Icon name={n.icon} size={26} className={on ? 'text-brand-orange' : 'text-ink-soft'} />
            <span className={cx('text-caption', on ? 'font-semibold text-heading' : 'text-ink-soft')}>{n.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

/** Kerangka halaman baru: navbar atau bar atas + bottom nav, dan isi halaman lewat <Outlet />. */
export default function AppShell() {
  const { pathname } = useLocation()
  const active = activeNavId(pathname)
  const online = useOnlineStatus()
  useEffect(() => {
    document.title = active ? `${pageTitle(active)} · LABU` : 'LABU'
  }, [active])
  return (
    <div className="min-h-screen bg-page font-ui text-ink">
      <PhoneBar title={pageTitle(active)} />
      <TopNav active={active} />
      {!online && <OfflineBanner />}
      <main id="konten" tabIndex={-1} className="pb-28 outline-none md:pb-12">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <InstallBanner />
      <BottomNav active={active} />
    </div>
  )
}
