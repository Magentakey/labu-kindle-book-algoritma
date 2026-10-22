import { LOGO_FULL_VIEWBOX, LOGO_MARK_VIEWBOX, logoFullInner, logoMarkInner } from './brandArt.js'

/** Logo LABU. `variant="lengkap"` = bata + tulisan, `variant="mark"` = hanya tumpukan bata. Tinggi diatur lewat className, misalnya "h-10". */
export default function Logo({ variant = 'lengkap', className }) {
  const full = variant === 'lengkap'
  return (
    <svg
      viewBox={full ? LOGO_FULL_VIEWBOX : LOGO_MARK_VIEWBOX}
      role="img"
      aria-label="LABU"
      className={className}
      dangerouslySetInnerHTML={{ __html: full ? logoFullInner : logoMarkInner }}
    />
  )
}
