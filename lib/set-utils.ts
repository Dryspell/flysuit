export function ASetMinusB(a: any[], b: any[]) {
  const A = new Set(a)
  const B = new Set(b)
  let a_minus_b = new Set([...Array.from(A)].filter((x) => !B.has(x)))
  return Array.from(a_minus_b)
}
