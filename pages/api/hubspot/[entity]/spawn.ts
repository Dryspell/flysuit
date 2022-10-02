import { createRandom, HS_Record, postHubspot } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['GET', 'POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const BearerToken = (req.query.bearer_token ||
    req.query.token ||
    req.body.bearer_token ||
    req.body.token) as string

  const entityPlural = req.query.entity as string
  const count = parseInt(req.query.count as string) || 10

  console.log(`Spawning ${count} ${entityPlural}`)

  const random = createRandom(entityPlural, count)
  const randomResults = random.message === 'Success' ? random.data : []

  if (req.method === 'GET') {
    return res.status(200).json({ message: `Success`, data: randomResults })
  }

  if (req.method === 'POST') {
    const postedEntities: HS_Record[] = (
      await postHubspot(entityPlural, randomResults, 'create', BearerToken)
    ).records
    // console.log(postEntities)

    return res.status(200).json({
      message: `Success`,
      data: postedEntities,
    })
  }
}
