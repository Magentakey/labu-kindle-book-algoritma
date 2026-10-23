import { Component } from 'react'
import ErrorState from './ErrorState.jsx'

/**
 * Menangkap galat saat menampilkan satu halaman, supaya aplikasi tidak menjadi layar kosong.
 * `resetKey` (mis. alamat halaman) mengosongkan galat saat pengguna pindah halaman.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <ErrorState
        judul="Halaman ini gagal dimuat"
        pesan="Terjadi kesalahan saat menampilkan halaman. Coba lagi, atau kembali ke beranda."
        aksi={[
          { label: 'Coba lagi', icon: 'refresh', onClick: () => this.setState({ error: null }) },
          { label: 'Ke beranda', onClick: () => { window.location.hash = '#/' } },
        ]}
      />
    )
  }
}
