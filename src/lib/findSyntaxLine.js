import { javascriptLanguage } from '@codemirror/lang-javascript'

/**
 * Perkiraan nomor baris kesalahan sintaks (mulai dari 1), atau null bila tidak ditemukan.
 * Memakai parser CodeMirror yang sudah dimuat editor, karena pesan SyntaxError di Chrome tidak memuat nomor baris.
 * Hasilnya perkiraan: parser mencatat tempat pertama kode tidak masuk akal, yang bisa satu-dua baris setelah salah ketiknya.
 * @param {string} code
 */
export function findSyntaxLine(code) {
  const tree = javascriptLanguage.parser.parse(code)
  let at = null
  tree.iterate({
    enter(node) {
      if (at !== null) return false
      if (node.type.isError) {
        at = node.from
        return false
      }
    },
  })
  if (at === null) return null
  // Kesalahan "kurang kurung tutup" ditandai di akhir teks: arahkan ke baris terakhir yang berisi.
  const upto = Math.min(at, code.trimEnd().length)
  return code.slice(0, upto).split('\n').length
}
