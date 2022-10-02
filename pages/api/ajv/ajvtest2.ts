import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import { quickType } from '../quicktype'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

  const data = {
    foo: 1,
    bar: 'abc',
  }
  const schema = JSON.parse(
    (await quickType(data, undefined, 'json-schema')).lines.join('')
  ).definitions['MySchema']

  try {
    const validate = ajv.compile(schema)

    const badData = {
      foo: 'non-integer',
      bar: 'abc',
    }

    const validData = validate(data)
    const invalidData = validate(badData)
    if (!validData) console.log(validate.errors)
    if (!invalidData) console.log(validate.errors)
    return res.status(200).json({
      message: `Success`,
      schema,
      inputData: {
        good: data,
        bad: badData,
      },
      outputData: {
        good: validData || validate.errors,
        bad: invalidData || validate.errors,
      },
    })
  } catch (e: any) {
    console.log(e)
    return res.status(500).json({ message: `Error`, schema, error: e.message })
  }
}
