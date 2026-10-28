import { useEffect, useState } from 'react'

/** True bila service worker sudah aktif mengendalikan halaman, artinya materi di aplikasi ini bisa dibuka tanpa internet. */
export function useOfflineReady() {
  const has = () => typeof navigator !== 'undefined' && 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller)
  const [ready, setReady] = useState(has)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined
    const on = () => setReady(has())
    navigator.serviceWorker.addEventListener('controllerchange', on)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', on)
  }, [])
  return ready
}
