export function ASetMinusB<T>(a: T[], b: T[]) {
	const A = new Set(a)
	const B = new Set(b)
	const a_minus_b = new Set([...Array.from(A)].filter((x) => !B.has(x)))
	return Array.from(a_minus_b)
}

export function splitIntoChunks<T>(arr: T[], chunkSize: number) {
	arr = [...arr]
	const tempArray: T[] = []
	while (arr.length > 0) {
		tempArray.push(...arr.splice(0, chunkSize))
	}
	return tempArray
}

export const rotateArr = <T>(arr: T[], n: number) => {
	return arr.slice(n, arr.length).concat(arr.slice(0, n))
}
