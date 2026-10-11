/**
 * Bentuk langkah untuk visualizer tabel DP.
 * @typedef {Object} DpCell
 * @property {string} text    isi sel ('' = belum diisi)
 * @property {string} [sub]   teks kecil di bawah isi (panah asal, atau k terbaik)
 * @property {string} mark    kunci pada DP_STATUS
 * @property {string} [glyph] simbol khusus sel ini (menggantikan simbol bawaan status)
 *
 * @typedef {Object} DpStep
 * @property {number|null} line
 * @property {string} note
 * @property {{ labels?: Record<string,string>, table: { caption: string, corner: string, rowHeaders: string[], colHeaders: string[], cells: DpCell[][] }, panels: any[] }} view
 */
export {}
