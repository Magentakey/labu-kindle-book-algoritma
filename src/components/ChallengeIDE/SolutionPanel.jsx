import { useId } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { editorTheme } from './editorTheme.js'

const secondaryButtonClass =
  'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl border-2 border-stone-900 bg-white px-4 font-semibold ' +
  'hover:bg-orange-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

// Hanya baca: tidak ada gutter aktif, autocompletion, atau penutup kurung otomatis.
const basicSetup = {
  foldGutter: false,
  autocompletion: false,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  closeBrackets: false,
}

/**
 * Jawaban contoh dalam editor hanya-baca. Tetap bisa difokus (pengguna keyboard bisa menggeser isinya),
 * tetapi tidak bisa diubah.
 *
 * @param {Object} props
 * @param {string} props.id  id elemen (dipakai tombol penampil lewat aria-controls)
 * @param {string} props.code
 * @param {() => void} props.onCopy
 */
export default function SolutionPanel({ id, code, onCopy }) {
  const headingId = `${useId()}-judul`
  const extensions = [
    javascript(),
    ...editorTheme,
    EditorView.contentAttributes.of({ 'aria-labelledby': headingId }),
  ]

  return (
    <section id={id} aria-labelledby={headingId} className="mt-4 max-w-3xl">
      <h4 id={headingId} className="text-lg font-semibold">
        Jawaban contoh (hanya baca)
      </h4>
      <p className="mt-1 text-sm">
        Ini salah satu cara yang benar; jawaban lain yang lulus semua test case juga boleh. Anda bisa mempelajarinya
        atau menyalinnya ke editor lalu mengubahnya.
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border-2 border-stone-900 bg-white">
        <CodeMirror
          value={code}
          extensions={extensions}
          theme="none"
          basicSetup={basicSetup}
          readOnly
          indentWithTab={false}
          maxHeight="24rem"
        />
      </div>
      <div className="mt-3">
        <button type="button" onClick={onCopy} className={secondaryButtonClass}>
          Salin ke editor
        </button>
      </div>
    </section>
  )
}
