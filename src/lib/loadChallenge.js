// Setiap file src/content/challenges/<id>.json menjadi potongan JavaScript terpisah
// yang baru diunduh saat soalnya dibuka (import.meta.glob tanpa eager).
const loaders = import.meta.glob('../content/challenges/*.json', { import: 'default' })

/**
 * @param {string} id  sama dengan field `challenge` di materials.json
 * @returns {Promise<{ id: string, title: string, description: string, starterCode: string, testCases: Array<{ input: unknown[], expected: unknown }> } | null>}
 *   data soal, atau null bila file belum ada
 */
export async function loadChallenge(id) {
  const load = loaders[`../content/challenges/${id}.json`]
  return load ? await load() : null
}
