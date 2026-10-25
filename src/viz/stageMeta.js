// Keterangan tiap jenis tampilan di panel Visualisasi: ikon dan chip judul.
export const stageMeta = {
  graph: { icon: 'graph', chip: (graph) => `Graf · ${graph?.directed ? 'berarah' : 'tak berarah'}` },
  bars: { icon: 'chart', chip: () => 'Bar Array' },
  table: { icon: 'list', chip: () => 'Tabel DP' },
  timeline: { icon: 'chart', chip: () => 'Garis waktu' },
  huffman: { icon: 'graph', chip: () => 'Pohon Huffman' },
}
