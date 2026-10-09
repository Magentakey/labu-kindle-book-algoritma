// Worker tipis: semua logika ada di lib/runTests.js supaya bisa dites tanpa browser.
import { runTests } from '../lib/runTests.js'

self.onmessage = (event) => {
  const { code, testCases } = event.data
  self.postMessage(runTests(code, testCases))
}
