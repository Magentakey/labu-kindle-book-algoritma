// Menu utama (navbar atas di tablet dan desktop, bottom nav di HP). Sumber: desain Figma "Navigasi".
export const navItems = [
  { id: 'algoritma', label: 'Algoritma', to: '/', icon: 'algo' },
  { id: 'materi', label: 'Materi', to: '/materi', icon: 'book' },
  { id: 'quiz', label: 'Quiz', to: '/quiz', icon: 'quiz' },
  { id: 'credit', label: 'Credit', to: '/credit', icon: 'award' },
]

/** Id menu yang aktif untuk sebuah alamat, atau null bila di luar menu utama. */
export function activeNavId(pathname) {
  if (pathname === '/' || pathname.startsWith('/algoritma')) return 'algoritma'
  for (const item of navItems.slice(1)) if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return item.id
  return null
}

/** Judul halaman untuk bar atas HP dan judul tab browser. */
export const pageTitle = (id) => navItems.find((n) => n.id === id)?.label ?? 'LABU'
