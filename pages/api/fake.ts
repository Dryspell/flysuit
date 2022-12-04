import type { NextApiRequest, NextApiResponse } from "next"
import { faker } from "@faker-js/faker"
import { jaccard, levenshtein } from "./similarity"

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!Object.keys(req.body).length) {
		return res.status(400).json({
			status: `Error`,
			message: `No body supplied`,
		})
	}

	const fakerDictionary: { [key: string]: () => string | Date | number } = {
		firstname: faker.name.firstName,
		lastname: faker.name.lastName,
		date_of_birth: faker.date.birthdate,
		birthdate: faker.date.birthdate,
		salutation: faker.name.prefix,
		twitterhandle: faker.internet.userName,
		email: faker.internet.email,
		mobilephone: faker.phone.number,
		phone: faker.phone.number,
		fax: faker.phone.number,
		address: faker.address.streetAddress,
		city: faker.address.city,
		state: faker.address.state,
		zip: faker.address.zipCode,
		country: faker.address.country,
		jobtitle: faker.name.jobTitle,
		company: faker.company.name,
		website: faker.internet.url,
		industry: faker.name.jobArea,
		description: faker.lorem.paragraph,
		about_us: faker.company.bs,
		founded_year: faker.date.past(50).getFullYear,
	}

	const fakePrimitive = (value: string | boolean | number, key?: string) => {
		if (
			typeof value === "boolean" ||
			(typeof value === "string" && ["true", "false"].includes(value))
		) {
			return Math.random() >= 0.5
		}

		if (typeof value === "number") {
			return faker.datatype.number()
		}

		if (key) {
			const similarityIndex = Object.keys(fakerDictionary)
				.map((fakerKey) => {
					return {
						key: fakerKey,
						similarity: jaccard(key, fakerKey).distance || 0,
					}
				})
				.sort((a, b) => b.similarity - a.similarity)[0]

			if (similarityIndex.key) {
				return fakerDictionary[similarityIndex.key]()
			}
		}
		return faker.datatype.string()
	}

	const fakeObject: (obj: any) => any = (obj: any) => {
		if (["string", "number", "boolean"].includes(typeof obj))
			return fakePrimitive(obj)

		return Object.fromEntries(
			Object.entries(obj).map(([key, value]: any) => {
				if (
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean" ||
					value === null ||
					value === undefined
				) {
					return [key, fakePrimitive(value)]
				}

				if (Array.isArray(value)) {
					return [key, value.map((item: any) => fakeObject(item))]
				}

				return [key, fakeObject(value)]
			})
		)
	}

	return res.status(200).json(fakeObject(req.body))
}
