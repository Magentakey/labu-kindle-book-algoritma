import { indentLess, indentMore } from '@codemirror/commands'
import { Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'

/**
 * Mode "Tab untuk indentasi" yang tidak menjebak pengguna keyboard (WCAG 2.1.2).
 *
 * - Tab menggeser indentasi ke kanan, Shift+Tab ke kiri.
 * - Esc lalu Tab: Tab berikutnya TIDAK dipakai editor, jadi fokus pindah ke elemen berikutnya.
 * - Tombol lain, atau fokus meninggalkan editor, membatalkan "Esc" itu.
 *
 * Mode ini hanya dipasang saat pengguna mengaktifkannya. Secara bawaan Tab memindahkan fokus.
 */
export function createTabKeys() {
  let escaped = false

  const wrap = (indent) => (view) => {
    if (escaped) {
      escaped = false
      return false // tidak ditangani editor: browser memindahkan fokus
    }
    return indent(view)
  }

  const escape = () => {
    escaped = true
    return true
  }

  // Tombol selain Esc, Tab, dan Shift membatalkan "Esc" sebelumnya.
  const onKeydown = (event) => {
    if (event.key !== 'Escape' && event.key !== 'Tab' && event.key !== 'Shift') escaped = false
    return false
  }

  const onBlur = () => {
    escaped = false
    return false
  }

  const extension = Prec.high([
    keymap.of([
      { key: 'Escape', run: escape },
      { key: 'Tab', run: wrap(indentMore), shift: wrap(indentLess) },
    ]),
    EditorView.domEventHandlers({ keydown: onKeydown, blur: onBlur }),
  ])

  return { extension, isEscaped: () => escaped, wrap, escape, onKeydown, onBlur }
}
