/**
 * Menggulir ke satu bagian halaman lalu memindahkan fokus ke judulnya,
 * supaya pembaca layar dan keyboard melanjutkan dari bagian itu.
 * @param {string} id
 * @returns {boolean} true bila elemennya ditemukan
 */
export function jumpToSection(id) {
  const el = document.getElementById(id)
  if (!el) return false
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
  return true
}
