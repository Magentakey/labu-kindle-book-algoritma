import Icon from './Icon.jsx'
import { cx } from './cx.js'
import { toastKinds } from './toastLogic.js'

// Warna ikon per jenis (toast selalu gelap di terang maupun gelap, jadi teks putih aman di sini).
const iconColor = { update: 'text-brand-blue', success: 'text-brand-mint', error: 'text-brand-orange', offline: 'text-muted', info: 'text-brand-blue' }

/**
 * Satu toast: ikon, pesan, tombol aksi opsional, dan tombol tutup. Error memakai role="alert", lainnya role="status".
 * @param {{ toast: ReturnType<import('./toastLogic.js').makeToast>, onDismiss: () => void }} props
 */
export default function Toast({ toast, onDismiss }) {
  const kind = toastKinds[toast.kind]
  return (
    <div
      role={kind.urgent ? 'alert' : 'status'}
      className="pointer-events-auto flex max-w-[calc(100vw-2rem)] animate-toast-in items-center gap-3 rounded-sm border border-white/10 bg-[#240a03] px-4 py-3 text-white shadow-popover"
    >
      <Icon name={kind.icon} size={18} className={cx('shrink-0', iconColor[toast.kind])} />
      <span className="text-body min-w-0">{toast.message}</span>
      {toast.actionLabel && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.()
            onDismiss()
          }}
          className="text-button shrink-0 rounded-sm text-brand-orange hover:underline"
        >
          {toast.actionLabel} →
        </button>
      )}
      <button type="button" aria-label="Tutup pesan" onClick={onDismiss} className="shrink-0 rounded-sm text-white/70 hover:text-white">
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}
