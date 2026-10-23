// Tabel kelas Tailwind tombol menurut peran warna (dipisah dari JSX agar bisa dites).
export const base = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-button transition-colors disabled:cursor-not-allowed'
export const sizes = { m: 'h-10 px-4', s: 'h-8 px-3' }
export const off = 'disabled:border-transparent disabled:bg-placeholder disabled:text-ink-soft disabled:shadow-none disabled:hover:bg-placeholder'

// Tombol menurut PERAN warna (Figma Style Guide: "Tombol per peran"):
// navigasi = pindah halaman (isi Coral), navigasiGaris = pindah, kedua (garis Coral), tautan = teks Coral Tua,
// kontrol = ubah sesuatu di halaman ini (garis Biru), konfirmasi = kirim/selesaikan (Mint),
// netral = pilihan ringan, bahaya = hapus/atur ulang (garis Merah).
export const buttonVariants = {
  navigasi: 'bg-brand-orange text-on-orange shadow-block hover:bg-brand-burnt hover:text-on-burnt',
  navigasiGaris: 'border-[1.5px] border-brand-orange bg-card text-link hover:bg-orange-soft hover:shadow-block',
  tautan: 'text-link underline underline-offset-4 hover:bg-orange-soft',
  kontrol: 'border-[1.5px] border-brand-blue bg-card text-control hover:bg-info-bg hover:shadow-block',
  konfirmasi: 'bg-brand-mint text-on-orange shadow-block hover:bg-ok',
  netral: 'text-ink-soft hover:bg-panel',
  bahaya: 'border-[1.5px] border-bad bg-card text-bad-text hover:bg-bad-bg',
}


// Tombol ikon menurut peran: kontrol (garis Biru), kontrolUtama (isi Biru Tua, mis. play/pause), navigasi (isi Coral), netral.
export const iconButtonVariants = {
  kontrol: 'size-10 rounded-sm border border-brand-blue bg-card text-control hover:bg-info-bg',
  kontrolUtama: 'size-12 rounded-md bg-brand-blue-strong text-on-control shadow-block hover:bg-brand-blue',
  navigasi: 'size-10 rounded-sm bg-brand-orange text-on-orange shadow-block hover:bg-brand-burnt hover:text-on-burnt',
  netral: 'size-10 rounded-sm text-ink-soft hover:bg-panel',
}

