import { createRandom } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core'

export const quickType = async (
  url?: string,
  language?: string,
  schemaName?: string,
  alpha?: string,
  optionalProps?: string
) => {
  const jsonData = url && (await fetch(url).then((res) => res.json()))
  //   console.log(jsonData)

  const jsonInput = jsonInputForTargetLanguage('typescript')
  const jsonSource = {
    name: schemaName || 'mySchema',
    samples: [JSON.stringify(jsonData || (await createRandom('contacts', 2)))],
  }
  await jsonInput.addSource(jsonSource)

  const inputData = new InputData()
  inputData.addInput(jsonInput)

  const outputLang: 'typescript' | 'json-schema' | 'csharp' | 'python' = [
    'csharp',
    'typescript',
    'json-schema',
    'python',
  ].includes(language as string)
    ? (language as 'typescript' | 'json-schema' | 'csharp' | 'python')
    : 'typescript'

  return await quicktype({
    inputData,
    lang: outputLang,
    // leadingComments: url ? [url] : [],
    rendererOptions: { 'just-types': 'true' },
    alphabetizeProperties: alpha === 'true' ? true : false,
    allPropertiesOptional: optionalProps === 'true' ? true : false,
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.query.url as string
  const language = req.query.language as string
  const schemaName = req.query.schemaName as string
  const alpha = req.query.alpha as string
  const optionalProps = req.query.optionalProps as string

  const quickTypeJson = await quickType(
    url,
    language,
    schemaName,
    alpha,
    optionalProps
  )
  return res.status(200).send(quickTypeJson.lines.join('\n'))
}
