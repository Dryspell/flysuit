import { HS_Record, postHubspot } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const BearerToken = (req.query.bearer_token ||
    req.query.token ||
    req.body.bearer_token ||
    req.body.token) as string

  if (req.method === 'POST') {
    const entityPlural = (req.query.entity || req.body.entity) as string
    const records = req.body.records as any[]

    if (!entityPlural || !records)
      return res.status(400).json({ message: `Missing required parameters` })

    const postedEntities: HS_Record[] = (
      await postHubspot(entityPlural, req.body.records, 'archive', BearerToken)
    ).records
    // console.log(postEntities)

    return res.status(200).json({
      message: `Success`,
      data: postedEntities,
    })
  }
}
