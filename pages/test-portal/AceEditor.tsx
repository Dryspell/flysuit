import { GradientSegmentedControl } from '@/components/MantineComponents/GradientSegementedControl'
import { Container, Grid } from '@mantine/core'
import dynamic from 'next/dynamic'
import React from 'react'

const AceEditor = dynamic(() => import('../../components/AceEditor'), {
  ssr: false,
})

export default function Page() {
  const [code, setCode] = React.useState('')
  const onCodeInputChange = (newValue: string) => {
    // console.log('change', newValue)
    newValue =
      newValue[0] === '{' && newValue[newValue.length - 1] === '}'
        ? newValue.slice(1, -2).trim()
        : newValue
    const cleanJson = JSON.stringify(
      Object.fromEntries(
        newValue
          .replace(/\n/g, '')
          .split(',')
          .map((val) => val.split(':').map((val) => val.trim()))
          .filter((val) => val.length === 2)
      )
    )
    console.log(typeof cleanJson, cleanJson)
    let isValidJSON = true
    if (cleanJson)
      try {
        JSON.parse(cleanJson)
        console.log('JSON is valid')
        setCode(
          JSON.parse(JSON.stringify(cleanJson))
            .split(',')
            .join(',\n\t')
            .split('{')
            .join('{\n\t')
            .split('}')
            .join('\n}')
        )
      } catch (e) {
        isValidJSON = false
        console.log(`Invalid JSON: ${e}`)
      }
  }

  return (
    <>
      <Container my="md">
        <GradientSegmentedControl
          data={['Format', 'Hubspot Schema', 'AJV Validator', 'Quicktype']}
          onChange={(val: any) => console.log(val)}
        />
      </Container>

      <Container my="md">
        <Grid gutter="xl" justify="center">
          <Grid.Col span={6}>
            <AceEditor mode={'json5'} onChange={onCodeInputChange} />
          </Grid.Col>
          <Grid.Col offsetMd={1} span={5}>
            <AceEditor mode={'json5'} value={code} />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}
