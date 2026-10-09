// Bahasa yang diwarnai oleh Prism (lewat prism-react-renderer). Java dan bash
// tidak ada, jadi dipetakan ke padanan terdekat atau ke teks polos.
export const SUPPORTED_LANGUAGES = [
  'text', 'plain', 'plaintext', 'txt',
  'javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx',
  'python', 'py', 'c', 'cpp', 'go', 'rust', 'kotlin', 'swift',
  'json', 'css', 'html', 'markup', 'xml', 'yaml', 'sql', 'markdown', 'md',
]

export const LANGUAGE_ALIASES = {
  java: 'cpp',
  'c++': 'cpp',
  pseudocode: 'text',
  pseudo: 'text',
  bash: 'text',
  sh: 'text',
  shell: 'text',
}

/** Mengembalikan nama bahasa yang aman dipakai CodeBlock (bahasa tak dikenal jadi 'text'). */
export function resolveLanguage(lang) {
  const key = String(lang ?? '').trim().toLowerCase()
  if (!key) return 'text'
  if (LANGUAGE_ALIASES[key]) return LANGUAGE_ALIASES[key]
  return SUPPORTED_LANGUAGES.includes(key) ? key : 'text'
}

/** Apakah nama bahasa dikenal (langsung didukung atau punya alias)? */
export function isKnownLanguage(lang) {
  const key = String(lang ?? '').trim().toLowerCase()
  return SUPPORTED_LANGUAGES.includes(key) || key in LANGUAGE_ALIASES
}
