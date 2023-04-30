import { TableSort } from "@/components/MantineComponents/mantine-table"
import { HS_Contact } from "../../lib/hubspot"
import * as React from "react"

export async function getStaticProps() {
	const data = await fetch(
		`${process.env.NEXT_APP_URL}/api/hubspot/contacts/spawn`
	)
		.then((res) => res.json())
		.then((data) => data.data)
	console.log(`Received ${data.length} contacts`)
	return { props: { data } }
}

export default function main({ data }: { data: HS_Contact[] }) {
	const contacts = data.map((contact: HS_Contact) => {
		return {
			name: `${contact.firstname} ${contact.lastname}`,
			email: contact.email,
			company: contact.company,
		}
	})

	return <TableSort data={contacts} />
}
