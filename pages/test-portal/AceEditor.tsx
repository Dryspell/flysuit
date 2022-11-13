import { GradientSegmentedControl } from '@/components/MantineComponents/GradientSegementedControl'
import { Container, Grid } from '@mantine/core'
import dynamic from 'next/dynamic'
import { quickType } from 'pages/api/quicktype'
import React from 'react'

const AceEditor = dynamic(() => import('../../components/AceEditor'), {
  ssr: false,
})

const validateJson = (input: string) => {
  // console.log('change', newValue)
  input =
    input[0] === '{' && input[input.length - 1] === '}'
      ? input.slice(1, -2).trim()
      : input
  const formatJSON = JSON.stringify(
    Object.fromEntries(
      input
        .replace(/\n/g, '')
        .split(',')
        .map((val) => val.split(':').map((val) => val.trim()))
        .filter((val) => val.length === 2)
    )
  )
  console.log(typeof formatJSON, formatJSON)
  let isValidJSON = true
  if (formatJSON)
    try {
      JSON.parse(formatJSON)
      console.log('JSON is valid')
    } catch (e) {
      isValidJSON = false
      console.log(`Invalid JSON: ${e}`)
    }
  return { isValidJSON, formatJSON }
}

const formatJSON = (input: string) => {
  return JSON.parse(JSON.stringify(input))
    .split(',')
    .join(',\n\t')
    .split('{')
    .join('{\n\t')
    .split('}')
    .join('\n}')
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
    function: () => 'ajv_validator not set',
  },
  {
    value: 'quicktype',
    label: 'Quicktype',
    function: async (input: any) =>
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
          setOutput(output)
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
