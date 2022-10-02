import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

  const schema = {
    type: 'object',
    properties: {
      foo: { type: 'integer' },
      bar: { type: 'string' },
    },
    required: ['foo'],
    additionalProperties: false,
  }

  const validate = ajv.compile(schema)

  const data = {
    foo: 1,
    bar: 'abc',
  }
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
    data: {
      good: validData || validate.errors,
      bad: invalidData || validate.errors,
    },
  })
}
