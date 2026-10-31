// Pembantu tes: mencari Python 3 yang benar-benar jalan. Di Windows, `python3` sering hanya pintasan Microsoft Store
// (keluar dengan kode 9009), jadi beberapa nama dicoba. Mengembalikan null bila tidak ada; tes yang memakainya sebaiknya di-skip.
import { spawnSync } from 'node:child_process'

export function cariPython() {
  for (const cmd of ['python3', 'python', 'py']) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' })
    if (!r.error && r.status === 0 && /Python 3/.test(`${r.stdout}${r.stderr}`)) return cmd
  }
  return null
}
