export function ASetMinusB(a: any[], b: any[]) {
	const A = new Set(a)
	const B = new Set(b)
	let a_minus_b = new Set([...Array.from(A)].filter((x) => !B.has(x)))
	return Array.from(a_minus_b)
}

export function splitIntoChunks(arr: any[], chunkSize: number) {
	arr = [...arr]
	let tempArray: any[] = []
	while (arr.length > 0) {
		tempArray.push(arr.splice(0, chunkSize))
	}
	return tempArray
}

export const rotateArr = (arr: any[], n: number) => {
	return arr.slice(n, arr.length).concat(arr.slice(0, n))
}
