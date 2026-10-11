import { TIMELINE_STATUS } from './timelineStatuses.js'

const LABEL_W = '5.75rem'

/** Jarak antar penanda waktu menurut panjang sumbu, supaya angkanya tidak berdesakan di layar sempit. */
const tickStep = (max) => (max <= 10 ? 1 : max <= 20 ? 2 : 5)

/**
 * Garis waktu aktivitas: satu baris per aktivitas, batangnya membentang dari waktu mulai sampai selesai pada sumbu waktu
 * yang sama. Garis putus-putus vertikal menandai `akhir`, yaitu waktu selesai aktivitas terpilih yang terakhir; batang yang
 * mulainya di kiri garis itu bentrok. Baris paling bawah ("Jadwal") menumpuk semua aktivitas terpilih dalam satu lajur.
 *
 * Dibuat dengan HTML/CSS (bukan SVG) supaya ukuran huruf tetap terbaca di layar sempit. Daftar baris adalah <ol> sungguhan,
 * dan tiap baris punya teks tersembunyi (sr-only) berisi waktu dan statusnya untuk pembaca layar.
 * @param {Object} props
 * @param {import('../../algorithms/activitySelection.js').TimelineRow[]} props.rows
 * @param {number|null} props.frontier
 * @param {string[]} props.schedule      nama aktivitas terpilih, berurutan
 * @param {number} props.axisMax
 * @param {string} props.caption
 * @param {Record<string, string>} [props.labels]  keterangan status khusus algoritma ini
 * @param {string[]} [props.legend]
 */
export default function TimelineChart({ rows, frontier, schedule, axisMax, caption, labels = {}, legend = Object.keys(TIMELINE_STATUS) }) {
  const statusLabel = (key) => labels[key] ?? TIMELINE_STATUS[key]?.label ?? key
  const pct = (t) => `${(t / axisMax) * 100}%`
  const width = (a, b) => `${((b - a) / axisMax) * 100}%`
  const step = tickStep(axisMax)
  const ticks = []
  for (let t = 0; t <= axisMax; t += step) ticks.push(t)
  if (ticks[ticks.length - 1] !== axisMax) ticks.push(axisMax)

  const byId = Object.fromEntries(rows.map((r) => [r.id, r]))
  const lane = schedule.map((id) => byId[id])

  // Bendera "akhir" di bawah: rata kiri/kanan di dekat tepi supaya tidak terpotong.
  const frontierPos = frontier === null ? null : frontier / axisMax
  const flagStyle =
    frontierPos === null
      ? null
      : frontierPos < 0.12
        ? { left: pct(frontier) }
        : frontierPos > 0.88
          ? { left: pct(frontier), transform: 'translateX(-100%)' }
          : { left: pct(frontier), transform: 'translateX(-50%)' }

  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-3 text-stone-900">
      <p className="text-sm font-semibold">{caption}</p>

      <div className="relative mt-2">
        {/* Lapisan garis bantu dan garis akhir; sejajar dengan kolom lajur waktu */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 top-6" style={{ left: LABEL_W }}>
          {ticks.map((t) => (
            <span key={t} className="absolute inset-y-0 border-l border-stone-200" style={{ left: pct(t) }} />
          ))}
          {frontier !== null && (
            <span className="absolute inset-y-0 z-10 -ml-px border-l-[3px] border-dashed border-stone-900" style={{ left: pct(frontier) }} />
          )}
        </div>

        {/* Sumbu waktu */}
        <div aria-hidden="true" className="flex h-6 items-end">
          <div className="shrink-0 text-xs font-semibold text-stone-700" style={{ width: LABEL_W }}>
            waktu
          </div>
          <div className="relative h-full flex-1">
            {ticks.map((t) => (
              <span key={t} className="absolute bottom-0 -translate-x-1/2 text-xs font-medium text-stone-700" style={{ left: pct(t) }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Tailwind menghapus penanda daftar; role="list" menjaga semantik daftar di Safari/VoiceOver. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol role="list" aria-label={caption} className="relative mt-1 border-t-2 border-stone-900">
          {rows.map((r) => {
            const st = TIMELINE_STATUS[r.mark] ?? TIMELINE_STATUS.normal
            return (
              <li key={r.id} className={'flex h-9 items-center ' + (r.mark === 'current' ? 'bg-orange-50' : '')}>
                <div aria-hidden="true" className="shrink-0 whitespace-nowrap pr-2 text-sm" style={{ width: LABEL_W }}>
                  <span className="font-bold">{r.id}</span> <span className="text-xs text-stone-700">{r.start}–{r.finish}</span>
                </div>
                <div aria-hidden="true" className="relative h-full flex-1">
                  <span
                    className="absolute inset-y-1.5 rounded border-2 border-stone-800"
                    style={{ left: pct(r.start), width: width(r.start, r.finish), background: st.fill }}
                  >
                    {st.glyph && (
                      <span className="absolute -right-1 -top-2.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-stone-800 bg-white px-0.5 text-[11px] font-bold leading-none">
                        {st.glyph}
                      </span>
                    )}
                  </span>
                </div>
                <span className="sr-only">
                  {r.id}, mulai {r.start}, selesai {r.finish}, {statusLabel(r.mark)}
                </span>
              </li>
            )
          })}

          <li className="flex h-11 items-center border-t-2 border-stone-900">
            <div aria-hidden="true" className="shrink-0 pr-2 text-sm font-bold" style={{ width: LABEL_W }}>
              Jadwal
            </div>
            <div aria-hidden="true" className="relative h-full flex-1">
              {lane.map((r) => {
                const wide = (r.finish - r.start) / axisMax >= 0.08
                return (
                  <span
                    key={r.id}
                    className="absolute inset-y-2 flex items-center justify-center rounded border-2 border-stone-800"
                    style={{ left: pct(r.start), width: width(r.start, r.finish), background: TIMELINE_STATUS.selected.fill }}
                  >
                    {wide && <span className="rounded bg-white px-1 text-xs font-bold leading-4">{r.id}</span>}
                  </span>
                )
              })}
            </div>
            <span className="sr-only">
              Jadwal terpilih: {lane.length === 0 ? 'belum ada' : lane.map((r) => `${r.id} (${r.start} sampai ${r.finish})`).join(', ')}
            </span>
          </li>
        </ol>

        {/* Bendera nilai akhir */}
        <div aria-hidden="true" className="relative h-7" style={{ marginLeft: LABEL_W }}>
          {flagStyle && (
            <span
              className="absolute top-1 z-20 whitespace-nowrap rounded border-2 border-stone-900 bg-white px-1.5 text-xs font-bold leading-5"
              style={flagStyle}
            >
              akhir = {frontier}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-300 pt-3 text-sm">
        {legend
          .filter((k) => TIMELINE_STATUS[k])
          .map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 rounded border-2 border-stone-800" style={{ background: TIMELINE_STATUS[k].fill }} />
              {TIMELINE_STATUS[k].glyph && (
                <span aria-hidden="true" className="font-bold">
                  {TIMELINE_STATUS[k].glyph}
                </span>
              )}
              <span>{statusLabel(k)}</span>
            </li>
          ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-5 border-l-[3px] border-dashed border-stone-900" />
          <span>{labels.frontier ?? 'akhir (selesainya aktivitas terpilih terakhir)'}</span>
        </li>
      </ul>
    </div>
  )
}
