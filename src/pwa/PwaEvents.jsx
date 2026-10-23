import { useEffect, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { useOnlineStatus } from '../ui/useOnlineStatus.js'
import { useToast } from '../ui/toastContext.js'

/**
 * Menghubungkan service worker dan jaringan ke toast (tidak menampilkan apa pun sendiri):
 * "Versi baru tersedia" dengan tombol Muat ulang, "siap dipakai offline", serta kabar offline dan online kembali.
 */
export default function PwaEvents() {
  const { show } = useToast()
  const online = useOnlineStatus()
  const first = useRef(true)

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        show({ kind: 'update', message: 'Versi baru tersedia', actionLabel: 'Muat ulang', duration: 0, onAction: () => update(true) })
      },
      onOfflineReady() {
        show({ kind: 'success', message: 'LABU siap dipakai tanpa internet' })
      },
    })
  }, [show])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    show(online ? { kind: 'success', message: 'Kamu kembali online' } : { kind: 'offline', message: 'Kamu sedang offline' })
  }, [online, show])

  return null
}
