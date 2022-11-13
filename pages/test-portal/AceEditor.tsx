import { GradientSegmentedControl } from '@/components/MantineComponents/GradientSegementedControl'
import { Container, Grid } from '@mantine/core'
import dynamic from 'next/dynamic'
import { validator } from 'pages/api/ajv/validator'
import { quickType } from 'pages/api/quicktype'
import React from 'react'

const AceEditor = dynamic(() => import('../../components/AceEditor'), {
  ssr: false,
})

const validateJson = (input: string) => {
  // console.log('change', newValue)

  const formatJSON = (input: string) => {
    console.log('input', input)
    input =
      input[0] === '{' && input[input.length - 1] === '}'
        ? input.slice(1, -1).trim()
        : input
    console.log('Trimmed input', input)
    const json =
      // JSON.stringify(
      Object.fromEntries(
        input
          .replace(/\n/g, '')
          .replace(/\t/g, '')
          .split(',')
          .map((val) => {
            const split = val.split(':').map((val) => val.trim())
            let key = split.splice(0, 1)[0]
            console.log(`key:${key}, values:`, split.join(':'))
            const value: any =
              split.length > 1
                ? formatJSON(split.join(':'))
                : split[0]?.replace(/"/g, '').replace(/'/g, '')
            return [key.replace(/"/g, ''), value]
          })
        // .filter((val) => val.length === 2)
      )
    // )
    return json
  }
  const json = JSON.stringify(formatJSON(input))

  // console.log(typeof json, json)
  let isValidJSON = true
  if (json)
    try {
      const parsedJSON = JSON.parse(json)
      // JSON.parse(json)
      console.log('JSON is valid', parsedJSON)
    } catch (e) {
      isValidJSON = false
      console.log(`Invalid JSON: ${e}`)
    }
  return { isValidJSON, formatJSON: json }
}

const formatJSON = (input: string) => {
  const { isValidJSON, formatJSON } = validateJson(input)
  const obj = isValidJSON && JSON.parse(formatJSON)

  return JSON.stringify(obj, null, '\t')
}

const functions = [
  {
    value: 'format',
    label: 'Format',
    function: formatJSON,
  },
  {
    value: 'hubspot_schema',
    label: 'Hubspot Schema',
    function: () => 'hubspot_schema not set',
  },
  {
    value: 'ajv_validator',
    label: 'AJV Validator',
    function: async (input: string) => {
      input = JSON.parse(input)

      type ValidatorData = {
        object1: any
        object2: any
      }

      const isValidatorData = (input: any): input is ValidatorData => {
        return (
          Object.keys(input).includes('object1') &&
          Object.keys(input).includes('object2')
        )
      }

      // isValidatorData(input) &&
      console.log(`isValidatorData:${isValidatorData(input)}`, input)

      const validatorData = isValidatorData(input)
        ? await validator(input.object1, input.object2)
        : null

      return validatorData?.message === 'Success'
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
    value: 'quicktype',
    label: 'Quicktype',
    function: async (input: string) =>
      (await quickType(JSON.parse(input))).lines.join('\n'),
  },
]

export default function Page() {
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [selectedFunction, setSelectedFunction] = React.useState('format')

  React.useEffect(() => {
    const onCodeInputChange = async (input: string) => {
      const { isValidJSON, formatJSON } = validateJson(input)

      if (isValidJSON) {
        const f = functions.find((f) => f.value === selectedFunction)?.function
        try {
          const output = f && (await f(formatJSON))
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
            <AceEditor mode={'json5'} onChange={setInput} />
          </Grid.Col>
          <Grid.Col offsetMd={1} span={5}>
            <AceEditor mode={'json5'} value={output} />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}
