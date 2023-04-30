import type { NextApiRequest, NextApiResponse } from "next"
export interface BroadcastData {
	_id: string
	id: string
	context: string
	type: string
	name: string
	inLanguage: string
	rights: string
	superEvent: SuperEvent
	startDate: Date
	endDate: Date
	updatedDate: Date
	videoFormat: string
	subtitleLanguage: string
	isLiveBroadcast: string
	asset: Asset
}

export interface Asset {
	type: string
	id: string
	name: string
	files?: Asset[]
	url?: string
}

export interface SuperEvent {
	type: string
	name: string
	congressNum: string
	sessionNum: string
	location: Location
}

export interface Location {
	type: string
	name: string
	address: Address
}

export interface Address {
	type: string
	streetAddress: string
	addressLocality: string
	addressRegion: string
	postalCode: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const date =
		(req.query.date as string) ||
		new Date(Date.now()).toISOString().slice(0, 10).replace(/-/g, "")
	console.log(date)

	const congressBroadcastData: BroadcastData = (
		await fetch(
			`https://liveproxy-azapp-prod-eastus2-003.azurewebsites.net/broadcastevents/${date}`
		).then((res) => res.json())
	)[0]

	const congressBroadcastMP4 = congressBroadcastData?.asset?.files?.find(
		(file) => file.type === "MP4Format"
	)?.url

	console.log({ congressBroadcastMP4, congressBroadcastData })
	return res.status(200).json({ congressBroadcastMP4, congressBroadcastData })
}
