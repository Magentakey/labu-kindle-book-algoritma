// Bagian kecil yang dipakai bersama oleh halaman penjelajah (Pertumbuhan Fungsi, Batas Θ / O / Ω).
import { useId, useState } from 'react'
import { Icon } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { bacaBilangan } from './boundModel.js'

/** Kartu bagian halaman penjelajah, dengan judul h2 sebagai penanda wilayah. */
export function Panel({ judul, id, children, className }) {
  return (
    <section aria-labelledby={id} className={cx('overflow-hidden rounded-sm border border-line bg-card', className)}>
      <h2 id={id} className="text-h3 border-b border-line px-4 py-3 text-heading">
        {judul}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  )
}

/**
 * Isian bilangan dengan validasi. Nilai hanya diteruskan ke induk bila sah; bila tidak, tampil pesan dan nilai terakhir yang sah tetap dipakai.
 * `pecahan` mengizinkan penulisan seperti 3/4 atau 10/3. `awal` = teks awal isian (mis. "3/4") bila beda dari nilainya.
 * Bila nilai berubah dari luar (mis. memuat contoh), induk memberi `key` baru agar isian dimuat ulang.
 * @param {{ label: string, value: number, onChange: (v: number) => void, min: number, max: number, desimal?: boolean, pecahan?: boolean, awal?: string }} props
 */
export function Angka({ label, value, onChange, min, max, desimal = false, pecahan = false, awal }) {
  const uid = useId()
  const [draft, setDraft] = useState(awal ?? String(value).replace('.', ','))
  const [salah, setSalah] = useState(false)
  const ubah = (teks) => {
    setDraft(teks)
    const v = pecahan ? bacaBilangan(teks) : /^-?\d+([.,]\d+)?$/.test(teks.trim()) ? Number(teks.trim().replace(',', '.')) : null
    const sah = v !== null && Number.isFinite(v) && v >= min && v <= max && (desimal || Number.isInteger(v))
    setSalah(!sah)
    if (sah) onChange(v)
  }
  const batas = `${String(min).replace('.', ',')} dan ${String(max).replace('.', ',')}`
  const pesan = desimal ? `Isi bilangan antara ${batas}${pecahan ? ' (boleh pecahan, mis. 3/4)' : ''}.` : `Isi bilangan bulat antara ${batas}.`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-caption text-ink-soft">
        {label}
      </label>
      <input
        id={uid}
        inputMode={desimal ? 'decimal' : 'numeric'}
        value={draft}
        onChange={(e) => ubah(e.target.value)}
        aria-invalid={salah}
        aria-describedby={salah ? `${uid}-err` : undefined}
        className={cx('text-code h-10 w-32 rounded-sm border bg-card px-3 text-ink', salah ? 'border-bad' : 'border-line')}
      />
      {salah && (
        <p id={`${uid}-err`} role="alert" className="text-caption flex max-w-44 items-start gap-1 text-bad-text">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          {pesan}
        </p>
      )}
    </div>
  )
}
