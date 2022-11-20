import { HS_Property, PrismaClient } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"
import { testSchema } from "lib/hubspot"

type HSSchema = {
	name?: string
	labels?: {
		singular: string
		plural: string
	}
	requiredProperties?: string[]
	secondaryDisplayProperties?: string[]
	properties: { [key: string]: HSPropertyData }
	associatedObjects?: string[]
	primaryDisplayProperty?: string
	metaType?: string
}

type HSPropertyData = {
	name?: string
	label?: string
	isPrimaryDisplayLabel?: boolean
	description?: string
	options?: {
		label?: string
		value?: string
		description?: string
		displayOrder?: number
		hidden?: boolean
	}[]
	displayOrder?: number
	type?: string
	fieldType?: string
	isRequired?: boolean
	isSecondaryDisplayLabel?: boolean
	isSearchable?: boolean
}

type flatJSON = { [key: string]: string | boolean }

const formatToHRText = (text: string) => {
	const regex = /(\b[a-z](?!\s))/g
	return text
		.toLowerCase()
		.replace("_", " ")
		.replace(regex, (x) => x.toUpperCase())
}

const isHSSchema = (schema: any): schema is HSSchema => {
	return schema?.properties != null
}
const isFlatJSON = (schema: any): schema is flatJSON => {
	let truth = true
	Object.values(schema).forEach((value) => {
		if (typeof value !== ("string" || "boolean")) {
			truth = false
			return truth
		}
	})
	return truth
}

export const parseSchema = async (input: any) => {
	const schema: HSSchema | null =
		Object.keys(input).length && isHSSchema(input)
			? {
					...input,
					name: input?.name || "my_object",
			  }
			: isFlatJSON(input)
			? {
					name: "my_object",
					labels: {
						singular: formatToHRText("my_object"),
						plural: formatToHRText("my_object") + "s",
					},
					properties: Object.fromEntries(
						Object.entries(input).map(([key, value]) => {
							const hsPropertyData: HSPropertyData = { name: key }
							if (
								value === (true || false || "true" || "false") ||
								hsPropertyData?.type === "boolean"
							) {
								hsPropertyData.type = "enumeration"
								hsPropertyData.fieldType = "booleancheckbox"
								hsPropertyData.options = [
									{ label: "True", value: "true" },
									{ label: "False", value: "false" },
								]
							}

							return [key, hsPropertyData]
						})
					),
			  }
			: null

	if (!schema) {
		return {
			error:
				"Invalid input schema, please supply a flat JSON object or a JSON object with a properties key",
		}
	}

	console.log(`schema`, schema)

	const primaryDisplayProperty =
		Object.values(schema.properties).find(
			(prop: HSPropertyData) => prop?.isPrimaryDisplayLabel === true
		)?.name || (schema?.name === "contact" ? "email" : "id")

	const requiredProperties = Object.values(schema.properties)
		.filter((prop: HSPropertyData) => prop.isRequired === true)
		.map((prop: HSPropertyData) => prop.name as string)

	const secondaryDisplayProperties = Object.values(schema.properties)
		.filter((prop: HSPropertyData) => prop.isSecondaryDisplayLabel === true)
		.map((prop: HSPropertyData) => prop.name as string)

	const searchableProperties = Object.values(schema.properties)
		.filter((prop: HSPropertyData) => prop.isSearchable === true)
		.map((prop: HSPropertyData) => prop.name as string)

	const parsedSchema = {
		name: schema?.name || "my_object",
		labels: {
			singular: schema?.labels?.singular
				? formatToHRText(schema?.labels?.singular)
				: formatToHRText(schema.name || "my_object"),
			plural:
				schema?.labels?.plural ||
				formatToHRText(schema.name || "my_object") + "s",
		},
		properties: Object.entries(schema.properties)
			.filter(([key, value]) => value != null)
			.map(([key, value]) => {
				const hsPropertyData: HSPropertyData = {
					name: value?.name || key.toLowerCase(),
					label: value?.label || formatToHRText(key),
					...(value?.isPrimaryDisplayLabel && { isPrimaryDisplayLabel: true }),
					...(value?.description && { description: value.description }),
					...(value?.displayOrder && { displayOrder: value.displayOrder }),
					...(value?.options?.length && { options: value.options }),
					type: value?.type || "string",
					fieldType: value?.fieldType
						? value.fieldType
						: value.type === "dateTime" || value.type === "date"
						? "date"
						: value.type === "number"
						? "number"
						: value.type === "enumeration"
						? "checkbox"
						: "text",
				}

				if (value?.type === "boolean") {
					hsPropertyData.type = "enumeration"
					hsPropertyData.fieldType = "booleancheckbox"
					hsPropertyData.options = [
						{ label: "True", value: "true" },
						{ label: "False", value: "false" },
					]
				}
				if (
					hsPropertyData.type === "enumeration" &&
					!hsPropertyData?.options?.length
				)
					hsPropertyData.options = [
						{
							label: "Placeholder",
							value: "placeholder",
						},
					]

				return hsPropertyData
			}),
		associatedObjects: ["CONTACT"],
		primaryDisplayProperty,
		...(!!secondaryDisplayProperties.length && { secondaryDisplayProperties }),
		...(!!requiredProperties.length && { requiredProperties }),
		...(!!searchableProperties.length && { requiredProperties }),
	}
	console.log(`parsedSchema`, parsedSchema)

	//! Need to set up TRPC Route to connect to Prisma on the backend
	// try {
	// 	// const prisma = new PrismaClient()
	// 	// await prisma.$connect()

	// 	await prisma.hS_Schema.create({
	// 		data: {
	// 			name: parsedSchema.name,
	// 			labels: {
	// 				create: {
	// 					singular: parsedSchema.labels.singular,
	// 					plural: parsedSchema.labels.plural,
	// 				},
	// 			},
	// 			properties: {
	// 				//@ts-ignore
	// 				create: parsedSchema.properties,
	// 			},
	// 			associatedObjects: {
	// 				create: parsedSchema.associatedObjects.map((obj) => ({
	// 					name: obj,
	// 				})),
	// 			},
	// 			primaryDisplayProperty: parsedSchema.primaryDisplayProperty,
	// 			// ...(!!secondaryDisplayProperties.length && {
	// 			// 	secondaryDisplayProperties,
	// 			// }),
	// 			// ...(!!requiredProperties.length && { requiredProperties }),
	// 			// ...(!!searchableProperties.length && { requiredProperties }),
	// 		},
	// 	})

	// 	// await prisma.$disconnect()
	// } catch (error) {
	// 	console.log(`Prisma error`, error)
	// }

	return parsedSchema
}

//! this function is meant to convert json values to their correct types
//! based on the schema
const parseValuesBySchema = (schema: flatJSON, values: flatJSON) => {
	const parsedValues = Object.fromEntries(
		Object.entries(values).map(([key, value]) => {
			return [key, value]
		})
	)
	return parsedValues
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (Object.keys(req.body).length !== 0) {
		return res.status(200).json({
			data: {
				input: req.body,
				output: await parseSchema(req.body),
			},
		})
	}

	return res.status(200).json({
		message: `No input provided, showing example output`,
		data: {
			input: testSchema,
			output: await parseSchema(testSchema),
		},
	})
}
