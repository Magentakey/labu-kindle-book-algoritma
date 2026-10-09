import { Children } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from '../CodeBlock/CodeBlock.jsx'
import { resolveLanguage } from '../../lib/codeLanguages.js'

// Path gambar yang diawali "/" (mis. /materi/insertion-sort/diagram.png) menunjuk ke folder public/
// dan perlu diberi awalan base situs (/labu-kindle-book-algoritma/) agar jalan di GitHub Pages.
function resolveSrc(src) {
  if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')) {
    return import.meta.env.BASE_URL + src.slice(1)
  }
  return src
}

const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

// Judul di file materi dimulai dari "##" karena <h1> sudah dipakai halaman.
// "#" (h1) dan "#####" ke atas dipetakan ke tingkat terdekat agar urutan judul tidak rusak.
const H2 = ({ children }) => <h2 className="mt-8 text-xl font-semibold first:mt-0">{children}</h2>
const H3 = ({ children }) => <h3 className="mt-6 text-lg font-semibold">{children}</h3>
const H4 = ({ children }) => <h4 className="mt-4 font-semibold">{children}</h4>

function Link({ href, children }) {
  const external = /^https?:\/\//i.test(href ?? '')
  return (
    <a
      href={href}
      className={`font-medium underline hover:no-underline ${focusRing}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {external && <span className="sr-only"> (membuka tab baru)</span>}
    </a>
  )
}

function Pre({ children }) {
  const child = Children.toArray(children)[0]
  const props = child?.props ?? {}
  const found = /language-(\S+)/.exec(props.className ?? '')
  const language = resolveLanguage(found?.[1])
  const code = String(props.children ?? '').replace(/\n$/, '')
  return (
    <div className="my-4">
      <CodeBlock code={code} language={language} label={language === 'text' ? 'Contoh kode' : `Contoh kode ${language}`} />
    </div>
  )
}

function Table({ children }) {
  return (
    <div
      // Tabel lebar harus bisa digeser dengan keyboard (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label="Tabel, bisa digeser ke samping"
      className={`my-4 overflow-x-auto rounded-xl border-2 border-stone-900 bg-white focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-stone-900`}
    >
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  )
}

const Th = ({ children, style }) => (
  <th scope="col" style={style} className="whitespace-nowrap border-b-2 border-stone-900 bg-orange-200 px-3 py-2 font-semibold">
    {children}
  </th>
)
const Td = ({ children, style }) => (
  <td style={style} className="border-t border-stone-400 px-3 py-2 align-top">
    {children}
  </td>
)

const components = {
  h1: H2, // jaga-jaga; aturan penulisan melarangnya
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H4,
  h6: H4,
  p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 leading-7">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 leading-7">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-xl border-l-4 border-stone-900 bg-orange-100 px-4 py-1">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-stone-700" />,
  a: Link,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded bg-orange-200 px-1.5 py-0.5 font-mono text-[0.9em] break-words">{children}</code>
  ),
  pre: Pre,
  img: ({ src, alt }) => (
    <img src={resolveSrc(src)} alt={alt ?? ''} loading="lazy" className="my-4 h-auto max-w-full rounded-xl border-2 border-stone-900 bg-white" />
  ),
  table: Table,
  th: Th,
  td: Td,
}

/**
 * Menampilkan teks materi (Markdown) dengan gaya aplikasi.
 * HTML mentah sengaja tidak diaktifkan: teks diperlakukan sebagai data, bukan kode.
 * @param {{ text: string }} props
 */
export default function MarkdownView({ text }) {
  return (
    <div className="min-w-0 break-words text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}
