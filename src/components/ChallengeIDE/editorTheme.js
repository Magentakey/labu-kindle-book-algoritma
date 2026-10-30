import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// Semua warna memakai token (--syn-*, --bg-code, dst. di tokens.css) supaya editor ikut mode terang dan gelap.
// Kontras sintaks minimal 4,5 : 1 di atas --bg-code dan --bg-line-active pada kedua mode (dijaga oleh editorTheme.test.js).
const highlight = HighlightStyle.define([
  { tag: t.comment, color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--syn-keyword)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: 'var(--syn-keyword)' },
  { tag: [t.number, t.integer, t.float], color: 'var(--syn-number)' },
  { tag: [t.bool, t.null, t.atom], color: 'var(--syn-atom)' },
  { tag: [t.string, t.regexp, t.special(t.string)], color: 'var(--syn-string)' },
  { tag: [t.standard(t.variableName), t.className], color: 'var(--syn-builtin)' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--bg-code)', color: 'var(--text-primary)', fontSize: '16px' },
  '&.cm-focused': { outline: '3px solid var(--ring)', outlineOffset: '-3px' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    lineHeight: '1.6',
  },
  '.cm-content': { caretColor: 'var(--text-primary)', padding: '8px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text-primary)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'var(--bg-code)', color: 'var(--text-secondary)', border: 'none', borderRight: '2px solid var(--border-default)' },
  '.cm-activeLine': { backgroundColor: 'var(--bg-line-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--bg-line-active)', color: 'var(--text-primary)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--bg-selection)' },
})

/** Tema editor: warna dari token, area fokus tebal, tanpa warna bawaan CodeMirror. */
export const editorTheme = [theme, syntaxHighlighting(highlight)]
