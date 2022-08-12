import {
  createRandomCompany,
  createRandomContact,
  createRandomDeal,
  HS_Company,
  HS_Contact,
  HS_Deal,
} from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const entityPlural = req.query.entity as string
  const count = parseInt(req.query.count as string) || 10

  console.log(`Spawning ${count} ${entityPlural}`)

  const createRandom = (entity: string, count: number) => {
    const contacts: HS_Contact[] = []
    const companies: HS_Company[] = []
    const deals: HS_Deal[] = []
    switch (entity) {
      case 'contacts':
        Array.from({ length: count }).forEach(() => {
          contacts.push(createRandomContact())
        })
        break

      case 'deals':
        Array.from({ length: count }).forEach(() => {
          deals.push(createRandomDeal())
        })
        break
      case 'companies':
        Array.from({ length: count }).forEach(() => {
          companies.push(createRandomCompany())
        })
        break
      default:
        return res.status(400).json({ message: `Invalid entity` })
        break
    }

    return res.status(200).json({
      message: `Success`,
      data: [contacts, companies, deals].filter((ent) => ent.length)[0],
    })
  }
  return createRandom(entityPlural, count)
}
