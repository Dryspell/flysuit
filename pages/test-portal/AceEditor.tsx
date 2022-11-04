import { Container, Grid } from '@mantine/core'
import dynamic from 'next/dynamic'
import React from 'react'

const AceEditor = dynamic(() => import('../../components/AceEditor'), {
  ssr: false,
})

export default function Page() {
  const [code, setCode] = React.useState('')
  const onChange = (newValue: string) => {
    console.log('change', newValue)
    setCode(newValue)
  }

  return (
    <>
      <Container my="md">
        <Grid gutter="xl" justify="center">
          <Grid.Col span={6}>
            <AceEditor onChange={onChange} />
          </Grid.Col>
          <Grid.Col offsetMd={1} span={5}>
            <AceEditor value={code} />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}
