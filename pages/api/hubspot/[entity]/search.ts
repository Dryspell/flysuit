import { searchHubspot } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  console.log(`Query:`, JSON.stringify(req.query))
  const entityPlural = req.query.entity as string
  const queryLimit = (req.query.limit as string) || '100'
  const queryAfter = (req.query.after as string) || '0'
  const requestParams = Object.entries(req.query).filter(([key, value]) => {
    return !['entity', 'limit', 'after'].includes(key)
  })
  const body: {
    filterGroups: any[]
    limit?: string
    after?: string
    properties?: any
  } = !Object.keys(req.body).includes('filterGroups')
    ? {
        filterGroups: [
          {
            filters: requestParams.slice(0, 3).map(([key, value]) => {
              return {
                propertyName: key,
                operator: 'IN',
                values: Array.isArray(value) ? value : [value],
              }
            }),
          },
        ],
      }
    : { filterGroups: req.body.filterGroups }

  body.limit = queryLimit
  body.after = queryAfter

  console.log(`Search Body:`, JSON.stringify(body))
  const searchResults = await searchHubspot(entityPlural, body, queryLimit)

  return res.status(200).json(searchResults)
}
