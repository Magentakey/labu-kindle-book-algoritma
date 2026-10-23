import { useState } from 'react'
import Button from './Button.jsx'
import Logo from './Logo.jsx'
import { dismissInstall, isInstallDismissed } from './installLogic.js'
import { useInstallPrompt } from './useInstallPrompt.js'

/** Kartu "Pasang LABU" di kiri bawah (Figma: PWA · Pasang). Muncul hanya bila browser menawarkan pemasangan dan belum ditunda. */
export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt()
  const [hidden, setHidden] = useState(() => isInstallDismissed(window.localStorage))
  if (!canInstall || hidden) return null
  return (
    <aside aria-label="Pasang aplikasi" className="fixed bottom-24 left-4 right-4 z-40 flex items-center gap-3 rounded-sm border border-line bg-card p-3 shadow-popover md:bottom-6 md:right-auto md:w-[360px]">
      <Logo variant="mark" className="h-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-body-strong text-heading">Pasang LABU</p>
        <p className="text-caption text-ink-soft">Buka lebih cepat &amp; baca materi tanpa internet.</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-1">
        <Button variant="kontrol" size="s" icon="install" onClick={install}>
          Pasang
        </Button>
        <Button
          variant="netral"
          size="s"
          onClick={() => {
            dismissInstall(window.localStorage)
            setHidden(true)
          }}
        >
          Nanti
        </Button>
      </div>
    </aside>
  )
}
