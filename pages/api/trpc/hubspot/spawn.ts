import { hubspotRouter } from '@/server/routers/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

const caller = hubspotRouter.createCaller({} as any)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const contacts = await caller.query('spawn', {
    entity: 'contacts',
    count: 10,
  })
  return res.status(200).json({ message: `Success`, data: contacts })
}
