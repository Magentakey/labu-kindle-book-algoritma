// Kelas Tailwind untuk tata letak grup di Galeri. Ditulis lengkap (bukan dirangkai) agar Tailwind mengenalinya.
// Kolom: HP < 768 = satu baris geser, md (768) = 2 kolom, lg (1024) = 3 kolom, xl (1280) = 4 kolom.
// Sebuah grup menempati sebanyak min(jumlah kartu, kolom) kolom, dan kartunya disusun di dalam grup dengan jumlah kolom yang sama.
export const GRID_COLUMNS = { md: 2, lg: 3, xl: 4 }

export const groupSpan = {
  md: { 1: 'md:col-span-1', 2: 'md:col-span-2' },
  lg: { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' },
  xl: { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4' },
}

export const innerCols = {
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' },
  xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4' },
}

/** Kelas span dan kolom dalam untuk grup berisi `count` kartu. */
export function groupClasses(count) {
  const out = { span: [], inner: [] }
  for (const [bp, cols] of Object.entries(GRID_COLUMNS)) {
    const n = Math.min(Math.max(count, 1), cols)
    out.span.push(groupSpan[bp][n])
    out.inner.push(innerCols[bp][n])
  }
  return { span: out.span.join(' '), inner: out.inner.join(' ') }
}
