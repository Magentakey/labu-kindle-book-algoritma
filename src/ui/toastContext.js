import { createContext, useContext } from 'react'

export const ToastContext = createContext({ show: () => '', dismiss: () => {} })

/** @returns {{ show: (opts: { kind?: string, message: string, actionLabel?: string, onAction?: () => void, duration?: number }) => string, dismiss: (id: string) => void }} */
export const useToast = () => useContext(ToastContext)
