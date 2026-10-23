import { useSyncExternalStore } from 'react'

const subscribe = (cb) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/** True bila perangkat terhubung ke jaringan (navigator.onLine). */
export const useOnlineStatus = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
