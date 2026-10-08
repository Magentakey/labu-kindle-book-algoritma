import { Highlight } from 'prism-react-renderer'

// Warna sudah dicek kontrasnya (minimal 6,2 : 1) di atas putih dan oranye muda.
const theme = {
  plain: { color: '#1c1917', backgroundColor: '#ffffff' },
  styles: [
    { types: ['comment'], style: { color: '#166534', fontStyle: 'italic' } },
    { types: ['builtin', 'class-name'], style: { color: '#075985' } },
    { types: ['number', 'variable', 'inserted'], style: { color: '#115e59' } },
    { types: ['constant', 'char'], style: { color: '#9f1239' } },
    { types: ['string', 'deleted'], style: { color: '#991b1b' } },
    { types: ['keyword', 'function'], style: { color: '#1e3a8a' } },
  ],
}

/**
 * @param {Object} props
 * @param {string} props.code              kode yang ditampilkan
 * @param {string} [props.language]        bahasa untuk pewarnaan sintaks
 * @param {number|number[]|null} [props.highlightLine]  nomor baris aktif (mulai dari 1)
 * @param {string} [props.label]           nama area kode untuk pembaca layar
 */
export default function CodeBlock({
  code,
  language = 'javascript',
  highlightLine = null,
  label = 'Kode program',
}) {
  const active = Array.isArray(highlightLine) ? highlightLine : [highlightLine]

  return (
    <div className="overflow-hidden rounded-xl border-2 border-stone-900 bg-white">
      <Highlight theme={theme} code={code.trim()} language={language}>
        {({ tokens, style, getLineProps, getTokenProps }) => (
          <pre
            // Area scroll harus bisa difokus keyboard (WCAG 2.1.1), maka tabIndex sengaja dipakai.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            role="region"
            aria-label={label}
            style={style}
            className="overflow-x-auto py-2 text-sm leading-6 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-stone-900"
          >
            <code className="block w-max min-w-full font-mono">
              {tokens.map((line, i) => {
                const no = i + 1
                const isActive = active.includes(no)
                return (
                  <span
                    key={no}
                    {...getLineProps({
                      line,
                      className:
                        'flex border-l-4 pr-4 ' +
                        (isActive ? 'border-stone-900 bg-orange-100' : 'border-transparent'),
                    })}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isActive && <span className="sr-only">Baris {no}, baris aktif: </span>}
                    <span aria-hidden="true" className="w-4 shrink-0 select-none text-center">
                      {isActive ? '▶' : ''}
                    </span>
                    <span aria-hidden="true" className="w-8 shrink-0 select-none pr-3 text-right text-stone-700">
                      {no}
                    </span>
                    <span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </span>
                )
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  )
}
