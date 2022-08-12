import { searchHubspot } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const entityPlural = req.query.entity as string
  const queryLimit = (req.query.limit as string) || '100'

  const searchResults = await searchHubspot(entityPlural, req.body, queryLimit)

  return res.status(200).json(searchResults)
}
