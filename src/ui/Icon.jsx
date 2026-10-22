import { iconData } from './iconData.js'

/**
 * Ikon dari Figma. Warna mengikuti warna teks (currentColor). Tanpa `label` ikon dianggap hiasan (aria-hidden).
 * @param {{ name: keyof typeof iconData, size?: number, label?: string, className?: string }} props
 */
export default function Icon({ name, size = 18, label, className }) {
  const inner = iconData[name]
  if (!inner) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
