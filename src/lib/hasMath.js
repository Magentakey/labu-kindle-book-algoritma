/** Ada rumus bila ada tanda dolar. Tidak ada teks materi lain yang memakai $ (lihat docs/panduan-rumus.md). */
export const hasMath = (text) => typeof text === 'string' && text.includes('$')
