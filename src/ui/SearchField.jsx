import Icon from './Icon.jsx'
import { cx } from './cx.js'

/**
 * Kolom pencarian (Figma: Kolom Cari), tinggi 40. Ikon kaca pembesar berubah oranye saat terisi atau fokus, dan tombol X menghapus isi.
 * @param {{ value: string, onChange: (v: string) => void, placeholder?: string, label?: string, className?: string, inputRef?: any } & Record<string, any>} props
 */
export default function SearchField({ value, onChange, placeholder = 'Cari…', label = 'Cari', className, inputRef, ...rest }) {
  return (
    <label className={cx('group flex h-10 items-center gap-2 rounded-sm border border-line bg-card px-3 focus-within:border-2 focus-within:border-brand-orange focus-within:shadow-[0_0_0_1px_var(--ring-gap),0_0_0_4px_var(--ring)]', className)}>
      <Icon name="search" size={18} className={cx('shrink-0', value ? 'text-brand-burnt' : 'text-ink-soft group-focus-within:text-brand-burnt')} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-ink-soft focus-visible:shadow-none! [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button type="button" aria-label="Hapus pencarian" onClick={() => onChange('')} className="shrink-0 rounded-sm text-ink-soft hover:text-ink">
          <Icon name="x" size={16} />
        </button>
      )}
    </label>
  )
}
