import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schema = z.string()
  try {
    const validResult = schema.parse('hello')
    const validSafeResult = schema.safeParse('hello')

    // const invalidResult = schema.parse(123)
    const invalidSafeResult = schema.safeParse(123)
    return res.status(200).json({
      message: `Success`,
      data: {
        validResult,
        validSafeResult,
        // invalidResult,
        invalidSafeResult,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: `Error`, data: e })
  }
}
