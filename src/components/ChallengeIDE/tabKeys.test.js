import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { indentLess, indentMore } from '@codemirror/commands'
import { createTabKeys } from './tabKeys.js'

// "view" tiruan: cukup state + dispatch, itu yang dipakai indentMore/indentLess.
function fakeView(doc, cursor = doc.length) {
  const view = {
    state: EditorState.create({ doc, selection: { anchor: cursor } }),
    dispatch(tr) {
      view.state = tr.state
    },
  }
  return view
}

test('Tab menggeser indentasi ke kanan, Shift+Tab ke kiri', () => {
  const { wrap } = createTabKeys()
  const view = fakeView('x')
  assert.equal(wrap(indentMore)(view), true)
  assert.equal(view.state.doc.toString(), '  x')
  assert.equal(wrap(indentLess)(view), true)
  assert.equal(view.state.doc.toString(), 'x')
})

test('setelah Esc, Tab berikutnya tidak ditangani editor (fokus boleh pindah), lalu normal lagi', () => {
  const { wrap, escape, isEscaped } = createTabKeys()
  const view = fakeView('x')
  escape()
  assert.equal(isEscaped(), true)
  assert.equal(wrap(indentMore)(view), false)
  assert.equal(view.state.doc.toString(), 'x', 'dokumen tidak berubah')
  assert.equal(isEscaped(), false)
  assert.equal(wrap(indentMore)(view), true)
  assert.equal(view.state.doc.toString(), '  x')
})

test('Shift+Tab juga lolos setelah Esc', () => {
  const { wrap, escape } = createTabKeys()
  const view = fakeView('  x')
  escape()
  assert.equal(wrap(indentLess)(view), false)
  assert.equal(view.state.doc.toString(), '  x')
})

test('tombol lain atau kehilangan fokus membatalkan Esc', () => {
  const keys = createTabKeys()
  keys.escape()
  keys.onKeydown({ key: 'Shift' })
  assert.equal(keys.isEscaped(), true, 'Shift saja tidak membatalkan (Shift+Tab)')
  keys.onKeydown({ key: 'a' })
  assert.equal(keys.isEscaped(), false)

  keys.escape()
  keys.onBlur()
  assert.equal(keys.isEscaped(), false)
})

test('ekstensi bisa dipasang ke EditorState', () => {
  const { extension } = createTabKeys()
  assert.ok(EditorState.create({ extensions: [extension] }))
})
