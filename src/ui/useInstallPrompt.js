import { useEffect, useState } from 'react'

/**
 * Tombol "Pasang" hanya muncul bila browser benar-benar menawarkan pemasangan PWA (event beforeinstallprompt)
 * dan aplikasi belum dibuka sebagai aplikasi terpasang.
 * @returns {{ canInstall: boolean, install: () => Promise<void> }}
 */
export function useInstallPrompt() {
  const [event, setEvent] = useState(null)
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setEvent(e)
    }
    const onInstalled = () => setEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  const standalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
  return {
    canInstall: Boolean(event) && !standalone,
    install: async () => {
      if (!event) return
      event.prompt()
      await event.userChoice
      setEvent(null)
    },
  }
}
