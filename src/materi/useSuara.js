import { useSyncExternalStore } from 'react'
import { langgananSuara, simpanSuara, suaraAktif } from '../lib/suara.js'

const store = () => (typeof window !== 'undefined' ? window.localStorage : undefined)

/** [menyala, ubah]: pilihan suara kuis, tersimpan di perangkat dan dibagi semua komponen yang memakainya. */
export function useSuara() {
  const aktif = useSyncExternalStore(langgananSuara, () => suaraAktif(store()), () => true)
  return [aktif, (v) => simpanSuara(store(), v)]
}
