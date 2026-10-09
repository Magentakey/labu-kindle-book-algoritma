const MAX = 300

/** Teks ringkas dari sebuah nilai untuk ditampilkan di panel test case. */
export function formatValue(value) {
  let text
  if (value === undefined) text = 'undefined'
  else if (typeof value === 'number' || typeof value === 'bigint') text = String(value) // NaN, Infinity, -0 tetap terbaca
  else if (typeof value === 'function' || typeof value === 'symbol') text = String(value)
  else {
    try {
      text = JSON.stringify(value) ?? String(value)
    } catch {
      text = String(value)
    }
  }
  return text.length > MAX ? `${text.slice(0, MAX)}… (dipotong)` : text
}

/** Teks panggilan fungsi, misalnya solve([3,1,2], 5). */
export function formatCall(input) {
  return `solve(${input.map(formatValue).join(', ')})`
}
