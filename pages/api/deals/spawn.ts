import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import {
  createRandomDeal,
  HS_base_url,
  HS_Deal,
  HS_Headers,
} from '../../../lib/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const DEALS: HS_Deal[] = []
  Array.from({ length: 10 }).forEach(() => {
    DEALS.push(createRandomDeal())
  })

  if (req.method === 'GET') {
    return res.status(200).json({ message: `Success`, data: { DEALS: DEALS } })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
