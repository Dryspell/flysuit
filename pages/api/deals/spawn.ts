import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import { HS_base_url, HS_Headers } from '../../../lib/hubspot'

export type HS_Deal = {}

export type Deal = {
  dealname: string
  closedate: Date
  description: string
}

export function createRandomDeal(): Deal {
  const verb = faker.word.verb()

  return {
    dealname: `${faker.company.companyName()} | ${verb}`,
    closedate: faker.date.past(),
    description: faker.fake(
      `{{word.adjective}} {{word.noun}} ${verb} {{word.adjective}} {{word.noun}}`
    ),
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const DEALS: Deal[] = []
  Array.from({ length: 10 }).forEach(() => {
    DEALS.push(createRandomDeal())
  })

  if (req.method === 'GET') {
    return res.status(200).json({ message: `Success`, data: { DEALS: DEALS } })
  }

  if (req.method === 'POST') {
    const postedDeals = await fetch(
      `${HS_base_url}crm/v3/objects/deals/batch/create`,
      {
        headers: HS_Headers,
        method: 'POST',
        body: JSON.stringify({
          inputs: DEALS.map((deal) => {
            return { properties: deal }
          }),
        }),
      }
    )
      .then((res: any) => res.json())
      .then((res) => {
        return res.results
      })

    return res.status(200).json({ message: `Success`, data: postedDeals })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
