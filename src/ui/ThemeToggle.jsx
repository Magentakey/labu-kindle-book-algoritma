import IconButton from './IconButton.jsx'
import { useTheme } from './useTheme.js'

/** Tombol terang/gelap. Ikon bulan di mode terang (menuju gelap), matahari di mode gelap (menuju terang). */
export default function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return <IconButton icon={dark ? 'sun' : 'moon'} label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'} onClick={toggle} className={className} />
}
