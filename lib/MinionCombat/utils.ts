import React from "react"

export type Event = {
	type: string
	eventText: string
}

export const logEvent = (
	type: string,
	text: string,
	setEventLog: React.Dispatch<React.SetStateAction<Event[]>>
) => {
	const event = {
		type,
		eventText: text,
	}
	setEventLog((previousEvents) => [...previousEvents, event])

	console.log(event.eventText)
}
