import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// Warna sintaks sama dengan CodeBlock (kontras minimal 6,2 : 1 di atas putih dan oranye muda).
const highlight = HighlightStyle.define([
  { tag: t.comment, color: '#166534', fontStyle: 'italic' },
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: '#1e3a8a' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: '#1e3a8a' },
  { tag: [t.number, t.integer, t.float], color: '#115e59' },
  { tag: [t.bool, t.null, t.atom], color: '#9f1239' },
  { tag: [t.string, t.regexp, t.special(t.string)], color: '#991b1b' },
  { tag: [t.standard(t.variableName), t.className], color: '#075985' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#1c1917', fontSize: '16px' },
  '&.cm-focused': { outline: '4px solid #1c1917', outlineOffset: '-4px' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    lineHeight: '1.6',
  },
  '.cm-content': { caretColor: '#1c1917', padding: '8px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#1c1917', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: '#ffffff', color: '#44403c', border: 'none', borderRight: '2px solid #d6d3d1' },
  '.cm-activeLine': { backgroundColor: '#ffedd5' },
  '.cm-activeLineGutter': { backgroundColor: '#ffedd5', color: '#1c1917' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#fdba74' },
})

/** Tema editor: kontras sudah dicek, area fokus tebal, tanpa warna bawaan CodeMirror. */
export const editorTheme = [theme, syntaxHighlighting(highlight)]
