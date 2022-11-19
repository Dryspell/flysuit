import { GradientSegmentedControl } from "@/components/MantineComponents/GradientSegementedControl"
import { Container, Grid } from "@mantine/core"
import dynamic from "next/dynamic"
import { validator as ajvValidator } from "pages/api/ajv/validator"
import { quickType } from "pages/api/quicktype"
import React from "react"
import JSON5 from "json5"

const AceEditor = dynamic(() => import("../../components/AceEditor"), {
	ssr: false,
})

const validateJson = (input: string) => {
	if (!input) input = "{}"

	try {
		const parsedJSON = JSON5.parse(input)
		console.log("JSON is valid", parsedJSON)
		return { isValidJSON: true, parsedJSON }
	} catch (e) {
		const error = `Invalid JSON: ${e}`
		console.log(error)
		return { isValidJSON: false, parsedJSON: null, error }
	}
}

const formatJSON = (input: string) => {
	const { isValidJSON, parsedJSON, error } = validateJson(input)

	if (isValidJSON) return JSON.stringify(parsedJSON, null, "\t")
	else return JSON.stringify(error, null, "\t")
}

const functions = [
	{
		value: "format",
		label: "Format",
		function: formatJSON,
	},
	{
		value: "hubspot_schema",
		label: "Hubspot Schema",
		function: () => "hubspot_schema not set",
	},
	{
		value: "ajv_validator",
		label: "AJV Validator",
		function: async (input: string) => {
			const { isValidJSON, parsedJSON, error } = validateJson(input)

			if (!isValidJSON) return JSON.stringify(error, null, "\t")

			type ValidatorData = {
				object1: any
				object2: any
			}

			const isValidatorData = (input: any): input is ValidatorData => {
				return (
					Object.keys(input).includes("object1") &&
					Object.keys(input).includes("object2")
				)
			}

			console.log(`isValidatorData:${isValidatorData(parsedJSON)}`, parsedJSON)

			const validatorData = isValidatorData(parsedJSON)
				? await ajvValidator(parsedJSON.object1, parsedJSON.object2)
				: null

			if (!validatorData)
				return JSON.stringify(
					{
						message:
							"Input is not appropriate AJV_validator data, please supply a JSON object with two fields: object1 and object2",
						input: parsedJSON,
					},
					null,
					"\t"
				)

			return validatorData?.message === "Success"
				? formatJSON(
						JSON.stringify({
							schema: validatorData?.schema,
							sanityCheck: validatorData?.outputData?.object1,
							validityCheck: validatorData?.outputData?.object2,
						})
				  )
				: null
		},
	},
	{
		value: "quicktype",
		label: "Quicktype",
		function: async (input: string) => {
			const { isValidJSON, parsedJSON } = validateJson(input)
			if (!isValidJSON) return "Invalid input JSON"

			return (await quickType(parsedJSON)).lines.join("\n")
		},
	},
]

export default function Page() {
	const [input, setInput] = React.useState("")
	const [output, setOutput] = React.useState("")
	const [selectedFunction, setSelectedFunction] = React.useState("format")

	React.useEffect(() => {
		const onCodeInputChange = async (input: string) => {
			const { isValidJSON, parsedJSON } = validateJson(input)

			if (isValidJSON) {
				const f = functions.find((f) => f.value === selectedFunction)?.function
				try {
					const output = f && (await f(formatJSON(input)))
					output && setOutput(output)
				} catch (e: any) {
					setOutput(e)
				}
			}
		}

		onCodeInputChange(input)
	}, [input, selectedFunction])

	return (
		<>
			<Container my="md">
				<GradientSegmentedControl
					data={functions.map((val) => ({
						label: val.label,
						value: val.value,
					}))}
					onChange={(val: any) => {
						console.log(val)
						setSelectedFunction(val)
					}}
				/>
			</Container>

			<Container my="md">
				<Grid gutter="xl" justify="center">
					<Grid.Col span={6}>
						<AceEditor mode={"json5"} onChange={setInput} />
					</Grid.Col>
					<Grid.Col offsetMd={1} span={5}>
						<AceEditor mode={"json5"} value={output} />
					</Grid.Col>
				</Grid>
			</Container>
		</>
	)
}
