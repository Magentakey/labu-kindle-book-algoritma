import { IconButton, Icon, Segmented, Slider } from '../ui/index.js'
import { MODES, SPEED_STOPS, compactStatus, speedLabel } from './playerLogic.js'

/** Empat tombol utama: ulangi, mundur, putar/jeda (Kontrol Utama, biru tua), maju. */
function Buttons({ player }) {
  const auto = player.mode === 'otomatis'
  return (
    <div className="flex items-center gap-2">
      <IconButton variant="kontrol" icon="reset" label="Ulangi dari awal" onClick={player.reset} />
      <IconButton variant="kontrol" icon="back" label="Langkah sebelumnya" disabled={player.atStart} onClick={() => player.jump(player.index - 1)} />
      <IconButton variant="kontrolUtama" icon={player.running ? 'pause' : 'play'} label={player.running ? 'Jeda' : 'Putar'} disabled={!auto} onClick={player.toggle} />
      <IconButton variant="kontrol" icon="fwd" label="Langkah berikutnya" disabled={player.atEnd} onClick={() => player.jump(player.index + 1)} />
    </div>
  )
}

/**
 * Bilah kontrol desktop dan tablet (Figma: Kontrol): tombol, kecepatan, mode, slot tambahan (pilihan dan sakelar),
 * lalu "Langkah x / N" dengan penggeser posisi dan keterangan baris.
 */
export default function PlayerBar({ player, caption, extras, actions }) {
  const stop = SPEED_STOPS.indexOf(player.speed)
  return (
    <div className="rounded-sm border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Buttons player={player} />
        <div className="flex items-center gap-2 border-l border-line pl-4">
          <Icon name="gauge" size={18} className="text-ink-soft" />
          <Slider label="Kecepatan" min={0} max={SPEED_STOPS.length - 1} value={stop} onChange={(i) => player.setSpeed(SPEED_STOPS[i])} className="w-36" />
          <span className="text-body-strong w-12 text-ink" aria-live="off">{speedLabel(player.speed)}</span>
        </div>
        <div className="border-l border-line pl-4">
          <Segmented options={MODES} value={player.mode} onChange={player.setMode} label="Mode pemutaran" />
        </div>
        <div className="ml-auto">{actions}</div>
      </div>
      {extras && <div className="mt-3 flex flex-wrap items-center gap-3">{extras}</div>}
      <div className="mt-3 flex items-center gap-4">
        <span className="text-body-strong shrink-0 text-heading">
          Langkah {player.index + 1} / {player.total}
        </span>
        <Slider tone="lokasi" label="Posisi langkah" min={0} max={player.last} value={player.index} onChange={player.jump} className="flex-1" />
        <span className="text-caption hidden shrink-0 text-ink-soft sm:inline">{caption}</span>
      </div>
    </div>
  )
}

/** Bilah kontrol HP: menempel di atas bottom nav, berisi empat tombol dan status "23 / 41 · 1× · Otomatis". */
export function PlayerBarCompact({ player }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 border-t border-line bg-panel px-4 py-2.5 md:hidden">
      <Buttons player={player} />
      <p className="text-caption text-right text-ink-soft">
        <span className="text-body-strong block text-heading">{player.index + 1} / {player.total}</span>
        {compactStatus({ index: player.index, total: player.total, speed: player.speed, mode: player.mode }).split(' · ').slice(1).join(' · ')}
      </p>
    </div>
  )
}
