import { MASCOT_VIEWBOX, mascotInner, mascotNames } from './brandArt.js'

/**
 * Maskot labu. Hiasan (aria-hidden) kecuali `label` diisi.
 * @param {{ expression?: 'netral'|'senang'|'berpikir'|'kaget'|'merayakan', size?: number, label?: string, className?: string }} props
 */
export default function Mascot({ expression = 'netral', size = 96, label, className }) {
  const name = mascotNames.includes(expression) ? expression : 'netral'
  return (
    <svg
      width={size}
      height={Math.round((size * 150) / 160)}
      viewBox={MASCOT_VIEWBOX}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      dangerouslySetInnerHTML={{ __html: mascotInner(name) }}
    />
  )
}
