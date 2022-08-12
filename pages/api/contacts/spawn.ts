import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import {
  createRandomContact,
  HS_base_url,
  HS_Contact,
  HS_Headers,
} from '../../../lib/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const contacts: HS_Contact[] = []
  Array.from({ length: 10 }).forEach(() => {
    contacts.push(createRandomContact())
  })

  if (req.method === 'GET') {
    return res.status(200).json({ message: `Success`, data: { contacts } })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
