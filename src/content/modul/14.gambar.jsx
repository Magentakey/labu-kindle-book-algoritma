// Gambar Modul 14 untuk penanda {{gambar:waktu}}: Gambar 1 (11 aktivitas pada garis waktu dengan solusi Greedy). Isinya dihitung dari GREEDY-ACTIVITY-SELECTOR, bukan diketik.
import GarisWaktuAktivitas from '../../viz/GarisWaktuAktivitas.jsx'

export function GambarWaktu() {
  return (
    <figure className="my-6 rounded-sm border border-line bg-card p-4">
      <GarisWaktuAktivitas />
      <figcaption className="text-caption mt-3 text-ink-soft">
        Gambar 1. Aktivitas pada garis waktu. Batang hijau bertanda ✓ adalah solusi Greedy {'{'}a1, a4, a8, a11{'}'}; batang abu-abu tidak dipilih.
      </figcaption>
    </figure>
  )
}
