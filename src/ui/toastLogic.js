// Logika murni toast (notifikasi singkat). Tampilannya ada di Toast.jsx dan ToastProvider.jsx.
// Aturan dari style guide: bisa ditutup, tidak menutupi tombol utama, hilang sendiri setelah 5 detik.

export const TOAST_DEFAULT_MS = 5000
export const MAX_TOASTS = 3

/** Jenis toast: ikon, dan apakah pesannya mendesak (error diumumkan langsung oleh pembaca layar). */
export const toastKinds = {
  update: { icon: 'refresh', urgent: false },
  success: { icon: 'check', urgent: false },
  error: { icon: 'alert', urgent: true },
  offline: { icon: 'wifioff', urgent: false },
  info: { icon: 'info', urgent: false },
}

let counter = 0
/** Membuat toast baru. `duration: 0` berarti tidak hilang sendiri. */
export function makeToast({ kind = 'info', message, actionLabel, onAction, duration = TOAST_DEFAULT_MS }) {
  counter += 1
  return { id: `t${counter}`, kind: kind in toastKinds ? kind : 'info', message: String(message ?? ''), actionLabel, onAction, duration }
}

/** Reducer daftar toast: `add` menambah di akhir (yang terlama dibuang bila lebih dari MAX_TOASTS), `dismiss` menutup satu, `clear` semuanya. */
export function toastReducer(state, action) {
  switch (action.type) {
    case 'add': {
      if (!action.toast.message) return state
      // pesan yang sama dan masih tampil tidak digandakan
      if (state.some((t) => t.kind === action.toast.kind && t.message === action.toast.message)) return state
      return [...state, action.toast].slice(-MAX_TOASTS)
    }
    case 'dismiss':
      return state.filter((t) => t.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}
