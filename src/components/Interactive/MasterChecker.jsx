import { useId, useMemo, useState } from 'react'
import { analyzeMaster, masterSteps, masterVerdict } from '../../lib/masterCase.js'
import { focusRing, secondaryButton } from './styles.js'

const inputClass = `mt-1 min-h-12 w-40 max-w-full rounded-xl border-2 border-stone-900 bg-white px-3 tabular-nums ${focusRing}`

const CASE_LABEL = {
  1: 'Kasus 1: f(n) lebih kecil dari g(n)',
  2: 'Kasus 2: f(n) sama dengan g(n)',
  3: 'Kasus 3: f(n) lebih besar dari g(n)',
}

/**
 * Penentu kasus Metode Master: isi a, b, dan f(n), lalu lihat langkah penyelesaiannya seperti slide di materi 7
 * (tentukan a, b, f(n); hitung g(n); bandingkan; syarat tambahan; simpulkan). Semua hasil berupa teks, tidak bergantung warna.
 *
 * @param {{ a: string, b: string, f: string }} props  isian awal
 */
export default function MasterChecker({ a, b, f }) {
  const uid = useId()
  const [at, setAt] = useState(a)
  const [bt, setBt] = useState(b)
  const [ft, setFt] = useState(f)

  const result = useMemo(() => analyzeMaster({ a: at, b: bt, f: ft }), [at, bt, ft])
  const invalid = Boolean(result.error)
  const steps = useMemo(() => (invalid ? [] : masterSteps(result)), [invalid, result])
  const reset = () => {
    setAt(a)
    setBt(b)
    setFt(f)
  }

  const field = (id, label, value, set, hint) => (
    <div>
      <label htmlFor={`${uid}-${id}`} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={`${uid}-${id}`}
        type="text"
        autoComplete="off"
        spellCheck="false"
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={`${uid}-status ${uid}-${id}-hint`}
        className={inputClass}
      />
      <span id={`${uid}-${id}-hint`} className="sr-only">
        {hint}
      </span>
    </div>
  )

  return (
    // role="group", bukan <section>: dua penentu atau lebih di satu halaman akan membuat landmark kembar.
    <div role="group" aria-labelledby={`${uid}-judul`} className="my-6 rounded-2xl border-2 border-stone-900 bg-orange-100 p-4">
      <p id={`${uid}-judul`} className="text-lg font-semibold">
        Tentukan kasus Metode Master sendiri
      </p>
      <p className="mt-1 text-sm">
        Isi recurrence <span className="font-mono">T(n) = a·T(n/b) + f(n)</span>. Untuk <span className="font-mono">T(3n/5)</span> tulis b ={' '}
        <span className="font-mono">5/3</span>. f(n) boleh berbentuk <span className="font-mono">n</span>, <span className="font-mono">n^2</span>,{' '}
        <span className="font-mono">√n</span>, <span className="font-mono">n^1,5</span>, <span className="font-mono">1</span>, atau memakai{' '}
        <span className="font-mono">log n</span> seperti <span className="font-mono">n log n</span>.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {field('a', 'a (banyak submasalah)', at, setAt, 'Bilangan bulat 1 sampai 99, misalnya 2.')}
        {field('b', 'b (pembagi ukuran)', bt, setBt, 'Bilangan lebih dari 1, boleh pecahan seperti 5/3.')}
        {field('f', 'f(n)', ft, setFt, 'Misalnya n, n^2, akar n, atau n log n.')}
        <button type="button" onClick={reset} className={secondaryButton}>
          Kembalikan contoh
        </button>
      </div>

      <p id={`${uid}-status`} role="status" className="mt-2 min-h-6 text-sm font-semibold">
        {invalid ? `Masukan belum sah: ${result.error}` : masterVerdict(result)}
      </p>

      {invalid ? null : (
        <>
          <p className="mt-2 inline-block rounded-lg border-2 border-stone-900 bg-white px-3 py-1 text-sm font-semibold">
            {result.kase ? CASE_LABEL[result.kase] : 'Tidak ada kasus yang berlaku'}
          </p>
          <ol className="mt-3 space-y-3">
            {steps.map((s) => (
              <li key={s.title} className="rounded-xl border-2 border-stone-900 bg-white p-3">
                <p className="font-semibold">{s.title}</p>
                {s.lines.map((line, i) => (
                  <p key={i} className={`mt-1 text-sm ${/^(g\(n\)|a·f|a = |T\(n\)) ?[=·]/.test(line) ? 'break-words font-mono' : ''}`}>
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
