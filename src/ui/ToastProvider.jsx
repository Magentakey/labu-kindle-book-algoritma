import { useCallback, useEffect, useMemo, useReducer } from 'react'
import Toast from './Toast.jsx'
import { ToastContext } from './toastContext.js'
import { makeToast, toastReducer } from './toastLogic.js'

/** Satu toast: mulai hitung mundur sendiri dan menutup dirinya setelah `duration` ms (0 = tetap). */
function Timed({ toast, dismiss }) {
  useEffect(() => {
    if (!toast.duration) return undefined
    const t = setTimeout(() => dismiss(toast.id), toast.duration)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dismiss])
  return <Toast toast={toast} onDismiss={() => dismiss(toast.id)} />
}

/** Menyediakan useToast() dan menampilkan toast di bawah layar (di atas bottom nav pada HP). */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, [])
  const dismiss = useCallback((id) => dispatch({ type: 'dismiss', id }), [])
  const show = useCallback((opts) => {
    const toast = makeToast(opts)
    dispatch({ type: 'add', toast })
    return toast.id
  }, [])
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <Timed key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
