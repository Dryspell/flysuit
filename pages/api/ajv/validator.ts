import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import { quickType } from '../quicktype'
import { createRandom } from '../../../lib/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ajv = new Ajv({
    allErrors: true,
    strictDefaults: false,
  })
  // addFormats(ajv)
  const ajvExceptions: any[] = []
  ajv.addFormat('integer', {
    type: 'string',
    validate: (data) => {
      console.log('integer', data)
      ajvExceptions.push({ type: 'string', format: 'integer', data })
      return true
    },
  })
  ajv.addFormat('date-time', {
    type: 'string',
    validate: (data) => {
      console.log('date-time', data)
      ajvExceptions.push({ type: 'string', format: 'date-time', data })
      return true
    },
  })

  const object1 = req.body.object1 || createRandom('contacts', 1).data[0]
  const object2 = req.body.object2 || createRandom('companies', 1).data[0]

  const quicktypeSchema = await quickType(
    object1,
    undefined,
    'json-schema',
    'Object1'
  )
  let schema = {}
  try {
    schema = JSON.parse(quicktypeSchema.lines.join('')).definitions['Object1']
  } catch (e: any) {
    console.log(e)
    return res.status(500).json({
      message: `Error`,
      error: e.message,
      quicktypeSchema,
      object1,
      object2,
    })
  }

  try {
    const validateSanity = ajv.compile(schema)
    const sanityCheck = validateSanity(object1)
    const outputObject1 = sanityCheck || validateSanity.errors

    const validate = ajv.compile(schema)
    const validityCheck = validate(object2)
    return res.status(200).json({
      message: `Success`,
      schema,
      inputData: {
        object1,
        object2,
      },
      outputData: {
        object1: outputObject1,
        object2: validityCheck || validate.errors,
      },
      ajvExceptions,
    })
  } catch (e: any) {
    // console.log(e)
    return res
      .status(500)
      .json({ message: `Error`, schema, error: e.message, object1, object2 })
  }
}
