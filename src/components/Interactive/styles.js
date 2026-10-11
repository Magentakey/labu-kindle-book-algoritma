// Kelas Tailwind yang dipakai bersama komponen interaktif.
export const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

export const primaryButton =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl px-4 font-semibold ' +
  'bg-stone-900 text-orange-50 hover:bg-stone-700 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-stone-300 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-300 ' +
  focusRing

export const secondaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-4 font-semibold ' +
  'hover:bg-orange-100 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:border-stone-400 aria-disabled:bg-stone-100 aria-disabled:text-stone-700 aria-disabled:hover:bg-stone-100 ' +
  focusRing
