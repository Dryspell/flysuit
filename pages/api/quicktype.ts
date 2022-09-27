import { createRandom } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core'
import fs from 'fs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.query.url as string
  const jsonData = url && (await fetch(url).then((res) => res.json()))
  //   console.log(jsonData)

  const jsonInput = jsonInputForTargetLanguage('typescript')
  const jsonSource = {
    name: (req.query.schemaName as string) || 'mySchema',
    samples: [JSON.stringify(jsonData || (await createRandom('contacts', 2)))],
  }
  await jsonInput.addSource(jsonSource)

  const inputData = new InputData()
  inputData.addInput(jsonInput)

  console.log(Object.values(['csharp', 'typescript', 'json-schema']))
  const outputLang: 'typescript' | 'json-schema' | 'csharp' | 'python' = [
    'csharp',
    'typescript',
    'json-schema',
    'python',
  ].includes(req.query.language as string)
    ? (req.query.language as 'typescript' | 'json-schema' | 'csharp' | 'python')
    : 'typescript'

  const quickTypeJson = await quicktype({
    inputData,
    lang: outputLang,

    leadingComments: [],
    rendererOptions: { 'just-types': 'true' },
    alphabetizeProperties: req.query.alpha === 'true' ? true : false,
    allPropertiesOptional: req.query.optionalProps === 'true' ? true : false,
  })
  return res.status(200).send(quickTypeJson.lines.join('\n'))
}
