import Icon from './Icon.jsx'

/** Banner biru muda saat offline (Figma: State · Offline). Tetap tampil selama tidak ada jaringan. */
export default function OfflineBanner() {
  return (
    <div role="status" className="border-b border-info bg-info-bg">
      <div className="mx-auto flex w-full max-w-[1344px] items-start gap-3 px-4 py-2.5 md:items-center md:px-8">
        <Icon name="wifioff" size={18} className="mt-0.5 shrink-0 text-info md:mt-0" />
        <p className="text-caption text-ink">
          <strong className="text-body-strong">Kamu sedang offline, materi tetap bisa dibaca.</strong>{' '}
          <span className="text-ink-soft">Visualizer &amp; kuis memakai data tersimpan; skor disinkronkan saat online.</span>
        </p>
      </div>
    </div>
  )
}
