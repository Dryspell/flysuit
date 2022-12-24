import { test, expect } from "@playwright/test"

test("PostCustomSchema", async ({ page }) => {
	const pokemonSchema = {
		name: "pokemon",
		labels: {
			singular: "Pokemon",
			plural: "Pokemons",
		},
		properties: [
			{
				name: "name",
				label: "Name",
				type: "string",
				fieldType: "text",
			},
			{
				name: "height",
				label: "Height",
				type: "string",
				fieldType: "text",
			},
			{
				name: "weight",
				label: "Weight",
				type: "string",
				fieldType: "text",
			},
			{
				name: "types",
				label: "Types",
				type: "string",
				fieldType: "text",
			},
		],
		associatedObjects: ["CONTACT"],
		primaryDisplayProperty: "name",
	}

	console.log(`key:${process.env.HUBSPOT_TEST_API_KEY}`)

	const postCustomSchema = await page.request
		.post(`https://api.hubapi.com/crm/v3/schemas`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.HUBSPOT_TEST_API_KEY}`,
			},
			data: { ...pokemonSchema },
		})
		.then((res) => res.json())

	console.log(`postCustomSchema`, postCustomSchema)

	expect(postCustomSchema.labels.singular).toBe("Pokemon")
})
