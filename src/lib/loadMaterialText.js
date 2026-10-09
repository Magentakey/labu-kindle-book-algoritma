// Setiap file src/content/materials/<id>.md menjadi potongan JavaScript terpisah
// yang baru diunduh saat materinya dibuka (import.meta.glob tanpa eager).
const loaders = import.meta.glob('../content/materials/*.md', { query: '?raw', import: 'default' })

/**
 * @param {string} id  sama dengan field `id` di materials.json
 * @returns {Promise<string|null>} teks Markdown, atau null bila file belum ada
 */
export async function loadMaterialText(id) {
  const load = loaders[`../content/materials/${id}.md`]
  return load ? await load() : null
}
