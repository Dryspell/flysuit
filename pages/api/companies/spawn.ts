import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import {
  createRandomCompany,
  HS_base_url,
  HS_Company,
  HS_Headers,
  HS_SearchResult,
} from '../../../lib/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const companies: HS_Company[] = []
  Array.from({ length: 10 }).forEach(() => {
    companies.push(createRandomCompany())
  })

  return res.status(200).json({
    message: `Success`,
    data: {
      companies,
    },
  })
}
